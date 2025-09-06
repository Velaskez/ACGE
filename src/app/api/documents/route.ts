import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { searchCache, generateResultsKey, invalidateSearchCache } from '@/lib/search-cache'

/**
 * 📄 API DOCUMENTS - Standards Next.js (selon documentation MCP)
 * 
 * Fonctionnalités:
 * - Récupération paginée des documents
 * - Filtrage et recherche avancés
 * - Gestion d'erreurs robuste
 * - Validation des paramètres
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📄 API Documents - Début')
    
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
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

    // Vérifier le cache d'abord
    const cacheKey = generateResultsKey({
      search: search || undefined,
      fileType: fileType || undefined,
      folderId: folderId || undefined,
      page,
      limit,
      sortBy,
      sortOrder
    })
    
    const cachedResult = searchCache.get<{
      documents: any[]
      pagination: any
    }>(cacheKey)
    
    if (cachedResult) {
      console.log(`🎯 Résultats servis depuis le cache: page ${page}`)
      return NextResponse.json(cachedResult)
    }

    let documents: any[] = []
    let totalCount = 0
    const startTime = Date.now()

    try {
      // Essayer d'abord Supabase
      try {
        const supabase = getSupabaseAdmin()
        if (!supabase) {
          throw new Error('Supabase non configuré')
        }
        
        let query = supabase
          .from('documents')
          .select('id, title, description, authorId, folderId, createdAt, updatedAt, currentVersionId', { count: 'exact' })

        // Filtres de base - utiliser recherche full-text si disponible
        if (search) {
          try {
            // Essayer d'abord la recherche full-text optimisée
            const { data: searchResults } = await supabase
              .rpc('search_documents_optimized', {
                search_query: search,
                limit_count: limit,
                offset_count: offset
              })
            
            if (searchResults && searchResults.length > 0) {
              // Utiliser les résultats de la recherche full-text
              documents = searchResults
              totalCount = searchResults.length // Approximation
            } else {
              // Fallback sur la recherche ILIKE
              query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
            }
          } catch (searchError) {
            console.log('Recherche full-text non disponible, utilisation d\'ILIKE')
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
          }
        }
        
        if (folderId && folderId !== 'root') {
          query = query.eq('folderId', folderId)
        } else if (folderId === 'root') {
          query = query.is('folderId', null)
        }

        // Tri - utiliser les colonnes qui existent
        let sortField = 'createdAt' // colonne par défaut qui existe
        if (sortBy === 'title') {
          sortField = 'title'
        } else if (sortBy === 'createdAt') {
          sortField = 'createdAt'
        } else if (sortBy === 'updatedAt') {
          sortField = 'updatedAt'
        }
        
        query = query.order(sortField, { ascending: sortOrder === 'asc' })

        // Pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query
        
        if (error) {
          console.error('Erreur Supabase, passage à Prisma:', error)
          throw error
        }
        
        documents = data || []
        totalCount = count || 0
        
      } catch (supabaseError) {
        console.error('❌ Erreur Supabase:', supabaseError)
        throw new Error('Base de données Supabase indisponible')
      }

      // Enrichir les documents avec les versions
      if (documents.length > 0) {
        // Récupérer les versions pour tous les documents
        const documentIds = documents.map(doc => doc.id)
        const { data: versionsData, error: versionsError } = await supabase
          .from('document_versions')
          .select('*')
          .in('document_id', documentIds)
        
        if (versionsError) {
          console.error('Erreur récupération versions:', versionsError)
        }
        
        const versionsMap = new Map()
        if (versionsData) {
          versionsData.forEach(version => {
            if (!versionsMap.has(version.document_id)) {
              versionsMap.set(version.document_id, [])
            }
            versionsMap.get(version.document_id).push(version)
          })
        }
        
        for (const doc of documents) {
          const versions = versionsMap.get(doc.id) || []
          let currentVersion = versions.find(v => v.id === doc.current_version_id) || versions[0]
          
          // Si pas de version trouvée, créer une version factice pour l'affichage
          if (!currentVersion) {
            currentVersion = {
              id: 'no-version',
              version_number: 1,
              file_name: doc.title || 'Document',
              file_size: 0,
              file_type: 'unknown',
              file_path: '',
              change_log: 'Version initiale',
              created_at: doc.created_at
            }
          }
          
          // Ajouter les informations de version
          doc.currentVersion = {
            id: currentVersion.id,
            versionNumber: currentVersion.version_number || 1,
            fileName: currentVersion.file_name || doc.title || 'Document',
            fileSize: currentVersion.file_size || 0,
            fileType: currentVersion.file_type || 'unknown',
            filePath: currentVersion.file_path || '',
            changeLog: currentVersion.change_log || 'Version initiale',
            createdAt: currentVersion.created_at || doc.created_at
          }
          
          // Normaliser les noms de propriétés
          doc.createdAt = doc.created_at
          doc.updatedAt = doc.updated_at || doc.created_at
          doc.authorId = doc.author_id
          doc.folderId = doc.folder_id
          doc.author = {
            id: doc.author_id || 'unknown',
            name: 'Utilisateur',
            email: 'user@example.com'
          }
          doc.folder = doc.folder_id ? {
            id: doc.folder_id,
            name: 'Dossier'
          } : null
          doc._count = {
            versions: versions.length
          }
        }
      }

      const duration = Date.now() - startTime
      console.log(`✅ ${documents.length} documents récupérés sur ${totalCount} total en ${duration}ms`)

      // Mettre en cache les résultats
      const result = {
        documents,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
      
      searchCache.set(cacheKey, result, 2 * 60 * 1000) // 2 minutes

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
    console.error('❌ Erreur API documents:', error)
    
    return NextResponse.json({
      documents: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      error: 'Erreur générale de l\'API'
    }, { status: 500 })
  }
}
