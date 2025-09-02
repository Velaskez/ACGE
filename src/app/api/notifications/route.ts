import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Construire les conditions de filtrage
    const where: any = {
      userId: userId
    }

    if (unreadOnly) {
      where.isRead = false
    }

    try {
      // Récupérer les notifications
      const admin = getSupabaseAdmin()
      let query = admin
        .from('notifications')
        .select('id, title, message, type, isRead:is_read, createdAt:created_at, user:userId(id, name, email)', { count: 'exact' })
        .eq('userId', where.userId)
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1)

      if (unreadOnly) query = query.eq('is_read', true as any).not('is_read', 'is', null) // ensure boolean filter

      const { data: notifications, error, count: total } = await query
      if (error) throw error

      // Calculer le nombre de notifications non lues
      const { count: unreadCount } = await admin
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('userId', userId)
        .eq('is_read', false as any)

      return NextResponse.json({
        notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (dbError) {
      console.error('Erreur base de données notifications:', dbError)
      // Retourner une réponse vide si la table n'existe pas encore
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        }
      })
    }

  } catch (error) {
    console.error('Erreur récupération notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    const userRole = decoded.role

    // Seuls les admins peuvent créer des notifications
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, message, type, userId: targetUserId, data } = body

    // Validation
    if (!title || !message || !type || !targetUserId) {
      return NextResponse.json(
        { error: 'Titre, message, type et userId sont requis' },
        { status: 400 }
      )
    }

    try {
      // Vérifier que l'utilisateur cible existe
      const admin = getSupabaseAdmin()
      const { data: targetUser } = await admin
        .from('users')
        .select('id')
        .eq('id', targetUserId)
        .maybeSingle()

      if (!targetUser) {
        return NextResponse.json(
          { error: 'Utilisateur cible non trouvé' },
          { status: 404 }
        )
      }

      // Créer la notification
      const { data: notification, error } = await admin
        .from('notifications')
        .insert({
          title,
          message,
          type,
          userId: targetUserId,
          data: data || {},
          is_read: false
        })
        .select('id, title, message, type, isRead:is_read, createdAt:created_at, user:userId(id, name, email)')
        .single()

      if (error) throw error

      return NextResponse.json(notification, { status: 201 })
    } catch (dbError) {
      console.error('Erreur base de données création notification:', dbError)
      return NextResponse.json(
        { error: 'Service notifications temporairement indisponible' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('Erreur création notification:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
