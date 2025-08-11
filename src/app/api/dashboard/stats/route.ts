import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    // Helpers robustes pour supporter Postgres (authorId) et SQLite (userId)
    const countDocuments = async (): Promise<number> => {
      try {
        return await prisma.document.count({ where: { authorId: userId } as any })
      } catch {
        try {
          return await prisma.document.count({ where: { userId: userId } as any })
        } catch {
          return 0
        }
      }
    }

    const countFolders = async (): Promise<number> => {
      try {
        return await prisma.folder.count({ where: { authorId: userId } as any })
      } catch {
        try {
          return await prisma.folder.count({ where: { userId: userId } as any })
        } catch {
          return 0
        }
      }
    }

    const getUserDocumentsForGrowth = async (): Promise<Array<{ createdAt: Date }>> => {
      try {
        return await prisma.document.findMany({
          where: { authorId: userId } as any,
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
        })
      } catch {
        try {
          return await prisma.document.findMany({
            where: { userId: userId } as any,
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
          })
        } catch {
          return []
        }
      }
    }

    const getRecentDocuments = async (): Promise<any[]> => {
      // Essayer d'abord le schéma Postgres (versions)
      try {
        return await prisma.document.findMany({
          where: { authorId: userId } as any,
          include: {
            author: { select: { name: true, email: true } },
            folder: { select: { name: true } },
            currentVersion: true,
            _count: { select: { versions: true } },
          } as any,
          orderBy: { updatedAt: 'desc' },
          take: 5,
        })
      } catch {
        // Fallback SQLite
        try {
          return await prisma.document.findMany({
            where: { userId: userId } as any,
            include: {
              user: { select: { name: true, email: true } },
              folder: { select: { name: true } },
            } as any,
            orderBy: { updatedAt: 'desc' },
            take: 5,
          })
        } catch {
          return []
        }
      }
    }

    const [
      totalDocuments,
      totalFolders,
      totalUsers,
      userDocuments,
      recentDocuments,
      activeUsers
    ] = await Promise.all([
      countDocuments(),
      countFolders(),
      prisma.user.count().catch(() => 0),
      getUserDocumentsForGrowth(),
      getRecentDocuments(),
      prisma.user
        .count({ where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
        .catch(() => 0),
    ])

    // Calculer la croissance mensuelle des documents
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const documentsThisMonth = userDocuments.filter((doc) => doc.createdAt > oneMonthAgo).length

    const documentsLastMonth = userDocuments.filter((doc) => {
      const twoMonthsAgo = new Date(oneMonthAgo)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1)
      return doc.createdAt > twoMonthsAgo && doc.createdAt <= oneMonthAgo
    }).length

    const monthlyGrowthPercentage =
      documentsLastMonth > 0
        ? Math.round(((documentsThisMonth - documentsLastMonth) / documentsLastMonth) * 100)
        : documentsThisMonth > 0
        ? 100
        : 0

    // Espace utilisé: calcul de base sans versions si indisponible
    const totalSizeBytes = 0
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024)
    const maxQuotaGB = 10
    const usagePercentage = Math.round((totalSizeGB / maxQuotaGB) * 100)

    // Détecter le format des documents récents (Postgres vs SQLite)
    const formattedRecentDocuments = (recentDocuments as any[]).map((doc) => ({
      id: doc.id,
      name: (doc as any).name || (doc as any).currentVersion?.fileName || 'Sans fichier',
      title: (doc as any).title || (doc as any).name || '',
      size: (doc as any).size || (doc as any).currentVersion?.fileSize || 0,
      type: (doc as any).mimeType || (doc as any).currentVersion?.fileType || 'unknown',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      author: (doc as any).author || (doc as any).user,
      folder: doc.folder,
      versionCount: (doc as any)._count?.versions || ((doc as any).size ? 1 : 0),
      currentVersion: (doc as any).currentVersion?.versionNumber || ((doc as any).size ? 1 : 0),
    }))

    const stats = {
      totalDocuments,
      totalFolders,
      totalUsers,
      activeUsers,
      monthlyGrowthPercentage,
      spaceUsed: {
        bytes: totalSizeBytes,
        gb: parseFloat(totalSizeGB.toFixed(2)),
        percentage: usagePercentage,
        quota: maxQuotaGB,
      },
      recentDocuments: formattedRecentDocuments,
      documentsThisMonth,
      documentsLastMonth,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    // Dernier filet de sécurité: retourner des valeurs par défaut pour ne pas casser le dashboard
    return NextResponse.json({
      totalDocuments: 0,
      totalFolders: 0,
      totalUsers: 0,
      activeUsers: 0,
      monthlyGrowthPercentage: 0,
      spaceUsed: { bytes: 0, gb: 0, percentage: 0, quota: 10 },
      recentDocuments: [],
      documentsThisMonth: 0,
      documentsLastMonth: 0,
      warning: 'fallback-stats',
    })
  }
}
