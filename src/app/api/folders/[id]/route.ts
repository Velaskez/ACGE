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
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const resolvedParams = await params
    
    // Récupérer le dossier avec ses détails
    const folder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId // Seulement ses propres dossiers
      } as any,
      include: ({
        author: {
          select: {
            id: true,
            name: true
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            currentVersion: {
              select: {
                fileName: true,
                fileType: true,
                fileSize: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      } as any)
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Formater la réponse (tolérant côté types)
    const f: any = folder as any
    const formattedFolder = {
      id: f.id,
      folderNumber: f.folderNumber,
      name: f.name,
      description: f.description,
      documentCount: f._count?.documents ?? 0,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      author: {
        id: f.author?.id,
        name: f.author?.name
      },
      documents: (f.documents as any[]).map((doc: any) => ({
        id: doc.id,
        title: doc.title || doc.currentVersion?.fileName || 'Sans titre',
        fileName: doc.currentVersion?.fileName || 'Sans fichier',
        fileType: doc.currentVersion?.fileType || 'unknown',
        fileSize: doc.currentVersion?.fileSize || 0,
        updatedAt: doc.updatedAt
      }))
    }

    return NextResponse.json({ folder: formattedFolder })

  } catch (error) {
    console.error('Erreur lors de la récupération du dossier:', error)
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
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const resolvedParams = await params
    const { name, description } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du dossier est requis' },
        { status: 400 }
      )
    }

    // Vérifier que le dossier existe et appartient à l'utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      } as any
    })

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier qu'aucun autre dossier n'a ce nom
    const duplicateFolder = await prisma.folder.findFirst({
      where: {
        name: name.trim(),
        authorId: userId,
        id: { not: resolvedParams.id }
      } as any
    })

    if (duplicateFolder) {
      return NextResponse.json(
        { error: 'Un dossier avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Mettre à jour le dossier
    const updatedFolder = await prisma.folder.update({
      where: { id: resolvedParams.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      },
      include: ({
        author: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      } as any)
    })

    // Formater la réponse
    const uf: any = updatedFolder as any
    const formattedFolder = {
      id: uf.id,
      folderNumber: uf.folderNumber,
      name: uf.name,
      description: uf.description,
      documentCount: uf._count?.documents ?? 0,
      createdAt: uf.createdAt,
      updatedAt: uf.updatedAt,
      author: {
        id: uf.author?.id,
        name: uf.author?.name
      },
      recentDocuments: []
    }

    return NextResponse.json({ folder: formattedFolder })

  } catch (error) {
    console.error('Erreur lors de la modification du dossier:', error)
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
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const resolvedParams = await params

    // Vérifier que le dossier existe et appartient à l'utilisateur
    const folder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      } as any,
      include: ({
        _count: {
          select: {
            documents: true
          }
        }
      } as any)
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le dossier contient des documents
    const fold: any = folder as any
    if ((fold._count?.documents ?? 0) > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer le dossier. Il contient ${(fold._count?.documents ?? 0)} document(s).` },
        { status: 400 }
      )
    }

    // Supprimer le dossier
    await prisma.folder.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ 
      message: 'Dossier supprimé avec succès',
      deletedFolder: {
        id: folder.id,
        folderNumber: folder.folderNumber,
        name: folder.name
      }
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du dossier:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
