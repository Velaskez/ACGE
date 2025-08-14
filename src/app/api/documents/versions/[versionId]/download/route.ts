import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('📥 Début du download version Supabase...')
    
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
    console.log('✅ Utilisateur authentifié:', userId)

    // Récupérer la version du document
    const documentVersion = await prisma.documentVersion.findFirst({
      where: { 
        id: resolvedParams.versionId,
        document: {
          authorId: userId
        }
      },
      include: { document: true }
    })

    if (!documentVersion) {
      console.log('❌ Version de document non trouvée')
      return NextResponse.json(
        { error: 'Version de document non trouvée' },
        { status: 404 }
      )
    }

    if (!documentVersion.filePath) {
      console.log('❌ Fichier non trouvé')
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      )
    }

    console.log('📁 Fichier trouvé:', documentVersion.filePath)

    // Extraire le chemin du fichier depuis l'URL Supabase
    const fileUrl = documentVersion.filePath
    const urlParts = fileUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const userIdFromPath = urlParts[urlParts.length - 2]
    const filePath = `${userIdFromPath}/${fileName}`

    console.log('🔍 Chemin extrait:', filePath)

    // Télécharger le fichier depuis Supabase Storage avec le client admin
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Client Supabase admin non disponible' },
        { status: 500 }
      )
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      console.error('❌ Erreur download Supabase:', downloadError)
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier' },
        { status: 500 }
      )
    }

    if (!fileData) {
      console.log('❌ Aucune donnée de fichier reçue')
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      )
    }

    console.log('✅ Fichier téléchargé avec succès, taille:', fileData.size)

    // Convertir en ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Retourner le fichier avec les bons headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': documentVersion.fileType,
        'Content-Disposition': `attachment; filename="${documentVersion.fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('💥 Erreur download générale:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
