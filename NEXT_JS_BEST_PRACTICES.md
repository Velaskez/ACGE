# 🚀 Next.js 15 - Bonnes Pratiques pour Éviter les Erreurs d'Hydratation

## 📋 Principes Fondamentaux

### 1. **Séparation Server vs Client Components**

#### ✅ Server Components (par défaut)
```tsx
// ✅ Bon : Composant serveur pur
export default function ServerComponent() {
  return <div>Contenu statique</div>
}
```

#### ✅ Client Components (avec 'use client')
```tsx
// ✅ Bon : Composant client avec directive
'use client'

import { useState } from 'react'

export default function ClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 2. **Éviter les Différences Server/Client**

#### ❌ Problématique
```tsx
// ❌ Mauvais : Différence entre serveur et client
export default function BadComponent() {
  const timestamp = Date.now() // Différent à chaque rendu
  return <div>{timestamp}</div>
}
```

#### ✅ Solution
```tsx
// ✅ Bon : Éviter le rendu côté serveur
'use client'

import { useMounted } from '@/hooks/use-mounted'

export default function GoodComponent() {
  const isMounted = useMounted()
  
  if (!isMounted) return <div>Chargement...</div>
  
  const timestamp = Date.now()
  return <div>{timestamp}</div>
}
```

### 3. **Gestion des Providers**

#### ❌ Problématique
```tsx
// ❌ Mauvais : Provider client dans layout serveur
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider> {/* Erreur d'hydratation */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### ✅ Solution
```tsx
// ✅ Bon : Wrapper client séparé
import { ClientProviders } from '@/components/providers/client-providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

// providers/client-providers.tsx
'use client'
export function ClientProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
```

## 🛠️ Outils et Hooks Utiles

### 1. **Hook useMounted**
```tsx
// hooks/use-mounted.ts
import { useState, useEffect } from 'react'

export function useMounted() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  return isMounted
}
```

### 2. **Composant NoSSR**
```tsx
// components/common/no-ssr.tsx
'use client'

export function NoSSR({ children, fallback = null }) {
  const isMounted = useMounted()
  return isMounted ? <>{children}</> : <>{fallback}</>
}
```

## 🔍 Cas d'Usage Spécifiques

### 1. **Authentification et Redirection**
```tsx
'use client'

export default function ProtectedPage() {
  const { user, isLoading } = useAuth()
  const isMounted = useMounted()
  const router = useRouter()

  useEffect(() => {
    if (!isMounted || isLoading) return
    
    if (!user) {
      router.push('/login')
    }
  }, [user, isLoading, isMounted, router])

  if (!isMounted || isLoading) {
    return <div>Chargement...</div>
  }

  return <div>Contenu protégé</div>
}
```

### 2. **État Local avec Effects**
```tsx
'use client'

export default function ComponentWithEffect() {
  const [data, setData] = useState(null)
  const isMounted = useMounted()

  useEffect(() => {
    if (!isMounted) return
    
    // Effet seulement côté client
    fetchData().then(setData)
  }, [isMounted])

  if (!isMounted) {
    return <div>Chargement...</div>
  }

  return <div>{data}</div>
}
```

### 3. **Composants Conditionnels**
```tsx
'use client'

export default function ConditionalComponent() {
  const isMounted = useMounted()
  const [showContent, setShowContent] = useState(false)

  if (!isMounted) {
    return <div>Chargement...</div>
  }

  return (
    <div>
      <button onClick={() => setShowContent(!showContent)}>
        Toggle
      </button>
      {showContent && <div>Contenu conditionnel</div>}
    </div>
  )
}
```

## ⚠️ Erreurs Courantes à Éviter

### 1. **IDs Dynamiques**
```tsx
// ❌ Mauvais
const id = Math.random().toString()

// ✅ Bon
const [id, setId] = useState('')
useEffect(() => {
  setId(Math.random().toString())
}, [])
```

### 2. **Date/Time**
```tsx
// ❌ Mauvais
const now = new Date().toLocaleString()

// ✅ Bon
const [now, setNow] = useState('')
useEffect(() => {
  setNow(new Date().toLocaleString())
}, [])
```

### 3. **LocalStorage/SessionStorage**
```tsx
// ❌ Mauvais
const theme = localStorage.getItem('theme')

// ✅ Bon
const [theme, setTheme] = useState('')
useEffect(() => {
  setTheme(localStorage.getItem('theme') || 'light')
}, [])
```

## 📈 Diagnostic des Erreurs

### Messages d'erreur typiques :
- "A tree hydrated but some attributes..."
- "Text content does not match server-rendered HTML"
- "Cannot read properties of null"

### Solutions :
1. Utiliser `useMounted()` hook
2. Envelopper avec `NoSSR` component
3. Séparer les composants serveur/client
4. Éviter les données dynamiques côté serveur

## ✅ Checklist

- [ ] Tous les providers sont dans des composants clients
- [ ] Les composants avec état utilisent `useMounted()`
- [ ] Pas de données dynamiques (Date, Math.random) côté serveur
- [ ] Pas d'accès à window/localStorage côté serveur
- [ ] Les redirections sont conditionnelles au montage
- [ ] Les effects critiques attendent le montage

---

**💡 Astuce** : En cas de doute, utilisez `NoSSR` pour forcer le rendu côté client uniquement.
