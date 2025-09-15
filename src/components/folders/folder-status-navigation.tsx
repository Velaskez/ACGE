'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
import { FolderOpen, Clock, FileText, Trash2 } from 'lucide-react'
import { getStatusFilterCount } from '@/lib/folder-status'

interface FolderStatusNavigationProps {
  folders: any[]
  currentFilter: 'all' | 'en_attente' | 'valide' | 'rejete'
  onFilterChange: (filter: 'all' | 'en_attente' | 'valide' | 'rejete') => void
}

export function FolderStatusNavigation({ 
  folders, 
  currentFilter, 
  onFilterChange 
}: FolderStatusNavigationProps) {
  const filters = [
    {
      key: 'all' as const,
      label: 'Tous les dossiers',
      icon: FolderOpen,
      count: getStatusFilterCount(folders, 'all')
    },
    {
      key: 'en_attente' as const,
      label: 'En attente',
      icon: Clock,
      count: getStatusFilterCount(folders, 'en_attente')
    },
    {
      key: 'valide' as const,
      label: 'Validés',
      icon: FileText,
      count: getStatusFilterCount(folders, 'valide')
    },
    {
      key: 'rejete' as const,
      label: 'Rejetés',
      icon: Trash2,
      count: getStatusFilterCount(folders, 'rejete')
    }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const IconComponent = filter.icon
        return (
          <Button
            key={filter.key}
            variant={currentFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className="flex items-center gap-1.5 h-7 px-2 text-xs"
          >
            <IconComponent className="h-3 w-3" />
            {filter.label}
            <span className={`ml-1 text-xs px-1 py-0.5 rounded-full ${
              currentFilter === filter.key 
                ? 'bg-white/20 text-white' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {filter.count}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
