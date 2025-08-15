'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, AlertCircle, FolderOpen, Folder } from 'lucide-react'
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

export function DocumentEditModal({ document, isOpen, onClose, onSave }: DocumentEditModalProps) {
  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description || '',
    isPublic: document.isPublic,
    folderId: document.folderId || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)

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
      <DialogContent className="w-full max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">Modifier le document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du fichier (lecture seule) */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm font-medium text-primary">Fichier</span>
              <Badge variant="secondary" className="w-fit">{document.currentVersion?.fileType || 'Inconnu'}</Badge>
            </div>
            <p className="text-sm text-primary break-all">{document.currentVersion?.fileName || 'Sans nom'}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <p className="text-xs text-primary">
                {formatFileSize(document.currentVersion?.fileSize || 0)}
              </p>
              <span className="hidden sm:inline text-xs text-primary mx-2">•</span>
              <p className="text-xs text-primary">
                Version {document.currentVersion?.versionNumber || 0}
              </p>
              {document.folder && (
                <>
                  <span className="hidden sm:inline text-xs text-primary mx-2">•</span>
                  <p className="text-xs text-primary flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {document.folder.name}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Titre du document"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description du document (optionnel)"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="folderId" className="flex items-center gap-2">
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
              {formData.folderId !== 'root' && document.folder && formData.folderId !== document.folderId && (
                <p className="text-xs text-primary mt-1">
                  Actuellement dans : {document.folder.name}
                </p>
              )}
              {formData.folderId === 'root' && document.folder && (
                <p className="text-xs text-primary mt-1">
                  Sera déplacé vers la racine depuis : {document.folder.name}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                disabled={isLoading}
                className="mt-1 rounded border-gray-300"
              />
              <Label htmlFor="isPublic" className="text-sm leading-relaxed">
                Document public (visible par tous les utilisateurs)
              </Label>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col-reverse sm:flex-row">
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
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
