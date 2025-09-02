import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

interface DecodedToken {
  userId: string
  email: string
  name?: string
  role: 'ADMIN' | 'SECRETAIRE' | 'CONTROLEUR_BUDGETAIRE' | 'ORDONNATEUR' | 'AGENT_COMPTABLE'
}

const allowedRoles = new Set(['ADMIN', 'SECRETAIRE', 'CONTROLEUR_BUDGETAIRE', 'ORDONNATEUR', 'AGENT_COMPTABLE'])

function getDecodedTokenOrNull(request: NextRequest): DecodedToken | null {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  try {
    const decoded = verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as DecodedToken
    return decoded
  } catch {
    return null
  }
}

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const decoded = getDecodedTokenOrNull(request)
    // Vérifier l'authentification
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls les admins peuvent voir tous les utilisateurs)
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('users')
      .select('id, name, email, role, createdAt, updatedAt')
      .order('updatedAt', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ users: data })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const decoded = getDecodedTokenOrNull(request)
    // Vérifier l'authentification
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls les admins peuvent créer des utilisateurs)
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { name, email, password, role } = await request.json()

    // Validation des données
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (!allowedRoles.has(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const admin = getSupabaseAdmin()
    const { data: existingCheck, error: checkErr } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (checkErr) {
      throw checkErr
    }

    if (existingCheck) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const { data: created, error: insertErr } = await admin
      .from('users')
      .insert({ name, email, password: hashedPassword, role })
      .select('id, name, email, role, createdAt:created_at')
      .single()

    if (insertErr) {
      throw insertErr
    }

    return NextResponse.json(
      { 
        message: 'Utilisateur créé avec succès',
        user: created 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
