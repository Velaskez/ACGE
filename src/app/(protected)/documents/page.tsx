'use client'

import { useState, useEffect } from 'react'
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
  Filter,
  SortAsc,
  SortDesc,
  File,
  Image,
  Video,
  Music
} from 'lucide-react'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentVersionHistory } from '@/components/documents/document-version-history'

interface DocumentItem {
  id: string
  title: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  author?: {
    name: string
    email: string
  }
  currentVersion: {
    id: string
    versionNumber: number
    fileName: string
    fileSize: number
    fileType: string
    filePath: string
  } | null
  _count: {
    versions: number
  }
}

type ViewMode = 'list' | 'grid'
type SortField = 'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'
type SortOrder = 'asc' | 'desc'

export default function DocumentItemsPage() {
  const router = useRouter()
  const [documents, setDocumentItems] = useState<DocumentItem[]>([])
  const [filteredDocumentItems, setFilteredDocumentItems] = useState<DocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchDocumentItems()
  }, [])

  useEffect(() => {
    filterAndSortDocumentItems()
  }, [documents, searchQuery, sortField, sortOrder])

  const fetchDocumentItems = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocumentItems(data.documents)
      } else {
        setError('Erreur lors du chargement des fichiers')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortDocumentItems = () => {
    let filtered = documents

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredDocumentItems(filtered)
  }

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDownload = async (documentItem: DocumentItem) => {
    try {
      const response = await fetch(`/api/documents/${documentItem.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = documentItem.fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDocumentItems(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Erreur de connexion')
    }
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Mes DocumentItems
            </h1>
            <p className="text-muted-foreground">
              {documents.length} fichier(s) au total
            </p>
          </div>
          <Button onClick={() => router.push('/upload')}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter des fichiers
          </Button>
        </div>

        {/* Barre de recherche et filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des fichiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* Mode d'affichage */}
                <div className="flex rounded-lg border">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-r-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filtre */}
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <CardTitle>DocumentItems</CardTitle>
              <CardDescription>
                {filteredDocumentItems.length} document(s) affiché(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Nom
                        {sortField === 'title' && (
                          sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort('fileSize')}
                    >
                      <div className="flex items-center gap-2">
                        Taille
                        {sortField === 'fileSize' && (
                          sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Date d'ajout
                        {sortField === 'createdAt' && (
                          sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocumentItems.map((document) => (
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

              {filteredDocumentItems.length === 0 && (
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
            setDocumentItems(prev => 
              prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
            )
            setShowEditModal(false)
          }}
        />
      )}
    </MainLayout>
  )
}
