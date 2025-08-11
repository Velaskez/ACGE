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

    // Récupérer les activités récentes
    const [
      recentDocuments,
      recentFolders,
      recentShares
    ] = await Promise.all([
      // Documents récemment créés ou modifiés
      prisma.document.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          fileName: true,
          createdAt: true,
          updatedAt: true,
          fileType: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      
      // Dossiers récemment créés
      prisma.folder.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Partages récents (documents partagés avec l'utilisateur)
      prisma.documentShare.findMany({
        where: { userId: userId },
        include: {
          document: {
            select: {
              title: true,
              fileName: true,
              fileType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Combiner et trier toutes les activités par date
    const activities = []

    // Ajouter les documents
    recentDocuments.forEach(doc => {
      const isNew = new Date(doc.createdAt).getTime() === new Date(doc.updatedAt).getTime()
      
      activities.push({
        id: `doc-${doc.id}`,
        type: isNew ? 'document_created' : 'document_updated',
        action: isNew ? 'Nouveau document' : 'Document modifié',
        target: doc.title || doc.fileName,
        targetId: doc.id,
        timestamp: doc.updatedAt,
        metadata: {
          fileType: doc.fileType
        }
      })
    })

    // Ajouter les dossiers
    recentFolders.forEach(folder => {
      activities.push({
        id: `folder-${folder.id}`,
        type: 'folder_created',
        action: 'Dossier créé',
        target: folder.name,
        targetId: folder.id,
        timestamp: folder.createdAt,
        metadata: {}
      })
    })

    // Ajouter les partages
    recentShares.forEach(share => {
      activities.push({
        id: `share-${share.id}`,
        type: 'document_shared',
        action: 'Document partagé avec vous',
        target: share.document.title || share.document.fileName,
        targetId: share.documentId,
        timestamp: share.createdAt,
        metadata: {
          fileType: share.document.fileType
        }
      })
    })

    // Trier par timestamp décroissant et limiter à 10 activités
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: sortedActivities })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
