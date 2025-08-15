'use client'

import { ContentToolbar } from '@/components/shared/content-toolbar'
import { SearchSuggestion } from '@/components/ui/search-suggestions'

type ViewMode = 'list' | 'grid'
type SortField = 'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'
type SortOrder = 'asc' | 'desc'

interface DocumentsToolbarProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearchSelect?: (suggestion: SearchSuggestion) => void
  onSearchSubmit?: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortField: SortField
  sortOrder: SortOrder
  onSortFieldChange: (field: SortField) => void
  onSortOrderChange: (order: SortOrder) => void
  onOpenFilters?: () => void
  className?: string
  enableSuggestions?: boolean
}

const documentSortOptions = [
  { value: 'title', label: 'Nom' },
  { value: 'fileSize', label: 'Taille' },
  { value: 'createdAt', label: 'Date d\'ajout' },
  { value: 'updatedAt', label: 'Dernière mise à jour' },
  { value: 'fileType', label: 'Type' },
]

export function DocumentsToolbar({
  searchQuery,
  onSearchQueryChange,
  onSearchSelect,
  onSearchSubmit,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
  onOpenFilters,
  className,
  enableSuggestions = true,
}: DocumentsToolbarProps) {
  return (
    <ContentToolbar
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
      onSearchSelect={onSearchSelect}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder="Rechercher des fichiers..."
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      sortField={sortField}
      sortOrder={sortOrder}
      sortOptions={documentSortOptions}
      onSortFieldChange={onSortFieldChange}
      onSortOrderChange={onSortOrderChange}
      onOpenFilters={onOpenFilters}
      className={className}
      enableSuggestions={enableSuggestions}
    />
  )
}


