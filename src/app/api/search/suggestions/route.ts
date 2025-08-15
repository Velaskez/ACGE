import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SearchSuggestion } from '@/components/ui/search-suggestions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') // 'all', 'documents', 'folders', 'tags', 'users'

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions: SearchSuggestion[] = []

    // Rechercher dans les documents
    if (!type || type === 'all' || type === 'documents') {
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { currentVersion: { fileName: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: {
          currentVersion: true,
          author: true
        },
        take: Math.ceil(limit / 2),
        orderBy: { updatedAt: 'desc' }
      })

      documents.forEach(doc => {
        suggestions.push({
          id: `doc-${doc.id}`,
          text: doc.title,
          type: 'document',
          metadata: {
            title: doc.title,
            description: doc.description || undefined,
            fileType: doc.currentVersion?.fileType,
            fileSize: doc.currentVersion?.fileSize
          }
        })
      })
    }

    // Rechercher dans les dossiers
    if (!type || type === 'all' || type === 'folders') {
      const folders = await prisma.folder.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { documents: true }
          }
        },
        take: Math.ceil(limit / 3),
        orderBy: { updatedAt: 'desc' }
      })

      folders.forEach(folder => {
        suggestions.push({
          id: `folder-${folder.id}`,
          text: folder.name,
          type: 'folder',
          metadata: {
            title: folder.name,
            description: folder.description || undefined,
            documentCount: folder._count.documents
          }
        })
      })
    }

    // Rechercher dans les tags (si la table existe)
    if (!type || type === 'all' || type === 'tags') {
      try {
        const tags = await prisma.tag.findMany({
          where: {
            name: { contains: query, mode: 'insensitive' }
          },
          include: {
            _count: {
              select: { documents: true }
            }
          },
          take: Math.ceil(limit / 4),
          orderBy: { _count: { documents: 'desc' } }
        })

        tags.forEach(tag => {
          suggestions.push({
            id: `tag-${tag.id}`,
            text: tag.name,
            type: 'tag',
            metadata: {
              title: tag.name,
              tagCount: tag._count.documents
            }
          })
        })
      } catch (error) {
        // Table tags n'existe peut-être pas, on ignore
        console.log('Table tags non disponible')
      }
    }

    // Rechercher dans les utilisateurs
    if (!type || type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: Math.ceil(limit / 4),
        orderBy: { name: 'asc' }
      })

      users.forEach(user => {
        suggestions.push({
          id: `user-${user.id}`,
          text: user.name || user.email,
          type: 'user',
          metadata: {
            title: user.name || user.email,
            description: user.email
          }
        })
      })
    }

    // Trier et limiter les résultats
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Priorité : exact match au début
        const aExact = a.text.toLowerCase().startsWith(query.toLowerCase())
        const bExact = b.text.toLowerCase().startsWith(query.toLowerCase())
        
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        // Puis par type (documents en premier)
        const typeOrder = { document: 0, folder: 1, tag: 2, user: 3 }
        const aOrder = typeOrder[a.type]
        const bOrder = typeOrder[b.type]
        
        if (aOrder !== bOrder) return aOrder - bOrder
        
        // Puis par ordre alphabétique
        return a.text.localeCompare(b.text)
      })
      .slice(0, limit)

    return NextResponse.json({ suggestions: sortedSuggestions })

  } catch (error) {
    console.error('Erreur lors de la recherche de suggestions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des suggestions' },
      { status: 500 }
    )
  }
}
