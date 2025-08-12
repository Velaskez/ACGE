'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import { FolderOpen, Plus, FileText, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react'

export default function FoldersPage() {
  const { folders, stats, isLoading, error, refresh } = useSidebarData()
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list')
  const [sortField, setSortField] = React.useState<'name' | 'updatedAt' | 'documentCount'>('updatedAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')

  const filteredFolders = React.useMemo(() => {
    const items = (folders || []).filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()))
    const getValue = (f: any) => {
      if (sortField === 'updatedAt') return new Date(f.updatedAt || 0).getTime()
      if (sortField === 'documentCount') return f.documentCount || 0
      return (f.name || '').toLowerCase()
    }
    items.sort((a, b) => {
      const av = getValue(a)
      const bv = getValue(b)
      if (sortOrder === 'asc') return av > bv ? 1 : av < bv ? -1 : 0
      return av < bv ? 1 : av > bv ? -1 : 0
    })
    return items
  }, [folders, query, sortField, sortOrder])

  const handleCreateFolder = async () => {
    if (!name.trim()) return
    try {
      setCreating(true)
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined })
      })
      if (res.ok) {
        setOpen(false)
        setName('')
        setDescription('')
        await refresh()
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dossiers</h1>
            <p className="text-muted-foreground">Gérez vos dossiers et accédez rapidement à vos documents</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refresh}>Rafraîchir</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau dossier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau dossier</DialogTitle>
                  <DialogDescription>Créez un dossier pour organiser vos documents.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="folder-name">Nom</Label>
                    <Input id="folder-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mon dossier" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-desc">Description (optionnel)</Label>
                    <Input id="folder-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>Annuler</Button>
                  <Button onClick={handleCreateFolder} disabled={!name.trim() || creating}>{creating ? 'Création...' : 'Créer'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barre de recherche (identique à la page des fichiers) */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher des dossiers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mode d'affichage */}
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>

              {/* Filtres / Tri */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSortField('name')}>
                  Nom
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSortField('updatedAt')}>
                  Modifié le
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSortField('documentCount')}>
                  Nb docs
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapides */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total dossiers</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalFolders ?? 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalDocuments ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liste des dossiers */}
        <Card>
          <CardHeader>
            <CardTitle>Mes dossiers</CardTitle>
            <CardDescription>Derniers dossiers mis à jour</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredFolders && filteredFolders.length > 0 ? (
              viewMode === 'list' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Récents</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFolders.map((folder) => (
                      <TableRow key={folder.id}>
                        <TableCell className="font-medium">{folder.name}</TableCell>
                        <TableCell>{folder.documentCount}</TableCell>
                        <TableCell>
                          {folder.recentDocuments && folder.recentDocuments.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {folder.recentDocuments.map((doc) => (
                                <span key={doc.id} className="text-xs text-muted-foreground">
                                  {doc.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Aucun document</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => (
                    <Card key={folder.id} className="hover:bg-accent/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">{folder.name}</CardTitle>
                        <CardDescription>{folder.documentCount} document(s)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {folder.recentDocuments && folder.recentDocuments.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {folder.recentDocuments.map((doc) => (
                              <span key={doc.id} className="text-xs text-muted-foreground">
                                {doc.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucun document récent</span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Aucun dossier</h3>
                <p className="mt-1 text-sm text-muted-foreground">Créez votre premier dossier pour organiser vos documents.</p>
                <div className="mt-4">
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau dossier
                  </Button>
                </div>
              </div>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-4">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


