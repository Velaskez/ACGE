import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const documentId = params.id

    // Récupérer le document avec sa version actuelle
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        currentVersion: true,
        author: true
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions (admin ou propriétaire)
    if (userRole !== 'ADMIN' && document.authorId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    if (!document.currentVersion) {
      return NextResponse.json(
        { error: 'Aucune version disponible' },
        { status: 404 }
      )
    }

    // Télécharger le fichier depuis Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .download(document.currentVersion.filePath)

    if (error || !data) {
      console.error('Erreur téléchargement Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier' },
        { status: 500 }
      )
    }

    // Convertir le blob en array buffer
    const arrayBuffer = await data.arrayBuffer()

    // Retourner le fichier avec les bons headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': document.currentVersion.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${document.currentVersion.fileName}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Erreur téléchargement document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
