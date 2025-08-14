'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react'

interface FileWithPreview extends File {
  preview?: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error'
  errorMessage?: string
}

interface FileUploadZoneProps {
  onUpload?: (files: FileWithPreview[]) => Promise<void>
  maxFiles?: number
  maxSize?: number // en MB
  acceptedTypes?: string[]
  className?: string
}

export function FileUploadZone({
  onUpload,
  maxFiles = 10,
  maxSize = 50, // 50MB par défaut
  acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/*',
    'text/*'
  ],
  className = ''
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('')
    
    // Gérer les fichiers rejetés
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => {
          switch (e.code) {
            case 'file-too-large':
              return `${file.name} est trop volumineux (max: ${maxSize}MB)`
            case 'file-invalid-type':
              return `${file.name} n'est pas un type de fichier autorisé`
            case 'too-many-files':
              return `Trop de fichiers (max: ${maxFiles})`
            default:
              return `${file.name}: ${e.message}`
          }
        })
        return errorMessages.join(', ')
      })
      setError(errors.join('; '))
    }

    // Ajouter les fichiers acceptés
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploadProgress: 0,
        uploadStatus: 'pending' as const
      })
      return fileWithPreview
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [maxFiles, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize: maxSize * 1024 * 1024, // Convertir MB en bytes
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />
    if (file.type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (file.type.includes('word') || file.type.includes('document')) 
      return <FileText className="w-5 h-5 text-blue-600" />
    if (file.type.includes('excel') || file.type.includes('sheet')) 
      return <FileText className="w-5 h-5 text-green-600" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (files.length === 0 || !onUpload) return

    setIsUploading(true)
    setError('')

    try {
      await onUpload(files)
      
      // Marquer tous les fichiers comme uploadés avec succès
      setFiles(prev => prev.map(file => ({
        ...file,
        uploadStatus: 'success' as const,
        uploadProgress: 100
      })))

      // Nettoyer après 2 secondes
      setTimeout(() => {
        setFiles([])
      }, 2000)

    } catch (error) {
      setError('Erreur lors de l\'upload des fichiers')
      setFiles(prev => prev.map(file => ({
        ...file,
        uploadStatus: 'error' as const,
        errorMessage: 'Upload échoué'
      })))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 mb-4 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">
                Déposez les fichiers ici...
              </p>
            ) : (
              <div>
                              <p className="text-lg font-medium text-primary dark:text-primary mb-2">
                Glissez-déposez vos fichiers ici
              </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou cliquez pour sélectionner des fichiers
                </p>
                <Button variant="outline">
                  Parcourir les fichiers
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Formats acceptés : PDF, Word, Excel, Images, Texte</p>
              <p>Taille maximale : {maxSize}MB par fichier • Maximum {maxFiles} fichiers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-lg">
                Fichiers sélectionnés ({files.length})
              </h3>
              
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* Icône et preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>

                  {/* Informations du fichier */}
                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-primary dark:text-primary truncate">
                  {file.name}
                </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Barre de progression */}
                    {file.uploadStatus === 'uploading' && (
                      <Progress value={file.uploadProgress || 0} className="mt-2 h-2" />
                    )}
                    
                    {/* Message d'erreur */}
                    {file.uploadStatus === 'error' && file.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{file.errorMessage}</p>
                    )}
                  </div>

                  {/* Statut et actions */}
                  <div className="flex items-center gap-2">
                    {file.uploadStatus === 'success' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {file.uploadStatus === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {file.uploadStatus === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    
                    {file.uploadStatus === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton d'upload */}
            {files.some(f => f.uploadStatus === 'pending') && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="min-w-32"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Uploader {files.filter(f => f.uploadStatus === 'pending').length} fichier(s)
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
