'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Synchroniser avec la session NextAuth, puis fallback serveur via /api/auth/me
  useEffect(() => {
    // Si NextAuth fournit un user, on le prend
    if (session?.user?.id) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      })
      setIsInitialized(true)
      return
    }

    // Fallback: requête /api/auth/me
    const timer = setTimeout(() => {
      checkAuth()
    }, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, session?.user?.email, session?.user?.name, session?.user?.role, status])

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      setUser(null)
      return false
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      setUser(null)
      return false
    } finally {
      setIsInitialized(true)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      })
      return await checkAuth()
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      // NextAuth signOut
      await nextAuthSignOut({ redirect: false })
      // Nettoyer aussi l'ancien cookie côté serveur (no-op si absent)
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const isLoading = useMemo(() => status === 'loading' && !isInitialized, [status, isInitialized])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
