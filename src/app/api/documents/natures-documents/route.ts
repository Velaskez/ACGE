import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

interface DecodedToken {
  userId: string
  email: string
  name?: string
  role: 'ADMIN' | 'SECRETAIRE' | 'CONTROLEUR_BUDGETAIRE' | 'ORDONNATEUR' | 'AGENT_COMPTABLE'
}

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

// GET - Récupérer toutes les natures de documents
export async function GET(request: NextRequest) {
  try {
    const decoded = getDecodedTokenOrNull(request)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier les permissions
    const allowedRoles = ['SECRETAIRE', 'CONTROLEUR_BUDGETAIRE', 'ORDONNATEUR', 'AGENT_COMPTABLE', 'ADMIN']
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const naturesDocuments = await prisma.natureDocument.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        numero: 'asc'
      }
    })

    return NextResponse.json({ naturesDocuments })

  } catch (error) {
    console.error('Erreur lors de la récupération des natures de documents:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
