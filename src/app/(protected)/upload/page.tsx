'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { FileUploadZone } from '@/components/upload/file-upload-zone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFolders } from '@/hooks/use-folders'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  FolderOpen, 
  Tag,
  ArrowLeft,
  Check
} from 'lucide-react'

interface FileMetadata {
  tags: string[]
  folderId?: string
}

export default function UploadPage() {
  const router = useRouter()
  const { folders, isLoading: foldersLoading } = useFolders()
  const [metadata, setMetadata] = useState<FileMetadata>({
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (files: File[]) => {
    setError('')
    
    try {
      const formData = new FormData()
      
      // Ajouter les fichiers
      files.forEach((file, index) => {
        formData.append(`files`, file)
      })
      
      // Ajouter les métadonnées
      formData.append('metadata', JSON.stringify({
        ...metadata,
        fileCount: files.length
      }))

      console.log('Client: Sending upload request to /api/upload')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      console.log(`Client: Received response status: ${response.status} ${response.statusText}`)
      console.log(`Client: Response headers:`, Object.fromEntries(response.headers.entries()))

      const text = await response.text()
      let result: any = {}
      try { 
        result = text ? JSON.parse(text) : {} 
        console.log('Client: Parsed response body:', result)
      } catch (parseError) {
        console.error('Client: Error parsing response JSON:', parseError, 'Raw text:', text)
        result = {}
      }

      if (!response.ok) {
        const serverError = result?.error || 'Erreur lors de l\'upload'
        const details = Array.isArray(result?.errors) && result.errors.length
          ? ` (${result.errors.length} fichier(s) en erreur)`
          : ''
        const errorDetails = result?.details ? ` - ${result.details}` : ''
        throw new Error(`${serverError}${details}${errorDetails}`)
      }

      // Cas de succès avec erreurs partielles côté serveur
      if (Array.isArray(result?.errors) && result.errors.length) {
        const errorDetails = result.errors.map((err: any) => 
          `${err.fileName}: ${err.message}`
        ).join('; ')
        setError(`Upload partiel: ${result.errors.length} échec(s). Détails: ${errorDetails}`)
      }

      // Afficher le résumé de l'upload
      if (result.summary) {
        console.log('📊 Résumé upload:', result.summary)
        if (result.summary.failed > 0) {
          setError(`Upload terminé: ${result.summary.success} succès, ${result.summary.failed} échec(s)`)
        }
      }

      setIsSuccess(true)
      
      // Mise à jour optimiste de la liste des documents
      if (result.files && result.files.length > 0) {
        // Stocker les nouveaux documents dans sessionStorage pour la page documents
        const newDocuments = result.files.map((file: any) => ({
          id: file.id,
          title: file.title,
          description: file.description || '',
          author: { id: 'current-user', name: 'Vous', email: 'current@user.com' },
          folderId: file.folderId || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentVersion: {
            id: file.id,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            filePath: file.path,
            url: file.url,
            createdAt: new Date().toISOString()
          },
          tags: file.tags || []
        }))
        
        sessionStorage.setItem('newDocuments', JSON.stringify(newDocuments))
      }
      
      // Redirection immédiate après succès
      router.push('/documents')

    } catch (error) {
      console.error('Erreur upload:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="text-center animate-fade-in-up transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                Upload réussi !
              </h2>
              <p className="text-muted-foreground mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                Vos fichiers ont été uploadés avec succès.
              </p>
              <p className="text-sm text-muted-foreground animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                Redirection vers la liste des documents...
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header amélioré */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="transition-all duration-300 hover:scale-110 hover:bg-muted/80"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                  Upload de Fichiers
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Ajoutez de nouveaux fichiers à l'application avec des métadonnées
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone d'upload principal */}
          <div className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Sélection des fichiers
                </CardTitle>
                <CardDescription>
                  Glissez-déposez vos fichiers ou cliquez pour les sélectionner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone onUpload={handleUpload} />
              </CardContent>
            </Card>
          </div>

          {/* Options d'organisation */}
          <div className="space-y-6">
            {/* Tags */}
            <Card className="animate-fade-in-up transition-all duration-300 hover:shadow-lg" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Ajoutez des tags pour faciliter la recherche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    className="transition-all duration-300 hover:border-primary/50 focus:scale-[1.02]"
                  />
                  <Button 
                    onClick={addTag} 
                    size="sm"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Ajouter
                  </Button>
                </div>

                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-fade-in">
                    {metadata.tags.map((tag, index) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-primary/20 animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dossier de destination */}
            <Card className="animate-fade-in-up transition-all duration-300 hover:shadow-lg" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  Dossier
                </CardTitle>
                <CardDescription>
                  Sélectionnez le dossier de destination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={metadata.folderId || 'root'}
                  onValueChange={(value) => setMetadata(prev => ({ 
                    ...prev, 
                    folderId: value === 'root' ? undefined : value 
                  }))}
                >
                  <SelectTrigger className="transition-all duration-300 hover:border-primary/50 focus:scale-[1.02]">
                    <SelectValue placeholder="Racine (aucun dossier)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">Racine (aucun dossier)</SelectItem>
                    {foldersLoading ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : (
                      folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                          {folder.documentCount !== undefined && ` (${folder.documentCount})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}

// Styles CSS pour les animations
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out;
  }
`

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
