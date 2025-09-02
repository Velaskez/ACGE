import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

type CreateFolderBody = {
  name?: string
  description?: string
  parentId?: string | null
  numeroDossier?: string
  dateDepot?: string
  posteComptableId?: string
  numeroNature?: string
  natureDocumentId?: string
  objetOperation?: string
  beneficiaire?: string
}

export async function POST(request: NextRequest) {

  try {
    console.log('📁 Création dossier - Début')
    
    // Pour l'instant, utiliser un utilisateur admin par défaut
    // En production, vous pourriez vérifier l'authentification côté client
    
    const userId = 'cmebotahv0000c17w3izkh2k9' // ID de l'admin existant

    const raw = await request.text()
    let body: CreateFolderBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    const name = (body.name || '').trim()
    const description = (body.description || '').trim() || undefined
    const parentId = body.parentId ?? undefined
    const numeroDossier = body.numeroDossier || undefined
    const dateDepot = body.dateDepot || undefined
    const posteComptableId = body.posteComptableId || undefined
    const numeroNature = body.numeroNature || undefined
    const natureDocumentId = body.natureDocumentId || undefined
    const objetOperation = (body.objetOperation || '').trim() || undefined
    const beneficiaire = (body.beneficiaire || '').trim() || undefined

    if (!name) {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 })
    }

    // Empêcher les doublons (par utilisateur et parentId)
    const admin = getSupabaseAdmin()
    const { data: existing, error: existingErr } = await admin
      .from('folders')
      .select('id')
      .eq('name', name)
      .eq('authorId', userId)
      .eq('parentId', parentId === null ? null : parentId)
      .maybeSingle()

    if (existingErr && existingErr.code !== 'PGRST116') {
      throw existingErr
    }

    if (existing) {
      return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
    }

    // Création du dossier (version simplifiée pour compatibilité)
    const { data: created, error: insertErr } = await admin
      .from('folders')
      .insert({
        name,
        description,
        parentId: parentId === null ? null : parentId,
        authorId: userId
      })
      .select('id, name, description, createdAt:created_at, updatedAt:updated_at')
      .single()

    if (insertErr) {
      throw insertErr
    }

    return NextResponse.json({ folder: created }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {

  try {
    console.log('📁 Récupération dossiers - Début')
    
    // Pour l'instant, retourner tous les dossiers (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    const userId = 'cmebotahv0000c17w3izkh2k9' // ID de l'admin existant
    const userRole = 'ADMIN' // Admin voit tout

    // Construire les conditions de filtrage selon le rôle
    const userFilter = userRole === 'ADMIN' ? {} : { authorId: userId }

    // Récupérer les dossiers avec une requête simple
    let folders: any[] = []
    try {
      const admin = getSupabaseAdmin()
      const query = admin
        .from('folders')
        .select('id, name, authorId, createdAt:created_at, updatedAt:updated_at')
        .order('name', { ascending: true })
      const { data, error } = userRole === 'ADMIN'
        ? await query
        : await query.eq('authorId', userId)
      if (error) throw error
      folders = data || []

      // Ajouter les compteurs manuellement pour éviter les problèmes de relations
      for (const folder of folders) {
        try {
          const { count: documentCount } = await admin
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('folderId', folder.id)
          
          const { count: childrenCount } = await admin
            .from('folders')
            .select('id', { count: 'exact', head: true })
            .eq('parentId', folder.id)

          folder._count = {
            documents: documentCount,
            children: childrenCount
          }

          // Ajouter les informations de l'auteur
          try {
            const { data: author } = await admin
              .from('users')
              .select('name, email')
              .eq('id', folder.authorId)
              .maybeSingle()
            folder.author = author || { name: 'Utilisateur inconnu', email: 'unknown@example.com' }
          } catch (authorError) {
            console.error('Erreur récupération auteur:', authorError)
            folder.author = { name: 'Utilisateur inconnu', email: 'unknown@example.com' }
          }
        } catch (countError) {
          console.error('Erreur comptage pour dossier:', folder.id, countError)
          folder._count = { documents: 0, children: 0 }
          folder.author = { name: 'Utilisateur inconnu', email: 'unknown@example.com' }
        }
      }

    } catch (dbError) {
      console.error('Erreur base de données dossiers:', dbError)
      return NextResponse.json({
        folders: [],
        error: 'Erreur temporaire de la base de données'
      })
    }

    return NextResponse.json({ folders })

  } catch (error) {
    console.error('Erreur API dossiers:', error)

    // Toujours retourner du JSON valide
    return NextResponse.json({
      folders: [],
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
