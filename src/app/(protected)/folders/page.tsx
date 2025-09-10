'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useFolders } from '@/hooks/use-folders'
import { FoldersToolbar } from '@/components/folders/folders-toolbar'
import { FoldersFilters, FolderFilters } from '@/components/folders/folders-filters'
import { FolderGridItem } from '@/components/folders/folder-grid-item'
import { FolderCreationForm } from '@/components/folders/folder-creation-form'
import { ModalWrapper } from '@/components/ui/modal-wrapper'
import { DocumentsToolbar } from '@/components/documents/documents-toolbar'
import { DocumentsFilters, DocumentFilters } from '@/components/documents/documents-filters'
import { DocumentGridItem } from '@/components/documents/document-grid-item'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentShareModal } from '@/components/documents/document-share-modal'
import { FolderOpen, Plus, FileText, MoreHorizontal, Edit, Trash2, Eye, ArrowLeft, Download, Share2, Upload } from 'lucide-react'
import { SearchSuggestion } from '@/components/ui/search-suggestions'
import { DocumentItem } from '@/types/document'

export default function FoldersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { folders, stats, isLoading, error, refresh } = useFolders()
  
  // États pour la gestion des dossiers
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('grid')
  const [sortField, setSortField] = React.useState<'name' | 'createdAt' | 'updatedAt' | 'documentCount'>('updatedAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [editingFolder, setEditingFolder] = React.useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)

  // États pour les nouveaux champs du formulaire de dossier
  const [numeroDossier, setNumeroDossier] = React.useState('')
  const [dateDepot, setDateDepot] = React.useState('')
  const [posteComptableId, setPosteComptableId] = React.useState('')
  const [numeroNature, setNumeroNature] = React.useState('')
  const [natureDocumentId, setNatureDocumentId] = React.useState('')
  const [objetOperation, setObjetOperation] = React.useState('')
  const [beneficiaire, setBeneficiaire] = React.useState('')
  
  // États pour les données des dropdowns
  const [postesComptables, setPostesComptables] = React.useState<any[]>([])
  const [naturesDocuments, setNaturesDocuments] = React.useState<any[]>([])
  const [loadingData, setLoadingData] = React.useState(false)

  // États pour la vue du contenu d'un dossier
  const folderId = searchParams.get('folder')
  const [currentFolder, setCurrentFolder] = React.useState<any>(null)
  const [documents, setDocuments] = React.useState<DocumentItem[]>([])
  const [filteredDocuments, setFilteredDocuments] = React.useState<DocumentItem[]>([])
  const [documentsLoading, setDocumentsLoading] = React.useState(false)
  const [documentsError, setDocumentsError] = React.useState('')

  // Gestion des suggestions de recherche
  const handleSearchSelect = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'document':
        // Si on est dans un dossier, rechercher le document dans ce dossier
        if (folderId) {
          setQuery(suggestion.text)
        } else {
          // Sinon rediriger vers la page documents
          router.push(`/documents?search=${encodeURIComponent(suggestion.text)}`)
        }
        break
      case 'folder':
        // Rediriger vers le dossier sélectionné
        router.push(`/folders?folder=${suggestion.id.replace('folder-', '')}`)
        break
      case 'tag':
        // Ajouter le tag à la recherche
        setQuery(suggestion.text)
        break
      case 'user':
        // Filtrer par auteur
        setQuery(suggestion.text)
        break
    }
  }
  
  // États pour les documents (comme dans documents/page.tsx)
  const [documentSearchQuery, setDocumentSearchQuery] = React.useState('')
  const [documentViewMode, setDocumentViewMode] = React.useState<'list' | 'grid'>('grid')
  const [documentSortField, setDocumentSortField] = React.useState<'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'>('updatedAt')
  const [documentSortOrder, setDocumentSortOrder] = React.useState<'asc' | 'desc'>('desc')
  
  // États pour les modales de documents
  const [selectedDocument, setSelectedDocument] = React.useState<DocumentItem | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [shareModalOpen, setShareModalOpen] = React.useState(false)

  // États pour les filtres des dossiers
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [folderFilters, setFolderFilters] = React.useState<FolderFilters>({
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // États pour les filtres des documents dans un dossier
  const [isDocumentFiltersOpen, setIsDocumentFiltersOpen] = React.useState(false)
  const [documentFilters, setDocumentFilters] = React.useState<DocumentFilters>({
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // Fonction pour générer le numéro de dossier
  const generateNumeroDossier = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `DOSS-ACGE-${year}${randomNum}`
  }

  // Fonction pour charger les postes comptables
  const loadPostesComptables = async () => {
    try {
      const response = await fetch('/api/postes-comptables')
      if (response.ok) {
        const data = await response.json()
        setPostesComptables(data.postesComptables || [])
      }
    } catch (error) {
      console.error('Erreur chargement postes comptables:', error)
    }
  }

  // Fonction pour charger les natures de documents
  const loadNaturesDocuments = async () => {
    try {
      const response = await fetch('/api/natures-documents')
      if (response.ok) {
        const data = await response.json()
        setNaturesDocuments(data.naturesDocuments || [])
      }
    } catch (error) {
      console.error('Erreur chargement natures documents:', error)
    }
  }

  // Charger les données au montage du composant
  React.useEffect(() => {
    loadPostesComptables()
    loadNaturesDocuments()
  }, [])

  // Fonction pour charger les documents d'un dossier
  const loadFolderDocuments = React.useCallback(async (folderId: string) => {
    try {
      console.log('📁 Chargement des documents du dossier:', folderId)
      setDocumentsLoading(true)
      setDocumentsError('')
      
      // Charger les détails du dossier
      console.log('📁 Appel API dossier:', `/api/folders/${folderId}`)
      const folderRes = await fetch(`/api/folders/${folderId}`)
      console.log('📁 Réponse API dossier:', folderRes.status, folderRes.ok)
      
      if (folderRes.ok) {
        const folderData = await folderRes.json()
        console.log('📁 Données dossier reçues:', folderData)
        setCurrentFolder(folderData.folder || folderData)
      } else {
        const errorData = await folderRes.text()
        console.error('❌ Erreur API dossier:', folderRes.status, errorData)
        setDocumentsError(`Erreur lors du chargement du dossier (${folderRes.status})`)
      }
      
      // Charger les documents du dossier
      console.log('📄 Appel API documents:', `/api/documents?folderId=${folderId}`)
      const documentsRes = await fetch(`/api/documents?folderId=${folderId}`)
      console.log('📄 Réponse API documents:', documentsRes.status, documentsRes.ok)
      
      if (documentsRes.ok) {
        const response = await documentsRes.json()
        console.log('📄 Données documents reçues:', response)
        
        // L'API retourne { documents: [...], pagination: {...} }
        const documentsArray = response.documents || []
        console.log('📄 Nombre de documents trouvés:', documentsArray.length)
        
        // Adapter les données pour correspondre à notre interface
        const adaptedDocuments = documentsArray.map((doc: any): DocumentItem => ({
          ...doc,
          fileName: doc.fileName || doc.currentVersion?.fileName || 'document',
          fileSize: doc.fileSize || doc.currentVersion?.fileSize || 0,
          fileType: doc.fileType || doc.currentVersion?.fileType || 'unknown',
          filePath: doc.filePath || doc.currentVersion?.filePath || '',
          tags: doc.tags || [],
          author: doc.author || { id: 'unknown', name: 'Utilisateur inconnu', email: 'unknown@example.com' },
          _count: {
            comments: doc._count?.comments || 0,
            shares: doc._count?.shares || 0
          }
        }))
        setDocuments(adaptedDocuments)
        setFilteredDocuments(adaptedDocuments)
      } else {
        const errorData = await documentsRes.text()
        console.error('❌ Erreur API documents:', documentsRes.status, errorData)
        setDocumentsError(`Erreur lors du chargement des documents (${documentsRes.status})`)
      }
    } catch (error) {
      setDocumentsError('Erreur lors du chargement des documents')
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  // Effet pour charger les documents quand un dossier est sélectionné
  React.useEffect(() => {
    console.log('🔄 Effet de chargement - folderId:', folderId)
    if (folderId) {
      console.log('🔄 Chargement des documents pour le dossier:', folderId)
      loadFolderDocuments(folderId)
    } else {
      console.log('🔄 Pas de dossier sélectionné, réinitialisation')
      setCurrentFolder(null)
      setDocuments([])
      setFilteredDocuments([])
      setDocumentsError('')
    }
  }, [folderId, loadFolderDocuments])

  // Filtrage et tri des documents
  React.useEffect(() => {
    let filtered = documents.filter(doc => {
      // Filtrage par recherche dans la toolbar
      if (documentSearchQuery && 
          !doc.title.toLowerCase().includes(documentSearchQuery.toLowerCase()) &&
          !doc.description?.toLowerCase().includes(documentSearchQuery.toLowerCase()) &&
          !doc.fileName?.toLowerCase().includes(documentSearchQuery.toLowerCase())) {
        return false
      }

      // Filtrage par recherche dans les filtres
      if (documentFilters.search && 
          !doc.title.toLowerCase().includes(documentFilters.search.toLowerCase()) &&
          !doc.description?.toLowerCase().includes(documentFilters.search.toLowerCase()) &&
          !doc.fileName?.toLowerCase().includes(documentFilters.search.toLowerCase())) {
        return false
      }

      // Filtrage par type de fichier
      if (documentFilters.fileType && doc.fileType !== documentFilters.fileType) {
        return false
      }

      // Filtrage par taille
      if (documentFilters.minSize && (!doc.fileSize || doc.fileSize < documentFilters.minSize)) {
        return false
      }
      if (documentFilters.maxSize && (!doc.fileSize || doc.fileSize > documentFilters.maxSize)) {
        return false
      }

      // Filtrage par période
      if (documentFilters.startDate && doc.createdAt && new Date(doc.createdAt) < new Date(documentFilters.startDate)) {
        return false
      }
      if (documentFilters.endDate && doc.createdAt && new Date(doc.createdAt) > new Date(documentFilters.endDate)) {
        return false
      }

      // Filtrage par tags
      if (documentFilters.tags && documentFilters.tags.length > 0) {
        const docTags = doc.tags || []
        if (!documentFilters.tags.some(tag => docTags.some((docTag: any) => docTag === tag))) {
          return false
        }
      }

      return true
    })

    // Tri des documents
    const sortBy = documentFilters.sortBy || documentSortField
    const sortOrderValue = documentFilters.sortOrder || documentSortOrder

    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'createdAt':
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
          break
        case 'updatedAt':
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          break
        case 'fileSize':
          aValue = a.fileSize || 0
          bValue = b.fileSize || 0
          break
        case 'fileType':
          aValue = a.fileType?.toLowerCase() || ''
          bValue = b.fileType?.toLowerCase() || ''
          break
        default:
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      }

      if (sortOrderValue === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredDocuments(filtered)
  }, [documents, documentSearchQuery, documentSortField, documentSortOrder, documentFilters])

  const filteredFolders = React.useMemo(() => {
    let items = (folders || [])

    // Filtrage par recherche textuelle
    if (query) {
      items = items.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    }

    // Filtrage par recherche dans les filtres
    if (folderFilters.search) {
      items = items.filter(f => 
        f.name.toLowerCase().includes(folderFilters.search!.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(folderFilters.search!.toLowerCase()))
      )
    }

    // Filtrage par nombre de documents
    if (folderFilters.minDocuments !== undefined) {
      items = items.filter(f => (f._count?.documents || 0) >= folderFilters.minDocuments!)
    }
    if (folderFilters.maxDocuments !== undefined) {
      items = items.filter(f => (f._count?.documents || 0) <= folderFilters.maxDocuments!)
    }

    // Filtrage par période
    if (folderFilters.startDate) {
      items = items.filter(f => f.createdAt && new Date(f.createdAt) >= new Date(folderFilters.startDate!))
    }
    if (folderFilters.endDate) {
      items = items.filter(f => f.createdAt && new Date(f.createdAt) <= new Date(folderFilters.endDate!))
    }

    // Filtrage par poste comptable
    if (folderFilters.posteComptableId) {
      items = items.filter(f => (f as any).posteComptableId === folderFilters.posteComptableId)
    }

    // Filtrage par nature de document
    if (folderFilters.natureDocumentId) {
      items = items.filter(f => (f as any).natureDocumentId === folderFilters.natureDocumentId)
    }

    // Tri
    const sortBy = folderFilters.sortBy || sortField
    const sortOrderValue = folderFilters.sortOrder || sortOrder

    const getValue = (f: any) => {
      if (sortBy === 'updatedAt') return f.updatedAt ? new Date(f.updatedAt).getTime() : 0
      if (sortBy === 'createdAt') return f.createdAt ? new Date(f.createdAt).getTime() : 0
      if (sortBy === 'documentCount') return f._count?.documents || 0
      return (f.name || '').toLowerCase()
    }

    items.sort((a, b) => {
      const av = getValue(a)
      const bv = getValue(b)
      if (sortOrderValue === 'asc') return av > bv ? 1 : av < bv ? -1 : 0
      return av < bv ? 1 : av > bv ? -1 : 0
    })

    return items
  }, [folders, query, sortField, sortOrder, folderFilters])

  const handleCreateFolder = async (formData?: any, e?: React.FormEvent) => {
    // Prévenir le comportement par défaut si un événement est fourni
    if (e) {
      e.preventDefault()
    }
    
    // Si formData est fourni, utiliser les données du formulaire stepper
    const data = formData || {
      name,
      description,
      numeroDossier,
      numeroNature,
      objetOperation,
      beneficiaire,
      posteComptableId,
      natureDocumentId,
      dateDepot
    }

    if (!data.name?.trim()) return

    try {
      setCreating(true)
      console.log('🔄 Création dossier en cours...', data)
      
      const url = editingFolder ? `/api/folders/${editingFolder.id}` : '/api/folders'
      const method = editingFolder ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: data.name.trim(), 
          description: data.description?.trim() || undefined,
          numeroDossier: data.numeroDossier || generateNumeroDossier(),
          dateDepot: data.dateDepot || new Date().toISOString().split('T')[0],
          posteComptableId: data.posteComptableId || undefined,
          numeroNature: data.numeroNature || undefined,
          natureDocumentId: data.natureDocumentId || undefined,
          objetOperation: data.objetOperation || undefined,
          beneficiaire: data.beneficiaire || undefined
        })
      })
      
      console.log('📡 Réponse API:', res.status, res.statusText)
      
      if (res.ok) {
        const responseData = await res.json()
        console.log('✅ Dossier créé:', responseData)
        
        setOpen(false)
        setName('')
        setDescription('')
        setNumeroDossier('')
        setDateDepot('')
        setPosteComptableId('')
        setNumeroNature('')
        setNatureDocumentId('')
        setObjetOperation('')
        setBeneficiaire('')
        setEditingFolder(null)
        
        // Rafraîchir la liste des dossiers
        if (refresh) {
          await refresh()
        } else {
          console.warn('⚠️ Fonction refresh non disponible')
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('❌ Erreur création dossier:', errorData)
        alert(errorData.error || 'Erreur lors de la création du dossier')
      }
    } catch (error) {
      console.error('❌ Exception création dossier:', error)
      alert('Erreur lors de la création du dossier')
    } finally {
      setCreating(false)
    }
  }

  const handleEditFolder = React.useCallback((folder: any) => {
    setEditingFolder(folder)
    setName(folder.name)
    setDescription(folder.description || '')
    setOpen(true)
  }, [])

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await refresh()
        setDeleteConfirm(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      console.log('🔒 Fermeture dialogue')
      setOpen(false)
      setEditingFolder(null)
      setName('')
      setDescription('')
      setNumeroDossier('')
      setDateDepot('')
      setPosteComptableId('')
      setNumeroNature('')
      setNatureDocumentId('')
      setObjetOperation('')
      setBeneficiaire('')
    } else {
      console.log('🔓 Ouverture dialogue')
      setOpen(true)
      setEditingFolder(null)
      setName('')
      setDescription('')
      setNumeroDossier('')
      setDateDepot('')
      setPosteComptableId('')
      setNumeroNature('')
      setNatureDocumentId('')
      setObjetOperation('')
      setBeneficiaire('')
    }
  }


  // Fonctions pour la gestion des documents
  const handleViewDocument = React.useCallback((document: DocumentItem) => {
    setSelectedDocument(document)
    setPreviewOpen(true)
  }, [])

  const handleEditDocument = React.useCallback((document: DocumentItem) => {
    setSelectedDocument(document)
    setEditModalOpen(true)
  }, [])

  const handleShareDocument = React.useCallback((document: DocumentItem) => {
    setSelectedDocument(document)
    setShareModalOpen(true)
  }, [])


  const handleDownloadDocument = async (document: DocumentItem) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = document.fileName || 'document'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // Recharger les documents après suppression
        if (folderId) {
          loadFolderDocuments(folderId)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  // Fonction pour ouvrir un dossier
  const handleOpenFolder = React.useCallback((folder: any) => {
    console.log('🔍 Tentative d\'ouverture du dossier:', folder)
    console.log('🔍 ID du dossier:', folder.id)
    console.log('🔍 URL de navigation:', `/folders?folder=${folder.id}`)
    router.push(`/folders?folder=${folder.id}`)
  }, [router])

  // Fonction pour revenir à la liste des dossiers
  const handleBackToFolders = React.useCallback(() => {
    router.push('/folders')
  }, [router])

  // Rendu conditionnel : soit la liste des dossiers, soit le contenu d'un dossier
  if (folderId && currentFolder) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header avec breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToFolders}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux dossiers
              </Button>
              <div className="border-l pl-4 flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-sm text-primary mb-1">
                  <span>Dossiers</span>
                  <span>/</span>
                  <span className="font-medium text-foreground">{currentFolder.name}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">{currentFolder.name}</h1>
                <p className="text-primary text-sm sm:text-base">
                  {currentFolder.description || 'Documents du dossier'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => loadFolderDocuments(folderId)} className="w-full sm:w-auto">
                Rafraîchir
              </Button>
              <Button onClick={() => router.push(`/upload?folderId=${folderId}`)} className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Ajouter des documents
              </Button>
            </div>
          </div>

          {/* Barre d'outils pour les documents */}
          <DocumentsToolbar
            searchQuery={documentSearchQuery}
            onSearchQueryChange={setDocumentSearchQuery}
            viewMode={documentViewMode}
            onViewModeChange={setDocumentViewMode}
            sortField={documentSortField}
            sortOrder={documentSortOrder}
            onSortFieldChange={setDocumentSortField}
            onSortOrderChange={setDocumentSortOrder}
            onOpenFilters={() => setIsDocumentFiltersOpen(true)}
          />

          {/* Contenu des documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents du dossier</CardTitle>
              <CardDescription>
                {documents.length} document{documents.length > 1 ? 's' : ''} dans ce dossier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : documentsError ? (
                <div className="text-center py-8 text-destructive">
                  {documentsError}
                </div>
              ) : filteredDocuments.length > 0 ? (
                documentViewMode === 'list' ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Taille</TableHead>
                        <TableHead>Modifié</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>{document.fileType || 'N/A'}</TableCell>
                          <TableCell>
                            {document.fileSize ? 
                              `${Math.round(document.fileSize / 1024)} KB` : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            {document.updatedAt ? new Date(document.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDocument(document)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Prévisualiser
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadDocument(document)
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Télécharger
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShareDocument(document)
                                  }}
                                >
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Partager
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditDocument(document)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteDocument(document.id)
                                  }}
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
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 p-1">
                    {filteredDocuments.map((document) => (
                      <DocumentGridItem
                        key={document.id}
                        document={document}
                        onView={handleViewDocument}
                        onEdit={handleEditDocument}
                        onDownload={handleDownloadDocument}
                        onShare={handleShareDocument}
                        onDelete={handleDeleteDocument}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-2 text-sm font-medium">Aucun document</h3>
                  <p className="mt-1 text-sm text-primary">
                    Ce dossier ne contient aucun document.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modales pour les documents */}
          {selectedDocument && (
            <>
              <DocumentPreviewModal
                document={selectedDocument}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
              />
              <DocumentEditModal
                document={selectedDocument}
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={() => folderId && loadFolderDocuments(folderId)}
              />
              <DocumentShareModal
                document={selectedDocument}
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
              />
            </>
          )}

          {/* Panneau de filtres des documents */}
          <DocumentsFilters
            isOpen={isDocumentFiltersOpen}
            onClose={() => setIsDocumentFiltersOpen(false)}
            filters={documentFilters}
            onApplyFilters={setDocumentFilters}
            folders={[]} // Pas de sous-dossiers dans cette vue
          />
        </div>
      </MainLayout>
    )
  }

  // Vue par défaut : liste des dossiers
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Dossiers</h1>
            <p className="text-primary text-sm sm:text-base">Gérez vos dossiers et accédez rapidement à vos documents</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={refresh} className="w-full sm:w-auto">Rafraîchir</Button>
            <ModalWrapper isOpen={open} onOpenChange={handleCloseDialog}>
              <Dialog open={open} onOpenChange={handleCloseDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau dossier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {editingFolder ? 'Modifier le dossier' : 'Création du dossier comptable'}
                  </DialogTitle>
                  <DialogDescription>
                    Remplissez les informations requises pour créer un nouveau dossier comptable.
                  </DialogDescription>
                </DialogHeader>
                
                <FolderCreationForm
                  postesComptables={postesComptables}
                  naturesDocuments={naturesDocuments}
                  onSubmit={handleCreateFolder}
                  onCancel={() => setOpen(false)}
                  isLoading={creating}
                />
              </DialogContent>
            </Dialog>
            </ModalWrapper>
          </div>
        </div>

        {/* Barre d'outils - Maintenant identique à la page des fichiers */}
        <FoldersToolbar
          searchQuery={query}
          onSearchQueryChange={setQuery}
          onSearchSelect={handleSearchSelect}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onOpenFilters={() => setIsFiltersOpen(true)}
        />

        {/* Stats rapides */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total dossiers</CardTitle>
              <FolderOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalFolders ?? 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total documents</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalDocuments ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liste des dossiers */}
        <Card>
          <CardHeader>
            <CardTitle>Mes dossiers</CardTitle>
            <CardDescription>Derniers dossiers mis à jour</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredFolders && filteredFolders.length > 0 ? (
              viewMode === 'list' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead className="hidden sm:table-cell">Documents</TableHead>
                      <TableHead className="hidden md:table-cell">Récents</TableHead>
                      <TableHead className="w-10 sm:w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFolders.map((folder) => (
                      <TableRow 
                        key={folder.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleOpenFolder(folder)}
                      >
                        <TableCell className="font-medium">{folder.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{folder._count?.documents || 0}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-primary">
                            {folder._count?.documents || 0} document{folder._count?.documents !== 1 ? 's' : ''}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenFolder(folder)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les documents
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditFolder(folder)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirm(folder.id)
                                }}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredFolders.map((folder) => (
                    <FolderGridItem
                      key={folder.id}
                      folder={folder}
                      onView={handleOpenFolder}
                      onEdit={handleEditFolder}
                      onDelete={(folderId) => setDeleteConfirm(folderId)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-2 text-sm font-medium">Aucun dossier</h3>
                <p className="mt-1 text-sm text-primary">Créez votre premier dossier pour organiser vos documents.</p>
                                 <div className="mt-4">
                   <Button onClick={() => setOpen(true)}>
                     <Plus className="mr-2 h-4 w-4" />
                     Nouveau dossier
                   </Button>
                 </div>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Dialogue de confirmation de suppression */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le dossier sera définitivement supprimé.
                Assurez-vous qu'il ne contient aucun document ou sous-dossier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDeleteFolder(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Panneau de filtres des dossiers */}
        <FoldersFilters
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filters={folderFilters}
          onApplyFilters={setFolderFilters}
          postesComptables={postesComptables}
          naturesDocuments={naturesDocuments}
        />
      </div>
    </MainLayout>
  )
}


