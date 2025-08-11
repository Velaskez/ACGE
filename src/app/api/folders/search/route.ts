import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    // Récupérer le terme de recherche
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim() === '') {
      return NextResponse.json({ folders: [] })
    }

    const searchTerm = query.trim()

    // Construire les conditions de recherche
    const searchConditions = []

    // Recherche par nom (insensible à la casse)
    searchConditions.push({
      name: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    })

    // Recherche par description (insensible à la casse)
    searchConditions.push({
      description: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    })

    // Recherche par numéro de dossier (traitement comme chaîne)
    searchConditions.push({
      folderNumber: {
        contains: searchTerm,
        mode: 'insensitive' as const
      }
    })

    // Rechercher les dossiers
    const folders = await prisma.folder.findMany({
      where: {
        AND: [
          { authorId: userId },
          {
            OR: searchConditions
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            currentVersion: {
              select: {
                fileName: true,
                fileType: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 3
        },
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: [
        {
          folderNumber: 'asc' // Prioriser les résultats par numéro
        },
        {
          updatedAt: 'desc'
        }
      ]
    })

    // Formater les données
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      folderNumber: folder.folderNumber,
      name: folder.name,
      description: folder.description,
      documentCount: folder._count.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      author: {
        id: folder.author.id,
        name: folder.author.name
      },
      recentDocuments: folder.documents.map(doc => ({
        id: doc.id,
        title: doc.title || doc.currentVersion?.fileName || 'Sans titre',
        fileName: doc.currentVersion?.fileName || 'Sans fichier',
        fileType: doc.currentVersion?.fileType || 'unknown'
      }))
    }))

    return NextResponse.json({ 
      folders: formattedFolders,
      query: searchTerm,
      total: formattedFolders.length
    })

  } catch (error) {
    console.error('Erreur lors de la recherche de dossiers:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
