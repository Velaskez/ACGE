// Configuration pour API dynamique
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Lecture robuste du corps pour éviter les erreurs de parse JSON
    const rawBody = await request.text()
    let parsed: { email?: string; password?: string } = {}
    try {
      parsed = rawBody ? JSON.parse(rawBody) : {}
    } catch (e) {
      return NextResponse.json(
        { error: 'Corps JSON invalide' },
        { status: 400 }
      )
    }
    const { email, password } = parsed

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Créer un token JWT simple
    const secret = process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development'
    const token = sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      },
      secret,
      { expiresIn: '7d' }
    )

    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      { 
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 200 }
    )

    // Définir le cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    })

    return response

  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error)
    const isDev = process.env.NODE_ENV !== 'production'
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        ...(isDev ? { details: String(error?.message || error) } : {}),
      },
      { status: 500 }
    )
  }
}
