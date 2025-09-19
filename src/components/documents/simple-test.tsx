'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

export function SimpleTest() {
  const [isClient, setIsClient] = useState(false)
  const [testResults, setTestResults] = useState<{
    windowCheck: boolean
    documentCheck: boolean
    addEventListenerCheck: boolean
    fullscreenCheck: boolean
  }>({
    windowCheck: false,
    documentCheck: false,
    addEventListenerCheck: false,
    fullscreenCheck: false
  })

  useEffect(() => {
    // Test 1: Vérifier window
    const windowCheck = typeof window !== 'undefined'
    
    // Test 2: Vérifier document
    const documentCheck = typeof document !== 'undefined'
    
    // Test 3: Vérifier addEventListener
    const addEventListenerCheck = typeof document !== 'undefined' && typeof document.addEventListener === 'function'
    
    // Test 4: Vérifier fullscreenElement
    const fullscreenCheck = typeof document !== 'undefined' && 'fullscreenElement' in document

    setTestResults({
      windowCheck,
      documentCheck,
      addEventListenerCheck,
      fullscreenCheck
    })

    setIsClient(true)
  }, [])

  const allTestsPass = Object.values(testResults).every(Boolean)

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {allTestsPass ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Test Simple SSR</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              {testResults.windowCheck ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Window disponible</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {testResults.documentCheck ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Document disponible</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {testResults.addEventListenerCheck ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>addEventListener disponible</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {testResults.fullscreenCheck ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>fullscreenElement disponible</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Statut: {isClient ? 'Côté client' : 'Côté serveur'}
            </p>
            <p className="text-sm text-muted-foreground">
              Tests: {Object.values(testResults).filter(Boolean).length}/4 réussis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
