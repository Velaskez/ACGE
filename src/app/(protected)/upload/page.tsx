'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { FileUploadZone } from '@/components/upload/file-upload-zone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Info,
  ArrowLeft,
  Check
} from 'lucide-react'

interface FileMetadata {
  name: string
  description: string
  tags: string[]
  folderId?: string
  category: string
}

export default function UploadPage() {
  const router = useRouter()
  const { folders, isLoading: foldersLoading } = useFolders()
  const [metadata, setMetadata] = useState<FileMetadata>({
    name: '',
    description: '',
    tags: [],
    category: 'document'
  })
  const [tagInput, setTagInput] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'document', label: 'Document' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Vidéo' },
    { value: 'audio', label: 'Audio' },
    { value: 'archive', label: 'Archive' },
    { value: 'other', label: 'Autre' }
  ]

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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'upload')
      }

      const result = await response.json()
      console.log('Upload réussi:', result)
      
      setIsSuccess(true)
      
      // Redirection après succès
      setTimeout(() => {
        router.push('/documents')
      }, 2000)

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
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Upload réussi !
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vos fichiers ont été uploadés avec succès.
              </p>
              <p className="text-sm text-gray-500">
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Upload className="w-8 h-8" />
                Upload de Fichiers
              </h1>
              <p className="text-muted-foreground">
                Ajoutez de nouveaux fichiers à l'application
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone d'upload principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sélection des fichiers</CardTitle>
                <CardDescription>
                  Glissez-déposez vos fichiers ou cliquez pour les sélectionner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone onUpload={handleUpload} />
              </CardContent>
            </Card>
          </div>

          {/* Métadonnées */}
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Métadonnées
                </CardTitle>
                <CardDescription>
                  Informations qui seront appliquées à tous les fichiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={metadata.category}
                    onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description des documents..."
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
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
                  />
                  <Button onClick={addTag} size="sm">
                    Ajouter
                  </Button>
                </div>

                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
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
                  <SelectTrigger>
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
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}
