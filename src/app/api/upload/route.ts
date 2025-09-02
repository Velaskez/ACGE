import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { ensureUUID } from '@/lib/uuid-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de l\'upload Supabase...')
    
    const supabase = getSupabaseAdmin()
    
    // Vérifier l'authentification
    const isTestMode = request.headers.get('X-Test-Mode') === 'true'
    let userId: string
    
    if (!isTestMode) {
      const token = request.cookies.get('auth-token')?.value || 
                    request.headers.get('authorization')?.replace('Bearer ', '')

      if (!token) {
        console.log('❌ Pas de token d\'authentification')
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        )
      }

      const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
      const originalUserId = decoded.userId
      userId = ensureUUID(originalUserId) || ''
      console.log('✅ Utilisateur authentifié:', originalUserId, '-> UUID:', userId)
    } else {
      // Mode test - utiliser un userId de test
      userId = ensureUUID('test-user-id') || '00000000-0000-0000-0000-000000000001'
      console.log('🧪 Mode test - utilisateur:', userId)
    }

    // Parser le FormData
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadataStr = formData.get('metadata') as string
    
    console.log('📁 Fichiers reçus:', files.length)
    
    if (!files || files.length === 0) {
      console.log('❌ Aucun fichier fourni')
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    let metadata: any
    try {
      metadata = JSON.parse(metadataStr)
      console.log('📋 Métadonnées:', metadata)
    } catch {
      metadata = {}
      console.log('⚠️ Métadonnées invalides, utilisation des valeurs par défaut')
    }

    // Valider le dossier cible si fourni (par Supabase)
    let validFolderId: string | null = null
    if (metadata?.folderId) {
      const convertedFolderId = ensureUUID(String(metadata.folderId))
      if (convertedFolderId) {
        const { data: folder, error: folderErr } = await supabase
          .from('folders')
          .select('id, author_id')
          .eq('id', convertedFolderId)
          .eq('author_id', userId)
          .maybeSingle()
        if (!folderErr && folder) {
          validFolderId = folder.id
        }
        console.log('📂 Dossier:', metadata.folderId, '-> UUID:', convertedFolderId, 'Validé:', validFolderId ? 'Oui' : 'Non')
      }
    }

    const uploadedFiles: Array<{
      id: string
      title: string
      name: string
      size: number
      type: string
      path: string
      version: {
        id: string
        number: number
        changeLog: string | null
        isNewDocument: boolean
      }
    }> = []
    const errors: Array<{ fileName: string; message: string }> = []

    // Traiter chaque fichier
    for (const file of files) {
      try {
        console.log(`📤 Traitement du fichier: ${file.name}`)
        
        // Nettoyer le nom de fichier pour Supabase Storage
        const cleanFileName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, '_') // Remplacer les caractères spéciaux par des underscores
          .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
          .replace(/_{2,}/g, '_') // Remplacer les underscores multiples par un seul
          .replace(/^_|_$/g, '') // Supprimer les underscores en début et fin
        
        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomSuffix}-${cleanFileName}`
        const filePath = `${userId}/${fileName}`
        
        console.log('📝 Chemin de fichier généré:', filePath)
        
        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        console.log('📦 Buffer créé, taille:', buffer.length)
        
        // Upload vers Supabase Storage
        if (isTestMode) {
          // Mode test - simulation d'upload
          console.log('🧪 Mode test - simulation upload vers Supabase Storage')
          const uploadData = { path: filePath }
          console.log('✅ Fichier simulé vers Supabase:', uploadData.path)
        } else {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: false
            })

          if (uploadError) {
            console.error('❌ Erreur upload Supabase:', uploadError)
            throw new Error(`Erreur upload: ${uploadError.message}`)
          }

          console.log('✅ Fichier uploadé vers Supabase:', uploadData.path)
        }

        // Générer l'URL publique
        let publicUrl: string
        if (isTestMode) {
          // Mode test - URL simulée
          publicUrl = `https://test.example.com/documents/${filePath}`
          console.log('🔗 URL publique simulée:', publicUrl)
        } else {
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)
          publicUrl = urlData.publicUrl
          console.log('🔗 URL publique générée:', publicUrl)
        }

        // Vérifier s'il s'agit d'une nouvelle version d'un document existant
        let existingDocument: any = null
        if (metadata.documentId) {
          const { data: doc, error: docErr } = await supabase
            .from('documents')
            .select('id')
            .eq('id', String(metadata.documentId))
            .eq('author_id', userId)
            .maybeSingle()
          if (!docErr) existingDocument = doc
        }

        let document: any
        let documentVersion: any

        if (existingDocument) {
          console.log('🔄 Nouvelle version du document existant')
          
          if (isTestMode) {
            // Mode test - simulation
            documentVersion = {
              id: `test-version-${Date.now()}`,
              versionNumber: 1,
              changeLog: 'Version de test',
              filePath: publicUrl
            }
            document = { id: existingDocument.id, title: metadata.name || file.name.split('.')[0] }
          } else {
            // Calculer le prochain numéro de version
            let nextVersion = 1
            const { data: lastVersions } = await supabase
              .from('document_versions')
              .select('version_number')
              .eq('document_id', existingDocument.id)
              .order('version_number', { ascending: false })
              .limit(1)
            if (lastVersions && lastVersions.length > 0) {
              nextVersion = Number((lastVersions[0] as any).version_number || 0) + 1
            }

                         const { data: createdVersion } = await supabase
               .from('document_versions')
               .insert({
                 version_number: nextVersion,
                 file_name: file.name,
                 file_size: file.size,
                 file_type: file.type,
                 file_path: publicUrl,
                 change_log: metadata.changeLog || `Version ${nextVersion}`,
                 document_id: existingDocument.id,
                 created_by_id: userId
               })
               .select('id, version_number, change_log, file_path')
               .single()

            documentVersion = createdVersion!

            await supabase
              .from('documents')
              .update({ current_version_id: documentVersion.id })
              .eq('id', existingDocument.id)
            document = { id: existingDocument.id, title: metadata.name || file.name.split('.')[0] }
          }

        } else {
          console.log('🆕 Nouveau document')
          
          if (isTestMode) {
            // Mode test - simulation
            document = {
              id: `test-doc-${Date.now()}`,
              title: metadata.name || file.name.split('.')[0]
            }
            documentVersion = {
              id: `test-version-${Date.now()}`,
              versionNumber: 1,
              changeLog: 'Version initiale de test',
              filePath: publicUrl
            }
          } else {
            console.log('📝 Tentative d\'insertion du document en base...')
            console.log('📋 Données du document:', {
              title: metadata.name || file.name.split('.')[0],
              description: metadata.description || null,
              category: metadata.category || null,
              is_public: false,
              author_id: userId,
              folder_id: validFolderId,
            })
            
            const { data: createdDoc, error: createDocErr } = await supabase
              .from('documents')
              .insert({
                title: metadata.name || file.name.split('.')[0],
                description: metadata.description || null,
                category: metadata.category || null,
                is_public: false,
                author_id: userId,
                folder_id: validFolderId,
              })
              .select('id, title')
              .single()
            
            if (createDocErr) {
              console.error('❌ Erreur création document:', createDocErr)
              throw createDocErr
            }
            
            document = createdDoc!
            console.log('✅ Document créé:', document)

            console.log('📝 Tentative d\'insertion de la version en base...')
            console.log('📋 Données de la version:', {
              version_number: 1,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              file_path: publicUrl,
              change_log: 'Version initiale',
              document_id: document.id,
              created_by_id: userId
            })
            
            const { data: createdVersion, error: versionErr } = await supabase
              .from('document_versions')
              .insert({
                version_number: 1,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                file_path: publicUrl,
                change_log: 'Version initiale',
                document_id: document.id,
                created_by_id: userId
              })
              .select('id, version_number, change_log, file_path')
              .single()
            
            if (versionErr) {
              console.error('❌ Erreur création version:', versionErr)
              throw versionErr
            }
            
            documentVersion = createdVersion!
            console.log('✅ Version créée:', documentVersion)

            console.log('📝 Mise à jour du document avec current_version_id...')
            const { error: updateErr } = await supabase
              .from('documents')
              .update({ current_version_id: documentVersion.id })
              .eq('id', document.id)
            
            if (updateErr) {
              console.error('❌ Erreur mise à jour document:', updateErr)
              throw updateErr
            }
            
            console.log('✅ Document mis à jour avec current_version_id')
          }
        }

        console.log('💾 Document sauvegardé en base:', document.id)

        uploadedFiles.push({
          id: document.id,
          title: document.title,
          name: file.name,
          size: file.size,
          type: file.type,
          path: documentVersion.file_path,
          version: {
            id: documentVersion.id,
            number: documentVersion.version_number,
            changeLog: documentVersion.change_log,
            isNewDocument: !existingDocument
          }
        })

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error(`❌ Erreur lors de l'upload de ${file?.name || 'inconnu'}:`, {
          message,
          stack: error instanceof Error ? error.stack : undefined
        })
        errors.push({ fileName: file?.name || 'inconnu', message })
        // Continuer avec les autres fichiers
      }
    }

    if (uploadedFiles.length === 0) {
      console.log('❌ Aucun fichier uploadé avec succès')
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être uploadé', errors },
        { status: 500 }
      )
    }

    console.log('✅ Upload Supabase terminé avec succès:', uploadedFiles.length, 'fichiers')
    return NextResponse.json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès` + (errors.length ? `, ${errors.length} échec(s)` : ''),
      files: uploadedFiles,
      ...(errors.length ? { errors } : {})
    })

  } catch (error) {
    console.error('💥 Erreur upload générale:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
