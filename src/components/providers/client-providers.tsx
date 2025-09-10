'use client'

import { SupabaseAuthProvider } from '@/contexts/supabase-auth-context'
import { ModalProvider } from '@/contexts/modal-context'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </SupabaseAuthProvider>
  )
}
