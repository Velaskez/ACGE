'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search as SearchIcon, Folder as FolderIcon, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface FolderResult {
  id: string
  folderNumber: string
  name: string
  description?: string | null
  documentCount: number
  updatedAt: string
  author?: {
    id: string
    name?: string | null
  }
  recentDocuments?: Array<{
    id: string
    title: string
    fileName?: string
    fileType?: string
  }>
}

interface DocumentResult {
  id: string
  title: string
  description?: string | null
  updatedAt: string
  currentVersion?: {
    fileName: string
    fileType: string
  } | null
  author?: {
    name?: string | null
  } | null
  folderId?: string | null
}

export default function GlobalSearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = (searchParams.get('q') || '').trim()
  const [query, setQuery] = useState<string>(initialQuery)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [folders, setFolders] = useState<FolderResult[]>([])
  const [documents, setDocuments] = useState<DocumentResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Synchroniser l'input si l'URL change
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const q = initialQuery
    if (!q) {
      setFolders([])
      setDocuments([])
      return
    }

    setIsLoading(true)
    setError(null)

    const fetchResults = async () => {
      try {
        const [foldersRes, docsRes] = await Promise.all([
          fetch(`/api/folders/search?q=${encodeURIComponent(q)}`),
          fetch(`/api/documents?search=${encodeURIComponent(q)}&page=1&limit=20`),
        ])

        if (!foldersRes.ok) {
          const err = await foldersRes.json().catch(() => ({}))
          throw new Error(err.error || 'Erreur lors de la recherche de dossiers')
        }
        if (!docsRes.ok) {
          const err = await docsRes.json().catch(() => ({}))
          throw new Error(err.error || 'Erreur lors de la recherche de documents')
        }

        const foldersData = await foldersRes.json()
        const docsData = await docsRes.json()

        setFolders(Array.isArray(foldersData.folders) ? foldersData.folders : [])
        setDocuments(Array.isArray(docsData.documents) ? docsData.documents : [])
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [initialQuery])

  const totalCount = useMemo(() => folders.length + documents.length, [folders.length, documents.length])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  // Navigation clavier/Enter dans les listes
  const [focusedList, setFocusedList] = useState<'folders' | 'documents' | null>(null)
  const [folderIndex, setFolderIndex] = useState<number>(-1)
  const [docIndex, setDocIndex] = useState<number>(-1)

  const onKeyDownList = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const list = focusedList || 'folders'
      const isDown = e.key === 'ArrowDown'
      if (list === 'folders' && folders.length > 0) {
        setFocusedList('folders')
        setFolderIndex((idx) => {
          const next = isDown ? (idx + 1) % folders.length : (idx - 1 + folders.length) % folders.length
          return next
        })
      } else if (list === 'documents' && documents.length > 0) {
        setFocusedList('documents')
        setDocIndex((idx) => {
          const next = isDown ? (idx + 1) % documents.length : (idx - 1 + documents.length) % documents.length
          return next
        })
      }
    } else if (e.key === 'Tab') {
      // basculer entre listes
      const next = focusedList === 'folders' ? 'documents' : 'folders'
      setFocusedList(next)
      if (next === 'folders' && folders.length > 0) setFolderIndex((i) => (i >= 0 ? i : 0))
      if (next === 'documents' && documents.length > 0) setDocIndex((i) => (i >= 0 ? i : 0))
    } else if (e.key === 'Enter') {
      if (focusedList === 'folders' && folderIndex >= 0 && folders[folderIndex]) {
        const f = folders[folderIndex]
        router.push(`/folders/${f.id}`)
      } else if (focusedList === 'documents' && docIndex >= 0 && documents[docIndex]) {
        const d = documents[docIndex]
        if (d.folderId) router.push(`/folders/${d.folderId}`)
      }
    }
  }, [focusedList, folders, documents, folderIndex, docIndex, router])

  return (
    <div className="px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Recherche globale
            {initialQuery && (
              <span className="text-muted-foreground font-normal text-sm">“{initialQuery}”</span>
            )}
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-auto">{totalCount} résultat{totalCount > 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un dossier ou un document..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="py-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card onKeyDown={onKeyDownList} tabIndex={0}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderIcon className="h-5 w-5" />
              Dossiers
              <Badge variant="outline" className="ml-2">{folders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : folders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun dossier trouvé.</p>
            ) : (
              <ul className="divide-y">
                {folders.map((f, idx) => (
                  <li key={f.id} className={`py-3 ${focusedList === 'folders' && folderIndex === idx ? 'bg-accent/40' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{f.folderNumber}</Badge>
                          <Link href={`/folders/${f.id}`} className="font-medium hover:underline truncate">
                            {f.name}
                          </Link>
                        </div>
                        {f.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{f.description}</p>
                        )}
                        {f.recentDocuments && f.recentDocuments.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Docs récents: {f.recentDocuments.slice(0, 3).map(d => d.title).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline">{f.documentCount} docs</Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/folders/${f.id}`}>Ouvrir</Link>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card onKeyDown={onKeyDownList} tabIndex={0}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
              <Badge variant="outline" className="ml-2">{documents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun document trouvé.</p>
            ) : (
              <ul className="divide-y">
                {documents.map((d, idx) => (
                  <li key={d.id} className={`py-3 ${focusedList === 'documents' && docIndex === idx ? 'bg-accent/40' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{d.currentVersion?.fileType || 'doc'}</Badge>
                          <span className="font-medium truncate">
                            {d.title || d.currentVersion?.fileName || 'Sans titre'}
                          </span>
                        </div>
                        {d.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{d.description}</p>
                        )}
                        {d.currentVersion?.fileName && (
                          <div className="mt-1 text-xs text-muted-foreground">Fichier: {d.currentVersion.fileName}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {d.folderId ? (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/folders/${d.folderId}`}>Voir le dossier</Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />
      <div className="text-xs text-muted-foreground">Astuce: utilisez la barre en haut pour lancer rapidement une nouvelle recherche.</div>
    </div>
  )
}


