import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Début récupération stats dashboard...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      console.log('❌ Pas de token d\'authentification')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    console.log('✅ Utilisateur authentifié:', userId)
    console.log('🔍 User ID:', userId)

    // Récupérer les statistiques de base d'abord
    const totalDocuments = await prisma.document.count({
      where: { authorId: userId }
    })
    
    const totalFolders = await prisma.folder.count({
      where: { authorId: userId }
    })
    
    const recentDocuments = await prisma.document.count({
      where: {
        authorId: userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Calculer la taille totale de manière plus sûre
    let totalSize = 0
    try {
      const sizeResult = await prisma.documentVersion.aggregate({
        where: {
          document: {
            authorId: userId
          }
        },
        _sum: {
          fileSize: true
        }
      })
      totalSize = sizeResult._sum.fileSize || 0
    } catch (sizeError) {
      console.log('⚠️ Erreur calcul taille, utilisation de 0:', sizeError)
      totalSize = 0
    }

    const stats = {
      totalDocuments,
      totalFolders,
      recentDocuments,
      totalSize,
      averageSize: totalDocuments > 0 ? Math.round(totalSize / totalDocuments) : 0
    }

    console.log('✅ Stats récupérées:', stats)
    console.log('📊 Détails:', {
      totalDocuments,
      totalFolders,
      recentDocuments,
      totalSize,
      averageSize: totalDocuments > 0 ? Math.round(totalSize / totalDocuments) : 0
    })
    
    return NextResponse.json(stats)

  } catch (error) {
    console.error('💥 Erreur récupération stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
