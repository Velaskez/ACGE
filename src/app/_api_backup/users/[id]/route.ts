// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
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
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: resolvedParams.id }
      }
    })

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
    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

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
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    })

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


// Fonction requise pour l'export statique

// Fonction requise pour l'export statique
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}
    { id: '2' },
    { id: '3' },
  ]
}
}
