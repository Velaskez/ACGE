'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Header } from './header'
import { Sidebar } from './sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-20 left-2 z-50 bg-background/80 backdrop-blur-sm border"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
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
    </div>
  )
}
