'use client'

import { ContentToolbar } from '@/components/shared/content-toolbar'

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
    <ContentToolbar
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
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
    />
  )
}


