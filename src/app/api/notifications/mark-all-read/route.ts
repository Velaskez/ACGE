import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    const userRole = decoded.role

    // Marquer toutes les notifications non lues de l'utilisateur comme lues
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select('id')

    if (error) {
      console.error('Erreur marquage notifications:', error)
      return NextResponse.json(
        { error: 'Erreur lors du marquage des notifications' },
        { status: 500 }
      )
    }

    const updatedCount = data?.length || 0

    return NextResponse.json({
      message: `${updatedCount} notifications marquées comme lues`,
      updatedCount
    })

  } catch (error) {
    console.error('Erreur marquage global notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
