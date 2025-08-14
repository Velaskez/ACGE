import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { storage } from '@/lib/storage-lws'
import { readFile } from 'fs/promises'
import { join } from 'path'

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

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Récupérer le document
    const document = await prisma.document.findFirst({
      where: { id: resolvedParams.id, authorId: userId },
      include: { currentVersion: true }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    if (!document.currentVersion?.filePath) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      )
    }

    const filePath = document.currentVersion.filePath
    const fileName = document.currentVersion.fileName
    const fileType = document.currentVersion.fileType

    // Déterminer le type de stockage
    const useLocalStorage = process.env.STORAGE_TYPE !== 'ftp'

    let fileBuffer: Buffer

    if (useLocalStorage) {
      // Stockage local
      if (filePath.startsWith('http')) {
        // URL externe (Vercel Blob ou autre)
        return NextResponse.redirect(filePath)
      }
      
      // Fichier local
      const fullPath = filePath.startsWith('/') 
        ? join(process.cwd(), filePath)
        : filePath
      
      try {
        fileBuffer = await readFile(fullPath)
      } catch (error) {
        console.error('Erreur lecture fichier local:', error)
        return NextResponse.json(
          { error: 'Fichier non trouvé sur le serveur' },
          { status: 404 }
        )
      }
    } else {
      // Stockage FTP LWS
      try {
        fileBuffer = await storage.download(filePath)
      } catch (error) {
        console.error('Erreur téléchargement FTP:', error)
        return NextResponse.json(
          { error: 'Impossible de télécharger le fichier depuis le serveur FTP' },
          { status: 500 }
        )
      }
    }

    // Retourner le fichier avec les bons headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
