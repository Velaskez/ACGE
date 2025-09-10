import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const allowedRoles = new Set(['ADMIN', 'SECRETAIRE', 'CONTROLEUR_BUDGETAIRE', 'ORDONNATEUR', 'AGENT_COMPTABLE'])

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    
    // Vérifier le token avec Supabase Auth
    const { data: { user }, error } = await admin.auth.getUser(token)
    
    if (error || !user) {
      console.log('❌ [PUT] Token Supabase invalide:', error)
      return null
    }
    
    // Récupérer les informations complètes de l'utilisateur depuis public.users
    // D'abord essayer par email, puis par ID si l'email ne correspond pas
    let { data: userData, error: userError } = await admin
      .from('users')
      .select('id, name, email, role')
      .eq('email', user.email)
      .single()
    
    // Si pas trouvé par email, essayer par ID (au cas où les IDs ne correspondent pas)
    if (userError || !userData) {
      console.log('⚠️ [PUT] Utilisateur non trouvé par email, tentative par ID...')
      const { data: userDataById, error: userErrorById } = await admin
        .from('users')
        .select('id, name, email, role')
        .eq('id', user.id)
        .single()
      
      if (userErrorById || !userDataById) {
        console.log('❌ [PUT] Utilisateur non trouvé dans public.users:', userErrorById)
        return null
      }
      
      userData = userDataById
    }
    
    console.log('🔧 [PUT] Utilisateur authentifié:', { id: userData.id, email: userData.email, role: userData.role })
    return userData
    
  } catch (error) {
    console.log('❌ [PUT] Erreur authentification:', error)
    return null
  }
}

// PUT - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔧 [PUT /api/users/[id]] Début de la mise à jour')
    const resolvedParams = await params
    console.log('🔧 [PUT] ID utilisateur:', resolvedParams.id)
    
    const authenticatedUser = await getAuthenticatedUser(request)
    console.log('🔧 [PUT] Utilisateur authentifié:', authenticatedUser ? 'Oui' : 'Non')

    // Vérifier l'authentification
    if (!authenticatedUser) {
      console.log('❌ [PUT] Non authentifié')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls les admins peuvent modifier des utilisateurs)
    if (authenticatedUser.role !== 'ADMIN') {
      console.log('❌ [PUT] Permissions insuffisantes:', authenticatedUser.role)
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { name, email, password, role } = await request.json()
    console.log('🔧 [PUT] Données reçues:', { name, email, role, hasPassword: !!password })

    // Validation des données
    if (!name || !email || !role) {
      console.log('❌ [PUT] Données manquantes:', { name: !!name, email: !!email, role: !!role })
      return NextResponse.json(
        { error: 'Nom, email et rôle sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    console.log('🔧 [PUT] Connexion à Supabase...')
    const admin = getSupabaseAdmin()
    console.log('🔧 [PUT] Admin Supabase:', admin ? 'OK' : 'ERREUR')
    
    const { data: existingUser, error: userError } = await admin
      .from('users')
      .select('id, email')
      .eq('id', resolvedParams.id)
      .maybeSingle()

    console.log('🔧 [PUT] Recherche utilisateur:', { userError, existingUser })

    if (userError || !existingUser) {
      console.log('❌ [PUT] Utilisateur non trouvé:', userError)
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
    console.log('🔧 [PUT] Mise à jour avec données:', updateData)
    const { data: user, error: updateError } = await admin
      .from('users')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select('id, name, email, role')
      .single()

    console.log('🔧 [PUT] Résultat mise à jour:', { user, updateError })

    if (updateError) {
      console.error('❌ [PUT] Erreur mise à jour utilisateur:', updateError)
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
    console.log('🗑️ [DELETE] Début de la suppression')
    const resolvedParams = await params
    console.log('🗑️ [DELETE] ID utilisateur:', resolvedParams.id)
    
    const authenticatedUser = await getAuthenticatedUser(request)
    console.log('🗑️ [DELETE] Utilisateur authentifié:', authenticatedUser ? 'Oui' : 'Non')

    // Vérifier l'authentification
    if (!authenticatedUser) {
      console.log('❌ [DELETE] Non authentifié')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions (seuls les admins peuvent supprimer des utilisateurs)
    if (authenticatedUser.role !== 'ADMIN') {
      console.log('❌ [DELETE] Permissions insuffisantes:', authenticatedUser.role)
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Empêcher l'administrateur de se supprimer lui-même
    if (authenticatedUser.id === resolvedParams.id) {
      console.log('❌ [DELETE] Tentative de suppression de son propre compte')
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
