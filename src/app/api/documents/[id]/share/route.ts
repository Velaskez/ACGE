import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'

// Permissions disponibles
const PERMISSIONS = ['READ', 'WRITE', 'ADMIN'] as const
type Permission = typeof PERMISSIONS[number]

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

    // Vérifier que l'utilisateur a accès au document
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        OR: [
          { authorId: userId }, // Propriétaire
          { 
            shares: {
              some: { userId, permission: { in: ['READ', 'WRITE', 'ADMIN'] } }
            }
          }
        ]
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        author: document.author,
        isPublic: document.isPublic
      },
      shares: document.shares.map(share => ({
        id: share.id,
        user: share.user,
        permission: share.permission,
        createdAt: share.createdAt
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des partages:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST - Partager un document avec un utilisateur
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

    const body = await request.json()
    const { userEmail, permission } = body

    // Validation
    if (!userEmail || !permission) {
      return NextResponse.json({ 
        error: 'Email utilisateur et permission requis' 
      }, { status: 400 })
    }

    if (!PERMISSIONS.includes(permission)) {
      return NextResponse.json({ 
        error: 'Permission invalide. Utilisez: READ, WRITE, ou ADMIN' 
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur a les droits de partage sur ce document
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

    // Trouver l'utilisateur à qui partager
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Empêcher de se partager à soi-même
    if (targetUser.id === userId) {
      return NextResponse.json({ 
        error: 'Vous ne pouvez pas partager un document avec vous-même' 
      }, { status: 400 })
    }

    // Créer ou mettre à jour le partage
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: resolvedParams.id,
          userId: targetUser.id
        }
      },
      update: {
        permission
      },
      create: {
        documentId: resolvedParams.id,
        userId: targetUser.id,
        permission
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
