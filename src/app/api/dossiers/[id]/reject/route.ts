import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * ❌ API REJET DOSSIER - ACGE
 * 
 * Rejette un dossier par le Contrôleur Budgétaire
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const dossierId = resolvedParams.id
    
    console.log('❌ Rejet du dossier:', dossierId)
    
    const body = await request.json()
    const { reason } = body
    
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'La raison du rejet est requise' },
        { status: 400 }
      )
    }
    
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
        { error: 'Ce dossier ne peut pas être rejeté dans son état actuel' },
        { status: 400 }
      )
    }
    
    // Mettre à jour le statut du dossier avec la raison du rejet
    const { data: updatedDossier, error: updateError } = await admin
      .from('dossiers')
      .update({
        statut: 'REJETÉ_CB',
        updatedAt: new Date().toISOString(),
        // On pourrait ajouter un champ pour stocker la raison du rejet
        // rejectionReason: reason
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
      console.error('❌ Erreur rejet dossier:', updateError)
      throw updateError
    }

    console.log('❌ Dossier rejeté par CB:', updatedDossier.numeroDossier, 'Raison:', reason)
    
    return NextResponse.json({ 
      success: true, 
      dossier: updatedDossier,
      message: 'Dossier rejeté avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors du rejet du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du rejet du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
