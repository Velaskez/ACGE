// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { handlers } from '@/lib/auth'

// Fonction requise pour l'export statique

// Fonction requise pour l'export statique
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}
    { nextauth: ['signout'] },
    { nextauth: ['callback'] },
    { nextauth: ['session'] },
    { nextauth: ['csrf'] },
  ]
}

export const { GET, POST } = handlers
