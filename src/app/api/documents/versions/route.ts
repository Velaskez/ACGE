import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès au document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        authorId: userId
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Récupérer toutes les versions du document
    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId: documentId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        versionNumber: 'desc'
      }
    })

    return NextResponse.json({
      documentId,
      documentTitle: document.title,
      currentVersionId: document.currentVersionId,
      versions: versions.map(version => ({
        id: version.id,
        versionNumber: version.versionNumber,
        fileName: version.fileName,
        fileSize: version.fileSize,
        fileType: version.fileType,
        changeLog: version.changeLog,
        createdAt: version.createdAt,
        createdBy: version.createdBy,
        isCurrent: version.id === document.currentVersionId
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des versions:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const { documentId, fileName, fileSize, fileType, filePath, changeLog } = body

    if (!documentId || !fileName || !fileSize || !fileType || !filePath) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès au document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        authorId: userId
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Calculer le nouveau numéro de version
    const lastVersion = document.versions[0]
    const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1

    // Créer la nouvelle version
    const newVersion = await prisma.documentVersion.create({
      data: {
        versionNumber: newVersionNumber,
        fileName,
        fileSize,
        fileType,
        filePath,
        changeLog: changeLog || `Version ${newVersionNumber}`,
        documentId,
        createdById: userId
      }
    })

    // Mettre à jour le document pour pointer vers cette nouvelle version
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        currentVersionId: newVersion.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      version: {
        id: newVersion.id,
        versionNumber: newVersion.versionNumber,
        fileName: newVersion.fileName,
        fileSize: newVersion.fileSize,
        fileType: newVersion.fileType,
        changeLog: newVersion.changeLog,
        createdAt: newVersion.createdAt
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création de version:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
