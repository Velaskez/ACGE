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

    // Récupérer les statistiques
    const [
      totalDocuments,
      totalFolders,
      recentDocuments,
      totalSize
    ] = await Promise.all([
      // Nombre total de documents
      prisma.document.count({
        where: { authorId: userId }
      }),
      
      // Nombre total de dossiers
      prisma.folder.count({
        where: { authorId: userId }
      }),
      
      // Documents récents (7 derniers jours)
      prisma.document.count({
        where: {
          authorId: userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Taille totale des fichiers
      prisma.documentVersion.aggregate({
        where: {
          document: {
            authorId: userId
          }
        },
        _sum: {
          fileSize: true
        }
      })
    ])

    const stats = {
      totalDocuments,
      totalFolders,
      recentDocuments,
      totalSize: totalSize._sum.fileSize || 0,
      averageSize: totalDocuments > 0 ? Math.round((totalSize._sum.fileSize || 0) / totalDocuments) : 0
    }

    console.log('✅ Stats récupérées:', stats)
    
    return NextResponse.json(stats)

  } catch (error) {
    console.error('💥 Erreur récupération stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
