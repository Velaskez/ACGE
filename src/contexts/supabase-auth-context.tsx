'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserData(session.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserData = async (authUser: any) => {
    try {
      // Récupérer le token d'accès
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('Aucun token d\'accès disponible')
        setUser(null)
        return
      }

      console.log('🔐 Chargement données utilisateur pour:', authUser.email)

      // Utiliser l'API spécifique pour récupérer l'utilisateur connecté
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        console.error('Erreur API auth/me:', response.status, response.statusText)
        setUser(null)
        return
      }

      const data = await response.json()
      if (!data.success || !data.user) {
        console.error('Erreur données API auth/me:', data)
        setUser(null)
        return
      }

      console.log('✅ Utilisateur chargé:', data.user.name, data.user.role)

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      })
    } catch (error) {
      console.error('Erreur loadUserData:', error)
      setUser(null)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Erreur connexion:', error)
        return false
      }

      if (data.user) {
        await loadUserData(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error('Erreur login:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Erreur logout:', error)
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error('Erreur récupération token:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      refreshUser,
      getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
