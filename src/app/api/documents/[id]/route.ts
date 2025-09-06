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
    const userRole = decoded.role
    console.log('✅ Utilisateur authentifié:', userId, 'Rôle:', userRole)
    
    const resolvedParams = await params
    const documentId = resolvedParams.id
    
    // Récupérer le document de base
    const admin = getSupabaseAdmin()
    const { data: document, error } = await admin
      .from('documents')
      .select('id, title, authorId, folderId')
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
    if (userRole !== 'admin' && document.authorId !== userId) {
      console.log('❌ Accès refusé - pas le propriétaire')
      return NextResponse.json(
        { error: 'Accès refusé - vous ne pouvez supprimer que vos propres documents' },
        { status: 403 }
      )
    }

    console.log(`📄 Document à supprimer: ${document.title}`)
    console.log(`👤 Auteur: ${document.authorId}`)
    console.log(`📁 Dossier: ${document.folderId}`)

    // Supprimer l'enregistrement en base de données
    // Les versions seront supprimées automatiquement grâce aux contraintes CASCADE
    const { error: deleteErr } = await admin
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteErr) throw deleteErr

    console.log('✅ Document supprimé avec succès')
    
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

    // Vérifier que le document existe
    const admin = getSupabaseAdmin()
    const { data: existingDocument } = await admin
      .from('documents')
      .select('id, title, author:authorId(id, name), folder:folderId(id, name)')
      .eq('id', documentId)
      .maybeSingle()

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    console.log(`📄 Document à modifier: ${existingDocument.title}`)
    console.log(`👤 Auteur: ${existingDocument.author?.name}`)
    console.log(`📁 Dossier actuel: ${existingDocument.folder?.name || 'Racine'}`)

    // Vérifier le dossier si spécifié
    if (folderId && folderId !== 'root') {
      const { data: folder } = await admin
        .from('folders')
        .select('id, name')
        .eq('id', folderId)
        .maybeSingle()
      if (!folder) {
        return NextResponse.json({ error: 'Dossier spécifié non trouvé' }, { status: 400 })
      }
      console.log(`📁 Nouveau dossier: ${folder.name}`)
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      category: category || null,
      isPublic: Boolean(isPublic),
      updatedAt: new Date()
    }

    // Gérer le dossier
    if (folderId === 'root' || folderId === null || folderId === undefined) {
      updateData.folderId = null
    } else {
      updateData.folderId = folderId
    }

    // Mettre à jour le document
    const { data: updatedDocument, error: updateErr } = await admin
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select('id, title, description, category, isPublic:is_public, currentVersion:current_version_id(*), author:authorId(id, name, email), folder:folderId(id, name)')
      .single()

    if (updateErr) throw updateErr

    console.log('✅ Document modifié avec succès')
    console.log(`📄 Nouveau titre: ${updatedDocument.title}`)
    console.log(`📁 Nouveau dossier: ${updatedDocument.folder?.name || 'Racine'}`)

    return NextResponse.json({
      success: true,
      message: 'Document modifié avec succès',
      document: updatedDocument
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
