import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

type UpdateFolderBody = {
  name?: string
  description?: string
  parentId?: string | null
}

// GET - Récupérer un dossier spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('📁 Récupération dossier - Début')
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    // Récupérer le dossier avec ses détails
    const admin = getSupabaseAdmin()
    const { data: folder, error } = await admin
      .from('folders')
      .select('id, name, description, parentId, createdAt, updatedAt, authorId')
      .eq('id', folderId)
      .maybeSingle()

    if (error) throw error

    if (!folder) {
      
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Récupérer compteurs et auteur
    const [{ count: documentsCount }, { count: childrenCount }, { data: author }] = await Promise.all([
      admin.from('documents').select('id', { head: true, count: 'exact' }).eq('folderId', folderId),
      admin.from('folders').select('id', { head: true, count: 'exact' }).eq('parentId', folderId),
      admin.from('users').select('id, name, email').eq('id', folder.authorId).maybeSingle()
    ])

    return NextResponse.json({
      success: true,
      folder: {
        ...folder,
        _count: { documents: documentsCount || 0, children: childrenCount || 0 },
        author
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du dossier:', error)

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

// PUT - Modifier un dossier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('📁 Modification dossier - Début')
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    const raw = await request.text()
    let body: UpdateFolderBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    // Vérifier que le dossier existe avec son statut
    const admin = getSupabaseAdmin()
    const { data: existingFolder } = await admin
      .from('folders')
      .select('id, authorId, parentId, statut')
      .eq('id', folderId)
      .maybeSingle()

    if (!existingFolder) {
      
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Vérifier si le dossier est validé par le CB - dans ce cas, interdire la modification
    if (existingFolder.statut === 'VALIDÉ_CB' || existingFolder.statut === 'VALIDÉ_ORDONNATEUR' || existingFolder.statut === 'PAYÉ' || existingFolder.statut === 'TERMINÉ') {
      console.log(`🚫 Tentative de modification d'un dossier validé: ${folderId} (statut: ${existingFolder.statut})`)
      return NextResponse.json({ 
        error: `Impossible de modifier le dossier : il a été validé par le Contrôleur Budgétaire (statut: ${existingFolder.statut})` 
      }, { status: 403 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}
    
    if (body.name !== undefined) {
      const name = body.name.trim()
      if (!name) {
        
        return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
      }
      if (name.length > 100) {
        
        return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 })
      }
      
      // Vérifier qu'il n'y a pas de doublon (sauf le dossier actuel)
      const { data: duplicate } = await admin
        .from('folders')
        .select('id')
        .eq('name', name)
        .eq('authorId', existingFolder.authorId)
        .eq('parentId', body.parentId ?? existingFolder.parentId)
        .neq('id', folderId)
        .maybeSingle()
      
      if (duplicate) {
        
        return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
      }
      
      updateData.name = name
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim() || null
    }

    if (body.parentId !== undefined) {
      updateData.parentId = body.parentId
    }

    // Mettre à jour le dossier
    const { data: updatedFolder, error: updateErr } = await admin
      .from('folders')
      .update(updateData)
      .eq('id', folderId)
      .select('id, name, description, parentId, createdAt, updatedAt')
      .single()

    if (updateErr) throw updateErr

    return NextResponse.json({ 
      success: true,
      folder: updatedFolder 
    })
  } catch (error) {
    console.error('❌ Erreur lors de la modification du dossier:', error)

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

// DELETE - Supprimer un dossier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('🗑️ Suppression dossier - Début')
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    // Vérifier que le dossier existe avec son statut
    const admin = getSupabaseAdmin()
    const { data: folder, error } = await admin
      .from('folders')
      .select(`
        id, 
        name, 
        authorId,
        statut
      `)
      .eq('id', folderId)
      .maybeSingle()

    if (error) throw error

    if (!folder) {
      
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Vérifier si le dossier est validé par le CB - dans ce cas, interdire la suppression
    if (folder.statut === 'VALIDÉ_CB' || folder.statut === 'VALIDÉ_ORDONNATEUR' || folder.statut === 'PAYÉ' || folder.statut === 'TERMINÉ') {
      console.log(`🚫 Tentative de suppression d'un dossier validé: ${folder.name} (statut: ${folder.statut})`)
      return NextResponse.json({ 
        success: false,
        error: `Impossible de supprimer le dossier : il a été validé par le Contrôleur Budgétaire (statut: ${folder.statut})` 
      }, { status: 403 })
    }

    console.log(`📁 Dossier à supprimer: ${folder.name}`)

    // Vérifier si le dossier contient des documents ou des sous-dossiers
    const { count: documentsCount } = await admin
      .from('documents')
      .select('id', { head: true, count: 'exact' })
      .eq('folderId', folderId)

    const { count: childrenCount } = await admin
      .from('folders')
      .select('id', { head: true, count: 'exact' })
      .eq('parentId', folderId)

    console.log(`📄 Documents: ${documentsCount || 0}`)
    console.log(`📁 Sous-dossiers: ${childrenCount || 0}`)

    if ((documentsCount || 0) > 0) {
      return NextResponse.json({ 
        success: false,
        error: `Impossible de supprimer le dossier : il contient ${documentsCount} document(s)` 
      }, { status: 400 })
    }

    if ((childrenCount || 0) > 0) {
      return NextResponse.json({ 
        success: false,
        error: `Impossible de supprimer le dossier : il contient ${childrenCount} sous-dossier(s)` 
      }, { status: 400 })
    }

    // Supprimer le dossier
    const { error: deleteErr } = await admin
      .from('folders')
      .delete()
      .eq('id', folderId)
      .single()
    if (deleteErr) throw deleteErr

    console.log('✅ Dossier supprimé avec succès')
    
    return NextResponse.json({
      success: true,
      message: 'Dossier supprimé avec succès',
      deletedFolder: { id: folderId, name: folder.name }
    })
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du dossier:', error)

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
