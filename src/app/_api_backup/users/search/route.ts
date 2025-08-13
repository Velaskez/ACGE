// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// GET - Rechercher des utilisateurs par email ou nom
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause: any = {
      id: { not: userId } // Exclure l'utilisateur actuel
    }

    // Si une recherche est fournie, filtrer par email ou nom
    if (query && query.trim()) {
      whereClause.OR = [
        { email: { contains: query.trim(), mode: 'insensitive' } },
        { name: { contains: query.trim(), mode: 'insensitive' } }
      ]
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
        { email: 'asc' }
      ]
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
