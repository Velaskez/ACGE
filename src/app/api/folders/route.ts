import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { generateFolderNumberWithInitials } from '@/lib/folder-numbering'

export async function GET(request: NextRequest) {
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

    // Récupérer TOUS les dossiers de l'utilisateur avec les détails complets
    const folders = await prisma.folder.findMany({
      where: { 
        authorId: userId 
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
                fileType: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 3 // Quelques documents récents par dossier
        },
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Formater les données pour la page dossiers
    const formattedFolders = folders.map(folder => ({
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
      recentDocuments: folder.documents.map(doc => ({
        id: doc.id,
        title: doc.title || doc.currentVersion?.fileName || 'Sans titre',
        fileName: doc.currentVersion?.fileName || 'Sans fichier',
        fileType: doc.currentVersion?.fileType || 'unknown'
      }))
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

    const { name, description } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du dossier est requis' },
        { status: 400 }
      )
    }

    // Vérifier si un dossier avec ce nom existe déjà pour cet utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: name.trim(),
        authorId: userId
      }
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Un dossier avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Générer le numéro de dossier personnalisé
    const folderNumber = await generateFolderNumberWithInitials(name.trim())

    // Créer le nouveau dossier
    const newFolder = await prisma.folder.create({
      data: {
        folderNumber: folderNumber,
        name: name.trim(),
        description: description?.trim() || null,
        authorId: userId
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
      id: newFolder.id,
      folderNumber: newFolder.folderNumber,
      name: newFolder.name,
      description: newFolder.description,
      documentCount: newFolder._count.documents,
      createdAt: newFolder.createdAt,
      updatedAt: newFolder.updatedAt,
      author: {
        id: newFolder.author.id,
        name: newFolder.author.name
      },
      recentDocuments: []
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
