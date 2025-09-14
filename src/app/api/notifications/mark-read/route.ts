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
    
    // Récupérer l'ID de la notification depuis le body
    const { notificationId } = await request.json()
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID manquant' },
        { status: 400 }
      )
    }
    
    // Marquer la notification comme lue avec l'admin (contourne RLS)
    const { data, error } = await admin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select('id')
    
    if (error) {
      console.error('Erreur marquage notification:', error)
      return NextResponse.json(
        { error: 'Erreur lors du marquage de la notification' },
        { status: 500 }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Notification non trouvée ou déjà marquée comme lue' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      notificationId: data[0].id 
    })
    
  } catch (error) {
    console.error('Erreur API mark-read:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
