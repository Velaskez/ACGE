import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET - Récupérer les paramètres de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Vérifier que l'utilisateur existe
    const admin = getSupabaseAdmin()
    const { data: user } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les paramètres utilisateur avec SQL direct
    const { data: settings, error: settingsErr } = await admin
      .from('user_settings')
      .select('emailNotifications:email_notifications, pushNotifications:push_notifications, language, timezone, sessionTimeout:session_timeout, passwordExpiry:password_expiry, theme')
      .eq('userId', userId)

    // Si la table n'existe pas ou autre erreur, renvoyer des valeurs par défaut sans écrire en base
    if (settingsErr) {
      return NextResponse.json({
        settings: {
          emailNotifications: true,
          pushNotifications: false,
          language: 'fr',
          timezone: 'Africa/Libreville',
          security: { sessionTimeout: 15, passwordExpiry: 90 },
          theme: 'system'
        }
      })
    }

    // Si l'utilisateur n'a pas de paramètres, les créer avec les valeurs par défaut
    if (!settings || settings.length === 0) {
      // Aucun paramètre trouvé: renvoyer des valeurs par défaut sans tenter d'insérer
      return NextResponse.json({
        settings: {
          emailNotifications: true,
          pushNotifications: false,
          language: 'fr',
          timezone: 'Africa/Libreville',
          security: { sessionTimeout: 15, passwordExpiry: 90 },
          theme: 'system'
        }
      })
    }

    // Retourner les paramètres existants
    const userSettings = settings[0]
    return NextResponse.json({
      settings: {
        emailNotifications: userSettings.emailNotifications,
        pushNotifications: userSettings.pushNotifications,
        language: userSettings.language,
        timezone: userSettings.timezone,
        security: {
          sessionTimeout: userSettings.sessionTimeout,
          passwordExpiry: userSettings.passwordExpiry
        },
        theme: userSettings.theme
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres de l'utilisateur connecté
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    const { settings } = await request.json()

    // Validation des données
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      )
    }

    // Validation des paramètres spécifiques
    if (settings.emailNotifications !== undefined && typeof settings.emailNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'emailNotifications doit être un booléen' },
        { status: 400 }
      )
    }

    if (settings.pushNotifications !== undefined && typeof settings.pushNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'pushNotifications doit être un booléen' },
        { status: 400 }
      )
    }

    if (settings.language && !['fr', 'en'].includes(settings.language)) {
      return NextResponse.json(
        { error: 'Langue non supportée' },
        { status: 400 }
      )
    }

    if (settings.timezone && !['Africa/Libreville', 'Europe/Paris', 'UTC'].includes(settings.timezone)) {
      return NextResponse.json(
        { error: 'Fuseau horaire non supporté' },
        { status: 400 }
      )
    }

    if (settings.security) {
      if (settings.security.sessionTimeout && ![5, 10, 15, 30].includes(settings.security.sessionTimeout)) {
        return NextResponse.json(
          { error: 'Délai de session invalide' },
          { status: 400 }
        )
      }
    }

    // Vérifier que l'utilisateur existe
    const admin = getSupabaseAdmin()
    const { data: user } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour ou créer les paramètres utilisateur avec SQL direct
    const upsertPayload = {
      userId,
      email_notifications: settings.emailNotifications ?? true,
      push_notifications: settings.pushNotifications ?? false,
      language: settings.language || 'fr',
      timezone: settings.timezone || 'Africa/Libreville',
      session_timeout: settings.security?.sessionTimeout || 15,
      password_expiry: settings.security?.passwordExpiry || 90,
      theme: settings.theme || 'system'
    }
    const { error: upsertErr } = await admin
      .from('user_settings')
      .upsert(upsertPayload, { onConflict: 'userId' })
    if (upsertErr) throw upsertErr

    // Récupérer les paramètres mis à jour
    const { data: updatedSettings } = await admin
      .from('user_settings')
      .select('emailNotifications:email_notifications, pushNotifications:push_notifications, language, timezone, sessionTimeout:session_timeout, passwordExpiry:password_expiry, theme')
      .eq('userId', userId)

    const userSettings = updatedSettings![0]

    return NextResponse.json({
      message: 'Paramètres mis à jour avec succès',
      settings: {
        emailNotifications: userSettings.emailNotifications,
        pushNotifications: userSettings.pushNotifications,
        language: userSettings.language,
        timezone: userSettings.timezone,
        security: {
          sessionTimeout: userSettings.sessionTimeout,
          passwordExpiry: userSettings.passwordExpiry
        },
        theme: userSettings.theme
      }
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
