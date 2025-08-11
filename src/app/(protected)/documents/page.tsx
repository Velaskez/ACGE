'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Plus, 
  Search,
  MoreHorizontal, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  Grid,
  List,
  File,
  Image,
  Video,
  Music
} from 'lucide-react'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentVersionHistory } from '@/components/documents/document-version-history'

import { DocumentItem, ViewMode } from '@/types/document'
import { useDocumentsData } from '@/hooks/use-documents-data'

export default function DocumentsPage() {
  const router = useRouter()
  const { 
    documents, 
    filteredDocuments, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery,
    deleteDocument, 
    downloadDocument, 
    updateDocument, 
    refreshData 
  } = useDocumentsData()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4 text-purple-500" />
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4 text-green-500" />
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-gray-500" />
  }

  const handleDownload = async (documentItem: DocumentItem) => {
    await downloadDocument(documentItem)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }
    
    await deleteDocument(documentId)
  }

  const handleView = (documentItem: DocumentItem) => {
    // Ouvrir l'aperçu du document
    setSelectedDocument(documentItem)
    setShowPreview(true)
  }

  const handleEdit = (documentItem: DocumentItem) => {
    // Ouvrir la modal d'édition
    setSelectedDocument(documentItem)
    setShowEditModal(true)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement des fichiers...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Mes Documents
            </h1>
            <p className="text-muted-foreground">
              {isLoading 
                ? "Chargement..." 
                : filteredDocuments.length !== documents.length
                  ? `${filteredDocuments.length} sur ${documents.length} document${documents.length > 1 ? 's' : ''}`
                  : `${documents.length} document${documents.length > 1 ? 's' : ''} • Gérez vos fichiers`
              }
            </p>
          </div>
        
          <div className="flex items-center gap-2">
            {/* Bouton refresh si erreur */}
            {error && (
              <Button variant="outline" size="sm" onClick={refreshData}>
                <Upload className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            )}

            {/* Sélecteur de vue */}
            <div className="flex items-center rounded-lg border p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={() => router.push('/upload')}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter des fichiers
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des fichiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Messages d'erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Liste des documents */}
        {viewMode === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {filteredDocuments.length} document(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        {getFileIcon(document.currentVersion?.fileType || 'unknown')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{document.title}</div>
                          <div className="text-sm text-gray-500">{document.currentVersion?.fileName || 'Sans fichier'}</div>
                          {document.description && (
                            <div className="text-xs text-gray-400 mt-1">{document.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(document.currentVersion?.fileSize || 0)}</TableCell>
                      <TableCell>
                        {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{document.author?.name || 'Inconnu'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(document)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Aperçu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(document)}>
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <DocumentVersionHistory 
                                documentId={document.id}
                                documentTitle={document.title}
                                trigger={
                                  <div className="flex items-center w-full px-2 py-1.5 cursor-pointer">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Versions ({document._count.versions})
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(document)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(document.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-8">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {searchQuery ? 'Aucun document trouvé' : 'Aucun document'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Essayez de modifier votre recherche'
                      : 'Commencez par uploader vos premiers fichiers'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => router.push('/upload')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter des fichiers
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Vue en grille - TODO: Implémenter */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* TODO: Cartes de documents */}
          </div>
        )}
      </div>

      {/* Modal d'aperçu */}
      {showPreview && selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedDocument && (
        <DocumentEditModal
          document={selectedDocument}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedDocument) => {
            updateDocument(updatedDocument)
            setShowEditModal(false)
          }}
        />
      )}
    </MainLayout>
  )
}
