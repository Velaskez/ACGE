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
    const documentId = resolvedParams.id

    // Récupérer le document avec ses détails
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        currentVersion: true,
        folder: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            versions: true
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

    // Vérifier les permissions (propriétaire ou document public)
    if (document.authorId !== userId && !document.isPublic) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
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
    const documentId = resolvedParams.id
    const { title, description, isPublic, folderId } = await request.json()

    // Vérifier que le document existe et appartient à l'utilisateur
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    if (document.authorId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: title?.trim() || document.title,
        description: description?.trim() || document.description,
        isPublic: isPublic !== undefined ? isPublic : document.isPublic,
        // Important: autoriser la mise à null (racine). On ne doit PAS utiliser ||
        folderId: folderId !== undefined ? folderId : document.folderId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        currentVersion: true,
        folder: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            versions: true
          }
        }
      }
    })

    return NextResponse.json(updatedDocument)

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
    const documentId = resolvedParams.id

    // Vérifier que le document existe et appartient à l'utilisateur
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    if (document.authorId !== userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    // Supprimer le document (cascade vers les versions)
    await prisma.document.delete({
      where: { id: documentId }
    })

    // Enregistrer une activité de suppression
    try {
      await prisma.activity.create({
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