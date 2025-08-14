// Configuration pour export statique
export const dynamic = 'force-dynamic'


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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const folderId = searchParams.get('folderId')
    const fileType = searchParams.get('fileType')
    const minSize = searchParams.get('minSize')
    const maxSize = searchParams.get('maxSize')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tags = searchParams.get('tags')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construire les conditions de filtrage
    const where: any = {
      authorId: userId, // Seuls les documents de l'utilisateur
    }

    // Recherche textuelle
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { 
          currentVersion: {
            fileName: { contains: search, mode: 'insensitive' }
          }
        },
        {
          tags: {
            some: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ]
    }

    // Filtre par dossier
    if (folderId) {
      if (folderId === 'root') {
        where.folderId = null // Documents à la racine
      } else {
        where.folderId = folderId
      }
    }
    // Si pas de folderId spécifié, on affiche TOUS les documents (pas de filtre)

    // Filtre par type de fichier
    if (fileType) {
      where.currentVersion = {
        ...where.currentVersion,
        fileType: { contains: fileType, mode: 'insensitive' }
      }
    }

    // Filtre par taille de fichier
    if (minSize || maxSize) {
      where.currentVersion = {
        ...where.currentVersion,
        fileSize: {
          ...(minSize ? { gte: parseInt(minSize) } : {}),
          ...(maxSize ? { lte: parseInt(maxSize) } : {})
        }
      }
    }

    // Filtre par date
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {})
      }
    }

    // Filtre par tags
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim())
      where.tags = {
        some: {
          name: { in: tagList }
        }
      }
    }

    // Construire l'ordre de tri
    const orderBy: any = {}
    switch (sortBy) {
      case 'title':
        orderBy.title = sortOrder
        break
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      case 'fileSize':
        orderBy.currentVersion = { fileSize: sortOrder }
        break
      case 'fileName':
        orderBy.currentVersion = { fileName: sortOrder }
        break
      default:
        orderBy.updatedAt = sortOrder
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
          tags: true,
          _count: {
            select: {
              versions: true,
              comments: true,
              shares: true
            }
          }
        },
        orderBy,
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
