'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ModalWrapper } from '@/components/ui/modal-wrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Play,
  Pause,
  Volume2,
  FileSpreadsheet,
  FileImage,
  AlertCircle,
  Eye,
  X,
  Calendar,
  User,
  HardDrive,
  FolderOpen,
  Info
} from 'lucide-react'
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileText className="h-8 w-8 text-muted-foreground" />
  if (fileType.startsWith('image/')) return <Image className="h-8 w-8 text-muted-foreground" />
  if (fileType.startsWith('video/')) return <Video className="h-8 w-8 text-muted-foreground" />
  if (fileType.startsWith('audio/')) return <Music className="h-8 w-8 text-muted-foreground" />
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-8 w-8 text-muted-foreground" />
  if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
  return <FileText className="h-8 w-8 text-muted-foreground" />
}

const canPreview = (fileType?: string) => {
  if (!fileType) return false
  return fileType.startsWith('image/') || 
         fileType === 'application/pdf' ||
         fileType.startsWith('text/') ||
         fileType.startsWith('video/') ||
         fileType.startsWith('audio/') ||
         fileType === 'application/vnd.ms-excel' ||
         fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
         fileType === 'application/msword' ||
         fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

const getPreviewType = (fileType?: string): 'image' | 'pdf' | 'text' | 'video' | 'audio' | 'office' | 'unsupported' => {
  if (!fileType) return 'unsupported'
  if (fileType.startsWith('image/')) return 'image'
  if (fileType === 'application/pdf') return 'pdf'
  if (fileType.startsWith('text/')) return 'text'
  if (fileType.startsWith('video/')) return 'video'
  if (fileType.startsWith('audio/')) return 'audio'
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('word') || fileType.includes('document')) return 'office'
  return 'unsupported'
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)

  const previewType = getPreviewType(document.currentVersion?.fileType)

  useEffect(() => {
    if (isOpen && document.id) {
      loadPreview()
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [isOpen, document.id])

  const loadPreview = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('🔍 Chargement aperçu pour document:', document.id, document.title)
      console.log('📁 Type de fichier:', document.currentVersion?.fileType)
      console.log('📂 Chemin fichier:', document.currentVersion?.filePath)
      
      // Essayer d'abord l'API de téléchargement
      const response = await fetch(`/api/documents/${document.id}/download`)
      console.log('📡 Réponse API:', response.status, response.statusText)
      
      if (response.ok) {
        const blob = await response.blob()
        console.log('📦 Blob créé, taille:', blob.size, 'type:', blob.type)
        
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        console.log('✅ URL de prévisualisation créée via API')
      } else {
        // Si l'API échoue, essayer d'utiliser directement l'URL Supabase
        console.log('⚠️ API échouée, tentative avec URL Supabase directe')
        
        const filePath = document.currentVersion?.filePath
        if (filePath && (filePath.includes('supabase.co') || filePath.startsWith('http'))) {
          console.log('🔗 Utilisation URL Supabase directe:', filePath)
          
          // Créer un blob à partir de l'URL Supabase
          try {
            const supabaseResponse = await fetch(filePath)
            if (supabaseResponse.ok) {
              const blob = await supabaseResponse.blob()
              console.log('📦 Blob Supabase créé, taille:', blob.size, 'type:', blob.type)
              
              const url = URL.createObjectURL(blob)
              setPreviewUrl(url)
              console.log('✅ URL de prévisualisation créée via Supabase direct')
            } else {
              console.error('❌ Erreur Supabase direct:', supabaseResponse.status, supabaseResponse.statusText)
              throw new Error(`Erreur Supabase: ${supabaseResponse.status}`)
            }
          } catch (supabaseError) {
            console.error('❌ Erreur fetch Supabase:', supabaseError)
            throw supabaseError
          }
        } else {
          // Aucune URL disponible
          const errorData = await response.text()
          console.error('❌ Erreur API:', response.status, errorData)
          
          let errorMessage = 'Erreur lors du chargement du document'
          try {
            const errorJson = JSON.parse(errorData)
            errorMessage = errorJson.error || errorMessage
            if (errorJson.details) {
              errorMessage += ` (${errorJson.details})`
            }
          } catch {
            // Si ce n'est pas du JSON, utiliser le texte brut
            if (errorData) {
              errorMessage += `: ${errorData}`
            }
          }
          
          setError(errorMessage)
        }
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err)
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      if (previewUrl) {
        const a = window.document.createElement('a')
        a.style.display = 'none'
        a.href = previewUrl
        a.download = document.currentVersion?.fileName || 'document'
        window.document.body.appendChild(a)
        a.click()
        window.document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleFullscreen = () => setIsFullscreen(!isFullscreen)

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Progress value={undefined} className="w-48" />
          <p className="text-sm text-primary">Chargement de la prévisualisation...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (!previewUrl || !canPreview(document.currentVersion?.fileType)) {
      return (
        <div className="p-8 text-center text-primary">
          <div className="mb-4">
            {getFileIcon(document.currentVersion?.fileType)}
          </div>
          <h3 className="text-lg font-medium mb-2">Aperçu non disponible</h3>
          <p className="text-sm mb-4">
            Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
            Vous pouvez le télécharger pour l'ouvrir avec l'application appropriée.
          </p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Télécharger pour ouvrir
          </Button>
        </div>
      )
    }

    switch (previewType) {
      case 'image':
        return (
          <div className="relative bg-gray-50 min-h-96 flex items-center justify-center overflow-hidden">
            <img 
              src={previewUrl} 
              alt={document.currentVersion?.fileName || 'Image'}
              className="max-w-full max-h-96 transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onError={() => setError('Impossible de charger l\'image')}
            />
          </div>
        )

      case 'pdf':
        return (
          <div className="bg-gray-50" style={{ height: isFullscreen ? '70vh' : '500px' }}>
            <iframe 
              src={previewUrl}
              className="w-full h-full border-0"
              title={document.currentVersion?.fileName || 'PDF'}
              onError={() => setError('Impossible de charger le PDF')}
            />
          </div>
        )

      case 'video':
        return (
          <div className="bg-primary flex items-center justify-center" style={{ height: isFullscreen ? '60vh' : '400px' }}>
            <video 
              src={previewUrl}
              controls
              className="max-w-full max-h-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setError('Impossible de lire la vidéo')}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        )

      case 'audio':
        return (
          <div className="p-8 text-center bg-gray-50">
            <Music className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-4">{document.currentVersion?.fileName}</h3>
            <audio 
              src={previewUrl}
              controls 
              className="mx-auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setError('Impossible de lire l\'audio')}
            >
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </div>
        )

      case 'text':
        return (
          <div className="bg-white p-4 overflow-auto" style={{ maxHeight: '500px' }}>
            <iframe 
              src={previewUrl}
              className="w-full border-0 min-h-96"
              title={document.currentVersion?.fileName || 'Texte'}
              onError={() => setError('Impossible de charger le fichier texte')}
            />
          </div>
        )

      case 'office':
        return (
          <div className="p-8 text-center text-primary">
            <FileSpreadsheet className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">Document Office</h3>
            <p className="text-sm mb-4">
              Les documents Office nécessitent une application dédiée pour être visualisés.
            </p>
            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Télécharger pour ouvrir
            </Button>
          </div>
        )

      default:
        return (
          <div className="p-8 text-center text-primary">
            <FileText className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">Format non supporté</h3>
            <p className="text-sm">Téléchargez le fichier pour l'ouvrir.</p>
          </div>
        )
    }
  }

  return (
    <ModalWrapper isOpen={isOpen} onOpenChange={onClose}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          showCloseButton={false}
          className={`w-full max-w-5xl mx-auto transition-all duration-300 ${
            isFullscreen ? 'max-h-[98vh] w-[98vw]' : 'max-h-[85vh]'
          } overflow-hidden flex flex-col`}>
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getFileIcon(document.currentVersion?.fileType)}
              <div className="min-w-0 flex-1">
                <span className="truncate text-base sm:text-lg block">{document.title}</span>
                <p className="text-xs text-muted-foreground break-all">
                  {document.currentVersion?.fileName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMetadata(!showMetadata)}
                className="hidden sm:flex"
              >
                <Info className="h-4 w-4" />
                <span className="ml-1">Infos</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Métadonnées compactes - Version compacte */}
          <div className={`transition-all duration-300 overflow-hidden ${
            showMetadata ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <Label className="text-sm font-medium text-blue-900 block mb-1">Fichier</Label>
                  <p className="text-sm text-blue-800 break-all">{document.currentVersion?.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900 block mb-1">Taille</Label>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {document.currentVersion?.fileSize ? formatFileSize(document.currentVersion.fileSize) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900 block mb-1">Type</Label>
                  <Badge variant="secondary" className="text-xs">
                    {document.currentVersion?.fileType?.split('/')[1]?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900 block mb-1">Version</Label>
                  <Badge variant="outline" className="text-xs">
                    v{document.currentVersion?.versionNumber || 0}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900 block mb-1">Créé le</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {formatDate(document.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium text-blue-900 block mb-1">Auteur</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 break-all">
                      {document.author?.name || 'Inconnu'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barre d'outils de prévisualisation - Version compacte */}
          {canPreview(document.currentVersion?.fileType) && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 bg-gray-100 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                {previewType === 'image' && (
                  <div className="flex items-center gap-1 border rounded-md bg-white px-2 py-1">
                    <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 25} className="p-1 h-8 w-8">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
                    <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 300} className="p-1 h-8 w-8">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRotate} className="p-1 h-8 w-8">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={document.isPublic ? 'default' : 'secondary'} className="flex-shrink-0">
                    {document.isPublic ? 'Public' : 'Privé'}
                  </Badge>
                  {document._count?.versions && (
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      {document._count.versions} version(s)
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="sm:hidden"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleFullscreen} className="flex-shrink-0">
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
                </Button>
                <Button onClick={handleDownload} size="sm" className="flex-shrink-0">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Télécharger</span>
                </Button>
              </div>
            </div>
          )}

          {/* Zone de prévisualisation */}
          <div className="flex-1 border rounded-lg overflow-hidden bg-white">
            {renderPreviewContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </ModalWrapper>
  )
}