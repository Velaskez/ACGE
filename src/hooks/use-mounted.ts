import { useState, useEffect } from 'react'

/**
 * Hook pour s'assurer que le composant est monté côté client
 * Évite les problèmes d'hydratation en empêchant le rendu côté serveur
 * de différer du rendu côté client
 */
export function useMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
