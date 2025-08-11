import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Récupérer le document avec sa version actuelle
    const document = await prisma.document.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId // Sécurité : seul le propriétaire peut télécharger
      },
      include: {
        currentVersion: true
      }
    })

    if (!document || !document.currentVersion) {
      return NextResponse.json(
        { error: 'Document ou version non trouvé' },
        { status: 404 }
      )
    }

    // Construire le chemin du fichier
    const fileName = document.currentVersion.filePath.split('/').pop() || ''
    const filePath = join(process.cwd(), 'uploads', userId, fileName)

    // Vérifier que le fichier existe
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier non trouvé sur le serveur' },
        { status: 404 }
      )
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath)

    // Déterminer le type MIME
    const mimeType = document.currentVersion.fileType || 'application/octet-stream'

    // Créer la réponse avec le fichier
    const response = new NextResponse(fileBuffer as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${document.currentVersion.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })

    return response

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
