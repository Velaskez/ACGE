import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const userId = authUser.userId

    const resolvedParams = await params
    const documentId = resolvedParams.id

    // Récupérer le document avec ses détails (Postgres), puis fallback SQLite
    let documentNormalized: any
    try {
      const documentPg = await (prisma as any).document.findUnique({
        where: { id: documentId },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          currentVersion: true,
          folder: { select: { id: true, name: true } },
          _count: { select: { versions: true } },
        } as any,
      })

      if (!documentPg) {
        return NextResponse.json(
          { error: 'Document non trouvé' },
          { status: 404 }
        )
      }

      if (documentPg.authorId !== userId && !documentPg.isPublic) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      documentNormalized = documentPg
    } catch (_err) {
      const docSqlite = await (prisma as any).document.findUnique({
        where: { id: documentId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          folder: { select: { id: true, name: true } },
        } as any,
      })

      if (!docSqlite) {
        return NextResponse.json(
          { error: 'Document non trouvé' },
          { status: 404 }
        )
      }

      if (docSqlite.userId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      documentNormalized = {
        id: docSqlite.id,
        title: (docSqlite.title ?? docSqlite.name) as string,
        description: docSqlite.description ?? null,
        isPublic: false,
        createdAt: docSqlite.createdAt,
        updatedAt: docSqlite.updatedAt,
        currentVersion: {
          id: `legacy-${docSqlite.id}`,
          versionNumber: docSqlite.version ?? 1,
          fileName: docSqlite.fileName ?? docSqlite.name ?? 'document',
          fileSize: docSqlite.fileSize ?? docSqlite.size ?? 0,
          fileType: docSqlite.fileType ?? docSqlite.mimeType ?? 'application/octet-stream',
          filePath: docSqlite.filePath ?? docSqlite.url ?? '',
          changeLog: null,
          createdAt: docSqlite.createdAt,
        },
        _count: { versions: docSqlite.version ?? 1 },
        author: docSqlite.user
          ? { id: docSqlite.user.id, name: docSqlite.user.name ?? '', email: docSqlite.user.email ?? '' }
          : undefined,
        folder: docSqlite.folder ? { id: docSqlite.folder.id, name: docSqlite.folder.name } : undefined,
      }
    }

    return NextResponse.json({ document: documentNormalized })

  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const userId = authUser.userId

    const resolvedParams = await params
    const documentId = resolvedParams.id
    const { title, description, isPublic, folderId } = await request.json()

    // Mettre à jour le document (Postgres), fallback SQLite
    try {
      const document = await prisma.document.findUnique({ where: { id: documentId } })
      if (!document) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
      }
      if ((document as any).authorId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      const updatedDocument = await (prisma as any).document.update({
        where: { id: documentId },
        data: {
          title: title?.trim() || (document as any).title,
          description: description?.trim() || (document as any).description,
          isPublic: isPublic !== undefined ? isPublic : (document as any).isPublic,
          folderId: folderId !== undefined ? folderId : (document as any).folderId,
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          currentVersion: true,
          folder: { select: { id: true, name: true } },
          _count: { select: { versions: true } },
        } as any,
      })

      return NextResponse.json(updatedDocument)
    } catch (_err) {
      const docSqlite = await (prisma as any).document.findUnique({ where: { id: documentId } })
      if (!docSqlite) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
      }
      if (docSqlite.userId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      const updatedSqlite = await (prisma as any).document.update({
        where: { id: documentId },
        data: {
          name: title?.trim() || docSqlite.name,
          description: description?.trim() || docSqlite.description,
          folderId: folderId !== undefined ? folderId : docSqlite.folderId,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          folder: { select: { id: true, name: true } },
        } as any,
      })

      const normalized = {
        id: updatedSqlite.id,
        title: updatedSqlite.name,
        description: updatedSqlite.description ?? null,
        isPublic: false,
        createdAt: updatedSqlite.createdAt,
        updatedAt: updatedSqlite.updatedAt,
        currentVersion: {
          id: `legacy-${updatedSqlite.id}`,
          versionNumber: updatedSqlite.version ?? 1,
          fileName: updatedSqlite.fileName ?? updatedSqlite.name ?? 'document',
          fileSize: updatedSqlite.fileSize ?? updatedSqlite.size ?? 0,
          fileType: updatedSqlite.fileType ?? updatedSqlite.mimeType ?? 'application/octet-stream',
          filePath: updatedSqlite.filePath ?? updatedSqlite.url ?? '',
          changeLog: null,
          createdAt: updatedSqlite.createdAt,
        },
        _count: { versions: updatedSqlite.version ?? 1 },
        author: updatedSqlite.user
          ? { id: updatedSqlite.user.id, name: updatedSqlite.user.name ?? '', email: updatedSqlite.user.email ?? '' }
          : undefined,
        folder: updatedSqlite.folder
          ? { id: updatedSqlite.folder.id, name: updatedSqlite.folder.name }
          : undefined,
      }

      return NextResponse.json(normalized)
    }

  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const userId = authUser.userId

    const resolvedParams = await params
    const documentId = resolvedParams.id

    // Vérifier que le document existe et appartient à l'utilisateur (PG), fallback SQLite
    try {
      const document = await prisma.document.findUnique({ where: { id: documentId } })
      if (!document) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
      }
      if ((document as any).authorId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      // Supprimer le document (cascade vers les versions)
      await prisma.document.delete({ where: { id: documentId } })
    } catch (_err) {
      const document = await (prisma as any).document.findUnique({ where: { id: documentId } })
      if (!document) {
        return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
      }
      if (document.userId !== userId) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
      await (prisma as any).document.delete({ where: { id: documentId } })
    }

    // Enregistrer une activité de suppression
    try {
      await (prisma as any).activity.create({
        data: {
          type: 'document_deleted',
          targetType: 'document',
          targetId: documentId,
          title: document.title,
          metadata: {},
          userId: userId,
        }
      })
    } catch {}

    return NextResponse.json({ message: 'Document supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}