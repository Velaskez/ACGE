'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Users, 
  FolderOpen, 
  FileText, 
  Bell,
  Activity,
  BarChart3,
  Settings,
  Upload,
  Search,
  Shield,
  Globe
} from 'lucide-react'

interface ApiTestResult {
  endpoint: string
  status: 'pending' | 'success' | 'error'
  response?: any
  error?: string
  duration?: number
}

interface ApiEndpoint {
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  icon: React.ReactNode
  category: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Authentification
  {
    name: 'Health Check',
    path: '/api/health',
    method: 'GET',
    description: 'Vérification de l\'état du serveur',
    icon: <Globe className="h-4 w-4" />,
    category: 'Système'
  },
  {
    name: 'Check Schema',
    path: '/api/check-schema',
    method: 'GET',
    description: 'Vérification du schéma et des politiques RLS',
    icon: <Database className="h-4 w-4" />,
    category: 'Système'
  },
  {
    name: 'Test Users',
    path: '/api/test-users',
    method: 'GET',
    description: 'Test de récupération des utilisateurs',
    icon: <Users className="h-4 w-4" />,
    category: 'Système'
  },
  {
    name: 'Test Supabase',
    path: '/api/test-supabase',
    method: 'GET',
    description: 'Test de configuration Supabase',
    icon: <Shield className="h-4 w-4" />,
    category: 'Système'
  },

  // Dashboard
  {
    name: 'Dashboard Stats',
    path: '/api/dashboard/stats',
    method: 'GET',
    description: 'Statistiques du dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
    category: 'Dashboard'
  },
  {
    name: 'Dashboard Activity',
    path: '/api/dashboard/activity',
    method: 'GET',
    description: 'Activités récentes',
    icon: <Activity className="h-4 w-4" />,
    category: 'Dashboard'
  },

  // Gestion des données
  {
    name: 'Users List',
    path: '/api/users',
    method: 'GET',
    description: 'Liste des utilisateurs',
    icon: <Users className="h-4 w-4" />,
    category: 'Gestion'
  },
  {
    name: 'Folders List',
    path: '/api/folders',
    method: 'GET',
    description: 'Liste des dossiers',
    icon: <FolderOpen className="h-4 w-4" />,
    category: 'Gestion'
  },
  {
    name: 'Documents List',
    path: '/api/documents',
    method: 'GET',
    description: 'Liste des documents',
    icon: <FileText className="h-4 w-4" />,
    category: 'Gestion'
  },
  {
    name: 'Notifications List',
    path: '/api/notifications',
    method: 'GET',
    description: 'Liste des notifications',
    icon: <Bell className="h-4 w-4" />,
    category: 'Gestion'
  },

  // Fonctionnalités
  {
    name: 'Search Suggestions',
    path: '/api/search/suggestions',
    method: 'GET',
    description: 'Suggestions de recherche',
    icon: <Search className="h-4 w-4" />,
    category: 'Fonctionnalités'
  },
  {
    name: 'Settings',
    path: '/api/settings',
    method: 'GET',
    description: 'Paramètres de l\'application',
    icon: <Settings className="h-4 w-4" />,
    category: 'Fonctionnalités'
  },
  {
    name: 'Sidebar Folders',
    path: '/api/sidebar/folders',
    method: 'GET',
    description: 'Dossiers pour la sidebar',
    icon: <FolderOpen className="h-4 w-4" />,
    category: 'Fonctionnalités'
  },

  // Upload et gestion des fichiers
  {
    name: 'Upload Test',
    path: '/api/upload',
    method: 'POST',
    description: 'Test de l\'upload de fichiers',
    icon: <Upload className="h-4 w-4" />,
    category: 'Upload & Fichiers'
  },
  {
    name: 'Document Versions',
    path: '/api/documents/versions',
    method: 'GET',
    description: 'Gestion des versions de documents',
    icon: <FileText className="h-4 w-4" />,
    category: 'Upload & Fichiers'
  },
  {
    name: 'Document Download',
    path: '/api/documents/[id]/download',
    method: 'GET',
    description: 'Téléchargement de documents',
    icon: <FileText className="h-4 w-4" />,
    category: 'Upload & Fichiers'
  },
  {
    name: 'Document Share',
    path: '/api/documents/[id]/share',
    method: 'POST',
    description: 'Partage de documents',
    icon: <FileText className="h-4 w-4" />,
    category: 'Upload & Fichiers'
  },

  // Gestion des dossiers
  {
    name: 'Folder Create',
    path: '/api/folders',
    method: 'POST',
    description: 'Création de dossiers',
    icon: <FolderOpen className="h-4 w-4" />,
    category: 'Gestion des Dossiers'
  },
  {
    name: 'Folder Update',
    path: '/api/folders/[id]',
    method: 'PUT',
    description: 'Modification de dossiers',
    icon: <FolderOpen className="h-4 w-4" />,
    category: 'Gestion des Dossiers'
  },
  {
    name: 'Folder Delete',
    path: '/api/folders/[id]',
    method: 'DELETE',
    description: 'Suppression de dossiers',
    icon: <FolderOpen className="h-4 w-4" />,
    category: 'Gestion des Dossiers'
  },

  // Notifications et alertes
  {
    name: 'Notification Mark Read',
    path: '/api/notifications/[id]/read',
    method: 'PUT',
    description: 'Marquer notification comme lue',
    icon: <Bell className="h-4 w-4" />,
    category: 'Notifications'
  },
  {
    name: 'Mark All Read',
    path: '/api/notifications/mark-all-read',
    method: 'PUT',
    description: 'Marquer toutes comme lues',
    icon: <Bell className="h-4 w-4" />,
    category: 'Notifications'
  },

  // Profil et authentification
  {
    name: 'User Profile',
    path: '/api/profile',
    method: 'GET',
    description: 'Profil utilisateur',
    icon: <Users className="h-4 w-4" />,
    category: 'Profil & Auth'
  },
  {
    name: 'Auth Me',
    path: '/api/auth/me',
    method: 'GET',
    description: 'Vérification de session',
    icon: <Shield className="h-4 w-4" />,
    category: 'Profil & Auth'
  },
  {
    name: 'User Profile Update',
    path: '/api/user-profile',
    method: 'PUT',
    description: 'Mise à jour du profil',
    icon: <Users className="h-4 w-4" />,
    category: 'Profil & Auth'
  },

  // Fonctionnalités avancées
  {
    name: 'Session Extend',
    path: '/api/session/extend',
    method: 'POST',
    description: 'Extension de session',
    icon: <Shield className="h-4 w-4" />,
    category: 'Fonctionnalités Avancées'
  },
  {
    name: 'Update Passwords',
    path: '/api/update-passwords',
    method: 'POST',
    description: 'Mise à jour des mots de passe',
    icon: <Shield className="h-4 w-4" />,
    category: 'Fonctionnalités Avancées'
  }
]

export default function TestAllApisPage() {
  const [results, setResults] = useState<Record<string, ApiTestResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, error: 0, pending: 0 })
  const [copied, setCopied] = useState(false)

  const getEndpointKey = (endpoint: ApiEndpoint) => `${endpoint.method}:${endpoint.path}`

  const hasRunAtLeastOnce = () => {
    return Object.values(results).some(r => r && r.status !== 'pending')
  }

  const buildSummaryText = () => {
    const failed = Object.entries(results)
      .filter(([, r]) => r.status === 'error')
      .map(([path, r]) => `- ${path}: ${r.error}`)
      .join('\n')
    return [
      `Résumé des tests APIs`,
      `Total: ${summary.total} | Succès: ${summary.success} | Erreurs: ${summary.error} | En attente: ${summary.pending}`,
      failed ? `\nErreurs:\n${failed}` : ''
    ].filter(Boolean).join('\n')
  }

  useEffect(() => {
    // Initialiser tous les résultats en état "pending"
    const initialResults: Record<string, ApiTestResult> = {}
    API_ENDPOINTS.forEach(endpoint => {
      const key = getEndpointKey(endpoint)
      initialResults[key] = {
        endpoint: key,
        status: 'pending'
      }
    })
    setResults(initialResults)
    updateSummary(initialResults)
  }, [])

  const updateSummary = (currentResults: Record<string, ApiTestResult>) => {
    const total = Object.keys(currentResults).length
    const success = Object.values(currentResults).filter(r => r.status === 'success').length
    const error = Object.values(currentResults).filter(r => r.status === 'error').length
    const pending = Object.values(currentResults).filter(r => r.status === 'pending').length
    
    setSummary({ total, success, error, pending })
  }

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    const startTime = Date.now()
    const key = getEndpointKey(endpoint)
    
    setResults(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'pending' }
    }))

    try {
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const duration = Date.now() - startTime
      
      if (response.ok) {
        const data = await response.json()
        setResults(prev => ({
          ...prev,
          [key]: {
            endpoint: key,
            status: 'success',
            response: data,
            duration
          }
        }))
      } else {
        const errorText = await response.text()
        setResults(prev => ({
          ...prev,
          [key]: {
            endpoint: key,
            status: 'error',
            error: `HTTP ${response.status}: ${errorText}`,
            duration
          }
        }))
      }
    } catch (error) {
      const duration = Date.now() - startTime
      setResults(prev => ({
        ...prev,
        [key]: {
          endpoint: key,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          duration
        }
      }))
    }

    // Mettre à jour le résumé
    setTimeout(() => {
      setResults(prev => {
        updateSummary(prev)
        return prev
      })
    }, 100)
  }

  const testAllApis = async () => {
    setIsRunning(true)
    
    for (const endpoint of API_ENDPOINTS) {
      await testEndpoint(endpoint)
      // Petit délai entre chaque test pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setIsRunning(false)
  }

  const resetAll = () => {
    const initialResults: Record<string, ApiTestResult> = {}
    API_ENDPOINTS.forEach(endpoint => {
      const key = getEndpointKey(endpoint)
      initialResults[key] = {
        endpoint: key,
        status: 'pending'
      }
    })
    setResults(initialResults)
    updateSummary(initialResults)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Succès</Badge>
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const groupedEndpoints = API_ENDPOINTS.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = []
    }
    acc[endpoint.category].push(endpoint)
    return acc
  }, {} as Record<string, ApiEndpoint[]>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">🧪 Test de Toutes les APIs</h1>
        <p className="text-muted-foreground text-lg">
          Page de diagnostic pour vérifier le bon fonctionnement de toutes les APIs
        </p>
      </div>

      {/* Résumé global */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Résumé des Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.success}</div>
              <div className="text-sm text-muted-foreground">Succès</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.error}</div>
              <div className="text-sm text-muted-foreground">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={testAllApis} 
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Tester Toutes les APIs
            </>
          )}
        </Button>
        
        <Button 
          onClick={resetAll} 
          variant="outline"
          disabled={isRunning}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Résultats par catégorie */}
      {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-xl">{category}</CardTitle>
            <CardDescription>
              {endpoints.length} endpoint(s) dans cette catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpoints.map((endpoint) => {
                const key = getEndpointKey(endpoint)
                const result = results[key]
                return (
                  <div key={key} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {endpoint.icon}
                        <div>
                          <h3 className="font-semibold">{endpoint.name}</h3>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {endpoint.method} {endpoint.path}
                          </code>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result && getStatusBadge(result.status)}
                        {result?.duration && (
                          <Badge variant="outline" className="text-xs">
                            {result.duration}ms
                          </Badge>
                        )}
                      </div>
                    </div>

                    {result && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="text-sm">
                          {result.status === 'success' && 'API fonctionnelle'}
                          {result.status === 'error' && `Erreur: ${result.error}`}
                          {result.status === 'pending' && 'Test en attente...'}
                        </span>
                      </div>
                    )}

                    {result?.status === 'success' && result.response && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <pre className="text-xs overflow-auto max-h-32">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    )}

                    {result?.status === 'error' && result.error && (
                      <Alert className="bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {result.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testEndpoint(endpoint)}
                        disabled={isRunning}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Tester
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Résumé à partager */}
      {hasRunAtLeastOnce() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Résumé à partager
            </CardTitle>
            <CardDescription>
              Copiez ce résumé pour me l'envoyer après vos tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                Total: {summary.total} | Succès: {summary.success} | Erreurs: {summary.error} | En attente: {summary.pending}
              </div>
              <Button
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(buildSummaryText())
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
              >
                {copied ? '✅ Copié' : '📋 Copier'}
              </Button>
            </div>
            <pre className="bg-muted p-3 rounded text-xs whitespace-pre-wrap">
{buildSummaryText()}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            📋 Instructions d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Cliquez sur "Tester Toutes les APIs" pour lancer un test complet</li>
            <li>Chaque endpoint est testé individuellement avec un délai entre chaque test</li>
            <li>Les résultats sont affichés en temps réel avec le statut et la durée</li>
            <li>Vous pouvez tester un endpoint spécifique en cliquant sur "Tester"</li>
            <li>Utilisez "Réinitialiser" pour remettre tous les tests en état d'attente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
