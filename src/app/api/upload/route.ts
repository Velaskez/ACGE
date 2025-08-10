import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
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

    let metadata
    try {
      metadata = JSON.parse(metadataStr)
    } catch {
      metadata = {}
    }

    // Créer le répertoire d'upload s'il n'existe pas
    const uploadDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Créer un sous-répertoire pour cet utilisateur
    const userUploadDir = join(uploadDir, userId)
    if (!existsSync(userUploadDir)) {
      await mkdir(userUploadDir, { recursive: true })
    }

    const uploadedFiles = []

    // Traiter chaque fichier
    for (const file of files) {
      try {
        // Générer un nom de fichier unique
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${timestamp}-${randomSuffix}-${file.name}`
        const filePath = join(userUploadDir, fileName)

        // Convertir le fichier en buffer et l'écrire
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Enregistrer dans la base de données
        const document = await prisma.document.create({
          data: {
            title: metadata.name || file.name.split('.')[0],
            description: metadata.description || null,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            filePath: `/uploads/${userId}/${fileName}`,
            version: 1,
            isPublic: false,
            authorId: userId,
            folderId: metadata.folderId || null,
          }
        })

        uploadedFiles.push({
          id: document.id,
          name: file.name,
          size: file.size,
          type: file.type,
          path: document.filePath
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
