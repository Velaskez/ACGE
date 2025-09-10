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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Filter, 
  RotateCcw,
  Search,
  Calendar,
  FolderOpen,
  Hash,
  Settings
} from 'lucide-react'

export interface FolderFilters {
  search?: string
  minDocuments?: number
  maxDocuments?: number
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  posteComptableId?: string
  natureDocumentId?: string
}

interface FoldersFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: FolderFilters
  onApplyFilters: (filters: FolderFilters) => void
  postesComptables?: Array<{ id: string; nom: string }>
  naturesDocuments?: Array<{ id: string; nom: string }>
}

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Date de modification' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'name', label: 'Nom' },
  { value: 'documentCount', label: 'Nombre de documents' }
]

export function FoldersFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters,
  postesComptables = [],
  naturesDocuments = []
}: FoldersFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FolderFilters>(filters)

  const handleReset = () => {
    const resetFilters: FolderFilters = {
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    }
    setLocalFilters(resetFilters)
    onApplyFilters(resetFilters)
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.minDocuments || localFilters.maxDocuments) count++
    if (localFilters.startDate || localFilters.endDate) count++
    if (localFilters.posteComptableId) count++
    if (localFilters.natureDocumentId) count++
    return count
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[540px] overflow-y-auto bg-gradient-to-b from-background to-muted/20">
        {/* Header moderne avec gradient */}
        <SheetHeader className="pb-8 border-b bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 px-8 -mt-6 pt-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold">
                  Filtres des dossiers
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground mt-1">
                  Affinez votre recherche de dossiers
                </SheetDescription>
              </div>
            </div>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                {getActiveFiltersCount()} actif{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-8 px-2">
          {/* Section Recherche - Priorité haute */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Label className="text-base font-medium text-foreground">Recherche textuelle</Label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le nom, description..."
                value={localFilters.search || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  search: e.target.value || undefined
                })}
                className="pl-10 h-11 bg-background/50 border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Section Nombre de documents */}
          <div className="space-y-4 p-6 rounded-xl bg-muted/30 border border-muted">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/50">
                <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <Label className="text-base font-medium text-foreground">Nombre de documents</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min-docs" className="text-xs text-muted-foreground font-medium">
                  Minimum
                </Label>
                <Input
                  id="min-docs"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={localFilters.minDocuments || ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    minDocuments: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="h-10 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-docs" className="text-xs text-muted-foreground font-medium">
                  Maximum
                </Label>
                <Input
                  id="max-docs"
                  type="number"
                  placeholder="100"
                  min="0"
                  value={localFilters.maxDocuments || ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    maxDocuments: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="h-10 bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Section Période */}
          <div className="space-y-4 p-6 rounded-xl bg-muted/30 border border-muted">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <Label className="text-base font-medium text-foreground">Période de création</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-xs text-muted-foreground font-medium">
                  Date de début
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    startDate: e.target.value || undefined
                  })}
                  className="h-10 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-xs text-muted-foreground font-medium">
                  Date de fin
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    endDate: e.target.value || undefined
                  })}
                  className="h-10 bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Section Poste Comptable */}
          {postesComptables.length > 0 && (
            <div className="space-y-4 p-6 rounded-xl bg-muted/30 border border-muted">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50">
                  <FolderOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <Label className="text-base font-medium text-foreground">Poste comptable</Label>
              </div>
              
              <Select 
                value={localFilters.posteComptableId || 'all'} 
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  posteComptableId: value === 'all' ? undefined : value
                })}
              >
                <SelectTrigger className="h-11 bg-background/50">
                  <SelectValue placeholder="Tous les postes comptables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les postes comptables</SelectItem>
                  {postesComptables.map(poste => (
                    <SelectItem key={poste.id} value={poste.id}>
                      {poste.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Section Nature de document */}
          {naturesDocuments.length > 0 && (
            <div className="space-y-4 p-6 rounded-xl bg-muted/30 border border-muted">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50">
                  <FolderOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <Label className="text-base font-medium text-foreground">Nature de document</Label>
              </div>
              
              <Select 
                value={localFilters.natureDocumentId || 'all'} 
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  natureDocumentId: value === 'all' ? undefined : value
                })}
              >
                <SelectTrigger className="h-11 bg-background/50">
                  <SelectValue placeholder="Toutes les natures de documents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les natures de documents</SelectItem>
                  {naturesDocuments.map(nature => (
                    <SelectItem key={nature.id} value={nature.id}>
                      {nature.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Section Tri - Toujours visible */}
          <div className="space-y-4 p-6 rounded-xl bg-muted/30 border border-muted">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/50">
                <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <Label className="text-base font-medium text-foreground">Tri</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sort-field" className="text-sm text-muted-foreground font-medium">
                  Critère
                </Label>
                <Select 
                  value={localFilters.sortBy || 'updatedAt'} 
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    sortBy: value
                  })}
                >
                  <SelectTrigger id="sort-field" className="h-11 bg-background/50">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort-order" className="text-sm text-muted-foreground font-medium">
                  Ordre
                </Label>
                <Select 
                  value={localFilters.sortOrder || 'desc'} 
                  onValueChange={(value: 'asc' | 'desc') => setLocalFilters({
                    ...localFilters,
                    sortOrder: value
                  })}
                >
                  <SelectTrigger id="sort-order" className="h-11 bg-background/50">
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
        </div>

        {/* Footer avec actions */}
        <SheetFooter className="flex gap-4 pt-10 border-t bg-gradient-to-r from-muted/20 to-muted/10 -mx-6 px-8 -mb-6 pb-8 mt-10">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            className="flex-1 h-12 bg-background/50 hover:bg-background/80 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button 
            onClick={handleApply} 
            className="flex-1 h-12 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Filter className="h-4 w-4 mr-2" />
            Appliquer les filtres
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
