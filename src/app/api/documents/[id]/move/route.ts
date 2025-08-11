import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    const resolvedParams = await params
    const documentId = resolvedParams.id
    const { targetFolderId } = await request.json()

    // Vérifier l'existence du document et la propriété
    const document = await prisma.document.findFirst({
      where: { id: documentId, authorId: userId },
      include: { currentVersion: true }
    })
    if (!document) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

    // Si un dossier est fourni, vérifier qu'il appartient à l'utilisateur
    if (targetFolderId) {
      const folder = await prisma.folder.findFirst({ where: { id: targetFolderId, authorId: userId } })
      if (!folder) return NextResponse.json({ error: 'Dossier cible introuvable' }, { status: 404 })
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { folderId: targetFolderId || null },
      include: {
        currentVersion: true,
      }
    })

    // Journaliser le déplacement
    try {
      await prisma.activity.create({
        data: {
          type: 'document_moved',
          targetType: 'document',
          targetId: updated.id,
          title: updated.title,
          metadata: { targetFolderId: targetFolderId || null },
          userId,
        }
      })
    } catch {}

    return NextResponse.json({
      document: {
        id: updated.id,
        title: updated.title,
        folderId: updated.folderId,
        currentVersion: updated.currentVersion ? {
          id: updated.currentVersion.id,
          versionNumber: updated.currentVersion.versionNumber,
          fileName: updated.currentVersion.fileName,
          fileType: updated.currentVersion.fileType,
          fileSize: updated.currentVersion.fileSize,
        } : null,
        updatedAt: updated.updatedAt,
      }
    })
  } catch (error) {
    console.error('Erreur déplacement document:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


