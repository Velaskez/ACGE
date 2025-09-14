import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 📊 API DOSSIERS CB ALL - ACGE
 * 
 * Récupère tous les dossiers pour le Contrôleur Budgétaire (tous statuts)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération de tous les dossiers CB')
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer tous les dossiers (tous statuts)
    const { data: dossiers, error } = await admin
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .order('createdAt', { ascending: false })

    // Enrichir les dossiers avec les noms de dossiers manquants
    if (dossiers && dossiers.length > 0) {
      for (const dossier of dossiers) {
        if (!dossier.foldername && dossier.folderId) {
          try {
            const { data: folder } = await admin
              .from('folders')
              .select('name')
              .eq('id', dossier.folderId)
              .single()
            
            if (folder) {
              dossier.foldername = folder.name
            }
          } catch (error) {
            console.warn(`⚠️ Impossible de récupérer le nom du dossier ${dossier.folderId}:`, error)
          }
        }
      }
    }

    if (error) {
      console.error('❌ Erreur Supabase dossiers CB:', error)
      throw error
    }

    console.log(`📊 ${dossiers?.length || 0} dossiers CB trouvés`)
    
    // Log détaillé pour diagnostic
    if (dossiers && dossiers.length > 0) {
      console.log('📊 Détails des dossiers:')
      dossiers.forEach((dossier, index) => {
        console.log(`  ${index + 1}. ${dossier.numeroDossier} - Statut: ${dossier.statut} - Créé: ${dossier.createdAt}`)
      })
    } else {
      console.log('📊 Aucun dossier trouvé')
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
        error: 'Erreur lors de la récupération des dossiers',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
