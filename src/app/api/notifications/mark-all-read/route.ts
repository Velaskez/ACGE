import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer l'utilisateur depuis les headers
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID manquant' },
        { status: 400 }
      )
    }
    
    // Marquer toutes les notifications comme lues avec l'admin (contourne RLS)
    const { data, error } = await admin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select('id')
    
    if (error) {
      console.error('Erreur marquage toutes notifications:', error)
      return NextResponse.json(
        { error: 'Erreur lors du marquage de toutes les notifications' },
        { status: 500 }
      )
    }
    
    const count = data?.length || 0
    
    return NextResponse.json({ 
      success: true, 
      count 
    })
    
  } catch (error) {
    console.error('Erreur API mark-all-read:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
