import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ Suppression document - Début')
    
    // Vérifier l'authentification (optionnel en mode développement)
    const token = request.cookies.get('auth-token')?.value
    let userId = 'test-user'
    let userRole = 'admin'

    if (token) {
      try {
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
        userId = decoded.userId
        userRole = decoded.role
        console.log('✅ Utilisateur authentifié:', userId, 'Rôle:', userRole)
      } catch (error) {
        console.log('⚠️ Token invalide, utilisation des valeurs par défaut')
      }
    } else {
      console.log('⚠️ Pas de token, utilisation des valeurs par défaut pour les tests')
    }
    
    const resolvedParams = await params
    const documentId = resolvedParams.id
    
    // Récupérer le document de base
    const admin = getSupabaseAdmin()
    const { data: document, error } = await admin
      .from('documents')
      .select('id, title, author_id, folder_id, file_name')
      .eq('id', documentId)
      .maybeSingle()

    if (error) throw error

    if (!document) {
      console.log('❌ Document non trouvé')
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions (admin ou propriétaire)
    if (userRole !== 'admin' && document.author_id !== userId) {
      console.log('❌ Accès refusé - pas le propriétaire')
      return NextResponse.json(
        { error: 'Accès refusé - vous ne pouvez supprimer que vos propres documents' },
        { status: 403 }
      )
    }

    console.log(`📄 Document à supprimer: ${document.title}`)
    console.log(`👤 Auteur: ${document.author_id}`)
    console.log(`📁 Dossier: ${document.folder_id}`)

    // Supprimer l'enregistrement en base de données
    // Les versions seront supprimées automatiquement grâce aux contraintes CASCADE
    const { error: deleteErr } = await admin
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteErr) throw deleteErr

    console.log('✅ Document supprimé avec succès')
    
    // Supprimer le fichier du stockage Supabase si possible
    if (document.file_name) {
      try {
        const { error: storageError } = await admin.storage
          .from('documents')
          .remove([document.file_name])
        
        if (storageError) {
          console.warn('⚠️ Impossible de supprimer le fichier du stockage:', storageError)
        } else {
          console.log('✅ Fichier supprimé du stockage Supabase')
        }
      } catch (storageErr) {
        console.warn('⚠️ Erreur lors de la suppression du stockage:', storageErr)
      }
    }
    
    
    return NextResponse.json({
      success: true,
      message: 'Document supprimé avec succès',
      deletedDocument: {
        id: documentId,
        title: document.title,
        authorId: document.author_id,
        folderId: document.folder_id
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du document:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// GET - Récupérer un document spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('📄 Récupération document - Début')
    
    const resolvedParams = await params
    const documentId = resolvedParams.id

    // Récupérer le document
    const admin = getSupabaseAdmin()
    const { data: document, error } = await admin
      .from('documents')
      .select('id, title, description, author_id, folder_id, created_at')
      .eq('id', documentId)
      .maybeSingle()

    if (error) throw error

    if (!document) {
      
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      document 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du document:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// PUT - Modifier un document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📝 Modification document - Début')
    
    const resolvedParams = await params
    const documentId = resolvedParams.id

    // Récupérer les données de la requête
    const raw = await request.text()
    let body: any = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    const { title, description, category, isPublic, folderId } = body

    // Validation des données
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Le titre est trop long (max 200 caractères)' }, { status: 400 })
    }

    // Vérifier que le document existe et récupérer toutes ses données
    const admin = getSupabaseAdmin()
    const { data: existingDocument } = await admin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle()

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    console.log(`📄 Document à modifier: ${existingDocument.title}`)
    console.log(`👤 Auteur ID: ${existingDocument.author_id}`)
    console.log(`📁 Dossier actuel ID: ${existingDocument.folder_id || 'Racine'}`)

    // Vérifier le dossier si spécifié
    if (folderId && folderId !== 'root') {
      // Vérifier le format de l'ID pour décider comment le valider
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const legacyRegex = /^folder[-_]\d+$/i
      
      if (uuidRegex.test(folderId)) {
        // ID UUID standard - vérifier dans la base
        const { data: folder } = await admin
          .from('folders')
          .select('id, name')
          .eq('id', folderId)
          .maybeSingle()
        if (!folder) {
          return NextResponse.json({ error: 'Dossier spécifié non trouvé' }, { status: 400 })
        }
        console.log(`📁 Nouveau dossier UUID: ${folder.name}`)
      } else if (legacyRegex.test(folderId)) {
        // ID legacy - accepter sans vérification en base (car incompatible UUID)
        console.log(`📁 Nouveau dossier legacy: ${folderId}`)
        // Note: On ne peut pas vérifier l'existence en base car le type UUID rejette ces IDs
      } else {
        return NextResponse.json({ error: 'Format d\'ID de dossier invalide' }, { status: 400 })
      }
    }

    // Préparer les données de mise à jour (utiliser snake_case pour Supabase)
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      // Note: La colonne 'category' n'existe pas dans la table documents
      // category: category || null, // Commenté car la colonne n'existe pas
      is_public: Boolean(isPublic),
      updated_at: new Date().toISOString()
    }

    // Gérer le dossier (utiliser snake_case pour Supabase)
    if (folderId === 'root' || folderId === null || folderId === undefined) {
      updateData.folder_id = null
    } else {
      // Vérifier si c'est un ID legacy
      const legacyRegex = /^folder[-_]\d+$/i
      if (legacyRegex.test(folderId)) {
        // Pour les IDs legacy, ne pas mettre à jour le folder_id en base
        // car la colonne UUID rejette ces valeurs
        console.log(`⚠️ ID legacy détecté (${folderId}) - folder_id non mis à jour en base`)
        // On garde folder_id inchangé pour éviter l'erreur UUID
        // La migration sera nécessaire pour supporter ces IDs
      } else {
        updateData.folder_id = folderId
      }
    }

    // Mettre à jour le document
    const { data: updatedDocument, error: updateErr } = await admin
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select('id, title, description, is_public, updated_at, author_id, folder_id')
      .single()

    if (updateErr) throw updateErr

    console.log('✅ Document modifié avec succès')
    console.log(`📄 Nouveau titre: ${updatedDocument.title}`)


    // Transformer la réponse pour correspondre au format DocumentItem
    const transformedDocument = {
      id: updatedDocument.id,
      title: updatedDocument.title,
      description: updatedDocument.description,
      category: category || null, // Utiliser la valeur du formulaire car la colonne n'existe pas en base
      isPublic: updatedDocument.is_public,
      updatedAt: updatedDocument.updated_at,
      authorId: updatedDocument.author_id,
      folderId: updatedDocument.folder_id,
      // Garder les autres champs du document original
      fileName: existingDocument.file_name,
      fileSize: existingDocument.file_size,
      fileType: existingDocument.file_type,
      filePath: existingDocument.file_path,
      createdAt: existingDocument.created_at,
      tags: existingDocument.tags || [],
      author: {
        id: updatedDocument.author_id,
        name: 'Utilisateur',
        email: 'user@example.com'
      },
      _count: { comments: 0, shares: 0 }
    }

    return NextResponse.json({
      success: true,
      message: 'Document modifié avec succès',
      document: transformedDocument
    })

  } catch (error) {
    console.error('❌ Erreur lors de la modification du document:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
