'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Grid, List, SortAsc, SortDesc, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'grid'
type SortField = 'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'
type SortOrder = 'asc' | 'desc'

interface DocumentsToolbarProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortField: SortField
  sortOrder: SortOrder
  onSortFieldChange: (field: SortField) => void
  onSortOrderChange: (order: SortOrder) => void
  onOpenFilters?: () => void
  className?: string
}

export function DocumentsToolbar({
  searchQuery,
  onSearchQueryChange,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
  onOpenFilters,
  className,
}: DocumentsToolbarProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center',
        className,
      )}
    >
      {/* Recherche */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Rechercher des fichiers..."
          className="pl-9"
        />
      </div>

      {/* Tri */}
      <div className="flex items-center gap-2">
        <Select
          value={sortField}
          onValueChange={(v) => onSortFieldChange(v as SortField)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Nom</SelectItem>
            <SelectItem value="fileSize">Taille</SelectItem>
            <SelectItem value="createdAt">Date d'ajout</SelectItem>
            <SelectItem value="updatedAt">Dernière mise à jour</SelectItem>
            <SelectItem value="fileType">Type</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        {/* Mode d'affichage */}
        <div className="flex rounded-md border">
          <Button
            type="button"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            aria-label="Vue liste"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            aria-label="Vue grille"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtres additionnels (extension future) */}
        <Button type="button" variant="outline" onClick={onOpenFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
      </div>
    </div>
  )
}


