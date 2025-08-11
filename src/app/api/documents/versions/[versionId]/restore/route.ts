import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId
    
    const { versionId } = await params

    // Récupérer la version à restaurer (PG), fallback SQLite
    let versionToRestore: any
    try {
      versionToRestore = await (prisma as any).documentVersion.findUnique({
        where: { id: versionId },
        include: {
          document: {
            include: {
              author: { select: { id: true } },
            },
          },
        } as any,
      })
    } catch (_err) {
      const v = await (prisma as any).document.findUnique({
        where: { id: versionId },
      })
      // Ancien schéma: pas de versions dédiées → non supporté pour restore
      if (!v) {
        return NextResponse.json(
          { error: 'Version non trouvée' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Restauration de versions non supportée sur le schéma legacy' },
        { status: 400 }
      )
    }

    if (!versionToRestore) {
      return NextResponse.json(
        { error: 'Version non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (versionToRestore.document.authorId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
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
    const updatedDocument = await (prisma as any).document.update({
      where: { id: versionToRestore.documentId },
      data: { 
        currentVersionId: versionId,
        updatedAt: new Date()
      },
      include: {
        currentVersion: true
      } as any,
    })

    // Journaliser restauration (si modèle disponible)
    try {
      await (prisma as any).activity.create({
        data: {
          type: 'version_restored',
          targetType: 'document',
          targetId: updatedDocument.id,
          title: updatedDocument.title,
          metadata: { restoredVersionId: versionId, versionNumber: versionToRestore.versionNumber },
          userId,
        }
      })
    } catch {}

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
