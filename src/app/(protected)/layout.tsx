'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useMounted } from '@/hooks/use-mounted'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useSupabaseAuth()
  const router = useRouter()
  const isMounted = useMounted()

  useEffect(() => {
    if (!isMounted || isLoading) return
    
    if (!user) {
      router.push('/login')
    }
  }, [user, isLoading, router, isMounted])

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}