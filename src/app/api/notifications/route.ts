import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notification-service'

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
    const action = searchParams.get('action')

    // Vérifier si Supabase est configuré
    let admin
    try {
      admin = getSupabaseAdmin()
    } catch (error) {
      console.error('❌ Erreur configuration Supabase:', error)
      
      // En production, on peut choisir de retourner une erreur ou un fallback
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Service temporairement indisponible' },
          { status: 503 }
        )
      }
      
      // En développement, utiliser le mode fallback
      console.log('⚠️ Supabase non configuré, utilisation du mode fallback')
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

    // Actions spéciales
    if (action === 'unread-count') {
      const { count } = await admin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      
      return NextResponse.json({ count: count || 0 })
    }

    if (action === 'mark-all-read') {
      const { data, error } = await admin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id')
      
      if (error) {
        return NextResponse.json(
          { error: 'Erreur lors du marquage global' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        markedCount: data?.length || 0 
      })
    }

    // Construire la requête de base
    let query = admin
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        is_read,
        data,
        created_at,
        user_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Filtrer les notifications non lues si demandé
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Récupérer toutes les notifications pour la pagination
    const { data: allNotifications, error: fetchError } = await query

    if (fetchError) {
      console.error('Erreur récupération notifications:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des notifications' },
        { status: 500 }
      )
    }

    // Pagination
    const skip = (page - 1) * limit
    const paginatedNotifications = allNotifications?.slice(skip, skip + limit) || []

    // Compter les notifications non lues
    const { count: unreadCount } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: paginatedNotifications,
      unreadCount: unreadCount || 0,
      pagination: {
        total: allNotifications?.length || 0,
        page,
        limit,
        totalPages: Math.ceil((allNotifications?.length || 0) / limit)
      }
    })

  } catch (error) {
    console.error('❌ Erreur API notifications:', error)
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

    const result = await NotificationService.create({
      title,
      message,
      type: type as any,
      userId: targetUserId,
      data: data || {}
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Erreur création notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      notification: { id: result.id }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erreur API notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { notificationId, action } = body

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'notificationId et action sont requis' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()

    if (action === 'mark-read') {
      const { error } = await admin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Erreur marquage notification:', error)
        return NextResponse.json(
          { error: 'Erreur lors du marquage' },
          { status: 500 }
        )
      }
    } else if (action === 'delete') {
      const { error } = await admin
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Erreur suppression notification:', error)
        return NextResponse.json(
          { error: 'Erreur lors de la suppression' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Action non supportée' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erreur API notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}