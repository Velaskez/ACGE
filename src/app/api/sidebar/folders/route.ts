import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Sidebar folders - Début')
    
    // Récupérer les dossiers avec les documents récents
    let folders = []
    try {
      folders = await prisma.folder.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          documents: {
            select: {
              id: true,
              title: true,
              updatedAt: true
            },
            orderBy: {
              updatedAt: 'desc'
            },
            take: 3 // Limiter à 3 documents récents par dossier
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10 // Limiter à 10 dossiers récents
      })

      console.log('📁 Dossiers trouvés:', folders.length)

      // Transformer les données pour correspondre à l'interface
      const transformedFolders = folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        documentCount: folder.documents.length,
        recentDocuments: folder.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          fileName: doc.title, // Utiliser le titre comme nom de fichier pour l'instant
          fileType: 'application/octet-stream' // Type par défaut
        }))
      }))

      console.log('📁 Dossiers transformés:', transformedFolders.length)
      return NextResponse.json({ folders: transformedFolders })

    } catch (dbError) {
      console.error('Erreur base de données sidebar dossiers:', dbError)
      return NextResponse.json({ folders: [] }, { status: 200 })
    }

  } catch (error) {
    console.error('Erreur API sidebar dossiers:', error)
    return NextResponse.json({ folders: [] }, { status: 200 })
  }
}
