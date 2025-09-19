'use client'
import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CompactPageLayout, PageHeader, CompactStats, ContentSection, EmptyState } from '@/components/shared/compact-page-layout'
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
  AlertDialogCustom as AlertDialog,
  AlertDialogCustomAction as AlertDialogAction,
  AlertDialogCustomCancel as AlertDialogCancel,
  AlertDialogCustomContent as AlertDialogContent,
  AlertDialogCustomDescription as AlertDialogDescription,
  AlertDialogCustomFooter as AlertDialogFooter,
  AlertDialogCustomHeader as AlertDialogHeader,
  AlertDialogCustomTitle as AlertDialogTitle,
} from '@/components/ui/alert-dialog-custom'
import { useFolders } from '@/hooks/use-folders'
import { FoldersToolbar } from '@/components/folders/folders-toolbar'
import { FoldersFilters, FolderFilters } from '@/components/folders/folders-filters'
import { FolderCreationForm } from '@/components/folders/folder-creation-form'
import { ModalWrapper } from '@/components/ui/modal-wrapper'
import { DocumentsToolbar } from '@/components/documents/documents-toolbar'
import { DocumentsFilters, DocumentFilters } from '@/components/documents/documents-filters'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentShareModal } from '@/components/documents/document-share-modal'
import { DocumentPreviewModal } from '@/components/ui/document-preview-modal'
import { ModernUploadModal } from '@/components/upload/modern-upload-modal'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { SuccessModal } from '@/components/ui/success-modal'
import { FolderOpen, Plus, FileText, MoreHorizontal, Edit, Trash2, Eye, ArrowLeft, Download, Share2, Upload, Send, Clock, RefreshCw, CheckCircle } from 'lucide-react'
import { SearchSuggestion } from '@/components/ui/search-suggestions'
import { DocumentItem } from '@/types/document'
import { Folder } from '@/types/folder'
import { getFolderStatusInfo } from '@/lib/folder-status'
import { FolderStatusNavigation } from '@/components/folders/folder-status-navigation'
// Type étendu pour inclure numeroDossier et statut
interface FolderWithNumero extends Folder {
  numeroDossier?: string
  statut?: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDÉ_CB' | 'REJETÉ_CB' | 'VALIDÉ_ORDONNATEUR' | 'PAYÉ' | 'TERMINÉ'
}
export default function FoldersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { folders, stats, isLoading, error, refresh } = useFolders()
  // Convertir les dossiers en FolderWithNumero pour avoir accès au statut
  const foldersWithStatus = folders as FolderWithNumero[]
  // États pour la gestion des dossiers
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [sortField, setSortField] = React.useState<'name' | 'createdAt' | 'updatedAt' | 'documentCount'>('updatedAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [editingFolder, setEditingFolder] = React.useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
  // États pour la navigation par statut
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'en_attente' | 'valide' | 'rejete'>('all')
  // États pour les nouveaux champs du formulaire de dossier
  const [numeroDossier, setNumeroDossier] = React.useState('')
  const [dateDepot, setDateDepot] = React.useState('')
  const [posteComptableId, setPosteComptableId] = React.useState('')
  const [numeroNature, setNumeroNature] = React.useState('')
  const [natureDocumentId, setNatureDocumentId] = React.useState('')
  const [objetOperation, setObjetOperation] = React.useState('')
  const [beneficiaire, setBeneficiaire] = React.useState('')
  // États pour la soumission de dossiers
  const [submittingFolder, setSubmittingFolder] = React.useState<string | null>(null)
  const [submitConfirm, setSubmitConfirm] = React.useState<string | null>(null)
  const [submittedFolders, setSubmittedFolders] = React.useState<Set<string>>(new Set())
  // États pour la mise à jour de dossiers
  const [updatingFolder, setUpdatingFolder] = React.useState<string | null>(null)
  const [updateModalOpen, setUpdateModalOpen] = React.useState(false)
  const [folderToUpdate, setFolderToUpdate] = React.useState<any>(null)
  const [updateForm, setUpdateForm] = React.useState({
    numeroDossier: '',
    numeroNature: '',
    objetOperation: '',
    beneficiaire: '',
    posteComptableId: '',
    natureDocumentId: ''
  })
  // États pour la gestion des documents
  const [dossierDocuments, setDossierDocuments] = React.useState<any[]>([])
  const [availableDocuments, setAvailableDocuments] = React.useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = React.useState(false)
  const [documentsError, setDocumentsError] = React.useState('')
  const [showDocumentManager, setShowDocumentManager] = React.useState(false)
  // États pour les données des dropdowns
  const [postesComptables, setPostesComptables] = React.useState<any[]>([])
  const [naturesDocuments, setNaturesDocuments] = React.useState<any[]>([])
  const [loadingData, setLoadingData] = React.useState(false)
  // États pour la vue du contenu d'un dossier
  const folderId = searchParams.get('folder')
  const [currentFolder, setCurrentFolder] = React.useState<any>(null)
  const [documents, setDocuments] = React.useState<DocumentItem[]>([])
  const [filteredDocuments, setFilteredDocuments] = React.useState<DocumentItem[]>([])
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
  const [documentSortField, setDocumentSortField] = React.useState<'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'>('updatedAt')
  const [documentSortOrder, setDocumentSortOrder] = React.useState<'asc' | 'desc'>('desc')
  // États pour les modales de documents
  const [selectedDocument, setSelectedDocument] = React.useState<DocumentItem | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<DocumentItem | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
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
  // États pour la soumission des dossiers
  const [successModalOpen, setSuccessModalOpen] = React.useState(false)
  const [submittedFolder, setSubmittedFolder] = React.useState<Folder | null>(null)
  // États pour l'upload modal
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false)
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
    let items = (foldersWithStatus || [])
    // Filtrage par statut
    if (statusFilter !== 'all') {
      items = items.filter(f => {
        const folderStatus = f.statut
        switch (statusFilter) {
          case 'en_attente':
            return folderStatus === 'BROUILLON' || folderStatus === 'EN_ATTENTE' || !folderStatus
          case 'valide':
            return folderStatus === 'VALIDÉ_CB' || folderStatus === 'VALIDÉ_ORDONNATEUR' || folderStatus === 'PAYÉ' || folderStatus === 'TERMINÉ'
          case 'rejete':
            return folderStatus === 'REJETÉ_CB'
          default:
            return true
        }
      })
    }
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
  }, [foldersWithStatus, query, sortField, sortOrder, folderFilters, statusFilter])
  // Fonction pour vérifier quels dossiers ont déjà été soumis
  const checkSubmittedFolders = async () => {
    try {
      const response = await fetch('/api/dossiers/secretaire')
      if (response.ok) {
        const data = await response.json()
        const submittedIds = new Set<string>(data.dossiers?.map((d: any) => d.folderId).filter(Boolean) || [])
        setSubmittedFolders(submittedIds)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des dossiers soumis:', error)
    }
  }
  // Vérifier les dossiers soumis au chargement
  React.useEffect(() => {
    checkSubmittedFolders()
  }, [])
  // Fonction pour ouvrir le modal de mise à jour
  const handleOpenUpdateModal = async (folder: any) => {
    setFolderToUpdate(folder)
    setUpdateForm({
      numeroDossier: folder.numeroDossier || '',
      numeroNature: folder.numeroNature || '',
      objetOperation: folder.objetOperation || '',
      beneficiaire: folder.beneficiaire || '',
      posteComptableId: folder.posteComptableId || '',
      natureDocumentId: folder.natureDocumentId || ''
    })
    setUpdateModalOpen(true)
    // Charger les documents du dossier si c'est un dossier soumis
    if (submittedFolders.has(folder.id)) {
      await loadDossierDocuments(folder.id)
    }
  }
  // Fonction pour charger les documents d'un dossier
  const loadDossierDocuments = async (dossierId: string) => {
    try {
      setDocumentsLoading(true)
      setDocumentsError('')
      const response = await fetch(`/api/dossiers/${dossierId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDossierDocuments(data.documents || [])
      } else {
        setDocumentsError('Erreur lors du chargement des documents')
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error)
      setDocumentsError('Erreur lors du chargement des documents')
    } finally {
      setDocumentsLoading(false)
    }
  }
  // Fonction pour charger les documents disponibles (non associés)
  const loadAvailableDocuments = async () => {
    try {
      const response = await fetch('/api/documents?folderId=null&limit=50')
      if (response.ok) {
        const data = await response.json()
        setAvailableDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Erreur chargement documents disponibles:', error)
    }
  }
  // Fonction pour ajouter un document au dossier
  const handleAddDocument = async (documentId: string) => {
    if (!folderToUpdate) return
    try {
      const response = await fetch(`/api/dossiers/${folderToUpdate.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      })
      if (response.ok) {
        // Recharger les documents du dossier
        await loadDossierDocuments(folderToUpdate.id)
        // Recharger les documents disponibles
        await loadAvailableDocuments()
      } else {
        const errorData = await response.json()
        alert('Erreur lors de l\'ajout du document: ' + errorData.error)
      }
    } catch (error) {
      console.error('Erreur ajout document:', error)
      alert('Erreur lors de l\'ajout du document')
    }
  }
  // Fonction pour retirer un document du dossier
  const handleRemoveDocument = async (documentId: string) => {
    if (!folderToUpdate) return
    try {
      const response = await fetch(`/api/dossiers/${folderToUpdate.id}/documents?documentId=${documentId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        // Recharger les documents du dossier
        await loadDossierDocuments(folderToUpdate.id)
        // Recharger les documents disponibles
        await loadAvailableDocuments()
      } else {
        const errorData = await response.json()
        alert('Erreur lors du retrait du document: ' + errorData.error)
      }
    } catch (error) {
      console.error('Erreur retrait document:', error)
      alert('Erreur lors du retrait du document')
    }
  }
  // Fonction pour mettre à jour un dossier
  const handleUpdateFolder = async () => {
    if (!folderToUpdate) return
    try {
      setUpdatingFolder(folderToUpdate.id)
      const response = await fetch(`/api/dossiers/${folderToUpdate.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm)
      })
      if (response.ok) {
        console.log('✅ Dossier mis à jour avec succès')
        setUpdateModalOpen(false)
        setFolderToUpdate(null)
        if (refresh) {
          await refresh()
        }
        // Recharger la liste des dossiers soumis
        await checkSubmittedFolders()
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur mise à jour:', errorData)
        alert('Erreur lors de la mise à jour: ' + (errorData.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error)
      alert('Erreur de connexion lors de la mise à jour')
    } finally {
      setUpdatingFolder(null)
    }
  }
  // Fonction pour soumettre un dossier au Contrôleur Budgétaire
  const handleSubmitFolder = async (folderId: string) => {
    try {
      setSubmittingFolder(folderId)
      const response = await fetch(`/api/folders/${folderId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroDossier: numeroDossier || generateNumeroDossier(),
          numeroNature: numeroNature || 'NATURE-001',
          objetOperation: objetOperation || description || 'Opération comptable',
          beneficiaire: beneficiaire || 'Bénéficiaire à définir',
          posteComptableId: posteComptableId,
          natureDocumentId: natureDocumentId,
          secretaireId: null
        })
      })
      if (response.ok) {
        console.log('✅ Dossier soumis avec succès')
        setSubmitConfirm(null)
        // Ajouter le dossier à la liste des dossiers soumis
        setSubmittedFolders(prev => new Set([...prev, folderId]))
        if (refresh) {
          await refresh()
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur soumission:', errorData.error)
        alert('Erreur lors de la soumission: ' + (errorData.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('❌ Erreur soumission:', error)
      alert('Erreur de connexion lors de la soumission')
    } finally {
      setSubmittingFolder(null)
    }
  }
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
        // Le dossier est créé en statut brouillon, la soumission sera manuelle
        console.log('✅ Dossier créé en statut brouillon - soumission manuelle requise')
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
    // Vérifier si le dossier est validé - dans ce cas, empêcher l'édition
    if (folder.statut === 'VALIDÉ_CB' || folder.statut === 'VALIDÉ_ORDONNATEUR' || folder.statut === 'PAYÉ' || folder.statut === 'TERMINÉ') {
      alert(`🚫 Impossible de modifier ce dossier : il a été validé par le Contrôleur Budgétaire (statut: ${folder.statut})`)
      return
    }
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
        if (res.status === 403) {
          alert(`🚫 ${error.error}`)
        } else {
          alert(error.error || 'Erreur lors de la suppression')
        }
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
  const handleDeleteDocument = (document: DocumentItem) => {
    setDocumentToDelete(document)
    setDeleteModalOpen(true)
  }
  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return
    try {
      setIsDeleting(true)
      // Utiliser l'originalId (UUID de la base de données) au lieu de l'id généré côté client
      const documentId = documentToDelete.originalId || documentToDelete.id
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // Recharger les documents après suppression
        if (folderId) {
          await loadFolderDocuments(folderId)
        }
        setDeleteModalOpen(false)
        setDocumentToDelete(null)
      } else {
        console.error('Erreur lors de la suppression:', await response.text())
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
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
  // Fonction pour ouvrir l'upload modal
  const handleOpenUploadModal = () => {
    setUploadModalOpen(true)
  }
  // Fonction pour recharger les documents après upload
  const handleUploadSuccess = () => {
    if (folderId) {
      loadFolderDocuments(folderId)
    }
  }
  // Rendu conditionnel : soit la liste des dossiers, soit le contenu d'un dossier
  if (folderId && currentFolder) {
    return (
      <CompactPageLayout>
        {/* Header compact avec breadcrumb */}
        <PageHeader
          title={currentFolder.name}
          subtitle={currentFolder.description || 'Documents du dossier'}
          actions={
            <>
              <Button variant="outline" onClick={handleBackToFolders} className="w-full sm:w-auto h-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button variant="outline" onClick={() => loadFolderDocuments(folderId)} className="w-full sm:w-auto h-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={handleOpenUploadModal} className="w-full sm:w-auto h-8">
                <Upload className="h-4 w-4 mr-1" />
                Ajouter des documents
              </Button>
            </>
          }
        />
        {/* Stats compactes du dossier */}
        <CompactStats
          stats={[
            {
              label: "Documents",
              value: documents.length,
              icon: <FileText className="h-4 w-4 text-primary" />
            },
            {
              label: "Taille totale",
              value: documents.reduce((total, doc) => total + (doc.fileSize || 0), 0) > 0 
                ? <span className="text-number">{`${(documents.reduce((total, doc) => total + (doc.fileSize || 0), 0) / 1024 / 1024).toFixed(1)} MB`}</span>
                : <span className="text-number">0 MB</span>,
              icon: <FolderOpen className="h-4 w-4 text-primary" />
            },
            {
              label: "Dernière modification",
              value: currentFolder.updatedAt 
                ? <span className="text-date">{new Date(currentFolder.updatedAt).toLocaleDateString('fr-FR')}</span>
                : <span className="text-date">Date inconnue</span>,
              icon: <Clock className="h-4 w-4 text-primary" />
            }
          ]}
          columns={3}
        />
          {/* Barre d'outils pour les documents */}
          <DocumentsToolbar
            searchQuery={documentSearchQuery}
            onSearchQueryChange={setDocumentSearchQuery}
            sortField={documentSortField}
            sortOrder={documentSortOrder}
            onSortFieldChange={setDocumentSortField}
            onSortOrderChange={setDocumentSortOrder}
            onOpenFilters={() => setIsDocumentFiltersOpen(true)}
          />
          {/* Contenu des documents */}
          <ContentSection
            title="Documents du dossier"
            subtitle={`${documents.length} document${documents.length > 1 ? 's' : ''} dans ce dossier`}
          >
            {documentsLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : documentsError ? (
              <div className="text-center py-8 px-4 text-destructive">
                {documentsError}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="truncate">
                            {document.fileName || document.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {document.category || 'Non classé'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {document.fileSize ? 
                          `${(document.fileSize / 1024 / 1024).toFixed(1)} MB` : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {document.fileType || 'Type inconnu'}
                      </TableCell>
                      <TableCell>
                        {document.createdAt ? new Date(document.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDocument(document)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
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
                                handleDeleteDocument(document)
                              }}
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
            ) : (
              <EmptyState
                icon={<FileText className="h-10 w-10" />}
                title="Aucun document"
                description="Ce dossier ne contient aucun document."
              />
            )}
          </ContentSection>
          {/* Modales pour les documents */}
          {selectedDocument && (
            <>
              <DocumentPreviewModal
                document={selectedDocument}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                onDownload={(doc) => {
                  // Logique de téléchargement
                  console.log('Téléchargement du document:', doc.title)
                }}
                onEdit={(doc) => {
                  setEditModalOpen(true)
                }}
                onShare={(doc) => {
                  setShareModalOpen(true)
                }}
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
          {/* Modal d'upload */}
          <ModernUploadModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            folderId={folderId}
            onUploadSuccess={handleUploadSuccess}
          />
      </CompactPageLayout>
    )
  }
  // Vue par défaut : liste des dossiers
  return (
    <CompactPageLayout>
      {/* Header compact réutilisable */}
      <PageHeader
        title="Dossiers"
        subtitle={stats ? `${stats.totalFolders} dossiers, ${stats.totalDocuments} documents` : 'Chargement...'}
        actions={
          <>
            <Button variant="outline" onClick={refresh} className="w-full sm:w-auto h-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ModalWrapper isOpen={open} onOpenChange={handleCloseDialog}>
              <Dialog open={open} onOpenChange={handleCloseDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Nouveau dossier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden" showCloseButton={false}>
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
          </>
        }
      />
        {/* Navigation horizontale par statut */}
        <FolderStatusNavigation
          folders={folders || []}
          currentFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
        {/* Barre d'outils - Maintenant identique à la page des fichiers */}
        <ContentSection title="Recherche et filtres">
          <FoldersToolbar
            searchQuery={query}
            onSearchQueryChange={setQuery}
            onSearchSelect={handleSearchSelect}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
            onOpenFilters={() => setIsFiltersOpen(true)}
          />
        </ContentSection>
        {/* Stats compactes */}
        <CompactStats
          stats={[
            {
              label: "Total dossiers",
              value: stats?.totalFolders ?? 0,
              icon: <FolderOpen className="h-4 w-4 text-primary" />
            },
            {
              label: "Total documents",
              value: stats?.totalDocuments ?? 0,
              icon: <FileText className="h-4 w-4 text-primary" />
            }
          ]}
          columns={2}
        />
        {/* Liste des dossiers */}
        <ContentSection>
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : filteredFolders && filteredFolders.length > 0 ? (
              (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8">N° Dossier</TableHead>
                      <TableHead className="h-8">Nom</TableHead>
                      <TableHead className="hidden sm:table-cell h-8">Description</TableHead>
                      <TableHead className="hidden md:table-cell h-8">État</TableHead>
                      <TableHead className="hidden md:table-cell h-8">Documents</TableHead>
                      <TableHead className="hidden lg:table-cell h-8">Taille</TableHead>
                      <TableHead className="hidden xl:table-cell h-8">Créé le</TableHead>
                      <TableHead className="hidden xl:table-cell h-8">Modifié le</TableHead>
                      <TableHead className="w-10 sm:w-12 h-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFolders.map((folder) => (
                      <TableRow 
                        key={folder.id} 
                        className="cursor-pointer hover:bg-muted/50 h-10"
                        onClick={() => handleOpenFolder(folder)}
                      >
                        <TableCell className="font-medium py-2">
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            {(folder as FolderWithNumero).numeroDossier || 'Non défini'}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium py-2">
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-3 w-3 text-primary" />
                            <span className="text-sm">{folder.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell max-w-xs truncate text-muted-foreground py-2">
                          <span className="text-xs">{folder.description || 'Aucune description'}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2">
                          {(() => {
                            const status = (folder as FolderWithNumero).statut
                            const statusInfo = getFolderStatusInfo(status)
                            const IconComponent = statusInfo.icon
                            return (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                <IconComponent className="h-2.5 w-2.5" />
                                {statusInfo.label}
                              </span>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2">
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{folder._count?.documents || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-2">
                          <span className="text-xs text-muted-foreground">
                            {folder._count?.documents ? `${(folder._count.documents * 0.5).toFixed(1)} MB` : '0 MB'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell py-2">
                          <span className="text-xs text-muted-foreground">
                            {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell py-2">
                          <span className="text-xs text-muted-foreground">
                            {folder.updatedAt ? new Date(folder.updatedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="h-6 w-6 p-0"
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenFolder(folder)
                                }}
                              >
                                <Eye className="mr-2 h-3 w-3" />
                                Voir les documents
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditFolder(folder)
                                }}
                                disabled={folder.statut === 'VALIDÉ_CB' || folder.statut === 'VALIDÉ_ORDONNATEUR' || folder.statut === 'PAYÉ' || folder.statut === 'TERMINÉ'}
                              >
                                <Edit className="mr-2 h-3 w-3" />
                                {folder.statut === 'VALIDÉ_CB' || folder.statut === 'VALIDÉ_ORDONNATEUR' || folder.statut === 'PAYÉ' || folder.statut === 'TERMINÉ' 
                                  ? 'Modifier (interdit)' 
                                  : 'Modifier'
                                }
                              </DropdownMenuItem>
                              {/* Bouton de soumission - seulement si le dossier n'est pas déjà soumis */}
                              {(!folder.statut || folder.statut === 'BROUILLON' || folder.statut === 'EN_ATTENTE') && 
                               !submittedFolders.has(folder.id) && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSubmitConfirm(folder.id)
                                  }}
                                  className="text-blue-600"
                                >
                                  <Send className="mr-2 h-3 w-3" />
                                  Soumettre au CB
                                </DropdownMenuItem>
                              )}
                              {/* Indicateur si le dossier a déjà été soumis */}
                              {submittedFolders.has(folder.id) && (
                                <DropdownMenuItem 
                                  disabled
                                  className="text-gray-500 cursor-not-allowed"
                                >
                                  <CheckCircle className="mr-2 h-3 w-3" />
                                  Déjà soumis
                                </DropdownMenuItem>
                              )}
                              {/* Bouton de mise à jour - seulement pour les dossiers en attente */}
                              {submittedFolders.has(folder.id) && folder.statut === 'EN_ATTENTE' && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenUpdateModal(folder)
                                  }}
                                  className="text-orange-600"
                                >
                                  <Edit className="mr-2 h-3 w-3" />
                                  Mettre à jour
                                </DropdownMenuItem>
                              )}
                              {/* Indicateur pour les dossiers validés (non modifiables) */}
                              {submittedFolders.has(folder.id) && folder.statut === 'VALIDÉ_CB' && (
                                <DropdownMenuItem 
                                  disabled
                                  className="text-green-600 cursor-not-allowed"
                                >
                                  <CheckCircle className="mr-2 h-3 w-3" />
                                  Validé (non modifiable)
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirm(folder.id)
                                }}
                                className="text-red-600"
                                disabled={folder.statut === 'VALIDÉ_CB' || folder.statut === 'VALIDÉ_ORDONNATEUR' || folder.statut === 'PAYÉ' || folder.statut === 'TERMINÉ'}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                {folder.statut === 'VALIDÉ_CB' || folder.statut === 'VALIDÉ_ORDONNATEUR' || folder.statut === 'PAYÉ' || folder.statut === 'TERMINÉ' 
                                  ? 'Supprimer (interdit)' 
                                  : 'Supprimer'
                                }
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              <div className="text-center py-8 px-4">
                <FolderOpen className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-2 text-sm font-medium">Aucun dossier</h3>
                <p className="mt-1 text-xs text-muted-foreground">Créez votre premier dossier pour organiser vos documents.</p>
                <div className="mt-4">
                  <Button onClick={() => setOpen(true)} size="sm">
                    <Plus className="mr-1 h-3 w-3" />
                    Nouveau dossier
                  </Button>
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs text-destructive mt-4 px-4">{error}</p>
            )}
          </ContentSection>
        {/* Dialogue de confirmation de suppression */}
        <AlertDialog 
          open={!!deleteConfirm} 
          onOpenChange={() => setDeleteConfirm(null)}
          title="Êtes-vous sûr ?"
          description="Cette action ne peut pas être annulée. Le dossier sera définitivement supprimé. Assurez-vous qu'il ne contient aucun document ou sous-dossier."
        >
          <AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDeleteFolder(deleteConfirm)}
                loading={isDeleting}
                loadingText="Suppression en cours..."
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Dialogue de confirmation de soumission */}
        <AlertDialog 
          open={!!submitConfirm} 
          onOpenChange={() => setSubmitConfirm(null)}
          title="Soumettre le dossier"
          description="Êtes-vous sûr de vouloir soumettre ce dossier au Contrôleur Budgétaire ? Une fois soumis, le dossier passera en statut 'En attente' et ne pourra plus être modifié."
        >
          <AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSubmitConfirm(null)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => submitConfirm && handleSubmitFolder(submitConfirm)}
                disabled={submittingFolder === submitConfirm}
                loading={submittingFolder === submitConfirm}
                loadingText="Soumission en cours..."
                className="bg-blue-600 hover:bg-blue-700"
              >
                Soumettre
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
         {/* Modal de confirmation de suppression de document */}
         <DeleteConfirmationModal
           isOpen={deleteModalOpen}
           onClose={() => {
             setDeleteModalOpen(false)
             setDocumentToDelete(null)
           }}
           onConfirm={confirmDeleteDocument}
           title="Supprimer le document"
           description="Êtes-vous sûr de vouloir supprimer ce document ?"
           itemName={documentToDelete?.title}
           itemType="document"
           isLoading={isDeleting}
         />
         {/* Modal de succès de soumission */}
         <SuccessModal
           isOpen={successModalOpen}
           onClose={() => {
             setSuccessModalOpen(false)
             setSubmittedFolder(null)
           }}
           title="Dossier soumis avec succès !"
           description="Votre dossier a été transmis pour validation par le Contrôleur Budgétaire."
           itemName={submittedFolder?.name}
           itemType="dossier"
           details={{
             recipient: "Contrôleur Budgétaire",
             estimatedTime: "2-3 jours ouvrés",
             documentsCount: submittedFolder ? 1 : 0, // Vous pouvez calculer le nombre réel de documents
             nextSteps: [
               "Le CB va examiner votre dossier",
               "Vous recevrez une notification par email",
               "Le statut sera mis à jour automatiquement"
             ]
           }}
         />
         {/* Modal de mise à jour de dossier */}
         <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
           <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>Mettre à jour le dossier</DialogTitle>
               <DialogDescription>
                 Modifiez les informations du dossier et gérez ses documents. Le CB sera notifié de la modification.
               </DialogDescription>
             </DialogHeader>
             <div className="grid gap-6 py-4">
               {/* Informations du dossier */}
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Informations du dossier</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="numeroDossier">Numéro de dossier</Label>
                     <Input
                       id="numeroDossier"
                       value={updateForm.numeroDossier}
                       onChange={(e) => setUpdateForm(prev => ({ ...prev, numeroDossier: e.target.value }))}
                       placeholder="Ex: DOS-2024-001"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="numeroNature">Numéro nature</Label>
                     <Input
                       id="numeroNature"
                       value={updateForm.numeroNature}
                       onChange={(e) => setUpdateForm(prev => ({ ...prev, numeroNature: e.target.value }))}
                       placeholder="Ex: NAT-001"
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="objetOperation">Objet de l'opération</Label>
                   <Input
                     id="objetOperation"
                     value={updateForm.objetOperation}
                     onChange={(e) => setUpdateForm(prev => ({ ...prev, objetOperation: e.target.value }))}
                     placeholder="Description de l'opération"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="beneficiaire">Bénéficiaire</Label>
                   <Input
                     id="beneficiaire"
                     value={updateForm.beneficiaire}
                     onChange={(e) => setUpdateForm(prev => ({ ...prev, beneficiaire: e.target.value }))}
                     placeholder="Nom du bénéficiaire"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="posteComptable">Poste comptable</Label>
                     <Select
                       value={updateForm.posteComptableId}
                       onValueChange={(value) => setUpdateForm(prev => ({ ...prev, posteComptableId: value }))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Sélectionner un poste" />
                       </SelectTrigger>
                       <SelectContent>
                         {postesComptables.map((poste) => (
                           <SelectItem key={poste.id} value={poste.id}>
                             {poste.numero} - {poste.intitule}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="natureDocument">Nature du document</Label>
                     <Select
                       value={updateForm.natureDocumentId}
                       onValueChange={(value) => setUpdateForm(prev => ({ ...prev, natureDocumentId: value }))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Sélectionner une nature" />
                       </SelectTrigger>
                       <SelectContent>
                         {naturesDocuments.map((nature) => (
                           <SelectItem key={nature.id} value={nature.id}>
                             {nature.numero} - {nature.nom}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
               </div>
               {/* Gestion des documents */}
               {submittedFolders.has(folderToUpdate?.id) && (
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-semibold">Documents du dossier</h3>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => {
                         setShowDocumentManager(!showDocumentManager)
                         if (!showDocumentManager) {
                           loadAvailableDocuments()
                         }
                       }}
                     >
                       {showDocumentManager ? 'Masquer' : 'Gérer les documents'}
                     </Button>
                   </div>
                   {/* Documents actuels du dossier */}
                   <div className="space-y-2">
                     <Label>Documents actuels ({dossierDocuments.length})</Label>
                     {documentsLoading ? (
                       <div className="text-center py-4">Chargement des documents...</div>
                     ) : documentsError ? (
                       <div className="text-red-500 py-2">{documentsError}</div>
                     ) : dossierDocuments.length === 0 ? (
                       <div className="text-gray-500 py-2">Aucun document dans ce dossier</div>
                     ) : (
                       <div className="space-y-2 max-h-32 overflow-y-auto">
                         {dossierDocuments.map((doc) => (
                           <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                             <div className="flex-1">
                               <div className="font-medium">{doc.title}</div>
                               <div className="text-sm text-gray-500">
                                 {doc.file_name} • {Math.round(doc.file_size / 1024)} KB
                               </div>
                             </div>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleRemoveDocument(doc.id)}
                               className="text-red-600 hover:text-red-700"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                   {/* Gestionnaire de documents */}
                   {showDocumentManager && (
                     <div className="space-y-2">
                       <Label>Documents disponibles à ajouter</Label>
                       <div className="max-h-32 overflow-y-auto space-y-2">
                         {availableDocuments.length === 0 ? (
                           <div className="text-gray-500 py-2">Aucun document disponible</div>
                         ) : (
                           availableDocuments.map((doc) => (
                             <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                               <div className="flex-1">
                                 <div className="font-medium">{doc.title}</div>
                                 <div className="text-sm text-gray-500">
                                   {doc.file_name} • {Math.round(doc.file_size / 1024)} KB
                                 </div>
                               </div>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleAddDocument(doc.id)}
                                 className="text-green-600 hover:text-green-700"
                               >
                                 <Plus className="h-4 w-4" />
                               </Button>
                             </div>
                           ))
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>
             <DialogFooter>
               <Button
                 variant="outline"
                 onClick={() => {
                   setUpdateModalOpen(false)
                   setShowDocumentManager(false)
                   setDossierDocuments([])
                   setAvailableDocuments([])
                 }}
                 disabled={updatingFolder === folderToUpdate?.id}
               >
                 Annuler
               </Button>
               <Button
                 onClick={handleUpdateFolder}
                 disabled={updatingFolder === folderToUpdate?.id}
                 className="bg-orange-600 hover:bg-orange-700"
               >
                 {updatingFolder === folderToUpdate?.id ? 'Mise à jour...' : 'Mettre à jour'}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
      </CompactPageLayout>
    )
}
