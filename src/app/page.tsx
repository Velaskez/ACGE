'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthSessionProvider } from '@/components/providers/session-provider'

function HomePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // En cours de chargement

    if (!session) {
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Affichage de chargement pendant la vérification
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return null // Redirection en cours
}

export default function HomePage() {
  return (
    <AuthSessionProvider>
      <HomePageContent />
    </AuthSessionProvider>
  )
}
