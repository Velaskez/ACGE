import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Récupération des dossiers comptables')
    
    const admin = getSupabaseAdmin()
    
    // Récupérer les dossiers comptables avec relations sécurisées
    const { data: dossiers, error: dossiersError } = await admin
      .from('dossiers')
      .select(`
        id,
        numeroDossier,
        numeroNature,
        objetOperation,
        beneficiaire,
        montant,
        status,
        created_at,
        updated_at,
        posteComptableId,
        natureDocumentId,
        secretaireId
      `)
      .order('created_at', { ascending: false })

    if (dossiersError) {
      throw dossiersError
    }

    console.log(`📋 ${dossiers?.length || 0} dossiers comptables trouvés`)
    
    return NextResponse.json({ 
      success: true, 
      dossiers: dossiers || [],
      count: dossiers?.length || 0
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des dossiers comptables:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des dossiers comptables',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Création d\'un nouveau dossier comptable')
    
    const body = await request.json()
    
    const {
      numeroDossier,
      numeroNature,
      objetOperation,
      beneficiaire,
      posteComptableId,
      natureDocumentId,
      secretaireId
    } = body

    // Validation des champs requis
    if (!numeroDossier || !numeroNature || !objetOperation || !beneficiaire) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tous les champs sont requis: numeroDossier, numeroNature, objetOperation, beneficiaire' 
        }, 
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    // Vérifier si le numéro de dossier existe déjà
    const { data: existingDossier, error: checkError } = await admin
      .from('dossiers')
      .select('id')
      .eq('numeroDossier', numeroDossier)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingDossier) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un dossier avec ce numéro existe déjà' 
        }, 
        { status: 409 }
      )
    }

    // Créer le nouveau dossier
    const { data: newDossier, error: insertError } = await admin
      .from('dossiers')
      .insert({
        numeroDossier,
        numeroNature,
        objetOperation,
        beneficiaire,
        posteComptableId: posteComptableId || 'default-poste-id',
        natureDocumentId: natureDocumentId || 'default-nature-id',
        secretaireId: secretaireId || 'cmecmvbvy0000c1ecbq58lmtm'
      })
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()

    if (insertError) {
      throw insertError
    }

    console.log('✅ Dossier comptable créé:', newDossier.numeroDossier)
    
    return NextResponse.json({ 
      success: true, 
      dossier: newDossier,
      message: 'Dossier comptable créé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la création du dossier comptable:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création du dossier comptable',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
