import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de l\'upload Supabase (version corrigée)...')
    
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

      try {
        const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
        const originalUserId = decoded.userId
        console.log('🔍 ID utilisateur original (CUID):', originalUserId)
        
        // Chercher ou créer un mapping CUID -> UUID
        const { data: userMapping } = await supabase
          .from('user_mappings')
          .select('uuid')
          .eq('cuid', originalUserId)
          .single()
          
        if (userMapping) {
          userId = userMapping.uuid
          console.log('✅ Mapping trouvé - UUID:', userId)
        } else {
          // Créer un nouveau UUID pour cet utilisateur
          userId = randomUUID()
          console.log('🆕 Création d\'un nouveau UUID:', userId)
          
          // Sauvegarder le mapping
          await supabase
            .from('user_mappings')
            .insert({ cuid: originalUserId, uuid: userId })
            .select()
            .single()
        }
      } catch (error) {
        console.error('❌ Erreur décodage token:', error)
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        )
      }
    } else {
      // Mode test - utiliser un UUID de test fixe
      userId = '00000000-0000-0000-0000-000000000001'
      console.log('🧪 Mode test - UUID utilisateur:', userId)
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

    // Vérifier le dossier si fourni
    let validFolderId = null
    if (metadata.folderId && metadata.folderId !== 'null' && metadata.folderId !== '') {
      const { data: folder } = await supabase
        .from('folders')
        .select('id')
        .eq('id', String(metadata.folderId))
        .eq('author_id', userId)
        .maybeSingle()
      
      if (folder) {
        validFolderId = folder.id
        console.log('✅ Dossier valide:', validFolderId)
      } else {
        console.log('⚠️ Dossier non trouvé ou non autorisé:', metadata.folderId)
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

    const errors: Array<{ file: string; error: string }> = []

    // Traiter chaque fichier
    for (const file of files) {
      try {
        console.log(`📤 Traitement du fichier: ${file.name}`)
        
        // Générer un nom de fichier unique
        const fileExt = file.name.split('.').pop()
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomStr}-${file.name}`
        const filePath = `${userId}/${fileName}`

        // Convertir le fichier en buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log('📦 Buffer créé, taille:', buffer.length)

        // Upload vers Supabase Storage
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

        console.log('✅ Fichier uploadé vers Supabase:', filePath)

        // Générer l'URL publique
        let publicUrl = ''
        if (isTestMode) {
          publicUrl = `https://test.supabase.co/storage/v1/object/public/documents/${filePath}`
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)
          publicUrl = publicUrlData.publicUrl
          console.log('🔗 URL publique générée:', publicUrl)
        }

        // Créer le document en base de données
        console.log('🆕 Création du document en base...')
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
          throw new Error(`Erreur création document: ${createDocErr.message}`)
        }

        console.log('✅ Document créé:', createdDoc.id)

        // Créer la version initiale
        const { data: createdVersion, error: versionErr } = await supabase
          .from('document_versions')
          .insert({
            version_number: 1,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_path: publicUrl,
            change_log: 'Version initiale',
            document_id: createdDoc.id,
            created_by_id: userId
          })
          .select('id, version_number, change_log')
          .single()

        if (versionErr) {
          console.error('❌ Erreur création version:', versionErr)
          // Nettoyer le document créé
          await supabase.from('documents').delete().eq('id', createdDoc.id)
          throw new Error(`Erreur création version: ${versionErr.message}`)
        }

        // Mettre à jour le document avec la version courante
        await supabase
          .from('documents')
          .update({ current_version_id: createdVersion.id })
          .eq('id', createdDoc.id)

        uploadedFiles.push({
          id: createdDoc.id,
          title: createdDoc.title,
          name: file.name,
          size: file.size,
          type: file.type,
          path: publicUrl,
          version: {
            id: createdVersion.id,
            number: createdVersion.version_number,
            changeLog: createdVersion.change_log,
            isNewDocument: true
          }
        })

        console.log(`✅ Fichier ${file.name} uploadé avec succès`)

      } catch (error) {
        console.error(`❌ Erreur lors de l'upload de ${file.name}:`, error)
        errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    if (uploadedFiles.length === 0) {
      console.log('❌ Aucun fichier uploadé avec succès')
      return NextResponse.json(
        { 
          error: `Aucun fichier n'a pu être uploadé (${errors.length} fichier(s) en erreur)`,
          errors
        },
        { status: 500 }
      )
    }

    console.log('✅ Upload terminé:', uploadedFiles.length, 'fichiers uploadés,', errors.length, 'erreurs')
    
    return NextResponse.json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('💥 Erreur upload:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}