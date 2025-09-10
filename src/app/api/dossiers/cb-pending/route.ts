import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 📊 API DOSSIERS CB PENDING - ACGE
 * 
 * Récupère les dossiers en attente de validation par le Contrôleur Budgétaire
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération des dossiers en attente CB')
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer les dossiers en attente de validation CB
    const { data: dossiers, error } = await admin
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('statut', 'EN_ATTENTE')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('❌ Erreur Supabase dossiers CB:', error)
      throw error
    }

    console.log(`📊 ${dossiers?.length || 0} dossiers en attente CB trouvés`)
    
    // Log détaillé pour diagnostic
    if (dossiers && dossiers.length > 0) {
      console.log('📊 Détails des dossiers en attente:')
      dossiers.forEach((dossier, index) => {
        console.log(`  ${index + 1}. ${dossier.numeroDossier} - Statut: ${dossier.statut} - Créé: ${dossier.createdAt}`)
      })
    } else {
      console.log('📊 Aucun dossier en attente trouvé')
    }
    
    return NextResponse.json({ 
      success: true, 
      dossiers: dossiers || [],
      count: dossiers?.length || 0
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des dossiers CB:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des dossiers en attente',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
