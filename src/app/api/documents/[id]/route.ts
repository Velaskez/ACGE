import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
// Removed Supabase imports - using local storage only

// GET - Récupérer un document spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    // Récupérer le document
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId // Sécurité : seul le propriétaire peut voir le document
      },
      include: {
        currentVersion: true,
        _count: {
          select: {
            versions: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ document })

  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    // Récupérer le document avec toutes ses versions pour vérifier les permissions
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      },
      include: {
        versions: {
          select: {
            filePath: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer les fichiers stockés (local storage only)
    for (const version of document.versions) {
      const filePathMeta = version.filePath || ''
      try {
        const localFileName = filePathMeta.split('/').pop() || ''
        const localPath = join(process.cwd(), 'uploads', userId, localFileName)
        if (existsSync(localPath)) {
          await unlink(localPath)
        }
      } catch (fileError) {
        console.error('Erreur lors de la suppression du fichier:', fileError)
        // Continuer quand même la suppression en base
      }
    }

    // Supprimer l'enregistrement en base de données
    await prisma.document.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Document supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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

    const { title, description, isPublic, folderId } = await request.json()

    // Vérifier que le document appartient à l'utilisateur
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: resolvedParams.id },
      data: {
        title: title || existingDocument.title,
        description: description !== undefined ? description : existingDocument.description,
        isPublic: isPublic !== undefined ? isPublic : existingDocument.isPublic,
        folderId: folderId !== undefined ? folderId : existingDocument.folderId,
        updatedAt: new Date()
      },
      include: {
        currentVersion: true,
        _count: {
          select: {
            versions: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Document modifié avec succès',
      document: updatedDocument
    })

  } catch (error) {
    console.error('Erreur lors de la modification du document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }

}
