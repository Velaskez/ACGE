import { NextRequest, NextResponse } from 'next/server'
import { verify, sign } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// POST - Prolonger la session utilisateur
export async function POST(request: NextRequest) {
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
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Créer un nouveau token avec une expiration renouvelée
    const newToken = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development',
      { expiresIn: '24h' }
    )

    // Créer la réponse avec le nouveau token
    const response = NextResponse.json({
      message: 'Session prolongée avec succès',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })

    // Mettre à jour le cookie avec le nouveau token
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 heures
    })

    return response

  } catch (error) {
    console.error('Erreur lors de la prolongation de session:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
