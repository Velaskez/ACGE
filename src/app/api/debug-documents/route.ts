import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug documents - Début de la vérification...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    
    let currentUserId: string | null = null
    let currentUserEmail: string | null = null
    
    if (token) {
      try {
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
        currentUserId = decoded.userId
        currentUserEmail = decoded.email
        console.log('✅ Token valide - User ID:', currentUserId)
      } catch (error) {
        console.log('❌ Token invalide:', error)
      }
    } else {
      console.log('⚠️ Pas de token d\'authentification')
    }

    // Récupérer TOUS les documents (sans filtre)
    const allDocuments = await prisma.document.findMany({
      include: {
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
        },
        currentVersion: true,
        _count: {
          select: {
            versions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Récupérer les documents de l'utilisateur actuel
    const userDocuments = currentUserId ? await prisma.document.findMany({
      where: {
        authorId: currentUserId
      },
      include: {
        folder: {
          select: {
            name: true
          }
        },
        currentVersion: true
      }
    }) : []

    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            documents: true,
            folders: true
          }
        }
      }
    })

    // Récupérer tous les dossiers
    const allFolders = await prisma.folder.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      }
    })

    // Analyser les problèmes potentiels
    const problems = []
    
    if (!currentUserId) {
      problems.push('Aucun utilisateur connecté détecté')
    }
    
    if (allDocuments.length > 0 && userDocuments.length === 0) {
      problems.push(`Des documents existent mais aucun n'appartient à l'utilisateur actuel (${currentUserEmail || 'non connecté'})`)
    }
    
    // Vérifier si les documents sont associés à différents utilisateurs
    const documentsByAuthor = allDocuments.reduce((acc, doc) => {
      const authorEmail = doc.author?.email || 'Inconnu'
      if (!acc[authorEmail]) {
        acc[authorEmail] = []
      }
      acc[authorEmail].push(doc.title)
      return acc
    }, {} as Record<string, string[]>)

    return NextResponse.json({
      debug: {
        currentUser: {
          id: currentUserId,
          email: currentUserEmail,
          authenticated: !!currentUserId
        },
        statistics: {
          totalDocuments: allDocuments.length,
          userDocuments: userDocuments.length,
          totalFolders: allFolders.length,
          totalUsers: allUsers.length
        },
        problems: problems.length > 0 ? problems : ['Aucun problème détecté'],
        documents: {
          all: allDocuments.map(doc => ({
            id: doc.id,
            title: doc.title,
            authorId: doc.author?.id,
            authorName: doc.author?.name,
            authorEmail: doc.author?.email,
            folderId: doc.folder?.id,
            folderName: doc.folder?.name,
            fileName: doc.currentVersion?.fileName,
            createdAt: doc.createdAt,
            belongsToCurrentUser: doc.author?.id === currentUserId
          })),
          byAuthor: documentsByAuthor
        },
        folders: allFolders.map(folder => ({
          id: folder.id,
          name: folder.name,
          authorEmail: folder.author?.email,
          documentCount: folder._count.documents,
          belongsToCurrentUser: folder.author?.id === currentUserId
        })),
        users: allUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          documentCount: user._count.documents,
          folderCount: user._count.folders,
          isCurrentUser: user.id === currentUserId
        }))
      }
    })

  } catch (error) {
    console.error('💥 Erreur debug documents:', error)
    return NextResponse.json(
      { error: 'Erreur lors du debug', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
