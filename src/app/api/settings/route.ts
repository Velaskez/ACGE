import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les paramètres utilisateur avec SQL direct
    const settings = await prisma.$queryRaw`
      SELECT 
        "emailNotifications",
        "pushNotifications",
        language,
        timezone,
        "sessionTimeout",
        "passwordExpiry",
        theme
      FROM user_settings 
      WHERE "userId" = ${userId}
    ` as any[]

    // Si l'utilisateur n'a pas de paramètres, les créer avec les valeurs par défaut
    if (settings.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO user_settings (
          "userId", 
          "emailNotifications", 
          "pushNotifications", 
          language, 
          timezone, 
          "sessionTimeout", 
          "passwordExpiry", 
          theme
        ) VALUES (
          ${userId}, 
          true, 
          false, 
          'fr', 
          'Africa/Libreville', 
          15, 
          90, 
          'system'
        )
      `

      return NextResponse.json({
        settings: {
          emailNotifications: true,
          pushNotifications: false,
          language: 'fr',
          timezone: 'Africa/Libreville',
          security: {
            sessionTimeout: 15,
            passwordExpiry: 90
          },
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour ou créer les paramètres utilisateur avec SQL direct
    await prisma.$executeRaw`
      INSERT INTO user_settings (
        "userId", 
        "emailNotifications", 
        "pushNotifications", 
        language, 
        timezone, 
        "sessionTimeout", 
        "passwordExpiry", 
        theme,
        "updatedAt"
      ) VALUES (
        ${userId}, 
        ${settings.emailNotifications ?? true}, 
        ${settings.pushNotifications ?? false}, 
        ${settings.language || 'fr'}, 
        ${settings.timezone || 'Africa/Libreville'}, 
        ${settings.security?.sessionTimeout || 15}, 
        ${settings.security?.passwordExpiry || 90}, 
        ${settings.theme || 'system'},
        NOW()
      ) ON CONFLICT ("userId") DO UPDATE SET
        "emailNotifications" = EXCLUDED."emailNotifications",
        "pushNotifications" = EXCLUDED."pushNotifications",
        language = EXCLUDED.language,
        timezone = EXCLUDED.timezone,
        "sessionTimeout" = EXCLUDED."sessionTimeout",
        "passwordExpiry" = EXCLUDED."passwordExpiry",
        theme = EXCLUDED.theme,
        "updatedAt" = NOW()
    `

    // Récupérer les paramètres mis à jour
    const updatedSettings = await prisma.$queryRaw`
      SELECT 
        "emailNotifications",
        "pushNotifications",
        language,
        timezone,
        "sessionTimeout",
        "passwordExpiry",
        theme
      FROM user_settings 
      WHERE "userId" = ${userId}
    ` as any[]

    const userSettings = updatedSettings[0]

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
