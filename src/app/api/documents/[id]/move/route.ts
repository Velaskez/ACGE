import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const resolvedParams = await params
    const documentId = resolvedParams.id
    const { targetFolderId } = await request.json()

    // Vérifier l'existence du document et la propriété
    let document = await prisma.document.findFirst({
      where: { id: documentId, authorId: userId } as any,
      include: { currentVersion: true } as any,
    })
    if (!document) {
      document = await prisma.document.findFirst({
        where: { id: documentId, userId: userId } as any,
        include: { currentVersion: true } as any,
      })
    }
    if (!document) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

    // Si un dossier est fourni, vérifier qu'il appartient à l'utilisateur
    if (targetFolderId) {
      let folder = await prisma.folder.findFirst({
        where: { id: targetFolderId, authorId: userId } as any,
      } as any)
      if (!folder) {
        folder = await prisma.folder.findFirst({
          where: { id: targetFolderId, userId: userId } as any,
        } as any)
      }
      if (!folder) return NextResponse.json({ error: 'Dossier cible introuvable' }, { status: 404 })
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { folderId: targetFolderId || null },
    })

    // Journaliser le déplacement
    // Journaliser si le modèle Activity existe (Postgres). Ignorer s'il n'existe pas (SQLite)
    try {
      await (prisma as any).activity.create({
        data: {
          type: 'document_moved',
          targetType: 'document',
          targetId: updated.id,
          title: (updated as any).title || (updated as any).name || 'Document',
          metadata: { targetFolderId: targetFolderId || null },
          userId,
        }
      })
    } catch {}

    return NextResponse.json({
      document: {
        id: updated.id,
        title: (updated as any).title || (updated as any).name || 'Document',
        folderId: updated.folderId,
        currentVersion: null,
        updatedAt: updated.updatedAt,
      }
    })
  } catch (error) {
    console.error('Erreur déplacement document:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


