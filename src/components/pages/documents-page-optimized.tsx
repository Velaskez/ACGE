'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { CompactPageLayout, PageHeader, ContentSection, EmptyState } from '@/components/shared/compact-page-layout'
import { DocumentsToolbar } from '@/components/documents/documents-toolbar'
import { DocumentsFilters, type DocumentFilters } from '@/components/documents/documents-filters'
import { ActiveFiltersDisplay } from '@/components/documents/active-filters-display'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentShareModal } from '@/components/documents/document-share-modal'
import { DocumentDeleteConfirmation } from '@/components/documents/document-delete-confirmation'
import { useFolders } from '@/hooks/use-folders'
import { useSearchParams } from 'next/navigation'
import { SearchSuggestion } from '@/components/ui/search-suggestions'
import { DocumentItem } from '@/types/document'

type SortField = 'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'
type SortOrder = 'asc' | 'desc'

export function DocumentsPageOptimized() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { folders } = useFolders()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<DocumentFilters>({
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // Fonctions utilitaires
  const getFileIcon = (fileType: string) => {
    // Implémentation existante...
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    // Implémentation existante...
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  const handleSort = (field: SortField) => {
    // Implémentation existante...
  }

  const handleView = (document: DocumentItem) => {
    setSelectedDocument(document)
    setShowPreview(true)
  }

  const handleDownload = (document: DocumentItem) => {
    // Implémentation existante...
  }

  const handleEdit = (document: DocumentItem) => {
    setSelectedDocument(document)
    setShowEditModal(true)
  }

  const handleDelete = (documentId: string) => {
    setSelectedDocument(documents.find(d => d.id === documentId) || null)
    setShowDeleteConfirmation(true)
  }

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    // Implémentation existante...
  }

  const handleSearchSubmit = (query: string) => {
    // Implémentation existante...
  }

  const handleRemoveFilter = (key: string) => {
    // Implémentation existante...
  }

  const handleClearAllFilters = () => {
    // Implémentation existante...
  }

  return (
    <CompactPageLayout>
      {/* Header compact réutilisable */}
      <PageHeader
        title="Mes Documents"
        subtitle={`${documents.length} fichier(s) au total`}
        actions={
          <Button onClick={() => router.push('/upload')} className="w-full sm:w-auto h-8">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter des fichiers
          </Button>
        }
      />

      {/* Barre d'outils Documents */}
      <DocumentsToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        onSearchSelect={handleSearchSelect}
        onSearchSubmit={handleSearchSubmit}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortFieldChange={setSortField}
        onSortOrderChange={setSortOrder}
        onOpenFilters={() => setIsFiltersOpen(true)}
      />

      {/* Affichage des filtres actifs */}
      <ActiveFiltersDisplay
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des documents avec section réutilisable */}
      <ContentSection>
        {filteredDocuments.length > 0 ? (
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
                    {getFileIcon(document.fileType || 'unknown')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{document.title}</div>
                      <div className="text-xs sm:text-sm text-primary">{document.fileName || 'Sans fichier'}</div>
                      {document.description && (
                        <div className="hidden sm:block text-xs text-primary mt-1">{document.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-number">{formatFileSize(document.fileSize || 0)}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-date">{new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
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
        ) : (
          <EmptyState
            icon={<Upload className="h-10 w-10" />}
            title={searchQuery ? 'Aucun document trouvé' : 'Aucun document'}
            description={searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par uploader vos premiers fichiers'
            }
            action={!searchQuery ? {
              label: 'Ajouter des fichiers',
              onClick: () => router.push('/upload')
            } : undefined}
          />
        )}
      </ContentSection>

      {/* Modales */}
      {selectedDocument && (
        <>
          <DocumentPreviewModal
            document={selectedDocument}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
          />
          <DocumentEditModal
            document={selectedDocument}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={() => {/* Recharger les documents */}}
          />
          <DocumentShareModal
            document={selectedDocument}
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          />
        </>
      )}

      <DocumentDeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {/* Supprimer le document */}}
        documentTitle={selectedDocument?.title || ''}
      />

      <DocumentsFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        folders={folders}
      />
    </CompactPageLayout>
  )
}
