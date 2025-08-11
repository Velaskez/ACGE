'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FolderOpen, FileText, Calendar, User, ArrowLeft, Hash, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DocumentEditModal } from '@/components/documents/document-edit-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FolderDocumentItem {
  id: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  updatedAt: string
}

interface FolderDetail {
  id: string
  folderNumber: string
  name: string
  description?: string | null
  documentCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
  }
  documents: FolderDocumentItem[]
}

export default function FolderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const folderId = params?.id

  const [folder, setFolder] = useState<FolderDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [movingDocId, setMovingDocId] = useState<string | null>(null)
  const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined)
  const [isMoving, setIsMoving] = useState(false)
  const [moveError, setMoveError] = useState<string>('')

  // Édition de document
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState<any | null>(null)
  const [editLoadError, setEditLoadError] = useState<string>('')

  // Suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string>('')

  useEffect(() => {
    let isMounted = true

    async function fetchFolder() {
      if (!folderId) return
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/folders/${folderId}`, { cache: 'no-store' })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || 'Erreur lors du chargement du dossier')
        }
        const data = (await res.json()) as { folder: FolderDetail }
        if (isMounted) setFolder(data.folder)
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Erreur inconnue')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchFolder()
    const onChange = () => fetchFolder()
    window.addEventListener('data:documents-changed', onChange)
    return () => {
      isMounted = false
      window.removeEventListener('data:documents-changed', onChange)
    }
  }, [folderId])

  const refreshFolder = async () => {
    if (!folderId) return
    try {
      const res = await fetch(`/api/folders/${folderId}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { folder: FolderDetail }
      setFolder(data.folder)
    } catch {}
  }

  const openMoveDialog = (docId: string) => {
    setMovingDocId(docId)
    setMoveError('')
    setTargetFolderId(folderId) // pré-sélectionner le dossier courant
    setShowMoveDialog(true)
  }

  const openEditDialog = async (docId: string) => {
    setEditLoadError('')
    try {
      const res = await fetch(`/api/documents/${docId}`, { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Erreur lors du chargement du document')
      }
      const data = await res.json()
      setEditingDocument(data.document)
      setShowEditModal(true)
    } catch (e: any) {
      setEditLoadError(e?.message || 'Erreur inconnue')
    }
  }

  const openDeleteDialog = (docId: string) => {
    setDeletingDocId(docId)
    setDeleteError('')
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingDocId) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/documents/${deletingDocId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        throw new Error((data as any)?.error || 'Échec de la suppression')
      }
      try { window.dispatchEvent(new CustomEvent('data:documents-changed')) } catch {}
      await refreshFolder()
      setShowDeleteDialog(false)
      setDeletingDocId(null)
    } catch (e: any) {
      setDeleteError(e?.message || 'Erreur inconnue')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMove = async () => {
    if (!movingDocId) return
    setIsMoving(true)
    setMoveError('')
    try {
      const res = await fetch(`/api/documents/${movingDocId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetFolderId })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Échec du déplacement')
      }
      await refreshFolder()
      setShowMoveDialog(false)
    } catch (e: any) {
      setMoveError(e?.message || 'Erreur inconnue')
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/folders')}> 
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <FolderOpen className="w-7 h-7" />
              Dossier
            </h1>
          </div>
          {folderId && (
            <Button onClick={() => router.push(`/upload?folderId=${folderId}`)}>
              Ajouter fichier
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Chargement…</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : folder ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <Hash className="w-3 h-3 mr-1" />
                  {folder.folderNumber}
                </Badge>
                <h2 className="text-xl sm:text-2xl font-semibold">{folder.name}</h2>
              </div>
              {folder.description && (
                <p className="text-muted-foreground">{folder.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{folder.documentCount || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Dernière modification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-base">{formatRelativeTime(folder.updatedAt)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" /> Propriétaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-base">{folder.author?.name || '—'}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  {folder.documentCount > 0
                    ? `${folder.documentCount} document${folder.documentCount > 1 ? 's' : ''}`
                    : 'Aucun document'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {folder.documents.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun document dans ce dossier.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Nom du fichier</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Taille</TableHead>
                        <TableHead>Modifié</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {folder.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.title || 'Sans titre'}
                          </TableCell>
                          <TableCell>{doc.fileName || '—'}</TableCell>
                          <TableCell>{doc.fileType || '—'}</TableCell>
                          <TableCell>{formatFileSize(doc.fileSize || 0)}</TableCell>
                          <TableCell>{formatRelativeTime(doc.updatedAt)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => openMoveDialog(doc.id)}>
                              Déplacer
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="ml-2"
                              onClick={() => openEditDialog(doc.id)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="ml-2"
                              onClick={() => openDeleteDialog(doc.id)}
                              disabled={isDeleting && deletingDocId === doc.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Dialog de déplacement */}
            <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Déplacer le document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">Sélectionnez le dossier de destination.</p>
                  <FolderPicker value={targetFolderId} onChange={setTargetFolderId} />
                  {moveError && (
                    <Alert variant="destructive"><AlertDescription>{moveError}</AlertDescription></Alert>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowMoveDialog(false)} disabled={isMoving}>Annuler</Button>
                    <Button onClick={handleMove} disabled={isMoving}>
                      {isMoving ? 'Déplacement…' : 'Déplacer'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal d'édition de document */}
            {showEditModal && editingDocument && (
              <DocumentEditModal
                document={editingDocument}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={async () => {
                  setShowEditModal(false)
                  setEditingDocument(null)
                  await refreshFolder()
                }}
              />
            )}

            {/* Confirmation de suppression */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est définitive et supprimera le fichier et ses versions. Cette opération ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{deleteError}</AlertDescription>
                  </Alert>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Suppression…' : 'Supprimer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Alert>
            <AlertDescription>Le dossier demandé est introuvable.</AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}

function FolderPicker({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  const [folders, setFolders] = useState<Array<{ id: string; name: string; folderNumber: string }>>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/folders', { cache: 'no-store' })
        if (!res.ok) throw new Error('Erreur de chargement des dossiers')
        const data = await res.json()
        if (!mounted) return
        const opts = (data.folders || []).map((f: any) => ({ id: f.id, name: f.name, folderNumber: f.folderNumber }))
        setFolders(opts)
      } catch (e: any) {
        setError(e?.message || 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-2">
      <Select value={value || 'root'} onValueChange={(v) => onChange(v === 'root' ? undefined : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Choisir un dossier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="root">Racine (aucun dossier)</SelectItem>
          {folders.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name} ({f.folderNumber})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <p className="text-xs text-muted-foreground">Chargement…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}


