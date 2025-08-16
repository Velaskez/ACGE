'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { useSessionTimeout } from '@/hooks/use-session-timeout'
import { SessionWarning } from '@/components/ui/session-warning'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  // Utiliser le hook de déconnexion automatique (qui gère lui-même les paramètres)
  const { getTimeUntilExpiration, extendSession, sessionTimeout } = useSessionTimeout({
    enabled: true
  })

  const handleExtendSession = () => {
    extendSession()
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onOpenMenu={() => setSidebarOpen(true)} />

      {/* Mobile sidebar controlled by header button */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent 
          side="left" 
          className="w-[280px] max-w-[90vw] p-0 sm:w-[320px]"
        >
          <Sidebar className="border-r-0" inSheet />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar - responsive width */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content - responsive margin */}
      <main className="pt-16 min-h-screen transition-all duration-200 md:ml-64 lg:ml-72 xl:ml-80">
        <div className="p-3 w-full sm:p-6">
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Avertissement d'expiration de session */}
      <SessionWarning
        timeUntilExpiration={getTimeUntilExpiration()}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
        warningThreshold={60} // Avertir 60 secondes avant expiration
      />
    </div>
  )
}
