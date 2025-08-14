'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import {
  History,
  Download,
  RotateCcw,
  FileText,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface DocumentVersion {
  id: string
  versionNumber: number
  fileName: string
  fileSize: number
  fileType: string
  changeLog: string | null
  createdAt: string
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  isCurrent: boolean
}

interface DocumentVersionHistoryProps {
  documentId: string
  documentTitle: string
  trigger?: React.ReactNode
}

export function DocumentVersionHistory({ 
  documentId, 
  documentTitle, 
  trigger 
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [restoreConfirm, setRestoreConfirm] = useState<{versionId: string, versionNumber: number} | null>(null)

  const fetchVersions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/documents/versions?documentId=${documentId}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des versions')
      }

      const data = await response.json()
      setVersions(data.versions)
      setCurrentVersionId(data.currentVersionId)
      
    } catch (err) {
      console.error('Erreur versions:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && documentId) {
      fetchVersions()
    }
  }, [isOpen, documentId])

  const handleRestore = async (versionId: string, versionNumber: number) => {
    try {
      setIsRestoring(versionId)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/documents/versions/${versionId}/restore`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la restauration')
      }

      // Rafraîchir la liste des versions
      await fetchVersions()
      
      setSuccess(`Version ${versionNumber} restaurée avec succès !`)
      setRestoreConfirm(null)
      
      // Faire disparaître le message de succès après 5 secondes
      setTimeout(() => setSuccess(null), 5000)
      
    } catch (err) {
      console.error('Erreur restauration:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la restauration')
      setRestoreConfirm(null)
    } finally {
      setIsRestoring(null)
    }
  }

  const confirmRestore = (versionId: string, versionNumber: number) => {
    setRestoreConfirm({ versionId, versionNumber })
  }

  const handleDownload = async (versionId: string, fileName: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/documents/versions/${versionId}/download`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du téléchargement')
      }

      // Créer un blob à partir de la réponse
      const blob = await response.blob()
      
      // Créer un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      
      // Déclencher le téléchargement
      document.body.appendChild(a)
      a.click()
      
      // Nettoyer
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      console.error('Erreur téléchargement:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement')
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <History className="mr-2 h-4 w-4" />
      Historique
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Historique des versions</span>
          </DialogTitle>
          <p className="text-sm text-primary">{documentTitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // État d'erreur
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <MessageSquare className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : versions.length === 0 ? (
            // État vide
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-2 text-sm font-medium text-primary">
                    Aucune version trouvée
                  </h3>
                  <p className="mt-1 text-sm text-primary">
                    Ce document n'a pas d'historique de versions.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Liste des versions
            versions.map((version) => (
              <Card key={version.id} className={version.isCurrent ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">
                          Version {version.versionNumber}
                        </CardTitle>
                        {version.isCurrent && (
                          <Badge variant="default" className="bg-green-600">
                            Actuelle
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{version.fileName}</span>
                        </span>
                        <span>{formatFileSize(version.fileSize)}</span>
                      </CardDescription>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(version.id, version.fileName)}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Télécharger
                      </Button>
                      
                      {!version.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmRestore(version.id, version.versionNumber)}
                          disabled={isRestoring === version.id}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          {isRestoring === version.id ? 'Restauration...' : 'Restaurer'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-primary">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>{version.createdBy.name || version.createdBy.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(version.createdAt)}</span>
                    </div>
                    
                    {version.changeLog && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-3 w-3 mt-0.5" />
                        <span className="flex-1">{version.changeLog}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>

      {/* Dialog de confirmation de restauration */}
      <AlertDialog open={!!restoreConfirm} onOpenChange={() => setRestoreConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-500" />
              Confirmer la restauration
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir restaurer la <strong>version {restoreConfirm?.versionNumber}</strong> de ce document ?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Points importants :</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Cette action changera la version actuelle du document</li>
                      <li>La version actuelle sera conservée dans l'historique</li>
                      <li>Tous les utilisateurs verront la version restaurée</li>
                      <li>Cette action est réversible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreConfirm && handleRestore(restoreConfirm.versionId, restoreConfirm.versionNumber)}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={!!isRestoring}
            >
              {isRestoring ? 'Restauration en cours...' : 'Confirmer la restauration'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
