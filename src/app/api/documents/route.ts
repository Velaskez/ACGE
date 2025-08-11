import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const hasFolderIdParam = searchParams.has('folderId')
    const folderIdParam = searchParams.get('folderId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construire les conditions de filtrage pour Postgres (schéma versionné)
    const wherePg: any = { authorId: userId }
    if (search) {
      wherePg.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { currentVersion: { is: { fileName: { contains: search, mode: 'insensitive' } } } as any }
      ]
    }
    if (hasFolderIdParam) {
      wherePg.folderId = (!folderIdParam || folderIdParam === 'root' || folderIdParam === 'null')
        ? null
        : folderIdParam
    }

    // Construire les conditions de filtrage pour SQLite (schéma legacy)
    const whereSqlite: any = { userId }
    if (search) {
      whereSqlite.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (hasFolderIdParam) {
      whereSqlite.folderId = (!folderIdParam || folderIdParam === 'root' || folderIdParam === 'null')
        ? null
        : folderIdParam
    }

    try {
      // Tentative Postgres (modèle Document versionné)
      const [documents, totalCount] = await Promise.all([
        prisma.document.findMany({
          where: wherePg,
          include: {
            author: { select: { id: true, name: true, email: true } } as any,
            folder: { select: { id: true, name: true } } as any,
            currentVersion: true as any,
            _count: { select: { versions: true } } as any,
          } as any,
          orderBy: { updatedAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.document.count({ where: wherePg })
      ])

      return NextResponse.json({
        documents,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    } catch (err) {
      // Fallback SQLite (modèle legacy)
      const [docsSqlite, totalCount] = await Promise.all([
        prisma.document.findMany({
          where: whereSqlite,
          include: {
            user: { select: { id: true, name: true, email: true } } as any,
            folder: { select: { id: true, name: true } } as any,
          } as any,
          orderBy: { updatedAt: 'desc' },
          skip: offset,
          take: limit,
        }) as any,
        prisma.document.count({ where: whereSqlite })
      ])

      const documents = (docsSqlite as any[]).map((d) => ({
        id: d.id,
        title: (d.title ?? d.name) as string,
        description: d.description ?? null,
        isPublic: false,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        currentVersion: {
          id: `legacy-${d.id}`,
          versionNumber: d.version ?? 1,
          fileName: d.fileName ?? d.name ?? 'document',
          fileSize: d.fileSize ?? d.size ?? 0,
          fileType: d.fileType ?? d.mimeType ?? 'application/octet-stream',
          filePath: d.filePath ?? d.url ?? '',
          changeLog: null,
          createdAt: d.createdAt,
        },
        _count: { versions: d.version ?? 1 },
        author: d.user ? { name: d.user.name ?? '', email: d.user.email ?? '' } : undefined,
        folder: d.folder ? { id: d.folder.id, name: d.folder.name } : undefined,
      }))

      return NextResponse.json({
        documents,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error)
    const message =
      error instanceof Error && error.message ? error.message : 'Erreur interne du serveur'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
