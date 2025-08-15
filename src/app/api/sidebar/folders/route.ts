import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

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

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    const userRole = decoded.role

    // Construire les conditions de filtrage selon le rôle
    const userFilter = userRole === 'ADMIN' ? {} : { authorId: userId }

    // Récupérer les dossiers avec une requête simple
    let folders = []
    try {
      folders = await prisma.folder.findMany({
        where: userFilter,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Ajouter les compteurs manuellement pour éviter les problèmes de relations
      for (const folder of folders) {
        try {
          const documentCount = await prisma.document.count({
            where: { folderId: folder.id }
          })
          folder.documentCount = documentCount
        } catch (countError) {
          console.error('Erreur comptage pour dossier sidebar:', folder.id, countError)
          folder.documentCount = 0
        }
      }

    } catch (dbError) {
      console.error('Erreur base de données sidebar dossiers:', dbError)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(folders)

  } catch (error) {
    console.error('Erreur API sidebar dossiers:', error)
    
    // Toujours retourner du JSON valide
    return NextResponse.json([], { status: 200 })
  }
}
