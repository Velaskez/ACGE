import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * Fonction pour récupérer l'ID de la nature du document à partir du nom
 */
async function getNatureDocumentId(supabase: any, categoryName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('natures_documents')
      .select('id')
      .eq('nom', categoryName)
      .single()
    
    if (error || !data) {
      console.warn(`⚠️ Nature de document "${categoryName}" non trouvée`)
      return null
    }
    
    return data.id
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la nature du document:', error)
    return null
  }
}

/**
 * 🚀 API UPLOAD 100% SUPABASE - ACGE
 * 
 * Cette API gère l'upload de fichiers avec:
 * - Stockage dans Supabase Storage
 * - Métadonnées dans la base de données Supabase
 * - Authentification JWT
 * - Gestion des métadonnées
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === API UPLOAD SUPABASE - DÉBUT ===')

    // 1. AUTHENTIFICATION
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      console.log('❌ Pas de token d\'authentification')
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
      userId = decoded.userId
      console.log('✅ Utilisateur authentifié:', userId)
    } catch (error) {
      console.log('❌ Token invalide:', error)
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    // 2. CONNEXION SUPABASE
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      console.error('❌ Supabase non configuré')
      return NextResponse.json(
        { error: 'Service de stockage non disponible' },
        { status: 500 }
      )
    }

    // 3. RÉCUPÉRATION DES DONNÉES
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadataStr = formData.get('metadata') as string
    const metadata = metadataStr ? JSON.parse(metadataStr) : {}

    console.log(`📁 ${files.length} fichier(s) reçu(s)`)
    console.log('📋 Métadonnées:', metadata)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // 4. TRAITEMENT DES FICHIERS
    const uploadedFiles: Array<{
      id: string
      title: string
      name: string
      size: number
      type: string
      url: string
    }> = []

    const errors: Array<{ fileName: string; message: string }> = []

    for (const file of files) {
      try {
        // Vérifier que le fichier est valide
        if (!file || !file.name) {
          console.error('❌ Fichier invalide:', file)
          errors.push({ fileName: 'fichier invalide', message: 'Fichier sans nom ou corrompu' })
          continue
        }

        console.log(`📤 Traitement: ${file.name} (${file.size} bytes, ${file.type})`)

        // Nettoyer le nom de fichier
        const cleanFileName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_|_$/g, '')

        // Générer un nom unique
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomSuffix}-${cleanFileName}`
        
        // Générer un UUID pour le document
        const documentId = crypto.randomUUID()

        // ===== UPLOAD VERS SUPABASE STORAGE =====
        console.log('☁️ Upload vers Supabase Storage...')
        
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Upload vers le bucket 'documents' dans le sous-dossier 'documents/'
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .upload(`documents/${fileName}`, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (storageError) {
          console.error('❌ Erreur Supabase Storage:', storageError)
          throw new Error(`Erreur stockage: ${storageError.message}`)
        }

        console.log('✅ Fichier uploadé dans Supabase Storage:', storageData.path)

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(`documents/${fileName}`)

        console.log('🔗 URL publique Supabase:', publicUrl)

        // ===== SAUVEGARDE EN BASE DE DONNÉES =====
        console.log('💾 Sauvegarde des métadonnées en base...')
        
        const { data: document, error: dbError } = await supabase
          .from('documents')
          .insert({
            id: documentId,
            title: metadata.name || file.name.split('.')[0],
            description: metadata.description || '',
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            file_path: storageData.path,
            is_public: false,
            author_id: userId,
            folder_id: metadata.folderId || null,
            nature_document_id: metadata.category ? await getNatureDocumentId(supabase, metadata.category) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: metadata.tags || []
          })
          .select()
          .single()

        if (dbError) {
          console.error('❌ Erreur base de données:', dbError)
          // Essayer de supprimer le fichier du storage si la DB échoue
          await supabase.storage.from('documents').remove([`documents/${fileName}`])
          throw new Error(`Erreur base de données: ${dbError.message}`)
        }

        console.log('✅ Document sauvegardé en base:', documentId)
        
        // Document créé avec succès

        uploadedFiles.push({
          id: documentId,
          title: metadata.name || file.name.split('.')[0],
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl
        })

        console.log(`✅ Fichier ${file.name} traité avec succès`)

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error(`❌ Erreur lors du traitement de ${file?.name}:`, message)
        errors.push({ fileName: file?.name || 'inconnu', message })
      }
    }

    // 5. RÉPONSE FINALE
    console.log(`📊 Résumé: ${uploadedFiles.length} succès, ${errors.length} erreurs`)

    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: `Aucun fichier n'a pu être uploadé`,
          errors,
          details: 'Vérifiez que Supabase Storage est configuré correctement'
        },
        { status: 500 }
      )
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être traité' },
        { status: 500 }
      )
    }

    console.log('✅ Upload terminé avec succès:', uploadedFiles.length, 'fichiers')
    
    return NextResponse.json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès` + 
               (errors.length ? `, ${errors.length} échec(s)` : ''),
      files: uploadedFiles,
      ...(errors.length ? { errors } : {}),
      summary: {
        total: files.length,
        success: uploadedFiles.length,
        failed: errors.length
      }
    })

  } catch (error) {
    console.error('💥 ERREUR GÉNÉRALE:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}