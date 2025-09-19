'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Database, 
  Cloud,
  Settings,
  RefreshCw
} from 'lucide-react'

interface DiagnosticResult {
  success: boolean
  error?: string
  details?: string
  data?: any
}

interface StorageStatus {
  supabaseConfig: DiagnosticResult | null
  storageAccess: DiagnosticResult | null
  bucketStatus: DiagnosticResult | null
  databaseAccess: DiagnosticResult | null
}

export function StorageDiagnostic() {
  const [status, setStatus] = useState<StorageStatus>({
    supabaseConfig: null,
    storageAccess: null,
    bucketStatus: null,
    databaseAccess: null
  })
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    
    try {
      // 1. Vérifier la configuration Supabase
      console.log('🔍 Diagnostic: Vérification configuration...')
      const configCheck = await fetch('/api/check-storage')
      const configResult = await configCheck.json()
      
      setStatus(prev => ({
        ...prev,
        supabaseConfig: {
          success: configCheck.ok,
          error: configResult.error,
          details: configResult.details,
          data: configResult
        }
      }))

      if (configCheck.ok) {
        // 2. Test d'accès au stockage
        console.log('🔍 Diagnostic: Test stockage...')
        setStatus(prev => ({
          ...prev,
          storageAccess: {
            success: true,
            data: {
              bucketsFound: configResult.bucketsFound || 0,
              filesFound: configResult.filesFound || 0
            }
          }
        }))

        // 3. Test d'accès à la base de données
        console.log('🔍 Diagnostic: Test base de données...')
        const dbTest = await fetch('/api/documents?limit=1')
        const dbResult = await dbTest.json()
        
        setStatus(prev => ({
          ...prev,
          databaseAccess: {
            success: dbTest.ok,
            error: dbResult.error,
            data: {
              documentsCount: dbResult.pagination?.total || 0
            }
          }
        }))
      }

    } catch (error) {
      console.error('Erreur diagnostic:', error)
      setStatus(prev => ({
        ...prev,
        supabaseConfig: {
          success: false,
          error: 'Erreur réseau',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      }))
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (result: DiagnosticResult | null) => {
    if (!result) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    if (result.success) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (result: DiagnosticResult | null) => {
    if (!result) return <Badge variant="secondary">En cours...</Badge>
    if (result.success) return <Badge variant="default" className="bg-green-500">OK</Badge>
    return <Badge variant="destructive">Erreur</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Diagnostic du Stockage</h2>
        <Button onClick={runDiagnostic} disabled={isRunning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          Relancer le diagnostic
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Configuration Supabase */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(status.supabaseConfig)}
              <Settings className="h-5 w-5" />
              Configuration Supabase
              {getStatusBadge(status.supabaseConfig)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.supabaseConfig?.success ? (
              <div className="text-sm text-green-700">
                ✅ Configuration Supabase valide
              </div>
            ) : status.supabaseConfig?.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erreur :</strong> {status.supabaseConfig.error}
                  {status.supabaseConfig.details && (
                    <div className="mt-2">
                      <strong>Détails :</strong> {status.supabaseConfig.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Vérification en cours...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accès au stockage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(status.storageAccess)}
              <Cloud className="h-5 w-5" />
              Accès au Stockage
              {getStatusBadge(status.storageAccess)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.storageAccess?.success ? (
              <div className="space-y-2">
                <div className="text-sm text-green-700">
                  ✅ Accès au stockage Supabase fonctionnel
                </div>
                {status.storageAccess.data && (
                  <div className="text-xs text-muted-foreground">
                    Buckets trouvés: {status.storageAccess.data.bucketsFound} | 
                    Fichiers trouvés: {status.storageAccess.data.filesFound}
                  </div>
                )}
              </div>
            ) : status.storageAccess?.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erreur :</strong> {status.storageAccess.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-muted-foreground">En attente de la configuration...</div>
            )}
          </CardContent>
        </Card>

        {/* Accès à la base de données */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(status.databaseAccess)}
              <Database className="h-5 w-5" />
              Accès à la Base de Données
              {getStatusBadge(status.databaseAccess)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status.databaseAccess?.success ? (
              <div className="space-y-2">
                <div className="text-sm text-green-700">
                  ✅ Accès à la base de données fonctionnel
                </div>
                {status.databaseAccess.data && (
                  <div className="text-xs text-muted-foreground">
                    Documents en base: {status.databaseAccess.data.documentsCount}
                  </div>
                )}
              </div>
            ) : status.databaseAccess?.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erreur :</strong> {status.databaseAccess.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-muted-foreground">En attente de la configuration...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solution recommandée</CardTitle>
        </CardHeader>
        <CardContent>
          {!status.supabaseConfig?.success ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuration manquante :</strong>
                <div className="mt-2 space-y-1">
                  <div>1. Vérifiez que la variable <code className="bg-muted px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> est définie</div>
                  <div>2. Vérifiez que <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> est correcte</div>
                  <div>3. Redémarrez le serveur après modification des variables d'environnement</div>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-sm text-green-700">
              ✅ La configuration semble correcte. L'upload devrait fonctionner.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
