import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de l\'upload...')
    
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

    // Valider le dossier cible si fourni (éviter violation de FK)
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
        
        console.log('📝 Nom de fichier généré:', fileName)
        
        // Convertir le fichier en buffer pour Vercel Blob
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        console.log('📦 Buffer créé, taille:', buffer.length)
        
        // Upload vers Vercel Blob Storage avec la méthode officielle
        console.log('☁️ Upload vers Vercel Blob...')
        const blob = await put(fileName, buffer, {
          access: 'public',
          addRandomSuffix: false
        })
        
        console.log('✅ Blob uploadé:', blob.url)

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
              filePath: blob.url,
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
              filePath: blob.url,
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

    console.log('✅ Upload terminé avec succès:', uploadedFiles.length, 'fichiers')
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
