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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const folderId = searchParams.get('folderId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construire les conditions de filtrage
    const where: any = {
      authorId: userId, // Seuls les documents de l'utilisateur
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { 
          currentVersion: {
            fileName: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    if (folderId) {
      where.folderId = folderId
    } else if (folderId === null) {
      where.folderId = null // Documents à la racine
    }

    // Récupérer les documents
    const [documents, totalCount] = await Promise.all([
      prisma.document.findMany({
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
          currentVersion: true,
          _count: {
            select: {
              versions: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.document.count({ where })
    ])

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
    console.error('Erreur lors de la récupération des documents:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
