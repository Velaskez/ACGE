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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setIsCreating(true)
    try {
      // TODO: Appeler l'API pour créer le dossier
      console.log('Création du dossier:', { 
        name: newFolderName, 
        description: newFolderDescription 
      })
      
      // Simuler la création pour l'instant
      setNewFolderName('')
      setNewFolderDescription('')
      setShowCreateDialog(false)
      
      // TODO: Rafraîchir la liste des dossiers
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
    } finally {
      setIsCreating(false)
    }
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
    <div className={cn('fixed left-0 top-16 bottom-0 z-40 w-64 bg-background border-r flex flex-col max-h-screen', className)}>
      <ScrollArea className="flex-1">
        <div className="space-y-3 py-3 px-2">
        {/* Navigation principale */}
        <div className="px-1 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {filteredNav.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-sm min-w-0"
                  size="sm"
                >
                  <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Dossiers récents */}
        <div className="px-1 py-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-lg font-semibold tracking-tight truncate">
              Dossiers récents
            </h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau dossier</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="folder-name" className="text-right">
                      Nom
                    </Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="col-span-3"
                      placeholder="Nom du dossier"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="folder-description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="folder-description"
                      value={newFolderDescription}
                      onChange={(e) => setNewFolderDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Description (optionnel)"
                      disabled={isCreating}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={isCreating}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || isCreating}
                  >
                    {isCreating ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
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
                      className="w-full justify-start h-8 text-sm min-w-0"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      {expandedFolders.includes(folder.id) ? (
                        <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />
                      )}
                      <FolderOpen className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 min-w-0 text-left truncate">{folder.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
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
                              className="w-full justify-start h-6 text-sm min-w-0"
                            >
                              <FileText className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span className="flex-1 min-w-0 truncate">{doc.title}</span>
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
          </div>
        </div>

        <Separator />

        {/* Statistiques rapides */}
        <div className="px-1 py-2 flex-shrink-0">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Statistiques
          </h2>
          <div className="space-y-2 px-2">
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
      </ScrollArea>
    </div>
  )
}
