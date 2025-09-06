import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Récupération des utilisateurs...')
    
    const supabase = getSupabaseAdmin()
    
    // Récupérer tous les utilisateurs avec colonnes existantes seulement
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .order('id', { ascending: false })

    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error)
      return NextResponse.json(
        { error: 'Erreur récupération utilisateurs', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ ${users?.length || 0} utilisateur(s) trouvé(s)`)
    
    if (users && users.length > 0) {
      console.log('📋 Utilisateurs:', users.map(u => ({ id: u.id, email: u.email, name: u.name })))
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    })

  } catch (error) {
    console.error('💥 Erreur générale:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
