import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de l\'upload Supabase...')
    
    // Vérifier la configuration Supabase
    if (!supabaseAdmin) {
      console.error('❌ Client Supabase admin non disponible')
      return NextResponse.json(
        { error: 'Service d\'upload temporairement indisponible - Configuration Supabase manquante' },
        { status: 503 }
      )
    }
    
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

    // Valider le dossier cible si fourni
    let validFolderId: string | null = null
    if (metadata?.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: String(metadata.folderId), authorId: userId }
      })
      validFolderId = folder ? folder.id : null
      console.log('📂 Dossier validé:', validFolderId)
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
        
        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomSuffix}-${file.name}`
        const filePath = `${userId}/${fileName}`
        
        console.log('📝 Chemin de fichier généré:', filePath)
        
        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        console.log('📦 Buffer créé, taille:', buffer.length)
        
        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
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

        // Générer l'URL publique
        const { data: urlData } = supabaseAdmin.storage
          .from('documents')
          .getPublicUrl(filePath)

        const publicUrl = urlData.publicUrl
        console.log('🔗 URL publique générée:', publicUrl)

        // Vérifier s'il s'agit d'une nouvelle version d'un document existant
        const existingDocument = metadata.documentId ? 
          await prisma.document.findFirst({
            where: {
              id: metadata.documentId,
              authorId: userId
            },
            include: {
              versions: {
                orderBy: { versionNumber: 'desc' },
                take: 1
              }
            }
          }) : null

        let document
        let documentVersion

        if (existingDocument) {
          console.log('🔄 Nouvelle version du document existant')
          // Nouvelle version d'un document existant
          const lastVersion = existingDocument.versions[0]
          const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1

          documentVersion = await prisma.documentVersion.create({
            data: {
              versionNumber: newVersionNumber,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              filePath: publicUrl,
              changeLog: metadata.changeLog || `Version ${newVersionNumber}`,
              documentId: existingDocument.id,
              createdById: userId
            }
          })

          // Mettre à jour le document pour pointer vers la nouvelle version
          document = await prisma.document.update({
            where: { id: existingDocument.id },
            data: { 
              currentVersionId: documentVersion.id,
              updatedAt: new Date()
            }
          })

        } else {
          console.log('🆕 Nouveau document')
          // Nouveau document
          document = await prisma.document.create({
            data: {
              title: metadata.name || file.name.split('.')[0],
              description: metadata.description || null,
              isPublic: false,
              authorId: userId,
              folderId: validFolderId,
            }
          })

          // Créer la première version
          documentVersion = await prisma.documentVersion.create({
            data: {
              versionNumber: 1,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              filePath: publicUrl,
              changeLog: 'Version initiale',
              documentId: document.id,
              createdById: userId
            }
          })

          // Mettre à jour le document pour pointer vers cette version
          await prisma.document.update({
            where: { id: document.id },
            data: { currentVersionId: documentVersion.id }
          })
        }

        console.log('💾 Document sauvegardé en base:', document.id)

        uploadedFiles.push({
          id: document.id,
          title: document.title,
          name: file.name,
          size: file.size,
          type: file.type,
          path: documentVersion.filePath,
          version: {
            id: documentVersion.id,
            number: documentVersion.versionNumber,
            changeLog: documentVersion.changeLog,
            isNewDocument: !existingDocument
          }
        })

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error(`❌ Erreur lors de l'upload de ${file.name}:`, {
          message,
          stack: error instanceof Error ? error.stack : undefined
        })
        errors.push({ fileName: file.name, message })
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
