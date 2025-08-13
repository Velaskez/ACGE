import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { hasSupabase, uploadToStorage, deleteFromStorage } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Parser le FormData
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadataStr = formData.get('metadata') as string
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    let metadata: any
    try {
      metadata = JSON.parse(metadataStr)
    } catch {
      metadata = {}
    }

    // Valider le dossier cible si fourni (éviter violation de FK)
    let validFolderId: string | null = null
    if (metadata?.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: String(metadata.folderId), authorId: userId }
      })
      validFolderId = folder ? folder.id : null
    }

    // Préparer fallback local si pas de Supabase
    const uploadDir = join(process.cwd(), 'uploads')
    const userUploadDir = join(uploadDir, userId)
    if (!hasSupabase) {
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      if (!existsSync(userUploadDir)) await mkdir(userUploadDir, { recursive: true })
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
      // Déclarer ici pour disponibilité dans le catch
      let storedPath = ''
      let storageWasSupabase = false
      let localFilePath = ''
      try {
        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomSuffix}-${file.name}`
        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        if (hasSupabase) {
          const now = new Date()
          const year = now.getUTCFullYear()
          const month = String(now.getUTCMonth() + 1).padStart(2, '0')
          const storagePath = `${userId}/${year}/${month}/${fileName}`
          await uploadToStorage({ bucket: 'documents', path: storagePath, fileBuffer: buffer, contentType: file.type })
          storedPath = `documents/${storagePath}`
          storageWasSupabase = true
        } else {
          localFilePath = join(userUploadDir, fileName)
          await writeFile(localFilePath, buffer)
          storedPath = `/uploads/${userId}/${fileName}`
        }

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
          // Nouvelle version d'un document existant
          const lastVersion = existingDocument.versions[0]
          const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1

          documentVersion = await prisma.documentVersion.create({
            data: {
              versionNumber: newVersionNumber,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              filePath: storedPath,
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
              filePath: storedPath,
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
        console.error(`Erreur lors de l'upload de ${file.name}:`, {
          message,
          stack: error instanceof Error ? error.stack : undefined
        })
        // Nettoyage: supprimer l'objet déjà uploadé si la base échoue
        try {
          if (storageWasSupabase && storedPath.startsWith('documents/')) {
            const pathOnly = storedPath.replace(/^documents\//, '')
            await deleteFromStorage({ bucket: 'documents', path: pathOnly })
          } else if (localFilePath && existsSync(localFilePath)) {
            await unlink(localFilePath)
          }
        } catch (cleanupError) {
          console.warn('Échec du nettoyage après erreur upload:', cleanupError)
        }
        errors.push({ fileName: file.name, message })
        // Continuer avec les autres fichiers
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être uploadé', errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès` + (errors.length ? `, ${errors.length} échec(s)` : ''),
      files: uploadedFiles,
      ...(errors.length ? { errors } : {})
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
