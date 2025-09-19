'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

/**
 * Composant de test pour la fonctionnalité de rejet de dossier
 */
export function RejectTest() {
  const [dossierId, setDossierId] = useState('c8a73555-e928-46db-81e0-44465fd1d4f5')
  const [reason, setReason] = useState('Test de rejet - Motif de test')
  const [details, setDetails] = useState('Détails optionnels du test')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [dossierStatus, setDossierStatus] = useState<any>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  const checkDossierStatus = async () => {
    if (!dossierId.trim()) {
      toast.error('ID du dossier requis')
      return
    }

    try {
      setCheckingStatus(true)
      setDossierStatus(null)

      console.log('🔍 Vérification de l\'état du dossier:', dossierId)

      const response = await fetch(`/api/debug/dossier-status?id=${dossierId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      const responseData = await response.json()

      console.log('🔍 État du dossier:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      })

      setDossierStatus({
        status: response.status,
        ok: response.ok,
        data: responseData,
        timestamp: new Date().toISOString()
      })

      if (response.ok) {
        toast.success('État du dossier récupéré avec succès')
      } else {
        toast.error(`Erreur lors de la vérification: ${responseData.error || 'Erreur inconnue'}`)
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error)
      setDossierStatus({
        status: 'ERROR',
        ok: false,
        data: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
        timestamp: new Date().toISOString()
      })
      toast.error('Erreur de connexion lors de la vérification')
    } finally {
      setCheckingStatus(false)
    }
  }

  const testReject = async () => {
    if (!dossierId.trim() || !reason.trim()) {
      toast.error('ID du dossier et motif de rejet requis')
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const requestBody = {
        reason: reason.trim(),
        details: details.trim() || null
      }

      console.log('🧪 Test de rejet - Données envoyées:', {
        dossierId,
        body: requestBody
      })

      const response = await fetch(`/api/dossiers/${dossierId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()

      console.log('🧪 Test de rejet - Réponse:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      })

      setResult({
        status: response.status,
        ok: response.ok,
        data: responseData,
        timestamp: new Date().toISOString()
      })

      if (response.ok) {
        toast.success('Test de rejet réussi !')
      } else {
        toast.error(`Test de rejet échoué: ${responseData.error || 'Erreur inconnue'}`)
      }

    } catch (error) {
      console.error('🧪 Erreur lors du test de rejet:', error)
      setResult({
        status: 'ERROR',
        ok: false,
        data: { error: error instanceof Error ? error.message : 'Erreur inconnue' },
        timestamp: new Date().toISOString()
      })
      toast.error('Erreur de connexion lors du test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Test de Rejet de Dossier
        </CardTitle>
        <CardDescription>
          Composant de test pour vérifier la fonctionnalité de rejet de dossier CB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dossier-id">ID du Dossier</Label>
          <Input
            id="dossier-id"
            value={dossierId}
            onChange={(e) => setDossierId(e.target.value)}
            placeholder="ID du dossier à rejeter"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motif de Rejet *</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du rejet..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Détails (optionnel)</Label>
          <Textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Détails supplémentaires..."
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={checkDossierStatus} 
            disabled={checkingStatus || !dossierId.trim()}
            variant="outline"
            className="flex-1"
          >
            {checkingStatus ? 'Vérification...' : 'Vérifier l\'État'}
          </Button>
          <Button 
            onClick={testReject} 
            disabled={loading || !dossierId.trim() || !reason.trim()}
            className="flex-1"
          >
            {loading ? 'Test en cours...' : 'Tester le Rejet'}
          </Button>
        </div>

        {dossierStatus && (
          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {dossierStatus.ok ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">
                État du Dossier
              </span>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Statut HTTP:</strong> {dossierStatus.status}</div>
              <div><strong>Succès:</strong> {dossierStatus.ok ? 'Oui' : 'Non'}</div>
              <div><strong>Timestamp:</strong> {dossierStatus.timestamp}</div>
              {dossierStatus.data?.dossier && (
                <div className="mt-2">
                  <strong>Dossier:</strong>
                  <div className="ml-2 text-xs">
                    <div><strong>ID:</strong> {dossierStatus.data.dossier.id}</div>
                    <div><strong>Numéro:</strong> {dossierStatus.data.dossier.numeroDossier}</div>
                    <div><strong>Statut:</strong> {dossierStatus.data.dossier.statut}</div>
                    <div><strong>Peut être rejeté:</strong> {dossierStatus.data.canReject ? 'Oui' : 'Non'}</div>
                  </div>
                </div>
              )}
              <div className="mt-2">
                <strong>Données complètes:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(dossierStatus.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {result.ok ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">
                Résultat du Test de Rejet
              </span>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Statut HTTP:</strong> {result.status}</div>
              <div><strong>Succès:</strong> {result.ok ? 'Oui' : 'Non'}</div>
              <div><strong>Timestamp:</strong> {result.timestamp}</div>
              <div className="mt-2">
                <strong>Données de réponse:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
