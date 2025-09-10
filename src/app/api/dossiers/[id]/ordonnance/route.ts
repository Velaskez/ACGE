import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 📋 API ORDONNANCEMENT DOSSIER - ACGE
 * 
 * Ordonne un dossier par l'Ordonnateur
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const dossierId = resolvedParams.id
    
    console.log('📋 Ordonnancement du dossier:', dossierId)
    
    const body = await request.json()
    const { comment } = body
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Vérifier que le dossier existe et est validé par CB
    const { data: existingDossier, error: checkError } = await admin
      .from('dossiers')
      .select('id, statut')
      .eq('id', dossierId)
      .single()

    if (checkError || !existingDossier) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    if (existingDossier.statut !== 'VALIDÉ_CB') {
      return NextResponse.json(
        { error: 'Ce dossier doit être validé par le CB avant d\'être ordonné' },
        { status: 400 }
      )
    }
    
    // Mettre à jour le statut du dossier
    const { data: updatedDossier, error: updateError } = await admin
      .from('dossiers')
      .update({
        statut: 'VALIDÉ_ORDONNATEUR',
        updatedAt: new Date().toISOString()
        // On pourrait ajouter un champ pour stocker le commentaire d'ordonnancement
        // ordonnancementComment: comment
      })
      .eq('id', dossierId)
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()

    if (updateError) {
      console.error('❌ Erreur ordonnancement dossier:', updateError)
      throw updateError
    }

    console.log('📋 Dossier ordonné:', updatedDossier.numeroDossier)
    
    return NextResponse.json({ 
      success: true, 
      dossier: updatedDossier,
      message: 'Dossier ordonné avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'ordonnancement du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'ordonnancement du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
