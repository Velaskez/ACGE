import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {

  try {
    console.log('📁 Sidebar folders - Début')
    
    // Pour l'instant, retourner tous les dossiers (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    // Construire les conditions de filtrage (tous les utilisateurs pour l'instant)
    const userFilter = {} // Admin voit tout

    // Récupérer les dossiers avec une requête simple
    let folders = []
    try {
      folders = await prisma.folder.findMany({
        where: userFilter,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Ajouter les compteurs manuellement pour éviter les problèmes de relations
      for (const folder of folders) {
        try {
          const documentCount = await prisma.document.count({
            where: { folderId: folder.id }
          })
          folder.documentCount = documentCount
        } catch (countError) {
          console.error('Erreur comptage pour dossier sidebar:', folder.id, countError)
          folder.documentCount = 0
        }
      }

    } catch (dbError) {
      console.error('Erreur base de données sidebar dossiers:', dbError)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(folders)

  } catch (error) {
    console.error('Erreur API sidebar dossiers:', error)

    // Toujours retourner du JSON valide
    return NextResponse.json([], { status: 200 })
  }
}
