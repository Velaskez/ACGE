import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET - Récupérer le profil de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET || 'dev-secret') as any
    } catch {
      return NextResponse.json(
        { error: 'Session expirée ou invalide' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    const supabase = getSupabaseAdmin()

    // Récupérer l'utilisateur
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, role, createdAt, updatedAt')
      .eq('id', userId)
      .maybeSingle()

    if (userErr) {
      throw userErr
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Compter les documents de l'utilisateur (si le schéma le permet)
    let documentsCount = 0
    try {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('authorId', userId)
      if (!error && typeof count === 'number') documentsCount = count
    } catch {}

    // Compter les dossiers de l'utilisateur
    let foldersCount = 0
    try {
      const { count, error } = await supabase
        .from('folders')
        .select('*', { count: 'exact', head: true })
        .eq('authorId', userId)
      if (!error && typeof count === 'number') foldersCount = count
    } catch {}

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        _count: {
          documents: documentsCount,
          folders: foldersCount
        }
      }
    })

  } catch (error) {
    console.error('Erreur profil utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le profil de l'utilisateur connecté
export async function PUT(request: NextRequest) {
  try {
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

    const { name, email, currentPassword, newPassword } = await request.json()

    // Validation des données
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Le nom et l\'email sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    const existingUser = await supabase.from('users').select('*').eq('email', email).neq('id', userId).single()

    if (existingUser.error) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      name: name.trim(),
      email: email.trim()
    }

    // Si un nouveau mot de passe est fourni
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est requis' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        )
      }

      // Récupérer l'utilisateur avec le mot de passe actuel
      const user = await supabase.from('users').select('password').eq('id', userId).single()

      if (user.error) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier le mot de passe actuel
      const isPasswordValid = await bcrypt.compare(currentPassword, user.data.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        )
      }

      // Hasher le nouveau mot de passe
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Mettre à jour l'utilisateur
    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, email, role, createdAt, updatedAt')
      .single()

    if (updateErr) {
      throw updateErr
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
