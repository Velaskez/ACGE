import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fix documents ownership - Début...')
    
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
    const userEmail = decoded.email
    
    console.log('✅ Utilisateur authentifié:', userId, userEmail)

    // Récupérer le body de la requête
    const body = await request.json()
    const { documentIds, reassignAll } = body

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    let updatedDocuments = []
    let updatedFolders = []

    if (reassignAll) {
      // Réassigner TOUS les documents sans propriétaire ou d'autres utilisateurs
      console.log('🔄 Réassignation de tous les documents...')
      
      // Mettre à jour tous les documents
      const documentsResult = await prisma.document.updateMany({
        where: {
          OR: [
            { authorId: null },
            { authorId: { not: userId } }
          ]
        },
        data: {
          authorId: userId
        }
      })

      // Mettre à jour tous les dossiers
      const foldersResult = await prisma.folder.updateMany({
        where: {
          OR: [
            { authorId: null },
            { authorId: { not: userId } }
          ]
        },
        data: {
          authorId: userId
        }
      })

      updatedDocuments = await prisma.document.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true
        }
      })

      updatedFolders = await prisma.folder.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          name: true
        }
      })

      console.log(`✅ ${documentsResult.count} documents réassignés`)
      console.log(`✅ ${foldersResult.count} dossiers réassignés`)

    } else if (documentIds && Array.isArray(documentIds)) {
      // Réassigner uniquement les documents spécifiés
      console.log('🔄 Réassignation des documents spécifiés...')
      
      for (const docId of documentIds) {
        const document = await prisma.document.update({
          where: { id: docId },
          data: { authorId: userId },
          select: {
            id: true,
            title: true
          }
        })
        updatedDocuments.push(document)
      }
      
      console.log(`✅ ${updatedDocuments.length} documents réassignés`)
    }

    // Récupérer les statistiques mises à jour
    const stats = await prisma.document.groupBy({
      by: ['authorId'],
      _count: true
    })

    const userDocCount = await prisma.document.count({
      where: { authorId: userId }
    })

    const userFolderCount = await prisma.folder.count({
      where: { authorId: userId }
    })

    return NextResponse.json({
      success: true,
      message: reassignAll 
        ? `Tous les documents et dossiers ont été réassignés à ${user.email}`
        : `${updatedDocuments.length} document(s) réassigné(s) à ${user.email}`,
      updatedDocuments: updatedDocuments.map(d => ({ id: d.id, title: d.title })),
      updatedFolders: updatedFolders.map(f => ({ id: f.id, name: f.name })),
      statistics: {
        userDocuments: userDocCount,
        userFolders: userFolderCount,
        totalByAuthor: stats
      }
    })

  } catch (error) {
    console.error('💥 Erreur fix ownership:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réassignation', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}