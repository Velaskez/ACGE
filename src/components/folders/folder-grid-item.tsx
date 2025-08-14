'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  FolderOpen,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react'
import { SidebarFolder } from '@/hooks/use-sidebar-data'

interface FolderGridItemProps {
  folder: SidebarFolder
  onView: (folder: SidebarFolder) => void
  onEdit: (folder: SidebarFolder) => void
  onDelete: (folderId: string) => void
}

export function FolderGridItem({
  folder,
  onView,
  onEdit,
  onDelete,
}: FolderGridItemProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardContent className="p-4" onClick={() => onView(folder)}>
        <div className="flex flex-col h-full">
          {/* Icon et badge */}
          <div className="flex items-center justify-between mb-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {folder.documentCount} {folder.documentCount > 1 ? 'fichiers' : 'fichier'}
            </Badge>
          </div>

          {/* Nom du dossier */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {folder.name}
          </h3>

          {/* Espace pour la description (non disponible dans SidebarFolder) */}

          {/* Documents récents */}
          <div className="flex-1 flex flex-col justify-end">
            {folder.recentDocuments.length > 0 ? (
              <div className="space-y-1 mb-3">
                <p className="text-xs font-medium text-primary">Documents récents:</p>
                {folder.recentDocuments.slice(0, 2).map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-1">
                    <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-xs text-primary truncate">
                      {doc.title}
                    </span>
                  </div>
                ))}
                {folder.recentDocuments.length > 2 && (
                  <span className="text-xs text-primary">
                    +{folder.recentDocuments.length - 2} autres...
                  </span>
                )}
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-xs text-primary italic">
                  Aucun document
                </p>
              </div>
            )}

            {/* Note: updatedAt non disponible dans SidebarFolder */}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        {/* Actions rapides */}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onView(folder)
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(folder)
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>

        {/* Menu d'actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(folder)}>
              <Eye className="mr-2 h-4 w-4" />
              Ouvrir
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(folder)}>
              <Edit className="mr-2 h-4 w-4" />
              Éditer
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(folder.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
