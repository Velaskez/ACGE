import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// GET - Télécharger une version spécifique d'un document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    // Récupérer la version du document
    const version = await prisma.documentVersion.findUnique({
      where: { id: resolvedParams.versionId },
      include: {
        document: {
          include: {
            author: true,
            shares: {
              where: { userId },
              select: { permission: true }
            }
          }
        }
      }
    })

    if (!version) {
      return NextResponse.json({ error: 'Version non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions
    const isOwner = version.document.authorId === userId
    const hasSharedAccess = version.document.shares.length > 0

    if (!isOwner && !hasSharedAccess) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    if (!version.filePath) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Rediriger vers l'URL Vercel Blob
    return NextResponse.redirect(version.filePath)

  } catch (error) {
    console.error('Erreur lors du téléchargement de version:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
