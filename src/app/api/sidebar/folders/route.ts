import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Début récupération dossiers sidebar...')
    
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

    // Récupérer les dossiers avec le nombre de documents
    const folders = await prisma.folder.findMany({
      where: { authorId: userId },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Formater les données
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      documentCount: folder._count.documents
    }))

    console.log('✅ Dossiers récupérés:', formattedFolders.length)
    
    return NextResponse.json(formattedFolders)

  } catch (error) {
    console.error('💥 Erreur récupération dossiers:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dossiers' },
      { status: 500 }
    )
  }
}
