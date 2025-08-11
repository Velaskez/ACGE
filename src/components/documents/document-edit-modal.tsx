'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentItem {
  id: string
  title: string
  description?: string
  isPublic: boolean
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
    isPublic: document.isPublic
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
          isPublic: formData.isPublic
        }),
      })

      if (response.ok) {
        const updatedDocument = await response.json()
        onSave(updatedDocument)
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Modifier le document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du fichier (lecture seule) */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Fichier</span>
              <Badge variant="secondary">{document.currentVersion?.fileType || 'Inconnu'}</Badge>
            </div>
            <p className="text-sm text-gray-600">{document.currentVersion?.fileName || 'Sans nom'}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(document.currentVersion?.fileSize || 0)} • Version {document.currentVersion?.versionNumber || 0}
            </p>
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                disabled={isLoading}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isPublic" className="text-sm">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  Enregistrement...
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
