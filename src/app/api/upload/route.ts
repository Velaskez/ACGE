import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🚀 API UPLOAD UNIQUE ET ROBUSTE - ACGE
 * 
 * Cette API gère l'upload de fichiers avec:
 * - Stockage local uniquement (pas de Supabase pour simplifier)
 * - Authentification JWT
 * - Tous les fichiers dans le même dossier
 * - Gestion d'erreurs robuste
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 === API UPLOAD UNIQUE - DÉBUT ===')

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
      const userEmail = decoded.email
      console.log('✅ Utilisateur authentifié:', userEmail)
      
      // Récupérer l'UUID de l'utilisateur depuis la base
      const supabase = getSupabaseAdmin()
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      
      if (userError || !user) {
        console.error('❌ Utilisateur non trouvé:', userError)
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }
      
      userId = user.id
      console.log('✅ UUID utilisateur récupéré:', userId)
      
    } catch (error) {
      console.log('❌ Token invalide:', error)
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    // 2. RÉCUPÉRATION DES FICHIERS
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadataStr = formData.get('metadata') as string

    console.log('📁 Fichiers reçus:', files.length)

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // 3. MÉTADONNÉES
    let metadata: any = {}
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr)
        console.log('📋 Métadonnées:', metadata)
      } catch (error) {
        console.log('⚠️ Métadonnées invalides, utilisation des valeurs par défaut')
      }
    }

    // 4. CONFIGURATION SUPABASE STORAGE
    const supabase = getSupabaseAdmin()
    console.log('🔗 Connexion à Supabase Storage...')

    // 5. TRAITEMENT DES FICHIERS
    const uploadedFiles: Array<{
      id: string
      title: string
      name: string
      size: number
      type: string
      path: string
      url: string
    }> = []

    const errors: Array<{ fileName: string; message: string }> = []

    for (const file of files) {
      try {
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
        
        // Chemin dans Supabase Storage
        const filePath = `documents/${fileName}`

        // Convertir en buffer pour Supabase Storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          console.error('❌ Erreur upload Supabase Storage:', uploadError)
          throw new Error(`Erreur upload Supabase Storage: ${uploadError.message}`)
        }

        console.log('✅ Fichier uploadé vers Supabase Storage:', filePath)

        // URL publique depuis Supabase Storage
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)
        
        const publicUrl = urlData.publicUrl

        // ID unique pour le fichier
        const fileId = `file-${timestamp}-${randomSuffix}`

        // 🆕 SAUVEGARDER DANS LA TABLE DOCUMENTS SUPABASE
        try {
          console.log('💾 Sauvegarde en base de données...')
          console.log('👤 User ID:', userId)
          console.log('📄 File ID:', fileId)
          console.log('📝 Title:', metadata.name || file.name.split('.')[0])
          
          // Créer l'entrée document dans Supabase
          const { data: document, error: docError } = await supabase
            .from('documents')
            .insert({
              id: fileId,
              title: metadata.name || file.name.split('.')[0],
              description: metadata.description || null,
              authorId: userId, // Utiliser l'ID de l'utilisateur connecté
              folderId: null, // camelCase pour Supabase
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
            .select()
            .single()

          if (docError) {
            console.error('❌ Erreur sauvegarde document:', docError)
            console.error('❌ Détails erreur:', JSON.stringify(docError, null, 2))
            throw new Error(`Erreur sauvegarde document: ${docError.message}`)
          }

          console.log('✅ Document enregistré en base:', document.id)

          // Créer la première version du document
          const versionId = `version-${timestamp}-${randomSuffix}`
          const { data: version, error: versionError } = await supabase
            .from('document_versions')
            .insert({
              id: versionId,
              documentId: fileId, // camelCase pour Supabase
              versionNumber: 1, // camelCase pour Supabase
              fileName: file.name, // camelCase pour Supabase
              fileSize: file.size, // camelCase pour Supabase
              fileType: file.type, // camelCase pour Supabase
              filePath: filePath, // camelCase pour Supabase
              changeLog: 'Version initiale', // camelCase pour Supabase
              createdBy: userId, // Utiliser l'ID de l'utilisateur connecté
              createdAt: new Date().toISOString() // camelCase pour Supabase
            })
            .select()
            .single()

          if (versionError) {
            console.error('❌ Erreur création version:', versionError)
            throw new Error(`Erreur création version: ${versionError.message}`)
          }

          // Mettre à jour le document avec l'ID de la version actuelle
          const { error: updateError } = await supabase
            .from('documents')
            .update({ currentVersionId: versionId }) // camelCase pour Supabase
            .eq('id', fileId)

          if (updateError) {
            console.error('❌ Erreur mise à jour current_version_id:', updateError)
            throw new Error(`Erreur mise à jour current_version_id: ${updateError.message}`)
          }

          console.log('✅ Version créée et document mis à jour:', versionId)

        } catch (dbError) {
          console.error('❌ Erreur base de données:', dbError)
          console.error('❌ Détails erreur DB:', JSON.stringify(dbError, null, 2))
          // Continuer même si la DB échoue, au moins le fichier est sauvé
        }

        uploadedFiles.push({
          id: fileId,
          title: metadata.name || file.name.split('.')[0],
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
          url: publicUrl
        })

        console.log(`✅ Fichier ${file.name} traité avec succès`)

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error(`❌ Erreur lors du traitement de ${file?.name}:`, message)
        errors.push({ fileName: file?.name || 'inconnu', message })
      }
    }

    // 6. RÉPONSE FINALE
    console.log(`📊 Résumé: ${uploadedFiles.length} succès, ${errors.length} erreurs`)

    if (uploadedFiles.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: `Aucun fichier n'a pu être uploadé (${errors.length} fichier(s) en erreur)`,
          errors,
          details: 'Tous les fichiers ont rencontré une erreur lors du traitement'
        },
        { status: 500 }
      )
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être traité - erreur inattendue' },
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
