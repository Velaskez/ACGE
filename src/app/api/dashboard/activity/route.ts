import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const findDocuments = async () => {
      try {
        return await prisma.document.findMany({
          where: { authorId: userId } as any,
          select: { id: true, title: true, createdAt: true, updatedAt: true, currentVersion: { select: { fileName: true, fileType: true } } } as any,
          orderBy: { updatedAt: 'desc' },
          take: 10,
        })
      } catch {
        try {
          return await prisma.document.findMany({
            where: { userId } as any,
            select: { id: true, name: true, mimeType: true, createdAt: true, updatedAt: true } as any,
            orderBy: { updatedAt: 'desc' },
            take: 10,
          })
        } catch {
          return []
        }
      }
    }

    const findFolders = async () => {
      try {
        return await prisma.folder.findMany({
          where: { authorId: userId } as any,
          select: { id: true, name: true, createdAt: true, updatedAt: true } as any,
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      } catch {
        try {
          return await prisma.folder.findMany({
            where: { userId } as any,
            select: { id: true, name: true, createdAt: true, updatedAt: true } as any,
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        } catch {
          return []
        }
      }
    }

    const findShares = async () => {
      try {
        return await prisma.documentShare.findMany({
          where: { userId },
          include: { document: { select: { title: true, currentVersion: { select: { fileName: true, fileType: true } } } } } as any,
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      } catch {
        try {
          return await prisma.documentShare.findMany({
            where: { userId },
            include: { document: { select: { name: true, mimeType: true } } } as any,
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        } catch {
          return []
        }
      }
    }

    const [recentDocuments, recentFolders, recentShares] = await Promise.all([
      findDocuments(),
      findFolders(),
      findShares(),
    ])

    const activities: any[] = []

    recentDocuments.forEach((doc: any) => {
      const isNew = new Date(doc.createdAt).getTime() === new Date(doc.updatedAt).getTime()
      activities.push({
        id: `doc-${doc.id}`,
        type: isNew ? 'document_created' : 'document_updated',
        action: isNew ? 'Nouveau document' : 'Document modifié',
        target: (doc.title || doc.currentVersion?.fileName || doc.name) || 'Sans titre',
        targetId: doc.id,
        timestamp: doc.updatedAt,
        metadata: { fileType: (doc.currentVersion?.fileType || doc.mimeType) || 'unknown' },
      })
    })

    recentFolders.forEach((folder: any) => {
      activities.push({
        id: `folder-${folder.id}`,
        type: 'folder_created',
        action: 'Dossier créé',
        target: folder.name,
        targetId: folder.id,
        timestamp: folder.createdAt,
        metadata: {},
      })
    })

    recentShares.forEach((share: any) => {
      activities.push({
        id: `share-${share.id}`,
        type: 'document_shared',
        action: 'Document partagé avec vous',
        target: (share.document?.title || share.document?.currentVersion?.fileName || share.document?.name) || 'Sans titre',
        targetId: share.documentId,
        timestamp: share.createdAt,
        metadata: { fileType: (share.document?.currentVersion?.fileType || share.document?.mimeType) || 'unknown' },
      })
    })

    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: sortedActivities })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    // Fallback vide pour ne pas casser le dashboard
    return NextResponse.json({ activities: [], warning: 'fallback-activity' })
  }
}
