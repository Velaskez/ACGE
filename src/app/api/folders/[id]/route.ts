import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    const resolvedParams = await params
    
    // Récupérer le dossier avec ses détails
    const folder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId // Seulement ses propres dossiers
      },
      include: {
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
      }
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Formater la réponse
    const formattedFolder = {
      id: folder.id,
      folderNumber: folder.folderNumber,
      name: folder.name,
      description: folder.description,
      documentCount: folder._count.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      author: {
        id: folder.author.id,
        name: folder.author.name
      },
      documents: folder.documents.map(doc => ({
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
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

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
      }
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
      }
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
      include: {
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
      }
    })

    // Formater la réponse
    const formattedFolder = {
      id: updatedFolder.id,
      folderNumber: updatedFolder.folderNumber,
      name: updatedFolder.name,
      description: updatedFolder.description,
      documentCount: updatedFolder._count.documents,
      createdAt: updatedFolder.createdAt,
      updatedAt: updatedFolder.updatedAt,
      author: {
        id: updatedFolder.author.id,
        name: updatedFolder.author.name
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
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    const resolvedParams = await params

    // Vérifier que le dossier existe et appartient à l'utilisateur
    const folder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le dossier contient des documents
    if (folder._count.documents > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer le dossier. Il contient ${folder._count.documents} document(s).` },
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
