'use client'

import { ContentToolbar } from '@/components/shared/content-toolbar'

type ViewMode = 'list' | 'grid'
type SortField = 'name' | 'createdAt' | 'updatedAt' | 'documentCount'
type SortOrder = 'asc' | 'desc'

interface FoldersToolbarProps {
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

const folderSortOptions = [
  { value: 'name', label: 'Nom' },
  { value: 'documentCount', label: 'Nombre de documents' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'updatedAt', label: 'Dernière mise à jour' },
]

export function FoldersToolbar({
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
}: FoldersToolbarProps) {
  return (
    <ContentToolbar
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
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
    />
  )
}
