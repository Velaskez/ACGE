import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

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

    // Récupérer le document avec sa version actuelle depuis Supabase
    const admin = getSupabaseAdmin()
    const { data: document, error: docError } = await admin
      .from('documents')
      .select(`
        id,
        title,
        author_id,
        current_version_id
      `)
      .eq('id', documentId)
      .maybeSingle()

    if (docError) {
      console.error('❌ Erreur Supabase:', docError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du document', details: docError.message },
        { status: 500 }
      )
    }

    if (!document) {
      console.log('❌ Document non trouvé')
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    console.log('📄 Document trouvé:', document.title)

    // Vérifier les permissions (admin ou propriétaire)
    if (userRole !== 'ADMIN' && document.author_id !== userId) {
      console.log('❌ Accès non autorisé - Utilisateur:', userId, 'Auteur:', document.author_id)
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    let currentVersion = null

    if (document.current_version_id) {
      // Récupérer la version actuelle du document
      const { data: version, error: versionError } = await admin
        .from('document_versions')
        .select(`
          id,
          file_name,
          file_path,
          file_type,
          file_size
        `)
        .eq('id', document.current_version_id)
        .maybeSingle()

      if (versionError) {
        console.error('❌ Erreur récupération version:', versionError)
        return NextResponse.json(
          { error: 'Erreur lors de la récupération de la version', details: versionError.message },
          { status: 500 }
        )
      }

      currentVersion = version
    }

    // Si pas de version actuelle définie, récupérer la première version disponible
    if (!currentVersion) {
      console.log('⚠️ Aucune version actuelle définie, recherche de la première version...')
      const { data: firstVersion, error: firstVersionError } = await admin
        .from('document_versions')
        .select(`
          id,
          file_name,
          file_path,
          file_type,
          file_size
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (firstVersionError) {
        console.error('❌ Erreur récupération première version:', firstVersionError)
        return NextResponse.json(
          { error: 'Erreur lors de la récupération de la version', details: firstVersionError.message },
          { status: 500 }
        )
      }

      if (!firstVersion) {
        console.log('❌ Aucune version trouvée pour ce document')
        return NextResponse.json(
          { error: 'Ce document n\'a pas de fichier associé. Veuillez le re-télécharger.' },
          { status: 404 }
        )
      }

      currentVersion = firstVersion
      console.log('✅ Première version trouvée:', currentVersion.id)
    }

    console.log('📁 Fichier trouvé:', currentVersion.file_path)

    // Traiter le chemin du fichier
    let filePath = currentVersion.file_path
    
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
    const { data, error } = await admin.storage
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
        'Content-Type': currentVersion.file_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${currentVersion.file_name}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Erreur téléchargement document:', error)
    
    let errorMessage = 'Erreur inconnue'
    let errorDetails = null
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || JSON.stringify(error)
      errorDetails = error.stack || error.details
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}
