'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Share2,
  Trash2,
  Plus,
  Edit,
  Bell,
  User,
  Shield
} from 'lucide-react'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

export default function TestUploadPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testFile, setTestFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  const addResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }])
  }

  const updateResult = (test: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => prev.map(r => r.test === test ? { test, status, message, details } : r))
  }



  const testFileUpload = async () => {
    if (!testFile) {
      addResult('Upload de fichier', 'error', 'Aucun fichier sélectionné')
      return
    }

    addResult('Upload de fichier', 'pending', 'Test en cours...')

    try {
      const formData = new FormData()
      // L'API attend `files` (peut être multiple)
      formData.append('files', testFile)
      // L'API attend `metadata` (JSON string)
      formData.append('metadata', JSON.stringify({
        folderId: 'test-folder',
        name: 'Test Upload',
        description: 'Fichier de test pour validation',
        category: null
      }))

      console.log('🧪 Envoi de la requête de test...')
      const response = await fetch('/api/upload-test', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Réponse reçue:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données reçues:', data)
        updateResult('Upload de fichier', 'success', 'Upload réussi', data)
      } else {
        let errorMessage = `Erreur upload: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${errorData.error || 'Erreur inconnue'}`
          console.error('❌ Erreur API:', errorData)
        } catch {
          const errorText = await response.text()
          errorMessage += ` - ${errorText || 'Erreur inconnue'}`
          console.error('❌ Erreur texte:', errorText)
        }
        updateResult('Upload de fichier', 'error', errorMessage)
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error)
      updateResult('Upload de fichier', 'error', `Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const testDocumentOperations = async () => {
    addResult('Opérations sur documents', 'pending', 'Test en cours...')

    try {
      // Test récupération des documents
      const docsResponse = await fetch('/api/documents')
      if (docsResponse.ok) {
        const docs = await docsResponse.json()
        updateResult('Opérations sur documents', 'success', 'Documents récupérés', { count: docs.documents?.length || 0 })
      } else {
        updateResult('Opérations sur documents', 'error', 'Erreur récupération documents', docsResponse.status)
      }
    } catch (error) {
      updateResult('Opérations sur documents', 'error', 'Erreur test documents', error)
    }
  }

  const testFolderOperations = async () => {
    addResult('Opérations sur dossiers', 'pending', 'Test en cours...')

    try {
      // Test récupération des dossiers
      const foldersResponse = await fetch('/api/folders')
      if (foldersResponse.ok) {
        const folders = await foldersResponse.json()
        updateResult('Opérations sur dossiers', 'success', 'Dossiers récupérés', { count: folders.folders?.length || 0 })
      } else {
        updateResult('Opérations sur dossiers', 'error', 'Erreur récupération dossiers', foldersResponse.status)
      }
    } catch (error) {
      updateResult('Opérations sur dossiers', 'error', 'Erreur test dossiers', error)
    }
  }

  const testNotifications = async () => {
    addResult('Système de notifications', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/notifications-test')
      if (response.ok) {
        const data = await response.json()
        updateResult('Système de notifications', 'success', 'Notifications récupérées', { count: data.notifications?.length || 0 })
      } else {
        updateResult('Système de notifications', 'error', 'Erreur notifications', response.status)
      }
    } catch (error) {
      updateResult('Système de notifications', 'error', 'Erreur test notifications', error)
    }
  }

  const testUserProfile = async () => {
    addResult('Profil utilisateur', 'pending', 'Test en cours...')

    try {
      const response = await fetch('/api/profile-test')
      if (response.ok) {
        const data = await response.json()
        updateResult('Profil utilisateur', 'success', 'Profil récupéré', { user: data.user?.email || 'N/A' })
      } else {
        updateResult('Profil utilisateur', 'error', 'Erreur profil', response.status)
      }
    } catch (error) {
      updateResult('Profil utilisateur', 'error', 'Erreur test profil', error)
    }
  }

  const testAllFeatures = async () => {
    setIsRunning(true)
    setResults([])

    // Tests séquentiels
    await testFileUpload()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testDocumentOperations()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testFolderOperations()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testNotifications()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testUserProfile()

    setIsRunning(false)
  }

  const resetTests = () => {
    setResults([])
    setTestFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      `Résumé tests fonctionnalités critiques`,
      `Total: ${total} | Succès: ${success} | Erreurs: ${error} | En cours: ${pending}`,
      failed ? `\nErreurs:\n${failed}` : ''
    ].filter(Boolean).join('\n')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">🚀 Test des Fonctionnalités Critiques</h1>
        <p className="text-muted-foreground text-lg">
          Validation complète de l'upload, gestion des documents, dossiers et notifications
        </p>
      </div>

      {/* Résumé */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
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
              <div className="text-sm text-muted-foreground">En cours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélection de fichier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Sélection de Fichier de Test
          </CardTitle>
          <CardDescription>
            Sélectionnez un fichier pour tester l'upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setTestFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
            <Button 
              onClick={testFileUpload}
              disabled={!testFile || isRunning}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Tester Upload
            </Button>
          </div>
          {testFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Fichier sélectionné: {testFile.name} ({(testFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boutons de test */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={testAllFeatures} 
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
              <CheckCircle className="h-4 w-4 mr-2" />
              Tester Toutes les Fonctionnalités
            </>
          )}
        </Button>
        
        <Button 
          onClick={resetTests} 
          variant="outline"
          disabled={isRunning}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Résultats des tests */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résultats des Tests
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
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            📋 Instructions de Test
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Sélectionnez un fichier de test (PDF, DOC, TXT, JPG, PNG)</li>
            <li>Cliquez sur "Tester Toutes les Fonctionnalités" pour un test complet</li>
            <li>Ou testez individuellement chaque composant</li>
            <li>Vérifiez que l'upload, la gestion des documents et dossiers fonctionnent</li>
            <li>Les erreurs sont affichées avec détails pour le diagnostic</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
