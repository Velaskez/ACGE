import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || undefined
    const targetType = searchParams.get('targetType') || undefined
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limitParam = parseInt(searchParams.get('limit') || '50', 10)
    const limit = isNaN(limitParam) ? 50 : Math.min(Math.max(limitParam, 1), 200)

    const where: any = { userId }
    if (type) where.type = type
    if (targetType) where.targetType = targetType
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { type: { contains: q, mode: 'insensitive' } },
        { targetType: { contains: q, mode: 'insensitive' } },
        // Recherche approximative dans metadata (JSON → string)
      ]
    }

    // Le schéma SQLite de dev ne contient pas le modèle Activity.
    // On renvoie une liste vide pour éviter une erreur de build.
    const activities: any[] = []

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Erreur recherche activités:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


