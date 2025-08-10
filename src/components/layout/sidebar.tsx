'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Home,
  FolderOpen,
  FileText,
  Users,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
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
    title: 'Mes documents',
    href: '/documents',
    icon: FileText,
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
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        {/* Navigation principale */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {mainNav.map((item) => (
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
              {/* TODO: Remplacer par les vrais dossiers */}
              {['Documents', 'Images', 'Vidéos', 'Musique'].map((folder, index) => (
                <div key={index}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-8"
                    onClick={() => toggleFolder(folder)}
                  >
                    {expandedFolders.includes(folder) ? (
                      <ChevronDown className="mr-2 h-4 w-4" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {folder}
                  </Button>
                  {expandedFolders.includes(folder) && (
                    <div className="ml-6 space-y-1">
                      <Button variant="ghost" className="w-full justify-start h-6 text-sm">
                        <FileText className="mr-2 h-3 w-3" />
                        Document 1.pdf
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-6 text-sm">
                        <FileText className="mr-2 h-3 w-3" />
                        Document 2.docx
                      </Button>
                    </div>
                  )}
                </div>
              ))}
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
            <div className="flex justify-between text-sm">
              <span>Documents</span>
              <span className="font-medium">1,234</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Espace utilisé</span>
              <span className="font-medium">2.5 GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Dossiers</span>
              <span className="font-medium">45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
