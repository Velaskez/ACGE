import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    console.log('🔑 Tentative de connexion pour:', email)

    // Utiliser la table users locale
    try {
      const supabase = getSupabaseAdmin()
      
      // Récupérer l'utilisateur par email
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1)
      
      if (fetchError) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', fetchError)
        return NextResponse.json(
          { error: 'Erreur d\'authentification' },
          { status: 500 }
        )
      }

      if (!users || users.length === 0) {
        console.log('❌ Utilisateur non trouvé:', email)
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        )
      }

      const user = users[0]
      console.log('👤 Utilisateur trouvé:', user.email)

      // Vérifier le mot de passe
      if (!user.password) {
        console.log('❌ Pas de mot de passe pour l\'utilisateur')
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        )
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      
      if (!isPasswordValid) {
        console.log('❌ Mot de passe incorrect pour:', email)
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        )
      }

      console.log('✅ Authentification réussie pour:', email)
      
      // Créer la réponse avec les informations utilisateur
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role || 'user'
        },
        message: 'Authentification réussie'
      })

      // Créer un token JWT simple pour la session
      const token = require('jsonwebtoken').sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role || 'user'
        },
        process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development',
        { expiresIn: '7d' }
      )

      // Définir le cookie de session
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 jours
      })

      return response

    } catch (authError: any) {
      console.error('Erreur d\'authentification:', authError)
      return NextResponse.json(
        { error: 'Erreur d\'authentification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur de connexion:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
