'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export function TestViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<Array<{timestamp: string, message: string, type: 'info' | 'success' | 'error'}>>([])
  const [testResults, setTestResults] = useState<Array<{
    name: string
    status: 'pending' | 'pass' | 'fail'
    message: string
  }>>([
    { name: 'useEffect fullscreen', status: 'pending', message: 'Test addEventListener fullscreen' },
    { name: 'useEffect keyboard', status: 'pending', message: 'Test addEventListener keyboard' },
    { name: 'toggleFullscreen function', status: 'pending', message: 'Test document.fullscreenElement' },
    { name: 'createElement function', status: 'pending', message: 'Test document.createElement' }
  ])

  const containerRef = useRef<HTMLDivElement>(null)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type }])
    console.log(`[${timestamp}] ${message}`)
  }

  // Test 1: useEffect fullscreen (exactement comme DocumentViewer)
  useEffect(() => {
    addLog('useEffect fullscreen: Début', 'info')
    
    if (typeof window === 'undefined') {
      addLog('useEffect fullscreen: window undefined, sortie', 'info')
      return
    }
    
    addLog('useEffect fullscreen: window disponible', 'success')
    
    const handleFullscreenChange = () => {
      addLog('useEffect fullscreen: handleFullscreenChange appelé', 'info')
    }
    
    try {
      addLog('useEffect fullscreen: Tentative addEventListener', 'info')
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      addLog('useEffect fullscreen: addEventListener réussi', 'success')
      
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect fullscreen' 
          ? { ...test, status: 'pass', message: 'addEventListener fullscreen réussi' }
          : test
      ))
      
      return () => {
        addLog('useEffect fullscreen: Cleanup, removeEventListener', 'info')
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
    } catch (error) {
      addLog(`useEffect fullscreen: Erreur - ${error}`, 'error')
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect fullscreen' 
          ? { ...test, status: 'fail', message: `Erreur: ${error}` }
          : test
      ))
    }
  }, [])

  // Test 2: useEffect keyboard (exactement comme DocumentViewer)
  useEffect(() => {
    addLog('useEffect keyboard: Début', 'info')
    
    if (typeof window === 'undefined') {
      addLog('useEffect keyboard: window undefined, sortie', 'info')
      return
    }
    
    addLog('useEffect keyboard: window disponible', 'success')
    
    const handleKeyDown = (e: KeyboardEvent) => {
      addLog(`useEffect keyboard: Touche pressée - ${e.key}`, 'info')
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    try {
      addLog('useEffect keyboard: Tentative addEventListener', 'info')
      document.addEventListener('keydown', handleKeyDown)
      addLog('useEffect keyboard: addEventListener réussi', 'success')
      
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect keyboard' 
          ? { ...test, status: 'pass', message: 'addEventListener keyboard réussi' }
          : test
      ))
      
      return () => {
        addLog('useEffect keyboard: Cleanup, removeEventListener', 'info')
        document.removeEventListener('keydown', handleKeyDown)
      }
    } catch (error) {
      addLog(`useEffect keyboard: Erreur - ${error}`, 'error')
      setTestResults(prev => prev.map(test => 
        test.name === 'useEffect keyboard' 
          ? { ...test, status: 'fail', message: `Erreur: ${error}` }
          : test
      ))
    }
  }, [isOpen])

  // Test 3: toggleFullscreen (exactement comme DocumentViewer)
  const toggleFullscreen = useCallback(async () => {
    addLog('toggleFullscreen: Début', 'info')
    
    if (!containerRef.current) {
      addLog('toggleFullscreen: containerRef null', 'error')
      return
    }
    
    if (typeof window === 'undefined') {
      addLog('toggleFullscreen: window undefined', 'error')
      return
    }
    
    addLog('toggleFullscreen: Vérifications OK', 'success')
    
    try {
      addLog('toggleFullscreen: Vérification document.fullscreenElement', 'info')
      if (!document.fullscreenElement) {
        addLog('toggleFullscreen: Pas en plein écran, tentative requestFullscreen', 'info')
        await containerRef.current.requestFullscreen()
        addLog('toggleFullscreen: requestFullscreen réussi', 'success')
      } else {
        addLog('toggleFullscreen: En plein écran, tentative exitFullscreen', 'info')
        await document.exitFullscreen()
        addLog('toggleFullscreen: exitFullscreen réussi', 'success')
      }
      
      setTestResults(prev => prev.map(test => 
        test.name === 'toggleFullscreen function' 
          ? { ...test, status: 'pass', message: 'toggleFullscreen réussi' }
          : test
      ))
    } catch (err) {
      addLog(`toggleFullscreen: Erreur - ${err}`, 'error')
      setTestResults(prev => prev.map(test => 
        test.name === 'toggleFullscreen function' 
          ? { ...test, status: 'fail', message: `Erreur: ${err}` }
          : test
      ))
    }
  }, [])

  // Test 4: createElement (exactement comme DocumentViewer)
  const testCreateElement = useCallback(() => {
    addLog('testCreateElement: Début', 'info')
    
    if (typeof window === 'undefined') {
      addLog('testCreateElement: window undefined', 'error')
      return
    }
    
    try {
      addLog('testCreateElement: Tentative createElement', 'info')
      const a = document.createElement('a')
      a.href = '#'
      a.download = 'test'
      addLog('testCreateElement: createElement réussi', 'success')
      
      addLog('testCreateElement: Tentative appendChild', 'info')
      document.body.appendChild(a)
      addLog('testCreateElement: appendChild réussi', 'success')
      
      addLog('testCreateElement: Tentative removeChild', 'info')
      document.body.removeChild(a)
      addLog('testCreateElement: removeChild réussi', 'success')
      
      setTestResults(prev => prev.map(test => 
        test.name === 'createElement function' 
          ? { ...test, status: 'pass', message: 'createElement réussi' }
          : test
      ))
    } catch (error) {
      addLog(`testCreateElement: Erreur - ${error}`, 'error')
      setTestResults(prev => prev.map(test => 
        test.name === 'createElement function' 
          ? { ...test, status: 'fail', message: `Erreur: ${error}` }
          : test
      ))
    }
  }, [])

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
            <span>Test DocumentViewer Pattern</span>
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

          <div className="grid grid-cols-2 gap-4">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{test.name}</h3>
                  <p className="text-xs text-muted-foreground">{test.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button onClick={toggleFullscreen} variant="outline" size="sm">
              Test toggleFullscreen
            </Button>
            <Button onClick={testCreateElement} variant="outline" size="sm">
              Test createElement
            </Button>
            <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm">
              Toggle Open
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`text-xs p-2 rounded ${
                log.type === 'success' ? 'bg-green-50 text-green-700' :
                log.type === 'error' ? 'bg-red-50 text-red-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                <span className="font-mono text-xs opacity-60">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent ref={containerRef} className="w-full h-full max-w-none max-h-none m-0 p-0 border-0 rounded-none">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Test Dialog</h2>
            <p className="text-muted-foreground mb-4">
              Ce dialog utilise le même pattern que DocumentViewer
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
