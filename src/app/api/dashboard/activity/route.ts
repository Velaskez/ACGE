import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {

  try {
    console.log('📊 Dashboard activity - Début')
    
    // Pour l'instant, retourner les activités pour tous les utilisateurs (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    // Construire les conditions de filtrage (tous les utilisateurs pour l'instant)
    const userFilter = {} // Admin voit tout
    const userId = 'admin' // Placeholder pour les partages

    // Récupérer les activités récentes
    let recentDocuments: any[] = []
    let recentFolders: any[] = []
    let recentShares: any[] = []

    try {
      recentDocuments = await prisma.document.findMany({
        where: userFilter,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          currentVersion: { select: { fileName: true, fileType: true } },
          author: { select: { name: true, email: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    } catch (error) {
      console.error('Erreur récupération documents:', error)
    }

    try {
      recentFolders = await prisma.folder.findMany({
        where: userFilter,
        select: { 
          id: true, 
          name: true, 
          createdAt: true, 
          updatedAt: true,
          author: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    } catch (error) {
      console.error('Erreur récupération dossiers:', error)
    }

    try {
      recentShares = await prisma.documentShare.findMany({
        where: { userId: userId },
        include: {
          document: { 
            select: { 
              title: true, 
              currentVersion: { select: { fileName: true, fileType: true } } 
            } 
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    } catch (error) {
      console.error('Erreur récupération partages:', error)
    }

    // Combiner et trier toutes les activités par date
    const activities: Array<{
      id: string
      type: string
      action: string
      target: string
      targetId: string
      timestamp: Date | string
      metadata: Record<string, any>
    }> = []

    // Ajouter les documents
    recentDocuments.forEach(doc => {
      const isNew = new Date(doc.createdAt).getTime() === new Date(doc.updatedAt).getTime()
      
      activities.push({
        id: `doc-${doc.id}`,
        type: isNew ? 'document_created' : 'document_updated',
        action: isNew ? 'Nouveau document' : 'Document modifié',
        target: doc.title || doc.currentVersion?.fileName || 'Sans titre',
        targetId: doc.id,
        timestamp: doc.updatedAt,
        metadata: {
          fileType: doc.currentVersion?.fileType || 'unknown',
          author: doc.author?.name || doc.author?.email || 'Inconnu'
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
        metadata: {
          author: folder.author?.name || folder.author?.email || 'Inconnu'
        }
      })
    })

    // Ajouter les partages
    recentShares.forEach(share => {
      activities.push({
        id: `share-${share.id}`,
        type: 'document_shared',
        action: 'Document partagé avec vous',
        target: share.document.title || share.document.currentVersion?.fileName || 'Sans titre',
        targetId: share.documentId,
        timestamp: share.createdAt,
        metadata: {
          fileType: share.document.currentVersion?.fileType || 'unknown'
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
      { 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
