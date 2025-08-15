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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const folderId = searchParams.get('folderId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construire les conditions de filtrage de base
    const where: any = {}

    // Pour les administrateurs : voir tous les documents
    // Pour les utilisateurs normaux : voir seulement leurs documents
    if (userRole !== 'ADMIN') {
      where.authorId = userId
    }

    // Recherche textuelle simple
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtre par dossier
    if (folderId) {
      if (folderId === 'root') {
        where.folderId = null
      } else {
        where.folderId = folderId
      }
    }

    // Récupérer les documents avec une requête simple
    let documents = []
    let totalCount = 0

    try {
      // Requête simple pour éviter les erreurs
      documents = await prisma.document.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          folder: {
            select: {
              id: true,
              name: true
            }
          },
          currentVersion: {
            select: {
              fileName: true,
              fileSize: true,
              fileType: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip: offset,
        take: limit
      })

      totalCount = await prisma.document.count({ where })

    } catch (dbError) {
      console.error('Erreur base de données documents:', dbError)
      
      // En cas d'erreur, retourner une réponse vide mais valide
      return NextResponse.json({
        documents: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        error: 'Erreur temporaire de la base de données'
      })
    }

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Erreur API documents:', error)
    
    // Toujours retourner du JSON valide
    return NextResponse.json({
      documents: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
