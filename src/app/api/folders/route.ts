// Configuration pour export statique
export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

type CreateFolderBody = {
  name?: string
  description?: string
  parentId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId as string

    const raw = await request.text()
    let body: CreateFolderBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    const name = (body.name || '').trim()
    const description = (body.description || '').trim() || undefined
    const parentId = body.parentId ?? undefined

    if (!name) {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 })
    }

    // Empêcher les doublons (par utilisateur et parentId)
    // On essaie d'abord avec authorId (schéma Postgres), sinon userId (schéma SQLite)
    const existing = await prisma.folder.findFirst({
      where: ({
        name,
        parentId: parentId === null ? null : parentId,
        authorId: userId,
      } as any),
      select: { id: true }
    }).catch(() => prisma.folder.findFirst({
      where: ({
        name,
        parentId: parentId === null ? null : parentId,
        userId: userId,
      } as any),
      select: { id: true }
    }))

    if (existing) {
      return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
    }

    // Création avec fallback authorId -> userId selon le schéma
    const created = await prisma.folder.create({
      data: ({
        name,
        description,
        parentId: parentId === null ? null : parentId,
        authorId: userId,
      } as any),
      select: { id: true, name: true }
    }).catch(() => prisma.folder.create({
      data: ({
        name,
        description,
        parentId: parentId === null ? null : parentId,
        userId: userId,
      } as any),
      select: { id: true, name: true }
    }))

    return NextResponse.json({ folder: created }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


