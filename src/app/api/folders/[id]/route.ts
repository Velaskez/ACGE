import { NextRequest, NextResponse } from 'next/server'
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
    console.log('📁 Récupération dossier - Début')
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    // Récupérer le dossier avec ses détails
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId
      },
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        _count: {
          select: {
            documents: true,
            children: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!folder) {
      
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      folder
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du dossier:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// PUT - Modifier un dossier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('📁 Modification dossier - Début')
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    const raw = await request.text()
    let body: UpdateFolderBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    // Vérifier que le dossier existe
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId
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
          authorId: existingFolder.authorId,
          id: { not: folderId }
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
      where: { id: folderId },
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

    return NextResponse.json({ 
      success: true,
      folder: updatedFolder 
    })
  } catch (error) {
    console.error('❌ Erreur lors de la modification du dossier:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un dossier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    console.log('🗑️ Suppression dossier - Début')
    
    const resolvedParams = await params
    const folderId = resolvedParams.id

    // Vérifier que le dossier existe
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId
      },
      include: {
        documents: true,
        children: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!folder) {
      
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    console.log(`📁 Dossier à supprimer: ${folder.name}`)
    console.log(`👤 Auteur: ${folder.author?.name}`)
    console.log(`📄 Documents: ${folder.documents.length}`)
    console.log(`📁 Sous-dossiers: ${folder.children.length}`)

    // Vérifier si le dossier contient des documents ou des sous-dossiers
    if (folder.documents.length > 0) {
      
      return NextResponse.json({ 
        success: false,
        error: `Impossible de supprimer le dossier : il contient ${folder.documents.length} document(s)` 
      }, { status: 400 })
    }

    if (folder.children.length > 0) {
      
      return NextResponse.json({ 
        success: false,
        error: `Impossible de supprimer le dossier : il contient ${folder.children.length} sous-dossier(s)` 
      }, { status: 400 })
    }

    // Supprimer le dossier
    await prisma.folder.delete({
      where: { id: folderId }
    })

    console.log('✅ Dossier supprimé avec succès')
    
    return NextResponse.json({
      success: true,
      message: 'Dossier supprimé avec succès',
      deletedFolder: {
        id: folderId,
        name: folder.name,
        documentsCount: folder.documents.length,
        childrenCount: folder.children.length
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du dossier:', error)

    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
