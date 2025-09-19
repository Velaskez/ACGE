'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Bug, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface DiagnosticData {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  authMe?: {
    success: boolean
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
  dossiers: {
    total: number
    pending: number
    allDossiers: any[]
    pendingDossiers: any[]
  }
}

export function DiagnosticPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [error, setError] = useState('')

  const runDiagnostic = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Récupérer les données de diagnostic
      const [userRes, dossiersRes] = await Promise.all([
        fetch('/api/debug/user', { credentials: 'include' }),
        fetch('/api/debug/dossiers', { credentials: 'include' })
      ])

      const userData = await userRes.json()
      const dossiersData = await dossiersRes.json()

      if (!userData.success || !dossiersData.success) {
        throw new Error(userData.error || dossiersData.error || 'Erreur de diagnostic')
      }

      setData({
        user: userData.user,
        dossiers: dossiersData
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'CONTROLEUR_BUDGETAIRE': return 'bg-emerald-100 text-emerald-800'
      case 'ORDONNATEUR': return 'bg-blue-100 text-blue-800'
      case 'AGENT_COMPTABLE': return 'bg-purple-100 text-purple-800'
      case 'SECRETAIRE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800'
      case 'VALIDÉ_CB': return 'bg-green-100 text-green-800'
      case 'REJETÉ_CB': return 'bg-red-100 text-red-800'
      case 'VALIDÉ_ORDONNATEUR': return 'bg-blue-100 text-blue-800'
      case 'PAYÉ': return 'bg-purple-100 text-purple-800'
      case 'TERMINÉ': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
        >
          <Bug className="w-4 h-4 mr-2" />
          Diagnostic
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 h-screen">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Panel de Diagnostic
              </CardTitle>
              <CardDescription>
                Outil de diagnostic pour identifier les problèmes d'affichage
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runDiagnostic}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Lancer diagnostic
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && (
            <>
              {/* Informations utilisateur */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Utilisateur connecté
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">{data.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{data.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <Badge className={getRoleBadgeColor(data.user.role)}>
                      {data.user.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-mono text-xs">{data.user.id}</p>
                  </div>
                </div>
                
                {/* Comparaison avec auth/me */}
                {data.authMe && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Comparaison avec API auth/me:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600">Nom (auth/me)</p>
                        <p className="font-medium">{data.authMe.user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Email (auth/me)</p>
                        <p className="font-medium">{data.authMe.user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Rôle (auth/me)</p>
                        <Badge className={getRoleBadgeColor(data.authMe.user.role)}>
                          {data.authMe.user.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">ID (auth/me)</p>
                        <p className="font-mono text-xs">{data.authMe.user.id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Statistiques des dossiers */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Statistiques des dossiers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data.dossiers.total}</p>
                    <p className="text-sm text-blue-800">Total</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{data.dossiers.pending}</p>
                    <p className="text-sm text-yellow-800">En attente</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {data.dossiers.allDossiers.filter(d => d.statut === 'VALIDÉ_CB').length}
                    </p>
                    <p className="text-sm text-green-800">Validés CB</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {data.dossiers.allDossiers.filter(d => d.statut === 'REJETÉ_CB').length}
                    </p>
                    <p className="text-sm text-red-800">Rejetés CB</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Liste des dossiers */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tous les dossiers
                </h3>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {data.dossiers.allDossiers.map((dossier, index) => (
                    <div key={dossier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-reference">{dossier.numeroDossier}</p>
                        <p className="text-sm text-muted-foreground">
                          Créé: <span className="text-date">{new Date(dossier.createdAt).toLocaleDateString('fr-FR')}</span>
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatutBadgeColor(dossier.statut)}>
                        {dossier.statut}
                      </Badge>
                    </div>
                  ))}
                  {data.dossiers.allDossiers.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun dossier trouvé
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {!data && !isLoading && (
            <div className="text-center py-8">
              <Bug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Cliquez sur "Lancer diagnostic" pour commencer
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
