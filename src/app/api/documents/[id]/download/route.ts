import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { readStoredFile } from '@/lib/storage'
import { getServerUser } from '@/lib/server-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    // Récupérer le document avec sa version actuelle (support PG/SQLite)
    let document = await prisma.document.findFirst({
      where: { id: resolvedParams.id, authorId: userId } as any,
      include: { currentVersion: true } as any,
    })
    if (!document) {
      document = await prisma.document.findFirst({
        where: { id: resolvedParams.id, userId: userId } as any,
        include: { currentVersion: true } as any,
      })
    }

    if (!document || !document.currentVersion) {
      return NextResponse.json(
        { error: 'Document ou version non trouvé' },
        { status: 404 }
      )
    }

    // Lire le fichier via provider de stockage
    const filePath = (document as any).currentVersion?.filePath || (document as any).filePath || ''
    const fileType = (document as any).currentVersion?.fileType || (document as any).fileType || ''
    const fileName = (document as any).currentVersion?.fileName || (document as any).fileName || 'document'

    const storageRes = await readStoredFile(userId, filePath)
    const mimeType = fileType || storageRes.contentType || 'application/octet-stream'
    const response = new NextResponse(storageRes.body as any, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        ...(storageRes.contentLength ? { 'Content-Length': String(storageRes.contentLength) } : {}),
      },
    })

    return response

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
