'use client'

import { useState } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Filter, 
  X, 
  Calendar,
  FileType,
  HardDrive,
  Tag,
  FolderOpen,
  RotateCcw
} from 'lucide-react'

export interface DocumentFilters {
  search?: string
  fileType?: string
  minSize?: number
  maxSize?: number
  startDate?: string
  endDate?: string
  folderId?: string
  tags?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface DocumentsFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: DocumentFilters
  onApplyFilters: (filters: DocumentFilters) => void
  folders?: Array<{ id: string; name: string }>
  availableTags?: string[]
}

const FILE_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Vidéos' },
  { value: 'audio', label: 'Audio' },
  { value: 'text', label: 'Texte' },
  { value: 'sheet', label: 'Tableurs' },
  { value: 'doc', label: 'Documents' },
  { value: 'archive', label: 'Archives' }
]

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Date de modification' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'title', label: 'Nom' },
  { value: 'fileSize', label: 'Taille' },
  { value: 'fileName', label: 'Nom du fichier' }
]

export function DocumentsFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters,
  folders = [],
  availableTags = []
}: DocumentsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<DocumentFilters>(filters)
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || [])
  const [tagInput, setTagInput] = useState('')

  const handleReset = () => {
    const resetFilters: DocumentFilters = {
      sortBy: 'updatedAt',
      sortOrder: 'desc'
      // Pas de folderId - affiche TOUS les documents par défaut
    }
    setLocalFilters(resetFilters)
    setSelectedTags([])
    onApplyFilters(resetFilters)
  }

  const handleApply = () => {
    onApplyFilters({
      ...localFilters,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    })
    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres avancés
          </SheetTitle>
          <SheetDescription>
            Affinez votre recherche avec des filtres détaillés
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Type de fichier */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileType className="h-4 w-4" />
              Type de fichier
            </Label>
            <Select 
              value={localFilters.fileType || 'all'} 
              onValueChange={(value) => setLocalFilters({
                ...localFilters,
                fileType: value === 'all' ? undefined : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Taille du fichier */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Taille du fichier
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Min (MB)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minSize ? localFilters.minSize / (1024 * 1024) : ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    minSize: e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : undefined
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max (MB)</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={localFilters.maxSize ? localFilters.maxSize / (1024 * 1024) : ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    maxSize: e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : undefined
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Période */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Période
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Date début</Label>
                <Input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    startDate: e.target.value || undefined
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date fin</Label>
                <Input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    endDate: e.target.value || undefined
                  })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dossier */}
          {folders.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Dossier
                </Label>
                <Select 
                  value={localFilters.folderId || 'all'} 
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    folderId: value === 'all' ? undefined : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les dossiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les dossiers</SelectItem>
                    <SelectItem value="root">Racine (sans dossier)</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button onClick={addTag} size="sm">
                Ajouter
              </Button>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Tri */}
          <div className="space-y-2">
            <Label>Trier par</Label>
            <div className="grid grid-cols-2 gap-4">
              <Select 
                value={localFilters.sortBy || 'updatedAt'} 
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  sortBy: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={localFilters.sortOrder || 'desc'} 
                onValueChange={(value: 'asc' | 'desc') => setLocalFilters({
                  ...localFilters,
                  sortOrder: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Décroissant</SelectItem>
                  <SelectItem value="asc">Croissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleApply} className="flex-1">
            <Filter className="h-4 w-4 mr-2" />
            Appliquer les filtres
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
