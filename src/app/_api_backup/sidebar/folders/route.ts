// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

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

    // Récupérer les dossiers de l'utilisateur (support authorId|userId) avec quelques documents récents
    const folders = await prisma.folder.findMany({
      where: ({ authorId: userId } as any),
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            currentVersion: { select: { fileName: true, fileType: true } }
          },
          orderBy: { updatedAt: 'desc' },
          take: 3
        },
        _count: { select: { documents: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 6
    }).catch(() => prisma.folder.findMany({
      where: ({ userId } as any),
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            currentVersion: { select: { fileName: true, fileType: true } }
          },
          orderBy: { updatedAt: 'desc' },
          take: 3
        },
        _count: { select: { documents: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 6
    }))

    // Formater les données pour la sidebar
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      updatedAt: folder.updatedAt,
      documentCount: folder._count.documents,
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
    console.error('Erreur lors de la récupération des dossiers sidebar:', error)
    
    // Fournir plus de détails sur l'erreur en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      : 'Erreur interne du serveur'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
