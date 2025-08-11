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

    // Récupérer les dossiers de l'utilisateur avec quelques documents récents
    const folders = await prisma.folder.findMany({
      where: { 
        authorId: userId 
      },
      include: {
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
          take: 3 // Seulement les 3 documents les plus récents par dossier
        },
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 6 // Limiter à 6 dossiers récents pour la sidebar
    })

    // Formater les données pour la sidebar
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      documentCount: folder._count.documents,
      recentDocuments: folder.documents.map(doc => ({
        id: doc.id,
        title: doc.title || doc.currentVersion?.fileName || 'Sans titre',
        fileName: doc.currentVersion?.fileName || 'Sans fichier',
        fileType: doc.currentVersion?.fileType || 'unknown'
      }))
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
