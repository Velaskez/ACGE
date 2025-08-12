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

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Récupérer les activités récentes (requêtes robustes)
    let recentDocuments: any[] = []
    let recentFolders: any[] = []
    let recentShares: any[] = []

    try {
      recentDocuments = await prisma.document.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          currentVersion: { select: { fileName: true, fileType: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    } catch {
      try {
        recentDocuments = await prisma.document.findMany({
          where: { userId } as any,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            currentVersion: { select: { fileName: true, fileType: true } }
          },
          orderBy: { updatedAt: 'desc' },
          take: 10
        })
      } catch {}
    }

    try {
      recentFolders = await prisma.folder.findMany({
        where: { authorId: userId },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    } catch {
      try {
        recentFolders = await prisma.folder.findMany({
          where: { userId } as any,
          select: { id: true, name: true, createdAt: true, updatedAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      } catch {}
    }

    try {
      recentShares = await prisma.documentShare.findMany({
        where: { userId: userId },
        include: {
          document: { select: { title: true, currentVersion: { select: { fileName: true, fileType: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    } catch {}

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
          fileType: doc.currentVersion?.fileType || 'unknown'
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
    
    // Fournir plus de détails sur l'erreur en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      : 'Erreur interne du serveur'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
