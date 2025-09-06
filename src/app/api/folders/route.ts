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
    
    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    
    // Vérifier si le dossier existe déjà
    const { data: existing } = await admin
      .from('folders')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
    }

    // Créer le dossier dans Supabase (même logique que test-folders qui fonctionne)
    const now = new Date().toISOString()
    const { data: newFolder, error: insertError } = await admin
      .from('folders')
      .insert({
        id: 'folder_' + Date.now(),
        name: name.trim(),
        description: description?.trim() || null,
        authorId: 'cmebotahv0000c17w3izkh2k9',
        createdAt: now,
        updatedAt: now
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('❌ Erreur insertion dossier:', insertError)
      return NextResponse.json({
        error: insertError.message,
        code: insertError.code,
        details: insertError.details
      }, { status: 500 })
    }

    console.log('✅ Dossier créé dans Supabase:', newFolder.name)
    
    return NextResponse.json({ folder: newFolder }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Récupération dossiers - Début')
    
    // Utiliser Supabase pour la récupération persistante
    const admin = getSupabaseAdmin()
    
    // Récupérer les dossiers depuis Supabase (même logique que test-get-folders qui fonctionne)
    const { data: folders, error } = await admin
      .from('folders')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Erreur récupération dossiers:', error)
      return NextResponse.json({
        folders: [],
        error: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log(`📁 ${folders?.length || 0} dossiers trouvés dans Supabase`)
    
    return NextResponse.json({ folders: folders || [] })

  } catch (error) {
    console.error('Erreur API dossiers:', error)

    return NextResponse.json({
      folders: [],
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
