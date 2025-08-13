import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'
import { hasSupabase, downloadFromStorage } from '@/lib/supabase'

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

    // Récupérer le contenu du fichier (Supabase si configuré, sinon stockage local)
    let fileBuffer: Buffer
    const filePathMeta = version.filePath || ''
    if (hasSupabase && filePathMeta.startsWith('documents/')) {
      const pathOnly = filePathMeta.replace(/^documents\//, '')
      const { buffer } = await downloadFromStorage({ bucket: 'documents', path: pathOnly })
      fileBuffer = buffer
    } else {
      // Fallback stockage local: fichiers rangés sous uploads/<authorId>/<fileName>
      const authorId = version.document.authorId
      const fileName = filePathMeta.split('/').pop() || ''
      const filePath = path.join(process.cwd(), 'uploads', authorId, fileName)
      if (!existsSync(filePath)) {
        return NextResponse.json({ error: 'Fichier non trouvé sur le serveur' }, { status: 404 })
      }
      fileBuffer = await readFile(filePath)
    }

    // Déterminer le type MIME
    const mimeType = version.fileType || 'application/octet-stream'

    // Créer la réponse avec les bons headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(version.fileName)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    // Log de l'activité (pour audit)
    console.log(`Version téléchargée: ${version.fileName} (v${version.versionNumber}) par utilisateur ${userId}`)

    return response

  } catch (error) {
    console.error('Erreur lors du téléchargement de version:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
