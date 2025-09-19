'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react'

/**
 * Composant de test pour vérifier les validations d'un dossier
 */
export function ValidationChecker() {
  const [dossierId, setDossierId] = useState('c8a73555-e928-46db-81e0-44465fd1d4f5')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const checkValidations = async () => {
    if (!dossierId.trim()) {
      toast.error('ID du dossier requis')
      return
    }

    try {
      setLoading(true)
      setResults(null)

      console.log('🔍 Vérification des validations pour le dossier:', dossierId)

      // Vérifier le statut du dossier
      const dossierResponse = await fetch(`/api/dossiers/${dossierId}`)
      const dossierData = await dossierResponse.json()

      // Vérifier la validation du type d'opération
      const typeResponse = await fetch(`/api/dossiers/${dossierId}/validation-operation-type`)
      const typeData = await typeResponse.json()

      // Vérifier les validations des contrôles de fond
      const controlesResponse = await fetch(`/api/dossiers/${dossierId}/validation-controles-fond`)
      const controlesData = await controlesResponse.json()

      console.log('🔍 Résultats de vérification:', {
        dossier: dossierData,
        typeOperation: typeData,
        controlesFond: controlesData
      })

      setResults({
        dossier: {
          status: dossierResponse.status,
          ok: dossierResponse.ok,
          data: dossierData
        },
        typeOperation: {
          status: typeResponse.status,
          ok: typeResponse.ok,
          data: typeData
        },
        controlesFond: {
          status: controlesResponse.status,
          ok: controlesResponse.ok,
          data: controlesData
        },
        timestamp: new Date().toISOString()
      })

      if (dossierResponse.ok && typeResponse.ok && controlesResponse.ok) {
        toast.success('Toutes les validations trouvées !')
      } else {
        toast.warning('Certaines validations manquent')
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error)
      setResults({
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      })
      toast.error('Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Vérificateur de Validations
        </CardTitle>
        <CardDescription>
          Vérifier l'existence des validations pour un dossier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dossier-id">ID du Dossier</Label>
          <Input
            id="dossier-id"
            value={dossierId}
            onChange={(e) => setDossierId(e.target.value)}
            placeholder="ID du dossier à vérifier"
          />
        </div>

        <Button 
          onClick={checkValidations} 
          disabled={loading || !dossierId.trim()}
          className="w-full"
        >
          {loading ? 'Vérification...' : 'Vérifier les Validations'}
        </Button>

        {results && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Résultats de la Vérification</h3>
            
            {/* Dossier */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.dossier?.ok ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">Dossier</span>
                <Badge variant={results.dossier?.ok ? "default" : "destructive"}>
                  {results.dossier?.status}
                </Badge>
              </div>
              {results.dossier?.data?.dossier && (
                <div className="text-sm space-y-1">
                  <div><strong>Numéro:</strong> {results.dossier.data.dossier.numeroDossier}</div>
                  <div><strong>Statut:</strong> {results.dossier.data.dossier.statut}</div>
                </div>
              )}
            </div>

            {/* Type d'Opération */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.typeOperation?.ok ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">Validation Type d'Opération</span>
                <Badge variant={results.typeOperation?.ok ? "default" : "destructive"}>
                  {results.typeOperation?.status}
                </Badge>
              </div>
              {results.typeOperation?.data?.validation ? (
                <div className="text-sm space-y-1">
                  <div><strong>Type:</strong> {results.typeOperation.data.validation.type_operation?.nom}</div>
                  <div><strong>Nature:</strong> {results.typeOperation.data.validation.nature_operation?.nom}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {results.typeOperation?.data?.error || 'Aucune validation trouvée'}
                </div>
              )}
            </div>

            {/* Contrôles de Fond */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.controlesFond?.ok ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">Contrôles de Fond</span>
                <Badge variant={results.controlesFond?.ok ? "default" : "destructive"}>
                  {results.controlesFond?.status}
                </Badge>
              </div>
              {results.controlesFond?.data?.validations ? (
                <div className="text-sm space-y-1">
                  <div><strong>Nombre de validations:</strong> {results.controlesFond.data.validations.length}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {results.controlesFond?.data?.error || 'Aucune validation trouvée'}
                </div>
              )}
            </div>

            {/* Détails complets */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Détails Complets</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
