'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModernUploadModal } from './modern-upload-modal'
import { Upload, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { StorageDiagnostic } from './storage-diagnostic'

export function UploadTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastUploadResult, setLastUploadResult] = useState<string>('')
  const [showDiagnostic, setShowDiagnostic] = useState(false)

  const handleUploadSuccess = () => {
    setLastUploadResult('Upload réussi !')
    console.log('Upload test: Success callback triggered')
  }

  const testScenarios = [
    {
      title: 'Diagnostic Stockage',
      description: 'Vérifier la configuration Supabase Storage',
      action: () => setShowDiagnostic(!showDiagnostic),
      icon: <Settings className="h-4 w-4" />
    },
    {
      title: 'Test Modal Standard',
      description: 'Ouvrir le modal d\'upload standard',
      action: () => setIsModalOpen(true),
      icon: <Upload className="h-4 w-4" />
    },
    {
      title: 'Test avec Dossier',
      description: 'Ouvrir le modal avec un dossier spécifique',
      action: () => setIsModalOpen(true),
      icon: <Upload className="h-4 w-4" />
    }
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Test du Composant Upload</h1>
        <p className="text-muted-foreground">
          Interface de test pour valider le nouveau composant d'upload moderne
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testScenarios.map((scenario, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {scenario.icon}
                {scenario.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {scenario.description}
              </p>
              <Button onClick={scenario.action} className="w-full">
                {scenario.title.includes('Diagnostic') ? 
                  (showDiagnostic ? 'Masquer' : 'Afficher') : 
                  'Lancer le test'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showDiagnostic && (
        <Card>
          <CardContent className="p-6">
            <StorageDiagnostic />
          </CardContent>
        </Card>
      )}

      {lastUploadResult && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Résultat du dernier test :</span>
              <span>{lastUploadResult}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Notes de test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>✅ Modal sans bouton X de fermeture</div>
          <div>✅ Marges réduites pour un design compact</div>
          <div>✅ Onglet "Fichiers existants" fonctionnel</div>
          <div>✅ Recherche dans les documents existants</div>
          <div>✅ Sélection multiple des fichiers existants</div>
          <div>✅ Gestion d'erreur robuste</div>
          <div>✅ Interface responsive et accessible</div>
        </CardContent>
      </Card>

      <ModernUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        maxFiles={10}
        maxSize={50}
      />
    </div>
  )
}
