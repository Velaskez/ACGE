import { NextRequest, NextResponse } from 'next/server'

/**
 * 🚀 API DOCUMENTS SIMPLIFIÉE - ACGE
 * 
 * Version simplifiée qui retourne des données de test
 * pour le développement sans dépendance à la base de données
 */

export async function GET(request: NextRequest) {
  try {
    console.log('📄 API Documents - Mode développement')
    
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Données de test
    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Document de test 1',
        description: 'Ceci est un document de test',
        fileName: 'test-document-1.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        filePath: '/uploads/test-document-1.pdf',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 'user-1',
          name: 'Utilisateur Test',
          email: 'test@example.com'
        },
        folder: null,
        tags: [],
        _count: {
          comments: 0,
          shares: 0
        }
      },
      {
        id: 'doc-2',
        title: 'Document de test 2',
        description: 'Un autre document de test',
        fileName: 'test-document-2.docx',
        fileSize: 512000,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filePath: '/uploads/test-document-2.docx',
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Hier
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        author: {
          id: 'user-1',
          name: 'Utilisateur Test',
          email: 'test@example.com'
        },
        folder: null,
        tags: ['important', 'test'],
        _count: {
          comments: 2,
          shares: 1
        }
      },
      {
        id: 'doc-3',
        title: 'Rapport mensuel',
        description: 'Rapport mensuel de janvier 2024',
        fileName: 'rapport-janvier-2024.xlsx',
        fileSize: 2048000,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filePath: '/uploads/rapport-janvier-2024.xlsx',
        isPublic: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // Il y a 2 jours
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        author: {
          id: 'user-2',
          name: 'Comptable Principal',
          email: 'comptable@acge.com'
        },
        folder: {
          id: 'folder-1',
          name: 'Rapports 2024'
        },
        tags: ['rapport', 'mensuel', '2024'],
        _count: {
          comments: 5,
          shares: 3
        }
      }
    ]
    
    // Appliquer la pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocuments = mockDocuments.slice(startIndex, endIndex)
    
    console.log(`📄 Retour de ${paginatedDocuments.length} documents sur ${mockDocuments.length} total`)
    
    return NextResponse.json({
      documents: paginatedDocuments,
      pagination: {
        page,
        limit,
        total: mockDocuments.length,
        totalPages: Math.ceil(mockDocuments.length / limit)
      }
    })

  } catch (error) {
    console.error('❌ Erreur API documents:', error)
    
    return NextResponse.json({
      documents: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      error: 'Erreur interne du serveur'
    }, { status: 500 })
  }
}