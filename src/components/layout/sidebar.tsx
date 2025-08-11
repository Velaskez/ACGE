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

export function Sidebar({ className }: SidebarProps) {
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
    <div className={cn('fixed left-0 top-16 bottom-0 z-40 w-64 bg-background border-r overflow-hidden', className)}>
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
        {/* Navigation principale */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {filteredNav.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Dossiers récents */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2 px-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Dossiers récents
            </h2>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              {isLoading ? (
                // Skeleton pour le chargement
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center space-x-2 px-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))
              ) : folders.length > 0 ? (
                // Affichage des vrais dossiers
                folders.map((folder) => (
                  <div key={folder.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-8"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      {expandedFolders.includes(folder.id) ? (
                        <ChevronDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      <FolderOpen className="mr-2 h-4 w-4" />
                      <span className="flex-1 text-left">{folder.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {folder.documentCount}
                      </span>
                    </Button>
                    {expandedFolders.includes(folder.id) && (
                      <div className="ml-6 space-y-1">
                        {folder.recentDocuments.length > 0 ? (
                          folder.recentDocuments.map((doc) => (
                            <Button 
                              key={doc.id}
                              variant="ghost" 
                              className="w-full justify-start h-6 text-sm"
                            >
                              <FileText className="mr-2 h-3 w-3" />
                              <span className="truncate">{doc.title}</span>
                            </Button>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground px-2 py-1">
                            Aucun document
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // État vide
                <div className="text-center py-4">
                  <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Aucun dossier
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Statistiques rapides */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Statistiques
          </h2>
          <div className="space-y-2 px-4">
            {isLoading ? (
              // Skeleton pour le chargement
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))
            ) : (
              // Affichage des vraies statistiques
              <>
                <div className="flex justify-between text-sm">
                  <span>Fichiers</span>
                  <span className="font-medium">
                    {stats?.totalDocuments?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Espace utilisé</span>
                  <span className="font-medium">
                    {stats?.spaceUsed?.gb ? `${stats.spaceUsed.gb} GB` : '0 GB'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Dossiers</span>
                  <span className="font-medium">
                    {stats?.totalFolders?.toLocaleString() || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </ScrollArea>
    </div>
  )
}
