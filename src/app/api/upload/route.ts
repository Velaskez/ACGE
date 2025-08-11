import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { saveUploadedFile } from '@/lib/storage'
import { getServerUser } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const userId = authUser.userId

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

    let metadata
    try {
      metadata = JSON.parse(metadataStr)
    } catch {
      metadata = {}
    }

    const uploadedFiles = []

    // Traiter chaque fichier
    for (const file of files) {
      try {
        // Sauver le fichier via provider de stockage
        const stored = await saveUploadedFile(userId, file)

        // Vérifier s'il s'agit d'une nouvelle version d'un document existant
        const existingDocument = metadata.documentId ? 
          await prisma.document.findFirst({
            where: {
              id: metadata.documentId,
              authorId: userId
            } as any,
            include: ({
              versions: {
                orderBy: { versionNumber: 'desc' },
                take: 1
              }
            } as any)
          }) : null

        let document
        let documentVersion

        if (existingDocument) {
          // Nouvelle version d'un document existant
          const lv: any = (existingDocument as any).versions && (existingDocument as any).versions.length > 0
            ? (existingDocument as any).versions[0]
            : null
          const newVersionNumber = lv && typeof lv.versionNumber === 'number' ? lv.versionNumber + 1 : 1

          try {
            documentVersion = await (prisma as any).documentVersion.create({
              data: {
                versionNumber: newVersionNumber,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                filePath: stored.filePath,
                changeLog: metadata.changeLog || `Version ${newVersionNumber}`,
                documentId: (existingDocument as any).id,
                createdById: userId
              }
            })

            // Mettre à jour le document pour pointer vers la nouvelle version
            document = await (prisma as any).document.update({
              where: { id: (existingDocument as any).id },
              data: { 
                currentVersionId: (documentVersion as any).id,
                updatedAt: new Date()
              }
            })
          } catch (_err) {
            // Fallback schéma legacy (pas de versions)
            document = await prisma.document.update({
              where: { id: (existingDocument as any).id },
              data: ({
                name: metadata.name || file.name.split('.')[0],
                description: metadata.description || (existingDocument as any).description || null,
                mimeType: file.type,
                size: file.size,
                url: stored.filePath,
                version: ((existingDocument as any).version || 0) + 1,
                updatedAt: new Date()
              } as any)
            })

            documentVersion = {
              id: `legacy-${(existingDocument as any).id}`,
              versionNumber: (document as any).version || 1,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              filePath: stored.filePath,
              changeLog: metadata.changeLog || `Version ${(document as any).version || 1}`
            }
          }
          // Journaliser mise à jour (nouvelle version)
          try {
            await (prisma as any).activity.create({
              data: {
                type: 'document_updated',
                targetType: 'document',
                targetId: existingDocument.id,
                title: existingDocument.title,
                metadata: { versionNumber: documentVersion.versionNumber },
                userId,
              }
            })
          } catch {}

        } else {
          // Nouveau document
          try {
            document = await prisma.document.create({
              data: ({
                title: metadata.name || file.name.split('.')[0],
                description: metadata.description || null,
                isPublic: false,
                authorId: userId,
                folderId: metadata.folderId || null,
              } as any)
            })
          } catch (_err) {
            // Fallback SQLite (schéma legacy)
            document = await prisma.document.create({
              data: ({
                name: metadata.name || file.name.split('.')[0],
                description: metadata.description || null,
                mimeType: file.type,
                size: file.size,
                url: stored.filePath,
                version: 0,
                userId: userId,
                folderId: metadata.folderId || null,
              } as any)
            })
          }

          // Créer la première version
          documentVersion = await (prisma as any).documentVersion.create({
            data: {
              versionNumber: 1,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              filePath: stored.filePath,
              changeLog: 'Version initiale',
              documentId: document.id,
              createdById: userId
            }
          })

          // Mettre à jour le document pour pointer vers cette version
          try {
            await (prisma as any).document.update({
              where: { id: document.id },
              data: { currentVersionId: documentVersion.id }
            })
          } catch {}

          // Journaliser création
          try {
            await (prisma as any).activity.create({
              data: {
                type: 'document_created',
                targetType: 'document',
                targetId: document.id,
                title: document.title,
                metadata: { fileName: documentVersion.fileName },
                userId,
              }
            })
          } catch {}
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
        console.error(`Erreur lors de l'upload de ${file.name}:`, error)
        // Continuer avec les autres fichiers
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être uploadé' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} fichier(s) uploadé(s) avec succès`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
