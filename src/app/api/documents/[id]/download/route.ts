import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🚀 API DOCUMENTS DOWNLOAD - Téléchargement de documents
 * 
 * API pour télécharger les documents depuis Supabase Storage
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 API Documents Download - Téléchargement:', params.id)
    
    const documentId = params.id
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'ID de document requis' },
        { status: 400 }
      )
    }

    // Connexion à Supabase
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      console.error('❌ Supabase non configuré')
      return NextResponse.json(
        { error: 'Service de stockage non disponible' },
        { status: 500 }
      )
    }

    try {
      // Récupérer le document depuis la base de données
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_name, file_path, file_type, title')
        .eq('id', documentId)
        .single()

      if (docError || !document) {
        console.error('❌ Document non trouvé:', docError)
        return NextResponse.json(
          { error: 'Document non trouvé' },
          { status: 404 }
        )
      }

      console.log('📄 Document trouvé:', document.title, document.file_name)

      // Télécharger le fichier depuis Supabase Storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('documents')
        .download(document.file_name)

      if (storageError || !fileData) {
        console.error('❌ Erreur Supabase Storage:', storageError)
        return NextResponse.json(
          { error: 'Fichier non trouvé dans le stockage' },
          { status: 404 }
        )
      }

      console.log('✅ Fichier téléchargé depuis Supabase Storage')

      // Convertir le blob en ArrayBuffer
      const arrayBuffer = await fileData.arrayBuffer()
      
      // Retourner le fichier avec les bons headers
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': document.file_type || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${document.title || document.file_name}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      })

    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du fichier' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erreur générale API documents download:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}