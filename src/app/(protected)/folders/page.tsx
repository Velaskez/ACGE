'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FolderOpen, 
  Plus, 
  Search,
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  User,
  Grid,
  List,
  Hash,
  RefreshCw
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useFoldersData } from '@/hooks/use-folders-data'
import { FolderEditModal } from '@/components/folders/folder-edit-modal'

type ViewMode = 'grid' | 'list'

export default function FoldersPage() {
  const router = useRouter()
  const { 
    folders, 
    filteredFolders, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery,
    createFolder, 
    updateFolder,
    deleteFolder, 
    refreshData 
  } = useFoldersData()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // États pour la modal de création
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // États pour la modal d'édition
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<any>(null)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setIsCreating(true)
    try {
      const success = await createFolder({
        name: newFolderName,
        description: newFolderDescription
      })
      
      if (success) {
        setNewFolderName('')
        setNewFolderDescription('')
        setShowCreateDialog(false)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleFolderClick = (folderId: string) => {
    router.push(`/folders/${folderId}`)
  }

  const handleDeleteFolder = async (folder: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le dossier "${folder.name}" ?`)) {
      return
    }

    await deleteFolder(folder.id)
  }

  const handleEditFolder = (folder: any) => {
    setEditingFolder(folder)
    setShowEditDialog(true)
  }

  const handleUpdateFolder = async (updatedFolder: { id: string; name: string; description?: string }) => {
    try {
      await updateFolder(updatedFolder)
      return true
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      return false
    }
  }

  const resetForm = () => {
    setNewFolderName('')
    setNewFolderDescription('')
  }

  const openCreateDialog = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  // Rendu conditionnel pour l'état d'erreur
  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FolderOpen className="w-8 h-8" />
                Mes Dossiers
              </h1>
              <p className="text-muted-foreground">
                Organisez vos documents dans des dossiers
              </p>
            </div>
            <Button onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FolderOpen className="w-8 h-8" />
              Mes Dossiers
            </h1>
            <p className="text-muted-foreground">
              {isLoading 
                ? "Chargement..." 
                : filteredFolders.length !== folders.length
                  ? `${filteredFolders.length} sur ${folders.length} dossier${folders.length > 1 ? 's' : ''}`
                  : `${folders.length} dossier${folders.length > 1 ? 's' : ''} • Organisez vos documents`
              }
            </p>
          </div>
        
          <div className="flex items-center gap-2">
            {/* Bouton refresh */}
            {error && (
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            )}

            {/* Sélecteur de vue */}
            <div className="flex items-center rounded-lg border p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Dialog de création */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau dossier
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
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, N° ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contenu principal */}
        {isLoading ? (
          // États de chargement
          viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        ) : filteredFolders.length > 0 ? (
          // Affichage des dossiers
          viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFolders.map((folder) => (
                <Card 
                  key={folder.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <Badge variant="outline" className="text-xs">
                          <Hash className="w-3 h-3 mr-1" />
                          {folder.folderNumber}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">
                          {folder.name}
                        </CardTitle>
                        {folder.description && (
                          <CardDescription className="text-sm line-clamp-2">
                            {folder.description}
                          </CardDescription>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleFolderClick(folder.id)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ouvrir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleEditFolder(folder)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleDeleteFolder(folder, e)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {folder.documentCount} document{folder.documentCount > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatRelativeTime(folder.updatedAt)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {folder.author.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Vue liste
            <Card>
              <CardHeader>
                <CardTitle>Liste des dossiers</CardTitle>
                <CardDescription>
                  {filteredFolders.length} dossier{filteredFolders.length > 1 ? 's' : ''} au total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° / Nom</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Dernière modification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFolders.map((folder) => (
                      <TableRow 
                        key={folder.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleFolderClick(folder.id)}
                      >
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {folder.folderNumber}
                              </Badge>
                              <span className="font-medium">{folder.name}</span>
                            </div>
                            {folder.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {folder.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                            {folder.documentCount}
                          </div>
                        </TableCell>
                        <TableCell>{folder.author.name}</TableCell>
                        <TableCell>{formatRelativeTime(folder.updatedAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                handleFolderClick(folder.id)
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ouvrir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation()
                                handleEditFolder(folder)
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteFolder(folder, e)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        ) : (
          // État vide
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchQuery ? 'Aucun dossier trouvé' : 'Aucun dossier'}
            </h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery 
                ? `Aucun dossier ne correspond à "${searchQuery}"`
                : 'Créez votre premier dossier pour organiser vos documents'
              }
            </p>
            {!searchQuery && (
              <Button 
                className="mt-4" 
                onClick={openCreateDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un dossier
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal d'édition de dossier */}
      <FolderEditModal
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        folder={editingFolder}
        onSave={handleUpdateFolder}
      />
    </MainLayout>
  )
}