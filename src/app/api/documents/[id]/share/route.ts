import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'

// GET - Récupérer les partages d'un document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    // Vérifier les permissions
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        OR: [
          { authorId: userId }, // Propriétaire
          { 
            shares: {
              some: { userId, permission: { in: ['ADMIN', 'WRITE'] } }
            }
          }
        ]
      }
    })

    if (!document) {
      return NextResponse.json({ 
        error: 'Document non trouvé ou permissions insuffisantes' 
      }, { status: 404 })
    }

    // Récupérer les partages
    const shares = await prisma.documentShare.findMany({
      where: { documentId: resolvedParams.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ shares })

  } catch (error) {
    console.error('Erreur lors de la récupération des partages:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST - Partager un document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    const { userEmail, permission } = await request.json()

    if (!userEmail || !permission) {
      return NextResponse.json({ 
        error: 'Email utilisateur et permission requis' 
      }, { status: 400 })
    }

    // Vérifier les permissions
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        OR: [
          { authorId: userId }, // Propriétaire
          { 
            shares: {
              some: { userId, permission: 'ADMIN' }
            }
          }
        ]
      }
    })

    if (!document) {
      return NextResponse.json({ 
        error: 'Document non trouvé ou permissions insuffisantes' 
      }, { status: 404 })
    }

    // Trouver l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!targetUser) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Vérifier que l'utilisateur ne se partage pas à lui-même
    if (targetUser.id === userId) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez pas partager un document avec vous-même' 
      }, { status: 400 })
    }

    // Vérifier si le partage existe déjà
    const existingShare = await prisma.documentShare.findUnique({
      where: {
        documentId_userId: {
          documentId: resolvedParams.id,
          userId: targetUser.id
        }
      }
    })

    if (existingShare) {
      return NextResponse.json({ 
        error: 'Ce document est déjà partagé avec cet utilisateur' 
      }, { status: 400 })
    }

    // Créer le partage
    const share = await prisma.documentShare.create({
      data: {
        documentId: resolvedParams.id,
        userId: targetUser.id,
        permission: permission.toUpperCase()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Créer une notification pour l'utilisateur
    await NotificationService.notifyDocumentShared(
      resolvedParams.id,
      document.title,
      userId,
      targetUser.id,
      permission
    )

    return NextResponse.json({
      message: 'Document partagé avec succès',
      share: {
        id: share.id,
        user: share.user,
        permission: share.permission,
        createdAt: share.createdAt
      }
    })

  } catch (error) {
    console.error('Erreur lors du partage:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un partage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')
    const targetUserId = searchParams.get('userId')

    if (!shareId && !targetUserId) {
      return NextResponse.json({ 
        error: 'ID de partage ou ID utilisateur requis' 
      }, { status: 400 })
    }

    // Vérifier les permissions
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        OR: [
          { authorId: userId }, // Propriétaire
          { 
            shares: {
              some: { userId, permission: 'ADMIN' }
            }
          }
        ]
      }
    })

    if (!document) {
      return NextResponse.json({ 
        error: 'Document non trouvé ou permissions insuffisantes' 
      }, { status: 404 })
    }

    // Supprimer le partage
    const whereClause = shareId 
      ? { id: shareId }
      : { documentId: resolvedParams.id, userId: targetUserId! }

    await prisma.documentShare.delete({
      where: whereClause
    })

    return NextResponse.json({ message: 'Partage supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression du partage:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
