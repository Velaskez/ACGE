import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('🗑️ Suppression document - Début')
    
    const resolvedParams = await params
    const documentId = resolvedParams.id
    
    // Pour l'instant, permettre la suppression à tous les admins
    // En production, vous pourriez vérifier l'authentification côté client
    
    // Récupérer le document avec toutes ses versions
    const admin = getSupabaseAdmin()
    const { data: document, error } = await admin
      .from('documents')
      .select('id, title, author:authorId(id, name, email), versions:file_versions(filePath:file_path, fileName:file_name)')
      .eq('id', documentId)
      .maybeSingle()

    if (error) throw error

    if (!document) {
      
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    console.log(`📄 Document à supprimer: ${document.title}`)
    console.log(`👤 Auteur: ${document.author?.name}`)
    console.log(`📁 Versions: ${document.versions.length}`)

    // Supprimer les fichiers stockés (si stockage local)
    for (const version of document.versions) {
      const filePathMeta = version.filePath || ''
      console.log(`🗂️ Fichier à supprimer: ${filePathMeta}`)
      
      // Note: Pour Supabase Storage, vous pourriez ajouter ici la suppression des fichiers
      // await supabase.storage.from('documents').remove([filePathMeta])
    }

    // Supprimer l'enregistrement en base de données
    // Prisma supprimera automatiquement les versions grâce aux relations CASCADE
    const { error: deleteErr } = await admin
      .from('documents')
      .delete()
      .eq('id', documentId)
      .single()
    if (deleteErr) throw deleteErr

    console.log('✅ Document supprimé avec succès')
    
    return NextResponse.json({
      success: true,
      message: 'Document supprimé avec succès',
      deletedDocument: {
        id: documentId,
        title: document.title,
        versionsCount: document.versions.length
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
      .select('id, title, description, category, isPublic:is_public, folder:folderId(id, name), author:authorId(id, name, email), currentVersion:current_version_id(*), versions:versions(count))')
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
