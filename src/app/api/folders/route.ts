import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type CreateFolderBody = {
  name?: string
  description?: string
  parentId?: string | null
  numeroDossier?: string
  dateDepot?: string
  posteComptableId?: string
  numeroNature?: string
  natureDocumentId?: string
  objetOperation?: string
  beneficiaire?: string
}

export async function POST(request: NextRequest) {

  try {
    console.log('📁 Création dossier - Début')
    
    // Pour l'instant, utiliser un utilisateur admin par défaut
    // En production, vous pourriez vérifier l'authentification côté client
    
    const userId = 'cmebotahv0000c17w3izkh2k9' // ID de l'admin existant

    const raw = await request.text()
    let body: CreateFolderBody = {}
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
    }

    const name = (body.name || '').trim()
    const description = (body.description || '').trim() || undefined
    const parentId = body.parentId ?? undefined
    const numeroDossier = body.numeroDossier || undefined
    const dateDepot = body.dateDepot || undefined
    const posteComptableId = body.posteComptableId || undefined
    const numeroNature = body.numeroNature || undefined
    const natureDocumentId = body.natureDocumentId || undefined
    const objetOperation = (body.objetOperation || '').trim() || undefined
    const beneficiaire = (body.beneficiaire || '').trim() || undefined

    if (!name) {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 })
    }

    // Empêcher les doublons (par utilisateur et parentId)
    const existing = await prisma.folder.findFirst({
      where: {
        name,
        parentId: parentId === null ? null : parentId,
        authorId: userId,
      },
      select: { id: true }
    })

    if (existing) {
      return NextResponse.json({ error: 'Un dossier portant ce nom existe déjà' }, { status: 409 })
    }

    // Création du dossier (version simplifiée pour compatibilité)
    const created = await prisma.folder.create({
      data: {
        name,
        description,
        parentId: parentId === null ? null : parentId,
        authorId: userId,
      },
      select: { 
        id: true, 
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ folder: created }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {

  try {
    console.log('📁 Récupération dossiers - Début')
    
    // Pour l'instant, retourner tous les dossiers (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    const userId = 'cmebotahv0000c17w3izkh2k9' // ID de l'admin existant
    const userRole = 'ADMIN' // Admin voit tout

    // Construire les conditions de filtrage selon le rôle
    const userFilter = userRole === 'ADMIN' ? {} : { authorId: userId }

    // Récupérer les dossiers avec une requête simple
    let folders = []
    try {
      folders = await prisma.folder.findMany({
        where: userFilter,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          authorId: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Ajouter les compteurs manuellement pour éviter les problèmes de relations
      for (const folder of folders) {
        try {
          const documentCount = await prisma.document.count({
            where: { folderId: folder.id }
          })
          
          const childrenCount = await prisma.folder.count({
            where: { parentId: folder.id }
          })

          folder._count = {
            documents: documentCount,
            children: childrenCount
          }

          // Ajouter les informations de l'auteur
          try {
            const author = await prisma.user.findUnique({
              where: { id: folder.authorId },
              select: { name: true, email: true }
            })
            folder.author = author || { name: 'Utilisateur inconnu', email: 'unknown@example.com' }
          } catch (authorError) {
            console.error('Erreur récupération auteur:', authorError)
            folder.author = { name: 'Utilisateur inconnu', email: 'unknown@example.com' }
          }
        } catch (countError) {
          console.error('Erreur comptage pour dossier:', folder.id, countError)
          folder._count = { documents: 0, children: 0 }
          folder.author = { name: 'Utilisateur inconnu', email: 'unknown@example.com' }
        }
      }

    } catch (dbError) {
      console.error('Erreur base de données dossiers:', dbError)
      return NextResponse.json({
        folders: [],
        error: 'Erreur temporaire de la base de données'
      })
    }

    return NextResponse.json({ folders })

  } catch (error) {
    console.error('Erreur API dossiers:', error)

    // Toujours retourner du JSON valide
    return NextResponse.json({
      folders: [],
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}
