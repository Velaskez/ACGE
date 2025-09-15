'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  isLoading: boolean
  onComplete?: () => void
}

export function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onComplete?.()
          }, 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading, onComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo avec effet glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-4 glassmorphism-subtle rounded-full group-hover:glassmorphism transition-all duration-1000"></div>
          <div className="relative">
            <Image
              src="/logo-tresor-public.svg"
              alt="Logo Trésor Public"
              width={100}
              height={100}
              className="animate-pulse drop-shadow-lg"
            />
          </div>
        </div>

        {/* Animation de points élégante */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Texte avec animation de typewriter */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-1 animate-fade-in">
            ACGE
          </h2>
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Agence Comptable des Grandes Écoles
          </p>
        </div>

        {/* Barre de progression minimaliste */}
        <div className="w-48 h-0.5 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
