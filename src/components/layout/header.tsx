 'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Search, Bell, Settings, LogOut, User } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Header() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const [suggestions, setSuggestions] = useState<Array<{ id: string; type: 'folder' | 'document'; label: string; subLabel?: string; url: string }>>([])
  const formRef = useRef<HTMLFormElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    if (isSuggestOpen && highlightIndex >= 0 && suggestions[highlightIndex]) {
      router.push(suggestions[highlightIndex].url)
      setIsSuggestOpen(false)
      return
    }
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const closeSuggestions = useCallback(() => {
    setIsSuggestOpen(false)
    setHighlightIndex(-1)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!formRef.current) return
      if (!formRef.current.contains(e.target as Node)) {
        closeSuggestions()
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [closeSuggestions])

  useEffect(() => {
    const q = searchQuery.trim()
    if (abortRef.current) abortRef.current.abort()
    if (q.length < 2) {
      setSuggestions([])
      setIsSuggestOpen(false)
      setHighlightIndex(-1)
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(async () => {
      try {
        const [foldersRes, docsRes] = await Promise.all([
          fetch(`/api/folders/search?q=${encodeURIComponent(q)}`, { signal: controller.signal }),
          fetch(`/api/documents?search=${encodeURIComponent(q)}&page=1&limit=5`, { signal: controller.signal }),
        ])
        if (!foldersRes.ok && !docsRes.ok) throw new Error('Erreur de recherche')
        const foldersData = foldersRes.ok ? await foldersRes.json() : { folders: [] }
        const docsData = docsRes.ok ? await docsRes.json() : { documents: [] }
        const list: Array<{ id: string; type: 'folder' | 'document'; label: string; subLabel?: string; url: string }> = []
        for (const f of (foldersData.folders || []).slice(0, 5)) {
          list.push({ id: f.id, type: 'folder', label: f.name, subLabel: `Dossier • ${f.folderNumber}`, url: `/folders/${f.id}` })
        }
        for (const d of (docsData.documents || []).slice(0, 5)) {
          const title = d.title || d.currentVersion?.fileName || 'Sans titre'
          list.push({ id: d.id, type: 'document', label: title, subLabel: 'Document', url: d.folderId ? `/folders/${d.folderId}` : '/documents' })
        }
        setSuggestions(list)
        setIsSuggestOpen(list.length > 0)
        setHighlightIndex(list.length > 0 ? 0 : -1)
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return
        setSuggestions([])
        setIsSuggestOpen(false)
        setHighlightIndex(-1)
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((idx) => (idx + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      // Handled by form submit
    } else if (e.key === 'Escape') {
      closeSuggestions()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="flex h-16 items-center px-4 max-w-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Image
              src="/TrésorPublicGabon.jpg"
              alt="Trésor Public Gabon"
              width={48}
              height={48}
              className="rounded-lg object-contain shadow-sm"
            />
            <h1 className="text-xl font-semibold text-[#134074] hidden sm:block">ACGE</h1>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex-1 max-w-sm mx-4 hidden sm:block">
          <form ref={formRef} onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
            />
            {isSuggestOpen && suggestions.length > 0 && (
              <div
                className="absolute mt-1 w-full z-50"
                role="listbox"
                aria-label="Suggestions de recherche"
              >
                <Card className="shadow-lg">
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-72">
                      <ul className="py-1">
                        {suggestions.map((s, idx) => (
                          <li key={`${s.type}-${s.id}`}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={idx === highlightIndex}
                              className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground ${idx === highlightIndex ? 'bg-accent text-accent-foreground' : ''}`}
                              onMouseEnter={() => setHighlightIndex(idx)}
                              onClick={() => {
                                router.push(s.url)
                                closeSuggestions()
                              }}
                            >
                              <div className="text-sm font-medium truncate">{s.label}</div>
                              {s.subLabel && (
                                <div className="text-xs text-muted-foreground truncate">{s.subLabel}</div>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Menu utilisateur */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.name || ''} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}