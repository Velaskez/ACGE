import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// GET - Récupérer le profil de l'utilisateur connecté
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
            folders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le profil de l'utilisateur connecté
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

    const { name, email, currentPassword, newPassword } = await request.json()

    // Validation des données
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Le nom et l\'email sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    })

    if (existingUser) {
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier le mot de passe actuel
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
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
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
            folders: true
          }
        }
      }
    })

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
