import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { hasSupabase, downloadFromStorage } from '@/lib/supabase'

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

    let fileBuffer: Buffer
    const filePathMeta = document.currentVersion?.filePath || ''
    if (hasSupabase && filePathMeta.startsWith('documents/')) {
      const pathOnly = filePathMeta.replace(/^documents\//, '')
      const { buffer } = await downloadFromStorage({ bucket: 'documents', path: pathOnly })
      fileBuffer = buffer
    } else {
      const fileName = filePathMeta.split('/').pop() || ''
      const filePath = join(process.cwd(), 'uploads', userId, fileName)
      if (!existsSync(filePath)) {
        return NextResponse.json({ error: 'Fichier non trouvé sur le serveur' }, { status: 404 })
      }
      fileBuffer = await readFile(filePath)
    }

    // Déterminer le type MIME
    const mimeType = document.currentVersion?.fileType || 'application/octet-stream'

    // Créer la réponse avec le fichier
    const response = new NextResponse(fileBuffer as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${document.currentVersion?.fileName || 'document'}"`,
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
