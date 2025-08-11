'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface FolderEditModalProps {
  isOpen: boolean
  onClose: () => void
  folder: {
    id: string
    folderNumber: string
    name: string
    description?: string
  } | null
  onSave: (updatedFolder: { id: string; name: string; description?: string }) => Promise<boolean>
}

export function FolderEditModal({ isOpen, onClose, folder, onSave }: FolderEditModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pré-remplir le formulaire quand le dossier change
  useEffect(() => {
    if (folder) {
      setName(folder.name)
      setDescription(folder.description || '')
      setError(null)
    }
  }, [folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folder || !name.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const success = await onSave({
        id: folder.id,
        name: name.trim(),
        description: description.trim() || undefined
      })

      if (success) {
        onClose()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le dossier</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {folder && (
            <div className="space-y-2">
              <Label htmlFor="folder-number">Numéro de dossier</Label>
              <Input
                id="folder-number"
                value={folder.folderNumber}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Le numéro de dossier ne peut pas être modifié
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="folder-name">Nom du dossier *</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du dossier"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-description">Description</Label>
            <Textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
