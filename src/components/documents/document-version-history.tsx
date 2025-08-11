'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatFileSize, formatRelativeTime } from '@/lib/utils'
import {
  History,
  Download,
  RotateCcw,
  FileText,
  Clock,
  User,
  MessageSquare
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
  const [isOpen, setIsOpen] = useState(false)

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
      const response = await fetch(`/api/documents/versions/${versionId}/restore`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la restauration')
      }

      // Rafraîchir la liste des versions
      await fetchVersions()
      
      // TODO: Afficher une notification de succès
      console.log(`Version ${versionNumber} restaurée avec succès`)
      
    } catch (err) {
      console.error('Erreur restauration:', err)
      // TODO: Afficher une notification d'erreur
    }
  }

  const handleDownload = async (versionId: string, fileName: string) => {
    try {
      // TODO: Implémenter le téléchargement de version spécifique
      console.log(`Téléchargement de la version ${versionId}: ${fileName}`)
    } catch (err) {
      console.error('Erreur téléchargement:', err)
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
      <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Historique des versions</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{documentTitle}</p>
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
                  <History className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                    Aucune version trouvée
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                          onClick={() => handleRestore(version.id, version.versionNumber)}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Restaurer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
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
    </Dialog>
  )
}
