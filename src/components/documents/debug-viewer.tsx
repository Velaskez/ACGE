'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function DebugViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [testResults, setTestResults] = useState<Array<{
    name: string
    status: 'pending' | 'pass' | 'fail'
    message: string
    error?: string
  }>>([
    { name: 'useEffect 1 - fullscreen', status: 'pending', message: 'Test addEventListener fullscreen' },
    { name: 'useEffect 2 - keyboard', status: 'pending', message: 'Test addEventListener keyboard' },
    { name: 'Function - toggleFullscreen', status: 'pending', message: 'Test document.fullscreenElement' },
    { name: 'Function - createElement', status: 'pending', message: 'Test document.createElement' }
  ])

  // Test 1: useEffect avec addEventListener (comme dans DocumentViewer)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleFullscreenChange = () => {
      console.log('Fullscreen change detected')
    }
    
    try {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect 1 - fullscreen' 
          ? { ...test, status: 'pass', message: 'addEventListener fullscreen réussi' }
          : test
      ))
      
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    } catch (error) {
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect 1 - fullscreen' 
          ? { ...test, status: 'fail', message: 'addEventListener fullscreen échoué', error: String(error) }
          : test
      ))
    }
  }, [])

  // Test 2: useEffect avec addEventListener keyboard (comme dans DocumentViewer)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    try {
      document.addEventListener('keydown', handleKeyDown)
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect 2 - keyboard' 
          ? { ...test, status: 'pass', message: 'addEventListener keyboard réussi' }
          : test
      ))
      
      return () => document.removeEventListener('keydown', handleKeyDown)
    } catch (error) {
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect 2 - keyboard' 
          ? { ...test, status: 'fail', message: 'addEventListener keyboard échoué', error: String(error) }
          : test
      ))
    }
  }, [isOpen])

  // Test 3: Fonction toggleFullscreen (comme dans DocumentViewer)
  const testToggleFullscreen = () => {
    try {
      if (typeof window === 'undefined') {
        setTestResults(prev => prev.map(test => 
          test.name === 'Function - toggleFullscreen' 
            ? { ...test, status: 'pass', message: 'Vérification window OK' }
            : test
        ))
        return
      }

      if (!document.fullscreenElement) {
        setTestResults(prev => prev.map(test => 
          test.name === 'Function - toggleFullscreen' 
            ? { ...test, status: 'pass', message: 'document.fullscreenElement accessible' }
            : test
        ))
      } else {
        setTestResults(prev => prev.map(test => 
          test.name === 'Function - toggleFullscreen' 
            ? { ...test, status: 'pass', message: 'document.fullscreenElement accessible' }
            : test
        ))
      }
    } catch (error) {
      setTestResults(prev => prev.map(test => 
        test.name === 'Function - toggleFullscreen' 
          ? { ...test, status: 'fail', message: 'document.fullscreenElement échoué', error: String(error) }
          : test
      ))
    }
  }

  // Test 4: Fonction createElement (comme dans DocumentViewer)
  const testCreateElement = () => {
    try {
      if (typeof window === 'undefined') {
        setTestResults(prev => prev.map(test => 
          test.name === 'Function - createElement' 
            ? { ...test, status: 'pass', message: 'Vérification window OK' }
            : test
        ))
        return
      }

      const a = document.createElement('a')
      a.href = '#'
      a.download = 'test'
      document.body.appendChild(a)
      document.body.removeChild(a)
      
      setTestResults(prev => prev.map(test => 
        test.name === 'Function - createElement' 
          ? { ...test, status: 'pass', message: 'document.createElement réussi' }
          : test
      ))
    } catch (error) {
      setTestResults(prev => prev.map(test => 
        test.name === 'Function - createElement' 
          ? { ...test, status: 'fail', message: 'document.createElement échoué', error: String(error) }
          : test
      ))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const allTestsPass = testResults.every(test => test.status === 'pass')
  const hasFailures = testResults.some(test => test.status === 'fail')

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {allTestsPass ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : hasFailures ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <span>Debug DocumentViewer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {allTestsPass ? '✅ Tous les tests passent' : 
               hasFailures ? '❌ Certains tests échouent' : 
               '⏳ Tests en cours...'}
            </p>
            <p className="text-sm text-muted-foreground">
              {testResults.filter(t => t.status === 'pass').length}/{testResults.length} tests réussis
            </p>
          </div>

          <div className="space-y-3">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-semibold">{test.name}</h3>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                  {test.error && (
                    <p className="text-sm text-red-600 mt-1">Erreur: {test.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button onClick={testToggleFullscreen} variant="outline" size="sm">
              Test toggleFullscreen
            </Button>
            <Button onClick={testCreateElement} variant="outline" size="sm">
              Test createElement
            </Button>
            <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm">
              Toggle Open ({isOpen ? 'Open' : 'Closed'})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
