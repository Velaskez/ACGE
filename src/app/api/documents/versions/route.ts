import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const userId = authUser.userId

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
    let document = await prisma.document.findFirst({
      where: { id: documentId, authorId: userId } as any,
    })
    if (!document) {
      document = await prisma.document.findFirst({
        where: { id: documentId, userId: userId } as any,
      })
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Récupérer toutes les versions du document
    const versions = await (prisma as any).documentVersion.findMany({
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
      documentTitle: (document as any).title ?? (document as any).name ?? '',
      currentVersionId: (document as any).currentVersionId ?? null,
      versions: (versions as any[]).map((version: any) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        fileName: version.fileName,
        fileSize: version.fileSize,
        fileType: version.fileType,
        changeLog: version.changeLog,
        createdAt: version.createdAt,
        createdBy: version.createdBy,
        isCurrent: version.id === (document as any).currentVersionId
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
    // Auth unifiée
    const authUser = await getServerUser(request)
    if (!authUser) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const userId = authUser.userId

    const body = await request.json()
    const { documentId, fileName, fileSize, fileType, filePath, changeLog } = body

    if (!documentId || !fileName || !fileSize || !fileType || !filePath) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès au document
    let document = await prisma.document.findFirst({
      where: { id: documentId, authorId: userId } as any,
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      } as any,
    })
    if (!document) {
      document = await prisma.document.findFirst({
        where: { id: documentId, userId: userId } as any,
        include: {
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
        } as any,
      })
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Calculer le nouveau numéro de version (tolérant)
    const lastVersion = (document as any).versions && (document as any).versions.length > 0
      ? (document as any).versions[0]
      : null
    const newVersionNumber = lastVersion && typeof (lastVersion as any).versionNumber === 'number'
      ? (lastVersion as any).versionNumber + 1
      : 1

    // Créer la nouvelle version
    const newVersion = await (prisma as any).documentVersion.create({
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
    await (prisma as any).document.update({
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
