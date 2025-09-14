'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { redirectByRole } from '@/lib/role-redirect'

export default function HomePage() {
  const { user, isLoading } = useSupabaseAuth()
  const router = useRouter()
  const isMounted = useMounted()

  useEffect(() => {
    if (!isMounted || isLoading) return // Attendre le montage et le chargement

    if (!user) {
      // Non authentifié, rediriger vers login
      router.push('/login')
    } else {
      // Authentifié, rediriger vers la page appropriée selon le rôle
      redirectByRole(user.role, router)
    }
  }, [user, isLoading, router, isMounted])

  // Ne rien afficher pendant l'hydratation ou le chargement
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-gray-600">Chargement...</p>
      </div>
    )
  }

  return null // Ne rien afficher car on redirige
}