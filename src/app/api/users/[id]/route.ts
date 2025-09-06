import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verify } from 'jsonwebtoken'

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

// PUT - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const decoded = getDecodedTokenOrNull(request)

    // Vérifier l'authentification
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls les admins peuvent modifier des utilisateurs)
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { name, email, password, role } = await request.json()

    // Validation des données
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Nom, email et rôle sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const admin = getSupabaseAdmin()
    const { data: existingUser, error: userError } = await admin
      .from('users')
      .select('id, email')
      .eq('id', resolvedParams.id)
      .maybeSingle()

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    const { data: emailExists } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', resolvedParams.id)
      .maybeSingle()

    if (emailExists) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    if (role && !allowedRoles.has(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      name,
      email,
      role
    }

    // Hasher le mot de passe seulement s'il est fourni
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Mettre à jour l'utilisateur
    const { data: user, error: updateError } = await admin
      .from('users')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select('id, name, email, role, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Erreur mise à jour utilisateur:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Utilisateur modifié avec succès',
        user 
      }
    )

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const decoded = getDecodedTokenOrNull(request)

    // Vérifier l'authentification
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls les admins peuvent supprimer des utilisateurs)
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Empêcher l'administrateur de se supprimer lui-même
    if (decoded.userId === resolvedParams.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const admin = getSupabaseAdmin()
    const { data: existingUser, error: userError } = await admin
      .from('users')
      .select('id')
      .eq('id', resolvedParams.id)
      .maybeSingle()

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'utilisateur
    const { error: deleteError } = await admin
      .from('users')
      .delete()
      .eq('id', resolvedParams.id)

    if (deleteError) {
      console.error('Erreur suppression utilisateur:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'utilisateur' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Utilisateur supprimé avec succès' }
    )

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
