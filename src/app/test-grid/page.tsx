'use client'

import { useState } from 'react'
import { ViewModeToggle } from '@/components/shared/view-mode-toggle'
import { DocumentGridItem } from '@/components/documents/document-grid-item'

type ViewMode = 'list' | 'grid'

// Données de test
const testDocuments = [
  {
    id: '1',
    title: 'Document de test 1',
    description: 'Ceci est un document de test pour vérifier la vue grid',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: [
      { id: '1', name: 'test' },
      { id: '2', name: 'document' }
    ],
    folder: { id: '1', name: 'Dossier Test' },
    author: { id: '1', name: 'Admin', email: 'admin@test.com' },
    currentVersion: {
      id: '1',
      fileName: 'test1.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      versionNumber: 1,
      createdAt: '2024-01-01T00:00:00Z'
    },
    _count: {
      versions: 1,
      comments: 0,
      shares: 0
    }
  },
  {
    id: '2',
    title: 'Document de test 2',
    description: 'Un autre document de test',
    isPublic: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    tags: [
      { id: '3', name: 'important' }
    ],
    author: { id: '1', name: 'Admin', email: 'admin@test.com' },
    currentVersion: {
      id: '2',
      fileName: 'test2.docx',
      fileSize: 2048000,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      versionNumber: 1,
      createdAt: '2024-01-02T00:00:00Z'
    },
    _count: {
      versions: 2,
      comments: 1,
      shares: 0
    }
  }
]

export default function TestGridPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const handleView = (doc: any) => {
    console.log('Voir document:', doc.title)
  }

  const handleEdit = (doc: any) => {
    console.log('Éditer document:', doc.title)
  }

  const handleDownload = (doc: any) => {
    console.log('Télécharger document:', doc.title)
  }

  const handleShare = (doc: any) => {
    console.log('Partager document:', doc.title)
  }

  const handleDelete = (docId: string) => {
    console.log('Supprimer document:', docId)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Vue Grid</h1>
      
      {/* Toolbar */}
              <div className="mb-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Mode d'affichage</h2>
                            <p className="text-sm text-muted-foreground">Testez le toggle entre vue liste et grille</p>
          </div>
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Contenu */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vue Liste</h3>
                     {testDocuments.map((doc) => (
             <div key={doc.id} className="p-4 bg-card rounded-lg border">
              <h4 className="font-medium">{doc.title}</h4>
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">Vue Grille</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {testDocuments.map((doc) => (
              <DocumentGridItem
                key={doc.id}
                document={doc}
                onView={handleView}
                onEdit={handleEdit}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

             {/* Debug info */}
       <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Informations de debug</h3>
        <p>Mode d'affichage actuel: <strong>{viewMode}</strong></p>
        <p>Nombre de documents: <strong>{testDocuments.length}</strong></p>
      </div>
    </div>
  )
}
