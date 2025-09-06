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
import { Folder } from '@/types/folder'

interface FolderGridItemProps {
  folder: Folder
  onView: (folder: Folder) => void
  onEdit: (folder: Folder) => void
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
            <div className="p-2 bg-muted rounded-lg">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {folder._count?.documents || 0} {(folder._count?.documents || 0) > 1 ? 'fichiers' : 'fichier'}
            </Badge>
          </div>

          {/* Nom du dossier */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {folder.name}
          </h3>

          {/* Espace pour la description (non disponible dans SidebarFolder) */}

          {/* Description */}
          {folder.description && (
            <p className="text-xs text-primary mb-3 line-clamp-2">
              {folder.description}
            </p>
          )}

          {/* Informations sur les documents */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="mb-3">
              <p className="text-xs text-primary">
                {folder._count?.documents || 0} document{(folder._count?.documents || 0) !== 1 ? 's' : ''}
              </p>
              {folder._count?.children > 0 && (
                <p className="text-xs text-primary">
                  {folder._count.children} sous-dossier{folder._count.children !== 1 ? 's' : ''}
                </p>
              )}
            </div>

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
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onView(folder)
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir les documents
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onEdit(folder)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(folder.id)
              }}
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
