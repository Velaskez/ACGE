import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'
import { generateFolderNumberWithInitials } from '@/lib/folder-numbering'

export async function GET(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    // Récupérer TOUS les dossiers de l'utilisateur avec les détails complets
    // Compatibilité SQLite: utiliser userId (pas authorId) et champs Document existants
    const isSQLite = (process.env.DATABASE_URL || '').includes('file:') || (process.env.DATABASE_URL || '').includes('sqlite')
    const ownerKey = isSQLite ? 'userId' : 'authorId'
    const includeClause: any = isSQLite
      ? {
          user: { select: { id: true, name: true } },
          documents: {
            select: { id: true, name: true, mimeType: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 3,
          },
          _count: { select: { documents: true } },
        }
      : {
          author: { select: { id: true, name: true } },
          documents: {
            select: {
              id: true,
              title: true,
              updatedAt: true,
              currentVersion: { select: { fileName: true, fileType: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 3,
          },
          _count: { select: { documents: true } },
        }

    const folders = await prisma.folder.findMany({
      where: { [ownerKey]: userId } as any,
      include: includeClause as any,
      orderBy: { updatedAt: 'desc' },
    })

    // Formater les données pour la page dossiers
    const formattedFolders = folders.map((folder: any) => ({
      id: folder.id,
      folderNumber: isSQLite ? `FOL-${folder.id.slice(0, 6)}` : folder.folderNumber,
      name: folder.name,
      description: folder.description || undefined,
      documentCount: folder._count.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      author: isSQLite
        ? { id: folder.user.id, name: folder.user.name || '' }
        : { id: folder.author.id, name: folder.author.name || '' },
      recentDocuments: folder.documents.map((doc: any) => ({
        id: doc.id,
        title: isSQLite ? (doc.name || 'Sans titre') : (doc.title || doc.currentVersion?.fileName || 'Sans titre'),
        fileName: isSQLite ? (doc.name || 'Sans fichier') : (doc.currentVersion?.fileName || 'Sans fichier'),
        fileType: isSQLite ? (doc.mimeType || 'unknown') : (doc.currentVersion?.fileType || 'unknown'),
      })),
    }))

    return NextResponse.json({ 
      folders: formattedFolders 
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const { name, description } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du dossier est requis' },
        { status: 400 }
      )
    }

    // Détection du provider et clé propriétaire dynamiques
    const isSQLite = (process.env.DATABASE_URL || '').includes('file:') || (process.env.DATABASE_URL || '').includes('sqlite')
    const ownerKey = isSQLite ? 'userId' : 'authorId'

    // Vérifier si un dossier avec ce nom existe déjà pour cet utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: ({ name: name.trim(), [ownerKey]: userId } as any),
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Un dossier avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Créer le nouveau dossier
    const createData: any = isSQLite
      ? { name: name.trim(), description: description?.trim() || null, userId: userId }
      : { name: name.trim(), description: description?.trim() || null, authorId: userId }
    const includeNew: any = isSQLite
      ? { user: { select: { id: true, name: true } }, _count: { select: { documents: true } } }
      : { author: { select: { id: true, name: true } }, _count: { select: { documents: true } } }
    const newFolder = await prisma.folder.create({
      data: createData,
      include: includeNew,
    })

    // Formater la réponse
    const formattedFolder = {
      id: newFolder.id,
      folderNumber: isSQLite ? `FOL-${newFolder.id.slice(0, 6)}` : (newFolder as any).folderNumber,
      name: newFolder.name,
      description: newFolder.description || undefined,
      documentCount: (newFolder as any)._count.documents,
      createdAt: newFolder.createdAt,
      updatedAt: newFolder.updatedAt,
      author: isSQLite
        ? { id: (newFolder as any).user.id, name: (newFolder as any).user.name || '' }
        : { id: (newFolder as any).author.id, name: (newFolder as any).author.name || '' },
      recentDocuments: [] as any[],
    }

    return NextResponse.json({ folder: formattedFolder }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
