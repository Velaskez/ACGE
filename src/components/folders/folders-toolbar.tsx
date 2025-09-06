'use client'

import { ContentToolbar } from '@/components/shared/content-toolbar'
import { SearchSuggestion } from '@/components/ui/search-suggestions'

type ViewMode = 'list' | 'grid'
type SortField = 'name' | 'createdAt' | 'updatedAt' | 'documentCount'
type SortOrder = 'asc' | 'desc'

interface FoldersToolbarProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearchSelect?: (suggestion: SearchSuggestion) => void
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

const folderSortOptions = [
  { value: 'name', label: 'Nom' },
  { value: 'documentCount', label: 'Nombre de documents' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'updatedAt', label: 'Dernière mise à jour' },
]

export function FoldersToolbar({
  searchQuery,
  onSearchQueryChange,
  onSearchSelect,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
  onOpenFilters,
  className,
  enableSuggestions = true,
}: FoldersToolbarProps) {
  return (
          <ContentToolbar<SortField>
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
      onSearchSelect={onSearchSelect}
      searchPlaceholder="Rechercher des dossiers..."
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      sortField={sortField}
      sortOrder={sortOrder}
      sortOptions={folderSortOptions}
      onSortFieldChange={onSortFieldChange}
      onSortOrderChange={onSortOrderChange}
      onOpenFilters={onOpenFilters}
      className={className}
      enableSuggestions={enableSuggestions}
    />
  )
}
