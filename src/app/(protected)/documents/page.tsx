'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
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
  MoreHorizontal, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  SortAsc,
  SortDesc,
  File,
  Image,
  Video,
  Music,
  Share2
} from 'lucide-react'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentVersionHistory } from '@/components/documents/document-version-history'
import { DocumentShareModal } from '@/components/documents/document-share-modal'
import { DocumentsToolbar } from '@/components/documents/documents-toolbar'
import { DocumentsFilters, type DocumentFilters } from '@/components/documents/documents-filters'
import { DocumentGridItem } from '@/components/documents/document-grid-item'
import { useFolders } from '@/hooks/use-folders'
import { useSearchParams } from 'next/navigation'
import { SearchSuggestion } from '@/components/ui/search-suggestions'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface DocumentItem {
  id: string
  title: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  tags: Array<{ id: string; name: string }>
  folder?: { id: string; name: string }
  author: { id: string; name: string; email: string }
  currentVersion?: {
    id: string
    versionNumber: number
    fileName: string
    fileSize: number
    fileType: string
    filePath: string
    changeLog?: string
    createdAt: string
  }
  _count?: {
    versions: number
    comments?: number
    shares?: number
  }
}

type ViewMode = 'list' | 'grid'
type SortField = 'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'
type SortOrder = 'asc' | 'desc'

export default function DocumentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { folders } = useFolders()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<DocumentFilters>({
    sortBy: 'updatedAt',
    sortOrder: 'desc'
    // Pas de folderId par défaut - affiche TOUS les documents
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Initialiser la recherche depuis l'URL
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchQuery(urlSearch)
      setFilters(prev => ({ ...prev, search: urlSearch }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchDocuments()
  }, [filters, pagination.page])

  useEffect(() => {
    filterAndSortDocuments()
  }, [documents, searchQuery, sortField, sortOrder])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      
      // Construire les paramètres de requête
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.fileType) params.append('fileType', filters.fileType)
      if (filters.minSize) params.append('minSize', filters.minSize.toString())
      if (filters.maxSize) params.append('maxSize', filters.maxSize.toString())
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.folderId) params.append('folderId', filters.folderId)
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      
      const response = await fetch(`/api/documents?${params.toString()}`, { 
        credentials: 'include' 
      })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
        setPagination(data.pagination)
      } else {
        setError('Erreur lors du chargement des fichiers')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFilters = (newFilters: DocumentFilters) => {
    setFilters(newFilters)
    // Synchroniser la barre de recherche locale avec les filtres
    if (newFilters.search !== searchQuery) {
      setSearchQuery(newFilters.search || '')
    }
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query)
    // Ne pas mettre à jour les filtres immédiatement pour éviter les appels API
    // Les filtres seront mis à jour seulement quand l'utilisateur valide la recherche
  }

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    // Rediriger selon le type de suggestion
    switch (suggestion.type) {
      case 'document':
        // Rechercher le document et l'afficher
        setSearchQuery(suggestion.text)
        setFilters(prev => ({ ...prev, search: suggestion.text }))
        break
      case 'folder':
        // Rediriger vers la page des dossiers avec le dossier sélectionné
        router.push(`/folders?folder=${suggestion.id.replace('folder-', '')}`)
        break
      case 'tag':
        // Ajouter le tag aux filtres
        setSearchQuery(suggestion.text)
        setFilters(prev => ({ ...prev, search: suggestion.text }))
        break
      case 'user':
        // Filtrer par auteur
        setSearchQuery(suggestion.text)
        setFilters(prev => ({ ...prev, search: suggestion.text }))
        break
    }
  }

  const handleSearchSubmit = () => {
    // Valider la recherche en mettant à jour les filtres
    setFilters(prev => ({ ...prev, search: searchQuery || undefined }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const filterAndSortDocuments = () => {
    let filtered = documents

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.currentVersion?.fileName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Trier
    const getSortableValue = (doc: DocumentItem, field: SortField) => {
      switch (field) {
        case 'title':
          return doc.title?.toLowerCase() || ''
        case 'createdAt':
          return new Date(doc.createdAt).getTime()
        case 'updatedAt':
          return new Date(doc.updatedAt).getTime()
        case 'fileSize':
          return doc.currentVersion?.fileSize || 0
        case 'fileType':
          return doc.currentVersion?.fileType || ''
      }
    }

    filtered.sort((a, b) => {
      const aValue = getSortableValue(a, sortField)
      const bValue = getSortableValue(b, sortField)
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredDocuments(filtered)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 text-muted-foreground" />
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4 text-muted-foreground" />
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4 text-muted-foreground" />
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-muted-foreground" />
    return <File className="w-4 h-4 text-muted-foreground" />
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
        a.download = documentItem.currentVersion?.fileName || 'document'
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
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Chargement des fichiers...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
              Mes Documents
            </h1>
            <p className="text-primary text-sm sm:text-base">
              {documents.length} fichier(s) au total
            </p>
          </div>
          <Button onClick={() => router.push('/upload')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter des fichiers
          </Button>
        </div>

        {/* Barre d'outils Documents */}
        <DocumentsToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
          onSearchSelect={handleSearchSelect}
          onSearchSubmit={handleSearchSubmit}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onOpenFilters={() => setIsFiltersOpen(true)}
        />

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
                {filteredDocuments.length} document(s) affiché(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 sm:w-12"></TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-primary/10"
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
                      className="hidden md:table-cell cursor-pointer hover:bg-gray-50 dark:hover:bg-primary/10"
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
                      className="hidden sm:table-cell cursor-pointer hover:bg-gray-50 dark:hover:bg-primary/10"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Date d'ajout
                        {sortField === 'createdAt' && (
                          sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Propriétaire</TableHead>
                    <TableHead className="w-10 sm:w-12"></TableHead>
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
                          <div className="text-xs sm:text-sm text-primary">{document.currentVersion?.fileName || 'Sans fichier'}</div>
                          {document.description && (
                            <div className="hidden sm:block text-xs text-primary mt-1">{document.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatFileSize(document.currentVersion?.fileSize || 0)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{document.author?.name || 'Inconnu'}</TableCell>
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
                                    Versions ({document._count?.versions ?? 0})
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(document)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDocument(document)
                              setShowShareModal(true)
                            }}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Partager
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(document.id)}
                              className="text-destructive"
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
                  <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
                                     <p className="text-lg font-medium text-primary dark:text-primary">
                     {searchQuery ? 'Aucun document trouvé' : 'Aucun document'}
                   </p>
                  <p className="text-primary mb-4">
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
          /* Vue en grille */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <DocumentGridItem
                  key={document.id}
                  document={document}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDownload={handleDownload}
                  onShare={(doc) => {
                    setSelectedDocument(doc)
                    setShowShareModal(true)
                  }}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Aucun document trouvé</h3>
                <p className="text-primary">
                  {searchQuery || Object.values(filters).some(v => v && v !== 'updatedAt' && v !== 'desc')
                    ? 'Aucun document ne correspond à vos critères de recherche.'
                    : 'Commencez par ajouter des documents à votre collection.'
                  }
                </p>
                <Button className="mt-4" onClick={() => router.push('/upload')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter des fichiers
                </Button>
              </div>
            )}
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
            setDocuments(prev => 
              prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
            )
            setShowEditModal(false)
          }}
        />
      )}

      {/* Modal de partage */}
      {showShareModal && selectedDocument && (
        <DocumentShareModal
          document={selectedDocument}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShared={() => {
            // Optionnel: rafraîchir la liste des documents
            fetchDocuments()
          }}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = i + 1
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      isActive={pagination.page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              {pagination.totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center text-sm text-primary mt-2">
            Page {pagination.page} sur {pagination.totalPages} • {pagination.total} documents au total
          </div>
        </div>
      )}

      {/* Panneau de filtres */}
      <DocumentsFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        folders={folders}
      />
    </MainLayout>
  )
}
