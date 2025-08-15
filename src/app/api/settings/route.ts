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

    // Paramètres par défaut (pour l'instant, pas de persistance)
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: false,
      language: 'fr',
      timezone: 'Africa/Libreville',
      security: {
        sessionTimeout: 15,
        passwordExpiry: 90
      }
    }

    return NextResponse.json({ settings: defaultSettings })

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

    // Pour l'instant, on retourne juste les paramètres validés sans les sauvegarder
    // TODO: Implémenter une table séparée pour les paramètres utilisateur si nécessaire
    return NextResponse.json({
      message: 'Paramètres validés avec succès (non persistés pour l\'instant)',
      settings: settings
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
