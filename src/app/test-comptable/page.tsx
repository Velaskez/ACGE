'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calculator, 
  FileText, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Receipt,
  Building2,
  Users,
  Shield
} from 'lucide-react'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

export default function TestComptablePage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }])
  }

  const updateResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => prev.map(r => r.test === test ? { test, status, message, details } : r))
  }

  const buildSummaryText = () => {
    const total = results.length
    const success = results.filter(r => r.status === 'success').length
    const error = results.filter(r => r.status === 'error').length
    const pending = results.filter(r => r.status === 'pending').length
    const failed = results
      .filter(r => r.status === 'error')
      .map(r => `- ${r.test}: ${r.message}`)
      .join('\n')
    return [
      `Résumé tests fonctionnalités comptables`,
      `Total: ${total} | Succès: ${success} | Erreurs: ${error} | En cours: ${pending}`,
      failed ? `\nErreurs:\n${failed}` : ''
    ].filter(Boolean).join('\n')
  }

  const testDossiersComptables = async () => {
    addResult('Dossiers Comptables', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/documents/dossiers-comptables')
      if (response.ok) {
        const data = await response.json()
        updateResult('Dossiers Comptables', 'success', 'Dossiers comptables récupérés', { count: data.dossiers?.length || 0 })
      } else {
        updateResult('Dossiers Comptables', 'error', 'Erreur dossiers comptables', response.status)
      }
    } catch (error) {
      updateResult('Dossiers Comptables', 'error', 'Erreur test dossiers comptables', error)
    }
  }

  const testNaturesDocuments = async () => {
    addResult('Natures de Documents', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/documents/natures-documents')
      if (response.ok) {
        const data = await response.json()
        updateResult('Natures de Documents', 'success', 'Natures récupérées', { count: data.natures?.length || 0 })
      } else {
        updateResult('Natures de Documents', 'error', 'Erreur natures documents', response.status)
      }
    } catch (error) {
      updateResult('Natures de Documents', 'error', 'Erreur test natures', error)
    }
  }

  const testPostesComptables = async () => {
    addResult('Postes Comptables', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/documents/postes-comptables')
      if (response.ok) {
        const data = await response.json()
        updateResult('Postes Comptables', 'success', 'Postes récupérés', { count: data.postes?.length || 0 })
      } else {
        updateResult('Postes Comptables', 'error', 'Erreur postes comptables', response.status)
      }
    } catch (error) {
      updateResult('Postes Comptables', 'error', 'Erreur test postes', error)
    }
  }

  const testDashboardStats = async () => {
    addResult('Statistiques Dashboard', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        updateResult('Statistiques Dashboard', 'success', 'Stats récupérées', { 
          documents: data.totalDocuments,
          folders: data.totalFolders,
          users: data.totalUsers
        })
      } else {
        updateResult('Statistiques Dashboard', 'error', 'Erreur stats dashboard', response.status)
      }
    } catch (error) {
      updateResult('Statistiques Dashboard', 'error', 'Erreur test stats', error)
    }
  }

  const testDashboardActivity = async () => {
    addResult('Activités Dashboard', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/dashboard/activity')
      if (response.ok) {
        const data = await response.json()
        updateResult('Activités Dashboard', 'success', 'Activités récupérées', { 
          documents: data.recentDocuments?.length || 0,
          folders: data.recentFolders?.length || 0
        })
      } else {
        updateResult('Activités Dashboard', 'error', 'Erreur activités dashboard', response.status)
      }
    } catch (error) {
      updateResult('Activités Dashboard', 'error', 'Erreur test activités', error)
    }
  }

  const testSearchSuggestions = async () => {
    addResult('Suggestions de Recherche', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/search/suggestions?q=comptable')
      if (response.ok) {
        const data = await response.json()
        updateResult('Suggestions de Recherche', 'success', 'Suggestions récupérées', { count: data.suggestions?.length || 0 })
      } else {
        updateResult('Suggestions de Recherche', 'error', 'Erreur suggestions', response.status)
      }
    } catch (error) {
      updateResult('Suggestions de Recherche', 'error', 'Erreur test suggestions', error)
    }
  }

  const testAllComptableFeatures = async () => {
    setIsRunning(true)
    setResults([])

    // Tests séquentiels
    await testDossiersComptables()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testNaturesDocuments()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testPostesComptables()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testDashboardStats()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testDashboardActivity()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testSearchSuggestions()

    setIsRunning(false)
  }

  const resetTests = () => {
    setResults([])
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
        return <Badge variant="secondary">En cours</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const summary = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    pending: results.filter(r => r.status === 'pending').length
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">🏛️ Test des Fonctionnalités Comptables</h1>
        <p className="text-muted-foreground text-lg">
          Validation des fonctionnalités spécifiques à la gestion comptable
        </p>
      </div>

      {/* Résumé */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Résumé des Tests Comptables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.total}</div>
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
              <div className="text-sm text-muted-foreground">En cours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons de test */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={testAllComptableFeatures} 
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700"
        >
          {isRunning ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
              Tests en cours...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Tester Toutes les Fonctionnalités Comptables
            </>
          )}
        </Button>
        
        <Button 
          onClick={resetTests} 
          variant="outline"
          disabled={isRunning}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Tests individuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Dossiers Comptables
            </CardTitle>
            <CardDescription>
              Test de récupération des dossiers comptables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testDossiersComptables}
              disabled={isRunning}
              className="w-full"
            >
              Tester
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Natures de Documents
            </CardTitle>
            <CardDescription>
              Test de récupération des natures de documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testNaturesDocuments}
              disabled={isRunning}
              className="w-full"
            >
              Tester
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Postes Comptables
            </CardTitle>
            <CardDescription>
              Test de récupération des postes comptables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testPostesComptables}
              disabled={isRunning}
              className="w-full"
            >
              Tester
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiques Dashboard
            </CardTitle>
            <CardDescription>
              Test des statistiques du dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testDashboardStats}
              disabled={isRunning}
              className="w-full"
            >
              Tester
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Résultats des tests */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résultats des Tests Comptables
            </CardTitle>
            <CardDescription>
              Détail de chaque test effectué
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold">{result.test}</h3>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>

                  {result.details && (
                    <Alert className={result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                      {result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={result.status === 'success' ? 'text-green-800' : 'text-red-800'}>
                        <pre className="text-xs overflow-auto max-h-32">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résumé à partager
            </CardTitle>
            <CardDescription>
              Copiez ce résumé et collez-le ici pour validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                Total: {summary.total} | Succès: {summary.success} | Erreurs: {summary.error} | En cours: {summary.pending}
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
      <Card className="bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-200">
            📋 Instructions de Test Comptable
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700 dark:text-green-300">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Cliquez sur "Tester Toutes les Fonctionnalités Comptables" pour un test complet</li>
            <li>Ou testez individuellement chaque composant comptable</li>
            <li>Vérifiez que les dossiers, natures et postes comptables sont accessibles</li>
            <li>Contrôlez que le dashboard affiche les bonnes statistiques</li>
            <li>Les erreurs sont affichées avec détails pour le diagnostic</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
