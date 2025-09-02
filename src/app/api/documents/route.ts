import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {

  try {
    console.log('📄 Documents - Début')
    
    // Pour l'instant, retourner tous les documents (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    const userId = 'admin' // Placeholder
    const userRole = 'ADMIN' // Admin voit tout

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
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

    // Construire les conditions de filtrage de base
    const where: any = {}

    // Pour les administrateurs : voir tous les documents
    // Pour les utilisateurs normaux : voir seulement leurs documents
    if (userRole !== 'ADMIN') {
      where.authorId = userId
    }

    // Recherche textuelle avancée
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { currentVersion: { fileName: { contains: search, mode: 'insensitive' } } }
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
        fileSize: {}
      }
      if (minSize) {
        where.currentVersion.fileSize.gte = parseInt(minSize)
      }
      if (maxSize) {
        where.currentVersion.fileSize.lte = parseInt(maxSize)
      }
    }

    // Filtre par période
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Filtre par tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim())
      where.tags = {
        some: {
          name: { in: tagArray, mode: 'insensitive' }
        }
      }
    }

    // Récupérer les documents avec une requête simple
    let documents: any[] = []
    let totalCount = 0

    try {
      // Requête complète avec toutes les données nécessaires
      const admin = getSupabaseAdmin()
      let query = admin
        .from('documents')
        .select(`
          id,
          title,
          description,
          category,
          isPublic:is_public,
          createdAt:created_at,
          updatedAt:updated_at,
          author:authorId(id, name, email),
          folder:folderId(id, name),
          currentVersion:current_version_id(*),
          tags:tags(id, name)
        `, { count: 'exact' })

      // Filtres
      if (where.authorId) query = query.eq('authorId', where.authorId)
      if (where.folderId === null) query = query.is('folderId', null)
      if (typeof where.folderId === 'string') query = query.eq('folderId', where.folderId)
      if (where.createdAt?.gte) query = query.gte('created_at', where.createdAt.gte.toISOString())
      if (where.createdAt?.lte) query = query.lte('created_at', where.createdAt.lte.toISOString())

      // Recherche textuelle basique (title/description)
      if (where.OR) {
        // Simplification: apply ilike on title/description
        const text = search as string
        if (text) {
          query = query.or(`title.ilike.%${text}%,description.ilike.%${text}%`)
        }
      }

      // Filtre type fichier/tailles basique via currentVersion
      if (fileType) query = query.ilike('current_version_file_type', `%${fileType}%` as any)
      if (minSize) query = query.gte('current_version_file_size', parseInt(minSize))
      if (maxSize) query = query.lte('current_version_file_size', parseInt(maxSize))

      // Tri + pagination
      query = query.order(sortBy === 'updatedAt' ? 'updated_at' : sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw error
      documents = data || []
      totalCount = count || 0

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
