import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Service de base de données indisponible'
      })
    }
    
    // Récupérer tous les utilisateurs CB
    const { data: cbUsers, error: cbUsersError } = await admin
      .from('users')
      .select('id, email, role, nom, prenom, actif')
      .eq('role', 'CONTROLEUR_BUDGETAIRE')
    
    if (cbUsersError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs CB',
        details: cbUsersError
      })
    }
    
    // Récupérer tous les utilisateurs pour comparaison
    const { data: allUsers, error: allUsersError } = await admin
      .from('users')
      .select('id, email, role, nom, prenom, actif')
      .limit(10)
    
    return NextResponse.json({
      success: true,
      cbUsers: cbUsers || [],
      allUsers: allUsers || [],
      cbUsersCount: cbUsers?.length || 0,
      totalUsersCount: allUsers?.length || 0
    })
    
  } catch (error) {
    console.error('❌ Erreur debug CB users:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur interne',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}
