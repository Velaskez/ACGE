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
      }),
      
      // Total des dossiers de l'utilisateur
      prisma.folder.count({
        where: { authorId: userId }
      }),
      
      // Total des utilisateurs (pour les admins)
      prisma.user.count(),
      
      // Documents de l'utilisateur pour calculer la croissance
      prisma.document.findMany({
        where: { authorId: userId },
        select: {
          createdAt: true,
          fileSize: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      // Taille totale des fichiers de l'utilisateur (via les versions)
      prisma.documentVersion.aggregate({
        where: { 
          document: { authorId: userId }
        },
        _sum: {
          fileSize: true
        }
      }),
      
      // Documents récents
      prisma.document.findMany({
        where: { authorId: userId },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          },
          folder: {
            select: {
              name: true
            }
          },
          currentVersion: true,
          _count: {
            select: {
              versions: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      
      // Utilisateurs actifs (connectés dans les dernières 24h)
      // Pour l'instant, on simule car nous n'avons pas de suivi des sessions
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
          }
        }
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
    const totalSizeBytes = totalFileSize._sum.fileSize || 0
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
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
