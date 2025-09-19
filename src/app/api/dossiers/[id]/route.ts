import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 📄 API DOSSIER SINGLE - ACGE
 * 
 * Récupère un dossier spécifique par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const dossierId = resolvedParams.id
    
    console.log('📄 Récupération du dossier:', dossierId)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer le dossier avec toutes les informations
    const { data: dossier, error } = await admin
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('id', dossierId)
      .single()

    if (error) {
      console.error('❌ Erreur récupération dossier:', error)
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    console.log('✅ Dossier trouvé:', {
      id: dossier.id,
      numero: dossier.numeroDossier,
      statut: dossier.statut,
      createdAt: dossier.createdAt
    })
    
    return NextResponse.json({ 
      success: true, 
      dossier
    })

  } catch (error) {
    console.error('❌ Erreur API dossier single:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}