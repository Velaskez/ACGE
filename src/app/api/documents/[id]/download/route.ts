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
    console.log('📥 Début du download document Supabase...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      console.log('❌ Pas de token d\'authentification')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    const userRole = decoded.role
    console.log('✅ Utilisateur authentifié:', userId, 'Rôle:', userRole)

    const documentId = params.id
    console.log('📄 Document ID:', documentId)

    // Récupérer le document avec sa version actuelle
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        currentVersion: true,
        author: true
      }
    })

    if (!document) {
      console.log('❌ Document non trouvé')
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    console.log('📄 Document trouvé:', document.title)

    // Vérifier les permissions (admin ou propriétaire)
    if (userRole !== 'ADMIN' && document.authorId !== userId) {
      console.log('❌ Accès non autorisé - Utilisateur:', userId, 'Auteur:', document.authorId)
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    if (!document.currentVersion) {
      console.log('❌ Aucune version disponible')
      return NextResponse.json(
        { error: 'Aucune version disponible' },
        { status: 404 }
      )
    }

    console.log('📁 Fichier trouvé:', document.currentVersion.filePath)

    // Traiter le chemin du fichier
    let filePath = document.currentVersion.filePath
    
    // Si le filePath est une URL complète, extraire le chemin relatif
    if (filePath.includes('supabase.co') || filePath.startsWith('http')) {
      const urlParts = filePath.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const userIdFromPath = urlParts[urlParts.length - 2]
      filePath = `${userIdFromPath}/${fileName}`
      console.log('🔍 Chemin extrait depuis URL:', filePath)
    }

    console.log('📂 Chemin final pour Supabase:', filePath)

    // Télécharger le fichier depuis Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (error || !data) {
      console.error('❌ Erreur téléchargement Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier', details: error?.message },
        { status: 500 }
      )
    }

    console.log('✅ Fichier téléchargé avec succès, taille:', data.size)

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
    console.error('❌ Erreur téléchargement document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
