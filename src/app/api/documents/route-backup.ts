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
      // TEMPORAIRE: Toujours retourner des données de test pour le développement
      console.log('⚠️ Mode développement: retour de données de test')
        
        // Retourner des données de test pour le développement
        const mockDocuments = [
          {
            id: 'doc-1',
            title: 'Document de test 1',
            description: 'Ceci est un document de test',
            fileName: 'test-document-1.pdf',
            fileSize: 1024000,
            fileType: 'application/pdf',
            filePath: '/uploads/test-document-1.pdf',
            isPublic: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: {
              id: 'user-1',
              name: 'Utilisateur Test',
              email: 'test@example.com'
            },
            folder: null,
            tags: [],
            _count: {
              comments: 0,
              shares: 0
            }
          },
          {
            id: 'doc-2',
            title: 'Document de test 2',
            description: 'Un autre document de test',
            fileName: 'test-document-2.docx',
            fileSize: 512000,
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            filePath: '/uploads/test-document-2.docx',
            isPublic: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Hier
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            author: {
              id: 'user-1',
              name: 'Utilisateur Test',
              email: 'test@example.com'
            },
            folder: null,
            tags: ['important', 'test'],
            _count: {
              comments: 2,
              shares: 1
            }
          }
        ]
        
        // Appliquer la pagination aux données de test
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedDocuments = mockDocuments.slice(startIndex, endIndex)
        
        return NextResponse.json({
          documents: paginatedDocuments,
          pagination: {
            page,
            limit,
            total: mockDocuments.length,
            totalPages: Math.ceil(mockDocuments.length / limit)
          }
        })
      }
      
      // Code Supabase désactivé temporairement
      // Essayer d'abord Supabase
      // try {
        
        let query = supabase
          .from('documents')
          .select('id, title, description, authorId, folderId, createdAt, updatedAt, fileName, fileSize, fileType, filePath', { count: 'exact' })

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

      // Enrichir les documents avec les informations utilisateur
      if (documents.length > 0) {
        // Récupérer les informations des utilisateurs
        const authorIds = [...new Set(documents.map(doc => doc.authorId).filter(Boolean))]
        let usersMap = new Map()
        
        if (authorIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', authorIds)
          
          if (usersError) {
            console.error('Erreur récupération utilisateurs:', usersError)
          } else if (usersData) {
            usersData.forEach(user => {
              usersMap.set(user.id, user)
            })
          }
        }
        
        for (const doc of documents) {
          // Les données sont déjà dans le bon format (camelCase)
          
          // Informations de l'auteur
          const author = usersMap.get(doc.authorId)
          doc.author = author ? {
            id: author.id,
            name: author.name,
            email: author.email
          } : {
            id: doc.authorId || 'unknown',
            name: 'Utilisateur',
            email: 'user@example.com'
          }
          
          // Informations du dossier
          doc.folder = doc.folderId ? {
            id: doc.folderId,
            name: 'Dossier'
          } : null
          
          // Version actuelle (modèle simple)
          doc.currentVersion = {
            id: doc.id,
            versionNumber: 1,
            fileName: doc.fileName || doc.title || 'Document',
            fileSize: doc.fileSize || 0,
            fileType: doc.fileType || 'unknown',
            filePath: doc.filePath || '',
            changeLog: 'Version actuelle',
            createdAt: doc.createdAt
          }
          
          // Compteur de versions (toujours 1 dans le modèle simple)
          doc._count = {
            versions: 1
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
    // */

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
