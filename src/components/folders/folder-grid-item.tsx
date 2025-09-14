'use client'

import { Card, CardContent } from '@/components/ui/card'
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
  Send,
} from 'lucide-react'
import { Folder } from '@/types/folder'

interface FolderGridItemProps {
  folder: Folder
  onView: (folder: Folder) => void
  onEdit: (folder: Folder) => void
  onDelete: (folderId: string) => void
  onSubmit?: (folderId: string) => void
}

export function FolderGridItem({
  folder,
  onView,
  onEdit,
  onDelete,
  onSubmit,
}: FolderGridItemProps) {
  const documentCount = folder._count?.documents || 0
  const subfolderCount = folder._count?.children || 0

  return (
    <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardContent className="p-3" onClick={() => onView(folder)}>
        <div className="flex flex-col h-full min-h-[140px]">
          {/* Header avec icône et actions */}
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                {/* Bouton de soumission - seulement si le dossier n'est pas déjà soumis */}
                {onSubmit && (!(folder as any).statut || (folder as any).statut === 'BROUILLON' || (folder as any).statut === 'EN_ATTENTE') && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      onSubmit(folder.id)
                    }}
                    className="text-blue-600"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Soumettre au CB
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
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
          </div>

          {/* Nom du dossier */}
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-tight">
            {folder.name}
          </h3>

          {/* Numéro de dossier */}
          {(folder as any).numeroDossier && (
            <div className="mb-2">
              <span className="text-xs font-mono bg-muted/60 px-2 py-0.5 rounded text-muted-foreground">
                {(folder as any).numeroDossier}
              </span>
            </div>
          )}

          {/* Description */}
          {folder.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
              {folder.description}
            </p>
          )}

          {/* Footer avec statistiques et actions rapides */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center justify-between">
              {/* Statistiques compactes */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{documentCount}</span>
                </div>
                {subfolderCount > 0 && (
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    <span>{subfolderCount}</span>
                  </div>
                )}
              </div>

              {/* Actions rapides */}
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-primary/10"
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
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(folder)
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
