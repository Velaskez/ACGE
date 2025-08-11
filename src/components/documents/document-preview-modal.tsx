'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Image, Video, Music, Archive } from 'lucide-react'
import { DocumentItem } from '@/types/document'

interface DocumentPreviewModalProps {
  document: DocumentItem
  isOpen: boolean
  onClose: () => void
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileText className="h-8 w-8 text-gray-500" />
  if (fileType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />
  if (fileType.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />
  if (fileType.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-8 w-8 text-orange-500" />
  return <FileText className="h-8 w-8 text-gray-500" />
}

const canPreview = (fileType?: string) => {
  if (!fileType) return false
  return fileType.startsWith('image/') || 
         fileType === 'application/pdf' ||
         fileType.startsWith('text/')
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = document.currentVersion?.fileName || 'document'
        window.document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{document.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du document */}
          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg">
            {getFileIcon(document.currentVersion?.fileType)}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{document.currentVersion?.fileName || 'Sans nom'}</h3>
                <Badge variant="secondary">{document.currentVersion?.fileType || 'Inconnu'}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                {formatFileSize(document.currentVersion?.fileSize || 0)} • Version {document.currentVersion?.versionNumber || 0}
              </p>
              {document.description && (
                <p className="text-sm text-gray-700">{document.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Créé le {new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
                <span>Par {document.author?.name || 'Inconnu'}</span>
              </div>
            </div>
            <Button onClick={handleDownload} size="sm" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </div>

          {/* Aperçu du contenu */}
          <div className="border rounded-lg overflow-hidden">
            {canPreview(document.currentVersion?.fileType) ? (
              <div className="bg-white">
                {document.currentVersion?.fileType?.startsWith('image/') && (
                  <div className="p-4 text-center">
                    <img 
                      src={`/api/documents/${document.id}/download`} 
                      alt={document.currentVersion?.fileName || 'Image'}
                      className="max-w-full max-h-96 mx-auto rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling!.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden text-gray-500 py-8">
                      Impossible d'afficher l'image
                    </div>
                  </div>
                )}
                
                {document.currentVersion?.fileType === 'application/pdf' && (
                  <div className="p-4 text-center">
                    <iframe 
                      src={`/api/documents/${document.id}/download`}
                      className="w-full h-96 border-0"
                      title={document.currentVersion?.fileName || 'PDF'}
                    />
                  </div>
                )}
                
                {document.currentVersion?.fileType?.startsWith('text/') && (
                  <div className="p-4">
                    <iframe 
                      src={`/api/documents/${document.id}/download`}
                      className="w-full h-64 border-0"
                      title={document.currentVersion?.fileName || 'Texte'}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  {getFileIcon(document.currentVersion?.fileType)}
                </div>
                <p className="text-lg font-medium mb-2">Aperçu non disponible</p>
                <p className="text-sm">
                  Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
                </p>
                <Button onClick={handleDownload} className="mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger pour voir
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
