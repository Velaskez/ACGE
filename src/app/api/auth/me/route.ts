import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Aucune session active' },
        { status: 401 }
      )
    }

    try {
      // Vérifier le token JWT
      const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'dev-secret') as any
      
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }
      })
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Session expirée ou invalide' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
