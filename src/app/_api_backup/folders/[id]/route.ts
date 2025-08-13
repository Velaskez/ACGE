// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

type UpdateFolderBody = {
  name?: string
  description?: string
  parentId?: string | null
}

// GET - Récupérer un dossier spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId as string

    // Récupérer le dossier avec ses détails
    const folder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
            children: true
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Erreur lors de la récupération du dossier:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// PUT - Modifier un dossier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId as string

    const raw = await request.text()
    let body: UpdateFolderBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    // Vérifier que le dossier existe et appartient à l'utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      }
    })

    if (!existingFolder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}
    
    if (body.name !== undefined) {
      const name = body.name.trim()
      if (!name) {
        return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
      }
      if (name.length > 100) {
        return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 })
      }
      
      // Vérifier qu'il n'y a pas de doublon (sauf le dossier actuel)
      const duplicate = await prisma.folder.findFirst({
        where: {
          name,
          parentId: body.parentId ?? existingFolder.parentId,
          authorId: userId,
          id: { not: resolvedParams.id }
        }
      })
      
      if (duplicate) {
        return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
      }
      
      updateData.name = name
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim() || null
    }

    if (body.parentId !== undefined) {
      updateData.parentId = body.parentId
    }

    // Mettre à jour le dossier
    const updatedFolder = await prisma.folder.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ folder: updatedFolder })
  } catch (error) {
    console.error('Erreur lors de la modification du dossier:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un dossier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId as string

    // Vérifier que le dossier existe et appartient à l'utilisateur
    const folder = await prisma.folder.findFirst({
      where: {
        id: resolvedParams.id,
        authorId: userId
      },
      include: {
        documents: true,
        children: true
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Vérifier si le dossier contient des documents ou des sous-dossiers
    if (folder.documents.length > 0) {
      return NextResponse.json({ 
        error: `Impossible de supprimer le dossier : il contient ${folder.documents.length} document(s)` 
      }, { status: 400 })
    }

    if (folder.children.length > 0) {
      return NextResponse.json({ 
        error: `Impossible de supprimer le dossier : il contient ${folder.children.length} sous-dossier(s)` 
      }, { status: 400 })
    }

    // Supprimer le dossier
    await prisma.folder.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Dossier supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du dossier:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }


// Fonction requise pour l'export statique

// Fonction requise pour l'export statique
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}
    { id: '2' },
    { id: '3' },
  ]
}
}
