import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * API pour gérer les documents individuels (GET, PUT, DELETE)
 */

// GET - Récupérer un document spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const documentId = resolvedParams.id

    console.log('📄 API Document GET:', documentId)

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Base de données non configurée' }, { status: 500 })
    }

    // Récupérer le document avec sa nature
    const { data: document, error } = await supabase
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
      `)
      .eq('id', documentId)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Transformer les données
    const enrichedDocument = {
      id: `file-${new Date(document.created_at).getTime()}-${Math.random().toString(36).substring(2, 8)}`,
      originalId: document.id,
      title: document.title,
      description: document.description || '',
      fileName: document.file_name || '',
      fileSize: document.file_size || 0,
      fileType: document.file_type || 'application/octet-stream',
      filePath: document.file_path || '',
      isPublic: document.is_public || false,
      tags: document.tags || [],
      category: document.natures_documents?.nom || 'Non classé',
      natureDocumentId: document.nature_document_id,
      natureDocument: document.natures_documents ? {
        id: document.natures_documents.id,
        numero: document.natures_documents.numero,
        nom: document.natures_documents.nom,
        description: document.natures_documents.description
      } : null,
      createdAt: document.created_at,
      updatedAt: document.created_at,
      authorId: document.author_id || 'unknown',
      folderId: document.folder_id || null,
      author: {
        id: document.author_id || 'unknown',
        name: 'Utilisateur inconnu',
        email: 'unknown@example.com'
      },
      folder: document.folder_id ? {
        id: document.folder_id,
        name: 'Dossier inconnu'
      } : null
    }

    return NextResponse.json({ document: enrichedDocument })

  } catch (error) {
    console.error('❌ Erreur API Document GET:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const documentId = resolvedParams.id

    console.log('🗑️ API Document DELETE:', documentId)

    // Authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Base de données non configurée' }, { status: 500 })
    }

    // Vérifier que le document existe et appartient à l'utilisateur
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, title, author_id, file_name, file_path')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Vérifier les permissions (propriétaire uniquement pour l'instant)
    if (document.author_id !== userId) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Supprimer le fichier du storage si il existe
    if (document.file_name) {
      try {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_name])
        
        if (storageError) {
          console.warn('⚠️ Erreur suppression fichier storage:', storageError)
        } else {
          console.log('✅ Fichier supprimé du storage:', document.file_name)
        }
      } catch (storageError) {
        console.warn('⚠️ Erreur suppression fichier storage:', storageError)
      }
    }

    // Supprimer le document de la base de données
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('❌ Erreur suppression document:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    console.log('✅ Document supprimé avec succès:', document.title)

    return NextResponse.json({ 
      success: true,
      message: 'Document supprimé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur API Document DELETE:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}