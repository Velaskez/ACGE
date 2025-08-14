'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import { cn, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Home,
  FolderOpen,
  FileText,
  Users,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Upload,
} from 'lucide-react'

interface SidebarProps {
  className?: string
  inSheet?: boolean
}

const mainNav = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Mes fichiers',
    href: '/documents',
    icon: FileText,
  },
  {
    title: 'Upload',
    href: '/upload',
    icon: Upload,
  },
  {
    title: 'Dossiers',
    href: '/folders',
    icon: FolderOpen,
  },
  {
    title: 'Utilisateurs',
    href: '/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar({ className, inSheet = false }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { stats, folders, isLoading } = useSidebarData()
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // Filtrer les éléments de navigation selon le rôle
  const filteredNav = mainNav.filter(item => {
    // On vérifie que la propriété 'role' existe bien avant de l'utiliser
    if (item.adminOnly && user?.role !== 'ADMIN') {
      return false
    }
    return true
  })

  return (
    <TooltipProvider>
      <div className={cn(
        inSheet
          ? 'relative inset-0 z-40 bg-background border-r flex flex-col h-full w-full'
          : 'fixed left-0 top-16 bottom-0 z-40 bg-background border-r flex flex-col w-64 min-w-[240px] max-w-[320px] sm:w-64 md:w-72 lg:w-80',
        className
      )}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 py-4">
            {/* Navigation principale */}
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight truncate text-primary">
                Navigation
              </h2>
              <div className="space-y-1">
                {filteredNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className="w-full justify-start min-h-[40px]"
                        >
                          <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-left flex-1">
                            {item.title}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[200px]">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Link>
                ))}
              </div>
            </div>

        <Separator />

            {/* Dossiers récents */}
            <div className="px-3 py-2 flex-1 min-h-0">
              <div className="flex items-center justify-between mb-2 px-4">
                <h2 className="text-lg font-semibold tracking-tight truncate flex-1 text-primary">
                  Dossiers récents
                </h2>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-1 max-h-[300px] overflow-y-auto">
                <div className="space-y-1">
                  {isLoading ? (
                    // Skeleton pour le chargement
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center space-x-2 px-2">
                          <Skeleton className="h-4 w-4 flex-shrink-0" />
                          <Skeleton className="h-4 w-4 flex-shrink-0" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      </div>
                    ))
                  ) : folders.length > 0 ? (
                    // Affichage des vrais dossiers
                    folders.map((folder) => (
                      <div key={folder.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-8 min-h-[32px]"
                              onClick={() => toggleFolder(folder.id)}
                            >
                              {expandedFolders.includes(folder.id) ? (
                                <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />
                              )}
                              <FolderOpen className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 text-left truncate min-w-0">
                                {folder.name}
                              </span>
                              <span className="text-xs text-primary flex-shrink-0 ml-2">
                                {folder.documentCount}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[250px]">
                            <p className="break-words">{folder.name}</p>
                            <p className="text-xs text-primary mt-1">
                              {folder.documentCount} document{folder.documentCount > 1 ? 's' : ''}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {expandedFolders.includes(folder.id) && (
                          <div className="ml-6 space-y-1">
                            {folder.recentDocuments.length > 0 ? (
                              folder.recentDocuments.map((doc) => (
                                <Tooltip key={doc.id}>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      className="w-full justify-start h-6 text-sm min-h-[24px]"
                                    >
                                      <FileText className="mr-2 h-3 w-3 flex-shrink-0" />
                                      <span className="truncate text-left flex-1 min-w-0">
                                        {doc.title}
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-[250px]">
                                    <p className="break-words">{doc.title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))
                            ) : (
                              <div className="text-xs text-primary px-2 py-1 truncate">
                                Aucun document
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // État vide
                    <div className="text-center py-4 px-2">
                      <FolderOpen className="mx-auto h-8 w-8 text-primary" />
                      <p className="text-xs text-primary mt-2 break-words">
                        Aucun dossier
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

        <Separator />

            {/* Statistiques rapides */}
            <div className="px-3 py-2 flex-shrink-0">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight truncate text-primary">
                Statistiques
              </h2>
              <div className="space-y-2 px-4">
                {isLoading ? (
                  // Skeleton pour le chargement
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-center text-sm min-h-[20px]">
                      <Skeleton className="h-4 w-16 flex-shrink-0" />
                      <Skeleton className="h-4 w-12 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  // Affichage des vraies statistiques
                  <>
                    <div className="flex justify-between items-center text-sm min-h-[20px]">
                      <span className="truncate flex-1 mr-2 text-primary">Fichiers</span>
                      <span className="font-medium flex-shrink-0 text-primary">
                        {stats?.totalDocuments?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm min-h-[20px]">
                      <span className="truncate flex-1 mr-2 text-primary">Espace utilisé</span>
                      <span className="font-medium flex-shrink-0 text-primary">
                        {stats?.spaceUsed?.gb ? `${stats.spaceUsed.gb} GB` : '0 GB'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm min-h-[20px]">
                      <span className="truncate flex-1 mr-2 text-primary">Dossiers</span>
                      <span className="font-medium flex-shrink-0 text-primary">
                        {stats?.totalFolders?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
