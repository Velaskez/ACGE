import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    // Récupérer les dossiers de l'utilisateur avec quelques documents récents (support PG/SQLite)
    const findFolders = async () => {
      try {
        return await prisma.folder.findMany({
          where: { authorId: userId } as any,
          include: {
            documents: {
              select: { id: true, title: true, updatedAt: true, currentVersion: { select: { fileName: true, fileType: true } } } as any,
              orderBy: { updatedAt: 'desc' },
              take: 3,
            },
            _count: { select: { documents: true } },
          } as any,
          orderBy: { updatedAt: 'desc' },
          take: 6,
        })
      } catch {
        try {
          return await prisma.folder.findMany({
            where: { userId } as any,
            include: {
              documents: {
                select: { id: true, name: true, mimeType: true, updatedAt: true } as any,
                orderBy: { updatedAt: 'desc' },
                take: 3,
              },
              _count: { select: { documents: true } },
            } as any,
            orderBy: { updatedAt: 'desc' },
            take: 6,
          })
        } catch {
          return []
        }
      }
    }

    const folders = await findFolders()

    // Formater les données pour la sidebar
    const formattedFolders = folders.map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      documentCount: folder._count.documents,
      recentDocuments: folder.documents.map((doc: any) => ({
        id: doc.id,
        title: (doc.title || (doc as any).name || (doc as any).currentVersion?.fileName || 'Sans titre'),
        fileName: ((doc as any).currentVersion?.fileName || (doc as any).name || 'Sans fichier'),
        fileType: ((doc as any).currentVersion?.fileType || (doc as any).mimeType || 'unknown'),
      })),
    }))

    return NextResponse.json({ 
      folders: formattedFolders 
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers sidebar:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
