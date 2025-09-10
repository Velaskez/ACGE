'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export default function TestDocumentsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.details = details
        return [...prev]
      }
      return [...prev, { name, status, message, details }]
    })
  }

  const clearResults = () => {
    setTestResults([])
  }

  const runAllTests = async () => {
    setIsRunning(true)
    clearResults()
    
    // Test 1: Authentification
    addTestResult('auth', 'pending', 'Test en cours...')
    try {
      const authResponse = await fetch('/api/auth/me')
      const authData = await authResponse.json()
      
      if (authResponse.ok) {
        addTestResult('auth', 'success', `Authentifié: ${authData.user.name} (${authData.user.role})`, authData)
      } else {
        addTestResult('auth', 'error', `Non authentifié: ${authData.error}`, authData)
      }
    } catch (error) {
      addTestResult('auth', 'error', `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
    }

    // Test 2: API Documents
    addTestResult('documents-api', 'pending', 'Test en cours...')
    try {
      const docsResponse = await fetch('/api/documents')
      const docsData = await docsResponse.json()
      
      if (docsResponse.ok) {
        const docCount = docsData.documents?.length || 0
        addTestResult('documents-api', 'success', `${docCount} documents récupérés`, docsData)
      } else {
        addTestResult('documents-api', 'error', `Erreur API: ${docsData.error}`, docsData)
      }
    } catch (error) {
      addTestResult('documents-api', 'error', `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
    }

    // Test 3: API Téléchargement
    addTestResult('download-api', 'pending', 'Test en cours...')
    try {
      // Récupérer d'abord un document pour tester le téléchargement
      const docsResponse = await fetch('/api/documents')
      const docsData = await docsResponse.json()
      
      if (docsResponse.ok && docsData.documents?.length > 0) {
        const testDoc = docsData.documents[0]
        const downloadResponse = await fetch(`/api/documents/${testDoc.id}/download`)
        
        if (downloadResponse.status === 401) {
          addTestResult('download-api', 'success', 'API Téléchargement fonctionne (401 = Non authentifié, normal)', {
            status: downloadResponse.status,
            documentId: testDoc.id
          })
        } else if (downloadResponse.ok) {
          const blob = await downloadResponse.blob()
          addTestResult('download-api', 'success', `Téléchargement réussi! Taille: ${blob.size} bytes`, {
            size: blob.size,
            type: blob.type
          })
        } else {
          const errorData = await downloadResponse.json()
          addTestResult('download-api', 'error', `Erreur: ${errorData.error}`, errorData)
        }
      } else {
        addTestResult('download-api', 'warning', 'Aucun document à tester', null)
      }
    } catch (error) {
      addTestResult('download-api', 'error', `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
    }

    // Test 4: Structure des données
    addTestResult('data-structure', 'pending', 'Test en cours...')
    try {
      const docsResponse = await fetch('/api/documents')
      const docsData = await docsResponse.json()
      
      if (docsResponse.ok && docsData.documents?.length > 0) {
        const doc = docsData.documents[0]
        const hasVersion = doc.currentVersion && doc.currentVersion.id !== 'no-version'
        const hasCorrectFields = doc.currentVersion && 
          typeof doc.currentVersion.fileSize === 'number' &&
          typeof doc.currentVersion.fileType === 'string'
        
        if (hasVersion && hasCorrectFields) {
          addTestResult('data-structure', 'success', 'Structure des données correcte', {
            hasVersion,
            fileSize: doc.currentVersion.fileSize,
            fileType: doc.currentVersion.fileType,
            fileName: doc.currentVersion.fileName
          })
        } else {
          addTestResult('data-structure', 'warning', 'Structure des données partielle', {
            hasVersion,
            hasCorrectFields,
            currentVersion: doc.currentVersion
          })
        }
      } else {
        addTestResult('data-structure', 'warning', 'Aucun document à analyser', null)
      }
    } catch (error) {
      addTestResult('data-structure', 'error', `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
    }

    setIsRunning(false)
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const

    const colors = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    }

    return (
      <Badge className={colors[status]}>
        {status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'warning' ? '⚠️' : '⏳'} 
        {status.toUpperCase()}
      </Badge>
    )
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const warningCount = testResults.filter(r => r.status === 'warning').length
  const totalTests = testResults.length

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              🧪 Test Page Documents
            </h1>
            <p className="text-muted-foreground">
              Test complet de la page des documents et de ses APIs
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Effacer les résultats
            </Button>
          </div>
        </div>

        {/* Résumé */}
        {totalTests > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Résumé des Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-muted-foreground">Réussis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-muted-foreground">Échecs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                  <div className="text-sm text-muted-foreground">Avertissements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.name}</CardTitle>
                    {getStatusBadge(result.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">
                        Voir les détails
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Cliquez sur "Lancer tous les tests" pour exécuter la suite de tests</li>
              <li>Les tests vérifient l'authentification, l'API documents, l'API téléchargement et la structure des données</li>
              <li>Un statut 401 (Non authentifié) est normal pour les tests d'API</li>
              <li>Consultez les détails de chaque test pour plus d'informations</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
