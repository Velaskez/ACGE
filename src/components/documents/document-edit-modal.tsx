'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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

interface DocumentItem {
  id: string
  title: string
  description?: string
  category?: string
  isPublic: boolean
  folderId?: string | null
  createdAt: string
  updatedAt: string
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
  }
  author?: {
    name: string
    email: string
  }
  folder?: {
    id: string
    name: string
  }
}

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

  // Définir les catégories disponibles
  const categories = [
    { value: 'ordre-recette', label: 'Ordre de recette' },
    { value: 'ordre-paiement', label: 'Ordre de paiement' },
    { value: 'courier', label: 'Courier' }
  ]
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [showFileInfo, setShowFileInfo] = useState(true)

  // Charger les dossiers disponibles
  useEffect(() => {
    if (isOpen) {
      fetchFolders()
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
      const response = await fetch('/api/sidebar/folders', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Modifier le document</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFileInfo(!showFileInfo)}
                className="hidden sm:flex"
              >
                <Info className="h-4 w-4" />
                <span className="ml-1">Infos</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                        {document.currentVersion?.fileName || 'Sans nom'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type de fichier */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Type</Label>
                  <Badge variant="secondary" className="w-full justify-center text-xs">
                    {document.currentVersion?.fileType?.split('/')[1]?.toUpperCase() || 'INCONNU'}
                  </Badge>
                </div>

                {/* Taille */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Taille</Label>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {formatFileSize(document.currentVersion?.fileSize || 0)}
                    </span>
                  </div>
                </div>

                {/* Version */}
                <div>
                  <Label className="text-sm font-medium text-blue-900 mb-1 block">Version</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{document.currentVersion?.versionNumber || 0}
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
                    <span className="text-sm text-blue-800">
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

          {/* Formulaire d'édition */}
          <div className="space-y-6">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <span>Titre *</span>
                <Badge variant="outline" className="text-xs">Obligatoire</Badge>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Titre du document"
                required
                disabled={isLoading}
                className="text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description du document (optionnel)"
                rows={3}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 caractères
              </p>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                <span>Catégorie</span>
                <Badge variant="outline" className="text-xs">Optionnel</Badge>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleChange('category', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Aucune catégorie</span>
                    </div>
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Emplacement */}
            <div className="space-y-2">
              <Label htmlFor="folderId" className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Emplacement
              </Label>
              <Select 
                value={formData.folderId} 
                onValueChange={(value) => handleChange('folderId', value)}
                disabled={isLoading || foldersLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={foldersLoading ? "Chargement..." : "Sélectionner un dossier"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span>Racine (aucun dossier)</span>
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span className="truncate">{folder.name}</span>
                        {folder.description && (
                          <span className="text-xs text-primary ml-auto">
                            ({folder.description.slice(0, 20)}{folder.description.length > 20 ? '...' : ''})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Indicateur de changement d'emplacement */}
              {formData.folderId !== 'root' && document.folder && formData.folderId !== document.folderId && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-xs text-yellow-800">
                    Sera déplacé vers : <strong>{folders.find(f => f.id === formData.folderId)?.name}</strong>
                  </p>
                </div>
              )}
              {formData.folderId === 'root' && document.folder && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-xs text-yellow-800">
                    Sera déplacé vers la racine depuis : <strong>{document.folder.name}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Visibilité */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Visibilité</Label>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="space-y-1">
                  <Label htmlFor="isPublic" className="text-sm font-medium leading-relaxed">
                    Document public
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visible par tous les utilisateurs de la plateforme
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  <span className="hidden sm:inline">Enregistrement...</span>
                  <span className="sm:hidden">Envoi...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
