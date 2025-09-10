'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  MoreHorizontal,
  Eye,
  Download,
  Edit,
  Share2,
  Trash2,
  Calendar,
  User,
  FolderOpen
} from 'lucide-react'

import { DocumentItem } from '@/types/document'

interface DocumentGridItemProps {
  document: DocumentItem
  onView: (document: DocumentItem) => void
  onEdit: (document: DocumentItem) => void
  onDownload: (document: DocumentItem) => void
  onShare: (document: DocumentItem) => void
  onDelete: (documentId: string) => void
}

export function DocumentGridItem({
  document,
  onView,
  onEdit,
  onDownload,
  onShare,
  onDelete
}: DocumentGridItemProps) {

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return File
    if (fileType.startsWith('image/')) return Image
    if (fileType.startsWith('video/')) return Video
    if (fileType.startsWith('audio/')) return Music
    if (fileType === 'application/pdf' || fileType.startsWith('text/')) return FileText
    return File
  }

  const getFileTypeColor = (fileType?: string) => {
    if (!fileType) return { bg: 'icon-blue-bg', text: 'icon-blue-fg' }
    if (fileType.startsWith('image/')) return { bg: 'icon-green-bg', text: 'icon-green-fg' }
    if (fileType.startsWith('video/')) return { bg: 'icon-purple-bg', text: 'icon-purple-fg' }
    if (fileType.startsWith('audio/')) return { bg: 'icon-orange-bg', text: 'icon-orange-fg' }
    if (fileType === 'application/pdf' || fileType.startsWith('text/')) return { bg: 'icon-red-bg', text: 'icon-red-fg' }
    return { bg: 'icon-blue-bg', text: 'icon-blue-fg' }
  }

  const IconComponent = getFileIcon(document.fileType)
  const colorClasses = getFileTypeColor(document.fileType)

  return (
    <Card 
      className="group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
      onClick={() => onView(document)}
    >
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header avec icône et menu */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.bg}`}>
            <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(document) }}>
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(document) }}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(document) }}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(document) }}>
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(document.id) }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Titre et description */}
        <div className="space-y-2 mb-3">
          <h3 className="font-medium text-sm line-clamp-2 leading-tight" title={document.title}>
            {document.title}
          </h3>
          
          {document.description && (
            <p className="text-xs text-primary line-clamp-2" title={document.description}>
              {document.description}
            </p>
          )}
        </div>

        {/* Métadonnées */}
        <div className="space-y-2 flex-1">
          {/* Taille et type de fichier */}
          {document.currentVersion && (
            <div className="flex items-center justify-between text-xs text-primary">
              <span>{formatFileSize(document.currentVersion.fileSize)}</span>
              <span>v{document.currentVersion.versionNumber}</span>
            </div>
          )}

          {/* Dossier */}
          {document.folder && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <FolderOpen className="w-3 h-3" />
              <span className="truncate">{document.folder.name}</span>
            </div>
          )}

          {/* Auteur et date */}
          <div className="flex items-center gap-1 text-xs text-primary">
            <User className="w-3 h-3" />
            <span className="truncate">{document.author.name}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-primary">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeTime(document.updatedAt)}</span>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tags.slice(0, 2).map(tag => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="text-xs px-1 py-0"
                >
                  {tag.name}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{document.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Statistiques */}
          {document._count && (
            <div className="flex items-center justify-between text-xs text-primary pt-2 border-t">
              <div className="flex items-center gap-3">
                {(document._count.versions ?? 0) > 1 && (
                  <span>{document._count.versions} versions</span>
                )}
                {(document._count.shares ?? 0) > 0 && (
                  <span>{document._count.shares} partages</span>
                )}
              </div>
              
              {document.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}