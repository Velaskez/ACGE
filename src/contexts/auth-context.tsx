'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Vérifier l'authentification au chargement avec un délai pour éviter l'hydratation
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth()
    }, 100) // Délai de 100ms au lieu de 0
    return () => clearTimeout(timer)
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Vérification de l\'authentification...')
      
      // Vérifier si on est côté client
      if (typeof window === 'undefined') {
        console.log('🖥️ Côté serveur, pas de vérification d\'auth')
        setIsLoading(false)
        setIsInitialized(true)
        return
      }
      
      // Vérifier si le navigateur est prêt
      if (document.readyState !== 'complete') {
        console.log('📄 Document pas encore prêt, attente...')
        setTimeout(checkAuth, 50)
        return
      }
      
      // Utiliser un timeout pour éviter les blocages
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 secondes de timeout
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      clearTimeout(timeoutId)
      console.log('📡 Status checkAuth:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données utilisateur reçues:', data)
        if (data.user) {
          setUser(data.user)
          console.log('👤 Utilisateur défini:', data.user.email)
        } else {
          console.log('❌ Pas de données utilisateur dans la réponse')
          setUser(null)
        }
      } else if (response.status === 401) {
        console.log('🔒 Non authentifié (401) - normal au chargement')
        setUser(null)
      } else {
        const text = await response.text()
        console.log('❌ Erreur HTTP:', response.status, text.slice(0, 200))
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error)
      
      // Gérer spécifiquement les erreurs de timeout et de réseau
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏰ Timeout lors de la vérification d\'auth')
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('🌐 Erreur réseau - serveur peut-être indisponible')
        
        // Retry après un délai si c'est une erreur réseau
        setTimeout(() => {
          console.log('🔄 Retry de la vérification d\'auth...')
          checkAuth()
        }, 1000)
        return
      }
      
      // En cas d'erreur réseau, on considère qu'il n'y a pas d'authentification
      setUser(null)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 Tentative de connexion pour:', email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      console.log('📡 Status login:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Réponse login:', data)
        if (data.success && data.user) {
          setUser(data.user)
          console.log('👤 Utilisateur connecté:', data.user.email)
          return true
        }
      } else {
        const errorText = await response.text()
        console.log('❌ Erreur login (texte):', errorText.slice(0, 200))
      }

      return false
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Tentative de déconnexion...')
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      
      console.log('📡 Status logout:', response.status)
      
      if (response.ok) {
        setUser(null)
        console.log('✅ Utilisateur déconnecté')
        router.push('/login')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
    }
  }

  const refreshUser = async () => {
    try {
      console.log('🔄 Rafraîchissement des données utilisateur...')
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      })
      console.log('📡 Status refreshUser:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données utilisateur rafraîchies:', data)
        if (data.user) {
          setUser(data.user)
          console.log('👤 Utilisateur mis à jour:', data.user.email)
        }
      } else {
        console.log('❌ Erreur lors du rafraîchissement')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des données utilisateur:', error)
      setUser(null)
    }
  }

  // Mémoriser les valeurs pour éviter les re-renders inutiles
  const value = React.useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    refreshUser
  }), [user, isLoading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
