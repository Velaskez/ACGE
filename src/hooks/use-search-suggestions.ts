import { useState, useEffect, useCallback } from 'react'
import { SearchSuggestion } from '@/components/ui/search-suggestions'

interface UseSearchSuggestionsOptions {
  debounceMs?: number
  minQueryLength?: number
  maxSuggestions?: number
}

export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {}
) {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxSuggestions = 10
  } = options

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache pour éviter les requêtes répétées
  const cache = new Map<string, SearchSuggestion[]>()

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setSuggestions([])
      return
    }

    // Vérifier le cache
    if (cache.has(searchQuery)) {
      setSuggestions(cache.get(searchQuery)!.slice(0, maxSuggestions))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=${maxSuggestions}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions')
      }

      const data = await response.json()
      const newSuggestions = data.suggestions || []

      // Mettre en cache
      cache.set(searchQuery, newSuggestions)
      
      setSuggestions(newSuggestions.slice(0, maxSuggestions))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [minQueryLength, maxSuggestions])

  // Debouncing avec useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, debounceMs, fetchSuggestions])

  // Nettoyer le cache périodiquement pour éviter la surcharge mémoire
  useEffect(() => {
    const cleanupCache = () => {
      if (cache.size > 100) {
        const entries = Array.from(cache.entries())
        const toDelete = entries.slice(0, 50) // Supprimer les 50 plus anciens
        toDelete.forEach(([key]) => cache.delete(key))
      }
    }

    const interval = setInterval(cleanupCache, 60000) // Nettoyer toutes les minutes
    return () => clearInterval(interval)
  }, [])

  return {
    suggestions,
    isLoading,
    error,
    refetch: () => fetchSuggestions(query)
  }
}
