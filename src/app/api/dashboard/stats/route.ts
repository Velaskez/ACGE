import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

async function countFoldersByUser(userId: string): Promise<number> {
  try {
    // Schéma Postgres (champ authorId)
    return await prisma.folder.count({
      where: { authorId: userId } as any,
    })
  } catch {
    // Schéma SQLite (champ userId)
    return await prisma.folder.count({
      where: { userId } as any,
    })
  }
}

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

    // Récupérer les statistiques en parallèle
    const [
      totalDocuments,
      totalFolders,
      totalUsers,
      userDocuments,
      totalFileSize,
      recentDocuments,
      activeUsers
    ] = await Promise.all([
      // Total des documents de l'utilisateur
      prisma.document.count({
        where: { authorId: userId }
      }).catch(() => prisma.document.count({ where: { userId } as any })),

      // Total des dossiers de l'utilisateur (support champs authorId|userId)
      countFoldersByUser(userId),

      // Total des utilisateurs (pour les admins)
      prisma.user.count(),

      // Documents de l'utilisateur pour calculer la croissance
      prisma.document.findMany({
        where: { authorId: userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      }).catch(() => prisma.document.findMany({
        where: { userId } as any,
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      })),

      // Taille totale des fichiers de l'utilisateur (via les versions)
      prisma.documentVersion.aggregate({
        where: { document: { authorId: userId } },
        _sum: { fileSize: true }
      }).catch(() => prisma.documentVersion.aggregate({
        where: { document: { userId } as any },
        _sum: { fileSize: true }
      })),

      // Documents récents
      prisma.document.findMany({
        where: { authorId: userId },
        include: {
          author: { select: { name: true, email: true } },
          folder: { select: { name: true } },
          currentVersion: true,
          _count: { select: { versions: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }).catch(() => prisma.document.findMany({
        where: { userId } as any,
        include: {
          author: { select: { name: true, email: true } } as any,
          folder: { select: { name: true } } as any,
          currentVersion: true,
          _count: { select: { versions: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })),

      // Utilisateurs actifs (connectés dans les dernières 24h)
      prisma.user.count({
        where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      })
    ])

    // Calculer la croissance mensuelle des documents
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const documentsThisMonth = userDocuments.filter(doc => 
      doc.createdAt > oneMonthAgo
    ).length
    
    const documentsLastMonth = userDocuments.filter(doc => {
      const twoMonthsAgo = new Date(oneMonthAgo)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1)
      return doc.createdAt > twoMonthsAgo && doc.createdAt <= oneMonthAgo
    }).length

    const monthlyGrowthPercentage = documentsLastMonth > 0 
      ? Math.round(((documentsThisMonth - documentsLastMonth) / documentsLastMonth) * 100)
      : documentsThisMonth > 0 ? 100 : 0

    // Calculer l'espace utilisé en GB
    const totalSizeBytes = (totalFileSize as any)?._sum?.fileSize || 0
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024)
    const maxQuotaGB = 10 // Quota par défaut de 10GB
    const usagePercentage = Math.round((totalSizeGB / maxQuotaGB) * 100)

    // Formatage des documents récents
    const formattedRecentDocuments = recentDocuments.map(doc => ({
      id: doc.id,
      name: doc.currentVersion?.fileName || 'Sans fichier',
      title: doc.title,
      size: doc.currentVersion?.fileSize || 0,
      type: doc.currentVersion?.fileType || 'unknown',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      author: doc.author,
      folder: doc.folder,
      versionCount: doc._count.versions,
      currentVersion: doc.currentVersion?.versionNumber || 0
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
        quota: maxQuotaGB
      },
      recentDocuments: formattedRecentDocuments,
      documentsThisMonth,
      documentsLastMonth
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    
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
