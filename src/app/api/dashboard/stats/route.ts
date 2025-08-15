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
    const userRole = decoded.role

    // Construire les conditions de filtrage selon le rôle
    const userFilter = userRole === 'ADMIN' ? {} : { authorId: userId }

    // Récupérer les statistiques de base avec gestion d'erreur
    let totalDocuments = 0
    let totalFolders = 0
    let totalUsers = 0
    let totalSize = 0

    try {
      totalDocuments = await prisma.document.count({
        where: userFilter
      })
    } catch (error) {
      console.error('Erreur comptage documents:', error)
    }

    try {
      totalFolders = await prisma.folder.count({
        where: userFilter
      })
    } catch (error) {
      console.error('Erreur comptage dossiers:', error)
    }

    try {
      totalUsers = await prisma.user.count()
    } catch (error) {
      console.error('Erreur comptage utilisateurs:', error)
    }

    // Calculer la taille totale de manière simple
    try {
      const documents = await prisma.document.findMany({
        where: userFilter,
        select: { id: true }
      })
      
      for (const doc of documents) {
        try {
          const version = await prisma.documentVersion.findFirst({
            where: { documentId: doc.id },
            select: { fileSize: true },
            orderBy: { versionNumber: 'desc' }
          })
          if (version?.fileSize) {
            totalSize += version.fileSize
          }
        } catch (versionError) {
          console.error('Erreur récupération version pour document:', doc.id, versionError)
        }
      }
    } catch (sizeError) {
      console.error('Erreur calcul taille totale:', sizeError)
      totalSize = 0
    }

    // Statistiques simplifiées
    const stats = {
      totalDocuments,
      totalFolders,
      totalUsers,
      activeUsers: totalUsers,
      monthlyGrowthPercentage: 0,
      spaceUsed: {
        bytes: totalSize,
        gb: Math.round((totalSize / (1024 * 1024 * 1024)) * 100) / 100,
        percentage: 0,
        quota: 10 * 1024 * 1024 * 1024
      },
      recentDocuments: [],
      documentsThisMonth: 0,
      documentsLastMonth: 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur API stats:', error)
    
    // Toujours retourner du JSON valide
    return NextResponse.json({
      totalDocuments: 0,
      totalFolders: 0,
      totalUsers: 0,
      activeUsers: 0,
      monthlyGrowthPercentage: 0,
      spaceUsed: {
        bytes: 0,
        gb: 0,
        percentage: 0,
        quota: 10 * 1024 * 1024 * 1024
      },
      recentDocuments: [],
      documentsThisMonth: 0,
      documentsLastMonth: 0,
      error: 'Erreur temporaire de la base de données'
    })
  }
}
