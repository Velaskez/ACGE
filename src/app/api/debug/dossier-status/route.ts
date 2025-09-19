import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🔍 API DEBUG - ÉTAT DOSSIER
 * 
 * Endpoint de debug pour vérifier l'état d'un dossier
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du dossier requis' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Debug état dossier:', id)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer le dossier avec toutes les informations
    const { data: dossier, error: fetchError } = await admin
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ Erreur récupération dossier:', fetchError)
      return NextResponse.json(
        { 
          error: 'Dossier non trouvé',
          details: fetchError
        },
        { status: 404 }
      )
    }

    console.log('✅ Dossier trouvé:', {
      id: dossier.id,
      numero: dossier.numeroDossier,
      statut: dossier.statut,
      createdAt: dossier.createdAt,
      updatedAt: dossier.updatedAt
    })
    
    // Vérifier les validations existantes
    const { data: validationTypeOperation } = await admin
      .from('validations_cb')
      .select('*')
      .eq('dossier_id', id)
      .single()
    
    const { data: validationsControlesFond } = await admin
      .from('validations_controles_fond')
      .select('*')
      .eq('dossier_id', id)
    
    return NextResponse.json({ 
      success: true,
      dossier: {
        id: dossier.id,
        numeroDossier: dossier.numeroDossier,
        statut: dossier.statut,
        createdAt: dossier.createdAt,
        updatedAt: dossier.updatedAt,
        rejectionReason: dossier.rejectionReason,
        rejectionDetails: dossier.rejectionDetails,
        rejectedAt: dossier.rejectedAt
      },
      validations: {
        typeOperation: validationTypeOperation,
        controlesFond: validationsControlesFond
      },
      canReject: dossier.statut === 'EN_ATTENTE',
      debug: {
        timestamp: new Date().toISOString(),
        dossierId: id
      }
    })

  } catch (error) {
    console.error('❌ Erreur debug dossier:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du debug du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
