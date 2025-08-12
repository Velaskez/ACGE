import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId
    
    const { versionId } = await params

    // Récupérer la version à restaurer
    const versionToRestore = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        document: {
          include: {
            author: true
          }
        }
      }
    })

    if (!versionToRestore) {
      return NextResponse.json(
        { error: 'Version non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions (propriétaire ou permission ADMIN/WRITE)
    const hasPermission = 
      versionToRestore.document.authorId === userId || 
      await prisma.documentShare.findFirst({
        where: {
          documentId: versionToRestore.documentId,
          userId: userId,
          permission: { in: ['ADMIN', 'WRITE'] }
        }
      })

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Accès refusé - permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Vérifier si ce n'est pas déjà la version actuelle
    if (versionToRestore.document.currentVersionId === versionId) {
      return NextResponse.json(
        { error: 'Cette version est déjà la version actuelle' },
        { status: 400 }
      )
    }

    // Mettre à jour le document pour pointer vers cette version
    const updatedDocument = await prisma.document.update({
      where: { id: versionToRestore.documentId },
      data: { 
        currentVersionId: versionId,
        updatedAt: new Date()
      },
      include: {
        currentVersion: true
      }
    })

    // Log de l'activité de restauration (pour audit)
    console.log(`Document ${versionToRestore.documentId}: Version ${versionToRestore.versionNumber} restaurée par utilisateur ${userId} à ${new Date().toISOString()}`)

    // Envoyer des notifications aux utilisateurs ayant accès au document
    const accessUsers = await NotificationService.getDocumentAccessUsers(versionToRestore.documentId)
    await NotificationService.notifyVersionRestored(
      versionToRestore.documentId,
      versionToRestore.document.title,
      versionToRestore.versionNumber,
      userId,
      accessUsers
    )

    return NextResponse.json({
      success: true,
      message: `Version ${versionToRestore.versionNumber} restaurée avec succès`,
      document: {
        id: updatedDocument.id,
        title: updatedDocument.title,
        currentVersion: {
          id: updatedDocument.currentVersion?.id,
          versionNumber: updatedDocument.currentVersion?.versionNumber,
          fileName: updatedDocument.currentVersion?.fileName,
          fileSize: updatedDocument.currentVersion?.fileSize,
          fileType: updatedDocument.currentVersion?.fileType
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la restauration de version:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
