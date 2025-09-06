'use client'

import { AuthProvider } from '@/contexts/auth-context'
import { ModalProvider } from '@/contexts/modal-context'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </AuthProvider>
  )
}
