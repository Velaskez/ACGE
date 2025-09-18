'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Download, 
  Eye, 
  Loader2, 
  AlertCircle, 
  X,
  Folder,
  Calendar,
  User,
  Hash,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Clock,
  Search,
  ArrowLeft
} from 'lucide-react'
import { DocumentPreviewModal } from '@/components/documents/document-preview-modal'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import { DocumentShareModal } from '@/components/documents/document-share-modal'
import { DocumentItem } from '@/types/document'

interface DossierComptable {
  id: string
  numeroDossier: string
  objetOperation: string
  beneficiaire: string
  statut: string
  dateDepot: string
  createdAt: string
  updatedAt: string
  folderId?: string
  folder_id?: string
  poste_comptable?: {
    numero: string
    intitule: string
  }
  nature_document?: {
    numero: string
    nom: string
  }
  secretaire?: {
    id: string
    name: string
    email: string
  }
  rejectionReason?: string
  rejectionDetails?: string
  rejectedAt?: string
}

interface DossierContentModalProps {
  dossier: DossierComptable | null
  isOpen: boolean
  onClose: () => void
}

export function DossierContentModal({ dossier, isOpen, onClose }: DossierContentModalProps) {
  const [currentFolder, setCurrentFolder] = React.useState<any>(null)
  const [documents, setDocuments] = React.useState<DocumentItem[]>([])
  const [filteredDocuments, setFilteredDocuments] = React.useState<DocumentItem[]>([])
  const [documentsLoading, setDocumentsLoading] = React.useState(false)
  const [documentsError, setDocumentsError] = React.useState('')
  const [selectedDocument, setSelectedDocument] = React.useState<DocumentItem | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [documentToDelete, setDocumentToDelete] = React.useState<DocumentItem | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  
  // États pour la recherche et le tri des documents
  const [documentSearchQuery, setDocumentSearchQuery] = React.useState('')
  const [documentSortField, setDocumentSortField] = React.useState<'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'>('updatedAt')
  const [documentSortOrder, setDocumentSortOrder] = React.useState<'asc' | 'desc'>('desc')

  // Charger le contenu du dossier
  const loadDossierContent = React.useCallback(async () => {
    if (!dossier) return

    const folderId = dossier.folderId || dossier.folder_id
    if (!folderId) {
      console.log('❌ Pas de folderId pour ce dossier:', dossier)
      setDocumentsError('Ce dossier n\'est pas lié à un dossier de fichiers')
      return
    }

    try {
      setDocumentsLoading(true)
      setDocumentsError('')
      
      console.log('📁 Chargement du contenu du dossier:', folderId)
      
      // Charger les informations du dossier
      const folderRes = await fetch(`/api/folders/${folderId}`)
      if (folderRes.ok) {
        const folderData = await folderRes.json()
        setCurrentFolder(folderData.folder || folderData)
      } else {
        setDocumentsError('Erreur lors du chargement du dossier')
        return
      }
      
      // Charger les documents du dossier
      const documentsRes = await fetch(`/api/documents?folderId=${folderId}`)
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
        setDocumentsError('Erreur lors du chargement des documents')
      }
    } catch (error) {
      console.error('❌ Erreur chargement contenu dossier:', error)
      setDocumentsError('Erreur lors du chargement du contenu')
    } finally {
      setDocumentsLoading(false)
    }
  }, [dossier])

  // Charger le contenu quand la modal s'ouvre
  React.useEffect(() => {
    if (isOpen && dossier) {
      loadDossierContent()
    }
  }, [isOpen, dossier, loadDossierContent])

  // Filtrage et tri des documents
  React.useEffect(() => {
    let filtered = documents.filter(doc => {
      // Filtrage par recherche
      if (documentSearchQuery && 
          !doc.title.toLowerCase().includes(documentSearchQuery.toLowerCase()) &&
          !doc.description?.toLowerCase().includes(documentSearchQuery.toLowerCase()) &&
          !doc.fileName?.toLowerCase().includes(documentSearchQuery.toLowerCase())) {
        return false
      }
      return true
    })

    // Tri des documents
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (documentSortField) {
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

      if (documentSortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredDocuments(filtered)
  }, [documents, documentSearchQuery, documentSortField, documentSortOrder])

  // Fonctions pour gérer les documents
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
        if (dossier) {
          await loadDossierContent()
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatutInfo = (statut: string) => {
    const statuts = {
      'EN_ATTENTE': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'VALIDÉ_CB': { label: 'Validé CB', className: 'bg-green-100 text-green-800 border-green-200' },
      'REJETÉ_CB': { label: 'Rejeté CB', className: 'bg-red-100 text-red-800 border-red-200' },
      'ORDONNANCÉ': { label: 'Ordonnancé', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    }
    return statuts[statut as keyof typeof statuts] || { label: statut, className: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  if (!dossier) return null

  const statutInfo = getStatutInfo(dossier.statut)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder className="h-6 w-6 text-primary" />
                <div>
                  <DialogTitle className="text-xl font-semibold text-reference">{dossier.numeroDossier}</DialogTitle>
                  <DialogDescription className="text-base">{dossier.objetOperation}</DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statutInfo.className}>
                  {statutInfo.label}
                </Badge>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-6">
            {/* Informations du dossier */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Bénéficiaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{dossier.beneficiaire}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Poste Comptable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    <span className="text-code">{dossier.poste_comptable?.numero || 'N/A'}</span> - {dossier.poste_comptable?.intitule || 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date de dépôt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-date">{formatDate(dossier.dateDepot)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats du dossier */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taille totale</CardTitle>
                  <Folder className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {documents.reduce((total, doc) => total + (doc.fileSize || 0), 0) > 0 
                      ? `${(documents.reduce((total, doc) => total + (doc.fileSize || 0), 0) / 1024 / 1024).toFixed(1)} MB`
                      : '0 MB'
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dernière modification</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {currentFolder?.updatedAt 
                      ? new Date(currentFolder.updatedAt).toLocaleDateString('fr-FR')
                      : 'Date inconnue'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barre de recherche pour les documents */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Rechercher dans les documents..."
                        value={documentSearchQuery}
                        onChange={(e) => setDocumentSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={documentSortField} 
                      onChange={(e) => setDocumentSortField(e.target.value as any)}
                      className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="updatedAt">Date de modification</option>
                      <option value="title">Nom</option>
                      <option value="createdAt">Date de création</option>
                      <option value="fileSize">Taille</option>
                      <option value="fileType">Type</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDocumentSortOrder(documentSortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {documentSortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Contenu des documents */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle>Documents du dossier</CardTitle>
                <CardDescription>
                  {documents.length} document{documents.length > 1 ? 's' : ''} dans ce dossier
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
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
                          <TableCell className="font-medium">{document.fileName || document.title}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {document.category || 'Non classé'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-number">
                              {document.fileSize ? 
                                `${(document.fileSize / 1024 / 1024).toFixed(1)} MB` : 
                                'Taille inconnue'
                              }
                            </span>
                          </TableCell>
                          <TableCell>{document.fileType || 'Type inconnu'}</TableCell>
                          <TableCell>
                            <span className="text-date">
                              {document.createdAt ? new Date(document.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                            </span>
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
          </div>
        </DialogContent>
      </Dialog>

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
            onSave={() => dossier && loadDossierContent()}
          />
          <DocumentShareModal
            document={selectedDocument}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
          />
        </>
      )}

      {/* Modal de confirmation de suppression de document */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le document</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteDocument}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
