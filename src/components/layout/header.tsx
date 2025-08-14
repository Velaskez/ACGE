'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Search, Settings, LogOut, User, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'

export function Header({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Rediriger vers la page documents avec la recherche
      window.location.href = `/documents?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="relative flex h-16 items-center px-2 sm:px-4">
        {/* Logo */}
        <div className={`flex items-center gap-2 sm:gap-4 ${searchOpen ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : ''}` }>
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => onOpenMenu?.()}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3">
            <Image
              src="/TrésorPublicGabon.jpg"
              alt="Trésor Public Gabon"
              width={40}
              height={40}
              className="rounded-lg object-contain shadow-sm sm:w-12 sm:h-12"
            />
            <h1 className="text-lg sm:text-xl font-semibold text-primary">ACGE</h1>
          </div>
        </div>

        {/* Barre de recherche centrée (desktop) */}
        <div className="pointer-events-auto hidden sm:block absolute left-1/2 -translate-x-1/2 w-full max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Actions */}
        <div className={`ml-auto flex items-center gap-2 sm:gap-4 ${searchOpen ? 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : ''}` }>
          {/* Recherche (mobile) alignée à droite */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </Button>
          {/* Notifications */}
          <NotificationDropdown />

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
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
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

        {/* Barre de recherche mobile intégrée au header */}
        {searchOpen && (
          <div className="sm:hidden absolute inset-x-2 z-10">
            <form
              onSubmit={(e) => {
                handleSearch(e)
                setSearchOpen(false)
              }}
              className="relative"
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                type="search"
                placeholder="Rechercher..."
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1.5 h-7 w-7"
                onClick={() => setSearchOpen(false)}
                aria-label="Fermer la recherche"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}