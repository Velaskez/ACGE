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
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 Vérification de l\'authentification...')
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      console.log('📡 Status checkAuth:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données utilisateur reçues:', data)
        if (data.user) {
          setUser(data.user)
          console.log('👤 Utilisateur défini:', data.user.email)
        }
      } else {
        console.log('❌ Non authentifié ou erreur')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error)
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
        const errorData = await response.json()
        console.log('❌ Erreur login:', errorData)
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
        credentials: 'include'
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
