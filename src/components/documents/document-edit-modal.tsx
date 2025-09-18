'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ModalWrapper } from '@/components/ui/modal-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, AlertCircle, FolderOpen, Folder, FileText, Calendar, User, HardDrive, Info, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocumentItem } from '@/types/document'
import { DocumentEditForm } from './document-edit-form'

interface FolderItem {
  id: string
  name: string
  description?: string
  parentId?: string | null
}

interface DocumentEditModalProps {
  document: DocumentItem
  isOpen: boolean
  onClose: () => void
  onSave: (updatedDocument: DocumentItem) => void
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function DocumentEditModal({ document, isOpen, onClose, onSave }: DocumentEditModalProps) {
  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description || '',
    category: document.category || '',
    isPublic: document.isPublic,
    folderId: document.folderId || ''
  })

  // État pour les catégories (natures de documents)
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [showFileInfo, setShowFileInfo] = useState(true)

  // Charger les dossiers et catégories disponibles
  useEffect(() => {
    if (isOpen) {
      fetchFolders()
      fetchCategories()
    }
  }, [isOpen])

  // Réinitialiser le formulaire quand le document change
  useEffect(() => {
    setFormData({
      title: document.title,
      description: document.description || '',
      category: document.category || '',
      isPublic: document.isPublic,
      folderId: document.folderId || 'root'
    })
  }, [document])

  const fetchFolders = async () => {
    setFoldersLoading(true)
    try {
      console.log('🔍 Chargement des dossiers pour la modal d\'édition...')
      const response = await fetch('/api/folders', {
        credentials: 'include'
      })
      console.log('📡 Réponse API sidebar/folders:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📂 Données reçues:', data)
        
        // L'API sidebar/folders retourne un tableau directement, pas un objet avec .folders
        const foldersArray = Array.isArray(data) ? data : (data.folders || [])
        console.log('📁 Dossiers trouvés:', foldersArray.length)
        
        setFolders(foldersArray)
      } else {
        console.error('❌ Erreur API sidebar/folders:', response.status)
        setFolders([])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des dossiers:', error)
      setFolders([])
    } finally {
      setFoldersLoading(false)
    }
  }

  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      console.log('🔍 Chargement des catégories (natures de documents)...')
      const response = await fetch('/api/natures-documents', {
        credentials: 'include'
      })
      console.log('📡 Réponse API natures-documents:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Données reçues:', data)
        
        const naturesDocuments = data.naturesDocuments || []
        const categoriesList = naturesDocuments.map((nature: any) => ({
          value: nature.nom,
          label: nature.nom
        }))
        
        // Ajouter "Non classé" en première option
        categoriesList.unshift({ value: 'Non classé', label: 'Non classé' })
        
        console.log('📁 Catégories trouvées:', categoriesList.length)
        setCategories(categoriesList)
      } else {
        console.error('❌ Erreur API natures-documents:', response.status)
        // Fallback vers les catégories par défaut
        setCategories([
          { value: 'Non classé', label: 'Non classé' }
        ])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des catégories:', error)
      // Fallback vers les catégories par défaut
      setCategories([
        { value: 'Non classé', label: 'Non classé' }
      ])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true)
    setError('')

    try {
      // Utiliser l'originalId (ID réel de la base) au lieu de l'ID artificiel
      const documentId = document.originalId || document.id
      const apiUrl = `/api/documents/${documentId}`
      console.log('🔗 URL API utilisée pour la modification:', apiUrl)
      console.log('🔑 ID du document utilisé:', documentId)
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category || null,
          isPublic: formData.isPublic,
          folderId: formData.folderId === 'root' ? null : formData.folderId
        }),
      })

      if (response.ok) {
        const updatedDocument = await response.json()
        onSave(updatedDocument.document || updatedDocument)
        onClose() // Fermer le modal seulement après succès
        
        // Message de confirmation si le dossier a changé
        const actualFolderId = formData.folderId === 'root' ? null : formData.folderId
        if (actualFolderId !== document.folderId) {
          const targetFolder = actualFolderId 
            ? folders.find(f => f.id === actualFolderId)?.name 
            : 'la racine'
          console.log(`Document déplacé vers : ${targetFolder}`)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <ModalWrapper isOpen={isOpen} onOpenChange={onClose}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-4xl mx-auto max-h-[85vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="h-5 w-5 flex-shrink-0 icon-red-fg" />
              <span className="truncate">Modifier le document</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFileInfo(!showFileInfo)}
                className="hidden sm:flex"
              >
                <Info className="mr-1 h-4 w-4" />
                <span>Infos</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du fichier (lecture seule) - Version compacte avec toggle */}
          <div className={`transition-all duration-300 overflow-hidden ${
            showFileInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Nom du fichier */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Label className="text-sm font-medium text-blue-900 mb-1 block">Nom du fichier</Label>
                      <p className="text-sm text-blue-800 break-all leading-relaxed">
                        {document.fileName || 'Sans nom'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type de fichier */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Type</Label>
                  <Badge variant="secondary" className="w-full justify-center text-xs">
                    {document.fileType?.split('/')[1]?.toUpperCase() || 'INCONNU'}
                  </Badge>
                </div>

                {/* Taille */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Taille</Label>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 text-number">
                      {formatFileSize(document.fileSize || 0)}
                    </span>
                  </div>
                </div>

                {/* Version */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Version</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{document.versionNumber || 0}
                    </Badge>
                  </div>
                </div>

                {/* Dossier actuel */}
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Emplacement actuel</Label>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 break-all">
                      {document.folder ? document.folder.name : 'Racine (aucun dossier)'}
                    </span>
                  </div>
                </div>

                {/* Date de création */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Créé le</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 text-date">
                      {formatDate(document.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Auteur */}
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Auteur</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 break-all">
                      {document.author?.name || 'Inconnu'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton d'infos pour mobile */}
          <div className="sm:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFileInfo(!showFileInfo)}
              className="w-full"
            >
              <Info className="h-4 w-4 mr-2" />
              {showFileInfo ? 'Masquer les infos' : 'Afficher les infos'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DocumentEditForm
            document={document}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
    </ModalWrapper>
  )
}
