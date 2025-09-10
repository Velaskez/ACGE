import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * ✅ API VALIDATION DOSSIER - ACGE
 * 
 * Valide un dossier par le Contrôleur Budgétaire
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const dossierId = resolvedParams.id
    
    console.log('✅ Validation du dossier:', dossierId)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Vérifier que le dossier existe et est en attente
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

    if (existingDossier.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { error: 'Ce dossier ne peut pas être validé dans son état actuel' },
        { status: 400 }
      )
    }
    
    // Mettre à jour le statut du dossier
    const { data: updatedDossier, error: updateError } = await admin
      .from('dossiers')
      .update({
        statut: 'VALIDÉ_CB',
        updatedAt: new Date().toISOString()
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
      console.error('❌ Erreur validation dossier:', updateError)
      throw updateError
    }

    console.log('✅ Dossier validé par CB:', updatedDossier.numeroDossier)
    
    return NextResponse.json({ 
      success: true, 
      dossier: updatedDossier,
      message: 'Dossier validé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la validation du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la validation du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
