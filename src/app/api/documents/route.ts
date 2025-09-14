import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🚀 API DOCUMENTS - ACGE avec Supabase (VERSION SIMPLIFIÉE)
 * 
 * Version drastique pour éliminer tous les problèmes de colonnes
 */

export async function GET(request: NextRequest) {
  try {
    console.log('📄 API Documents - Version simplifiée')
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    console.log('📄 Paramètres:', { search, page, limit })

    // Connexion à Supabase
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      console.error('❌ Supabase non configuré')
      return NextResponse.json({
        documents: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        error: 'Base de données non configurée'
      }, { status: 500 })
    }

    const offset = (page - 1) * limit

    try {
      // REQUÊTE AVEC NATURE DU DOCUMENT
      let query = supabase
        .from('documents')
        .select(`
          id, 
          title, 
          description, 
          author_id, 
          folder_id, 
          created_at, 
          file_name, 
          file_size, 
          file_type, 
          file_path,
          is_public,
          tags,
          nature_document_id,
          natures_documents!nature_document_id (
            id,
            numero,
            nom,
            description
          )
        `, { count: 'exact' })

      // Recherche simple
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,file_name.ilike.%${search}%`)
      }

      // Tri par date de création (colonne qui existe)
      query = query.order('created_at', { ascending: false })

      // Pagination
      query = query.range(offset, offset + limit - 1)

      // Exécuter la requête
      const { data: documents, error, count } = await query

      if (error) {
        console.error('❌ Erreur Supabase documents:', error)
        return NextResponse.json({
          documents: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          error: `Erreur base de données: ${error.message}`
        }, { status: 500 })
      }

      console.log(`📄 ${documents?.length || 0} documents trouvés sur ${count || 0} total`)

      // TRANSFORMATION SIMPLE DES DONNÉES
      const enrichedDocuments = (documents || []).map(doc => {
        // Générer un fileId pour compatibilité
        const timestamp = new Date(doc.created_at).getTime()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const documentId = `file-${timestamp}-${randomSuffix}`

        // Générer l'URL du fichier
        let fileUrl = null
        if (doc.file_name) {
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(doc.file_name)
          fileUrl = publicUrl
        }

        return {
          id: documentId,
          originalId: doc.id,
          title: doc.title,
          description: doc.description || '',
          fileName: doc.file_name || '',
          fileSize: doc.file_size || 0,
          fileType: doc.file_type || 'application/octet-stream',
          filePath: doc.file_path || '',
          fileUrl: fileUrl,
          isPublic: doc.is_public || false,
          tags: doc.tags || [],
          category: doc.natures_documents?.nom || 'Non classé',
          natureDocumentId: doc.nature_document_id,
          natureDocument: doc.natures_documents ? {
            id: doc.natures_documents.id,
            numero: doc.natures_documents.numero,
            nom: doc.natures_documents.nom,
            description: doc.natures_documents.description
          } : null,
          createdAt: doc.created_at,
          updatedAt: doc.created_at, // Utiliser created_at comme updatedAt
          authorId: doc.author_id || 'unknown',
          folderId: doc.folder_id || null,
          author: {
            id: doc.author_id || 'unknown',
            name: 'Utilisateur inconnu',
            email: 'unknown@example.com'
          },
          folder: doc.folder_id ? {
            id: doc.folder_id,
            name: 'Dossier inconnu'
          } : null,
          _count: {
            comments: 0,
            shares: 0
          }
        }
      })

      console.log(`✅ ${enrichedDocuments.length} documents enrichis retournés`)

      return NextResponse.json({
        documents: enrichedDocuments,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })

    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError)
      return NextResponse.json({
        documents: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        error: `Erreur base de données: ${dbError instanceof Error ? dbError.message : 'Erreur inconnue'}`
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erreur générale API documents:', error)
    return NextResponse.json({
      documents: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}