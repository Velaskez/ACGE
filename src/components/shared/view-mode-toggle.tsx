'use client'

import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'grid'

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  className,
}: ViewModeToggleProps) {
  return (
    <div className={cn('flex rounded-md border', className)}>
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
  )
}
