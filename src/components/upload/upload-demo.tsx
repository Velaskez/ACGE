'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModernUploadModal } from './modern-upload-modal'
import { Upload, FileText, Image, Archive } from 'lucide-react'

export function UploadDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleUploadSuccess = () => {
    console.log('Upload réussi !')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Nouveau composant d'upload</h1>
        <p className="text-muted-foreground">
          Interface moderne et ergonomique avec drag & drop, prévisualisation et gestion des métadonnées
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Fonctionnalités
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Support multi-formats (PDF, Word, Excel, Images, etc.)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Image className="h-4 w-4 text-green-500" />
              <span>Prévisualisation des fichiers avec icônes par type</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Archive className="h-4 w-4 text-purple-500" />
              <span>Interface à onglets pour organisation claire</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4 text-orange-500" />
              <span>Zone de drag & drop interactive et responsive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Améliorations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>✅ Interface moderne avec shadcn/ui</div>
            <div>✅ Drag & drop visuellement attrayant</div>
            <div>✅ Gestion des métadonnées organisée</div>
            <div>✅ Système de tags intuitif</div>
            <div>✅ Feedback utilisateur amélioré</div>
            <div>✅ Design responsive et accessible</div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setIsModalOpen(true)} 
          size="lg"
          className="min-w-[200px]"
        >
          <Upload className="mr-2 h-5 w-5" />
          Tester le nouveau modal
        </Button>
      </div>

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
