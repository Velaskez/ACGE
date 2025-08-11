'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Check, 
  AlertCircle,
  Loader2,
  Camera
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
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [hasCaptured, setHasCaptured] = useState(false)
  const [capturePreviewUrl, setCapturePreviewUrl] = useState<string | null>(null)
  const [captureBlob, setCaptureBlob] = useState<Blob | null>(null)

  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string | null>(null)
  const [mobileCapturedFile, setMobileCapturedFile] = useState<File | null>(null)
  const [isProcessingAuto, setIsProcessingAuto] = useState(false)

  // Dimensions naturelles pour la zone d'aperçu (desktop)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [cropPoints, setCropPoints] = useState<
    { x: number; y: number }[] | null
  >(null)

  // Dimensions naturelles pour la zone d'aperçu (mobile)
  const [mobileNaturalSize, setMobileNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [mobileCropPoints, setMobileCropPoints] = useState<
    { x: number; y: number }[] | null
  >(null)

  const svgRef = useRef<SVGSVGElement | null>(null)
  const mobileSvgRef = useRef<SVGSVGElement | null>(null)
  const draggingHandleRef = useRef<{ index: number; type: 'desktop' | 'mobile' } | null>(null)

  // Chargement dynamique d'OpenCV dans le navigateur
  const ensureOpenCvLoaded = useCallback(async () => {
    if (typeof window === 'undefined') return
    const w = window as any
    if (w.cv && w.cv.getBuildInformation) return
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://docs.opencv.org/4.x/opencv.js'
      script.onload = () => {
        const tryReady = () => {
          if (w.cv && w.cv.getBuildInformation) resolve()
          else setTimeout(tryReady, 100)
        }
        tryReady()
      }
      script.onerror = () => reject(new Error('Impossible de charger OpenCV.js'))
      document.body.appendChild(script)
    })
  }, [])

  const orderCorners = (pts: { x: number; y: number }[]) => {
    // Ordonner en TL, TR, BR, BL
    const sum = pts.map(p => p.x + p.y)
    const diff = pts.map(p => p.y - p.x)
    const tl = pts[sum.indexOf(Math.min(...sum))]
    const br = pts[sum.indexOf(Math.max(...sum))]
    const tr = pts[diff.indexOf(Math.min(...diff))]
    const bl = pts[diff.indexOf(Math.max(...diff))]
    return [tl, tr, br, bl]
  }

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  const autoDetectQuadrilateral = async (imgUrl: string, size: { width: number; height: number }) => {
    await ensureOpenCvLoaded()
    const cv = (window as any).cv
    return await new Promise<{ x: number; y: number }[]>((resolve) => {
    const img = new window.Image()
      img.onload = () => {
        try {
          const mat = cv.imread(img)
          const gray = new cv.Mat()
          const blurred = new cv.Mat()
          const edges = new cv.Mat()
          cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY)
          cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0)
          cv.Canny(blurred, edges, 50, 150)
          const contours = new cv.MatVector()
          const hierarchy = new cv.Mat()
          cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

          let best: { x: number; y: number }[] | null = null
          let bestArea = 0
          for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i)
            const peri = cv.arcLength(cnt, true)
            const approx = new cv.Mat()
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
            if (approx.rows === 4) {
              const pts: { x: number; y: number }[] = []
              for (let r = 0; r < 4; r++) {
                const x = approx.intPtr(r, 0)[0]
                const y = approx.intPtr(r, 0)[1]
                pts.push({ x, y })
              }
              const ordered = orderCorners(pts)
              // Aire via dimensions du quadrilatère approximée
              const w = Math.max(distance(ordered[0], ordered[1]), distance(ordered[2], ordered[3]))
              const h = Math.max(distance(ordered[1], ordered[2]), distance(ordered[3], ordered[0]))
              const area = w * h
              if (area > bestArea) {
                bestArea = area
                best = ordered
              }
            }
            approx.delete()
            cnt.delete()
          }
          contours.delete(); hierarchy.delete(); mat.delete(); gray.delete(); blurred.delete(); edges.delete()

          if (best) resolve(best)
          else {
            const marginW = Math.round(size.width * 0.05)
            const marginH = Math.round(size.height * 0.05)
            resolve([
              { x: marginW, y: marginH },
              { x: size.width - marginW, y: marginH },
              { x: size.width - marginW, y: size.height - marginH },
              { x: marginW, y: size.height - marginH }
            ])
          }
        } catch {
          const marginW = Math.round(size.width * 0.05)
          const marginH = Math.round(size.height * 0.05)
          resolve([
            { x: marginW, y: marginH },
            { x: size.width - marginW, y: marginH },
            { x: size.width - marginW, y: size.height - marginH },
            { x: marginW, y: size.height - marginH }
          ])
        }
      }
      img.src = imgUrl
    })
  }

  // Calculer l'image résultante par correction de perspective
  const generateWarpedBlob = async (
    imgUrl: string,
    size: { width: number; height: number },
    pts: { x: number; y: number }[]
  ): Promise<Blob> => {
    await ensureOpenCvLoaded()
    const cv = (window as any).cv
    return await new Promise<Blob>((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        try {
          const srcMat = cv.imread(img)
          const ordered = orderCorners(pts)
          const width = Math.round(
            Math.max(distance(ordered[0], ordered[1]), distance(ordered[2], ordered[3]))
          )
          const height = Math.round(
            Math.max(distance(ordered[1], ordered[2]), distance(ordered[3], ordered[0]))
          )
          const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            ordered[0].x, ordered[0].y,
            ordered[1].x, ordered[1].y,
            ordered[2].x, ordered[2].y,
            ordered[3].x, ordered[3].y
          ])
          const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            width - 1, 0,
            width - 1, height - 1,
            0, height - 1
          ])
          const M = cv.getPerspectiveTransform(srcTri, dstTri)
          const dst = new cv.Mat()
          cv.warpPerspective(srcMat, dst, M, new cv.Size(width, height))

          // Afficher dans un canvas et exporter en blob
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          cv.imshow(canvas, dst)
          canvas.toBlob(b => {
            if (!b) reject(new Error('Export impossible'))
            else resolve(b)
          }, 'image/jpeg', 0.95)

          srcMat.delete(); srcTri.delete(); dstTri.delete(); M.delete(); dst.delete()
        } catch (err) {
          reject(err as Error)
        }
      }
      img.src = imgUrl
    })
  }

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mobileCaptureInputRef = useRef<HTMLInputElement | null>(null)

  // Arrête proprement la caméra lorsqu'on ferme la modale
  const stopCamera = useCallback(() => {
    const video = videoRef.current
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

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

  const addImageFileToList = (file: File) => {
    const fileWithPreview: FileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
      uploadProgress: 0,
      uploadStatus: 'pending' as const
    })
    setFiles(prev => [...prev, fileWithPreview])
  }

  const startCamera = async () => {
    setError('')
    setIsCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback mobile capture si getUserMedia indisponible
        mobileCaptureInputRef.current?.click()
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
        setHasCaptured(false)
        setCapturePreviewUrl(null)
        setCaptureBlob(null)
        setIsCameraOpen(true)
      }
    } catch (e) {
      // Fallback vers input capture (mobile)
      mobileCaptureInputRef.current?.click()
    } finally {
      setIsCameraLoading(false)
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, width, height)

    // Préparer l'aperçu sans ajouter encore le fichier
    await new Promise<void>((resolve, reject) => {
      canvas.toBlob(async blob => {
        if (!blob) {
          reject(new Error('Capture impossible'))
          return
        }
        setCaptureBlob(blob)
        const url = URL.createObjectURL(blob)
        setCapturePreviewUrl(url)
        setHasCaptured(true)
        // Charger dimensions + auto-détection
        const temp = new window.Image()
        temp.onload = async () => {
          setNaturalSize({ width: temp.naturalWidth, height: temp.naturalHeight })
          setIsProcessingAuto(true)
          try {
            const autoPts = await autoDetectQuadrilateral(url, { width: temp.naturalWidth, height: temp.naturalHeight })
            setCropPoints(autoPts)
          } finally {
            setIsProcessingAuto(false)
          }
        }
        temp.src = url
        resolve()
      }, 'image/jpeg', 0.92)
    })
  }

  const onMobileCaptureChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Ouvrir un aperçu avant validation
      setMobileCapturedFile(file)
      const url = URL.createObjectURL(file)
      setMobilePreviewUrl(url)
      setIsMobilePreviewOpen(true)
      // Charger dimensions + auto-détection
      const temp = new window.Image()
      temp.onload = async () => {
        setMobileNaturalSize({ width: temp.naturalWidth, height: temp.naturalHeight })
        setIsProcessingAuto(true)
        try {
          const autoPts = await autoDetectQuadrilateral(url, { width: temp.naturalWidth, height: temp.naturalHeight })
          setMobileCropPoints(autoPts)
        } finally {
          setIsProcessingAuto(false)
        }
      }
      temp.src = url
    }
    // reset pour permettre une nouvelle capture identique
    if (mobileCaptureInputRef.current) {
      mobileCaptureInputRef.current.value = ''
    }
  }

  const handleScanClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    if (isMobileDevice()) {
      mobileCaptureInputRef.current?.click()
    } else {
      startCamera()
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />
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
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou cliquez pour sélectionner des fichiers
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <Button variant="outline">
                    Parcourir les fichiers
                  </Button>
                  <Button type="button" onClick={handleScanClick} disabled={isCameraLoading}>
                    {isCameraLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ouverture caméra...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Scanner
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Formats acceptés : PDF, Word, Excel, Images, Texte</p>
              <p>Taille maximale : {maxSize}MB par fichier • Maximum {maxFiles} fichiers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input caché pour fallback capture mobile */}
      <input
        ref={mobileCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onMobileCaptureChange}
        className="hidden"
      />

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
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
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

      {/* Modale caméra */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => {
        setIsCameraOpen(open)
        if (!open) {
          if (capturePreviewUrl) {
            URL.revokeObjectURL(capturePreviewUrl)
            setCapturePreviewUrl(null)
          }
          setHasCaptured(false)
          setCaptureBlob(null)
          stopCamera()
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scanner un document</DialogTitle>
            <DialogDescription>
              {hasCaptured ? 'Vérifiez l’aperçu puis validez ou reprenez.' : 'Alignez votre document et appuyez sur « Prendre la photo ».'}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {hasCaptured && capturePreviewUrl && naturalSize ? (
              <div className="relative w-full rounded-md overflow-hidden bg-black aspect-[3/2]">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
                  className="w-full h-full"
                  onPointerMove={(e) => {
                    if (!draggingHandleRef.current || !cropPoints || !svgRef.current) return
                    const rect = svgRef.current.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * naturalSize.width
                    const y = ((e.clientY - rect.top) / rect.height) * naturalSize.height
                    const next = [...cropPoints]
                    next[draggingHandleRef.current.index] = { x: Math.max(0, Math.min(naturalSize.width, x)), y: Math.max(0, Math.min(naturalSize.height, y)) }
                    setCropPoints(next)
                  }}
                  onPointerUp={() => { draggingHandleRef.current = null }}
                  onPointerLeave={() => { draggingHandleRef.current = null }}
                >
                  <image href={capturePreviewUrl} x={0} y={0} width={naturalSize.width} height={naturalSize.height} preserveAspectRatio="xMidYMid meet" />
                  {cropPoints && (
                    <>
                      <polygon points={cropPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={4} />
                      {cropPoints.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r={18}
                          fill="#fff"
                          stroke="#3b82f6"
                          strokeWidth={4}
                          onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); draggingHandleRef.current = { index: i, type: 'desktop' } }}
                        />
                      ))}
                    </>
                  )}
                </svg>
                {isProcessingAuto && (
                  <div className="absolute inset-0 grid place-items-center text-white/80 text-sm">Détection automatique…</div>
                )}
              </div>
            ) : (
              <div className="relative w-full rounded-md overflow-hidden bg-black aspect-[3/2]">
                <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
              </div>
            )}
          </div>
          <DialogFooter className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => { setIsCameraOpen(false); stopCamera() }}>Annuler</Button>
            {hasCaptured ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => {
                  if (capturePreviewUrl) {
                    URL.revokeObjectURL(capturePreviewUrl)
                  }
                  setCapturePreviewUrl(null)
                  setCaptureBlob(null)
                  setHasCaptured(false)
                  const v = videoRef.current
                  if (v && v.paused) v.play().catch(() => {})
                }}>Reprendre</Button>
                <Button onClick={async () => {
                  if (!capturePreviewUrl || !naturalSize || !cropPoints) return
                  setIsProcessingAuto(true)
                  try {
                    const warped = await generateWarpedBlob(capturePreviewUrl, naturalSize, cropPoints)
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                    const file = new (globalThis as any).File([warped], `scan-${timestamp}.jpg`, { type: 'image/jpeg' }) as File
                    addImageFileToList(file)
                    if (capturePreviewUrl) URL.revokeObjectURL(capturePreviewUrl)
                    setIsCameraOpen(false)
                    setCapturePreviewUrl(null)
                    setCaptureBlob(null)
                    setHasCaptured(false)
                    stopCamera()
                  } finally {
                    setIsProcessingAuto(false)
                  }
                }}>Valider</Button>
              </div>
            ) : (
              <Button onClick={capturePhoto}>
                <Camera className="mr-2 h-4 w-4" />
                Prendre la photo
              </Button>
            )}
          </DialogFooter>
          {/* Canvas hors écran pour la capture */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>

      {/* Modale d'aperçu mobile */}
      <Dialog open={isMobilePreviewOpen} onOpenChange={(open) => {
        setIsMobilePreviewOpen(open)
        if (!open) {
          if (mobilePreviewUrl) {
            URL.revokeObjectURL(mobilePreviewUrl)
            setMobilePreviewUrl(null)
          }
          setMobileCapturedFile(null)
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Aperçu du document</DialogTitle>
            <DialogDescription>Validez pour ajouter le scan ou annulez pour recommencer.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full rounded-md overflow-hidden bg-black aspect-[3/2]">
            {mobilePreviewUrl && mobileNaturalSize ? (
              <svg
                ref={mobileSvgRef}
                viewBox={`0 0 ${mobileNaturalSize.width} ${mobileNaturalSize.height}`}
                className="w-full h-full"
                onPointerMove={(e) => {
                  if (!draggingHandleRef.current || draggingHandleRef.current.type !== 'mobile' || !mobileCropPoints || !mobileSvgRef.current) return
                  const rect = mobileSvgRef.current.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * mobileNaturalSize.width
                  const y = ((e.clientY - rect.top) / rect.height) * mobileNaturalSize.height
                  const next = [...mobileCropPoints]
                  next[draggingHandleRef.current.index] = { x: Math.max(0, Math.min(mobileNaturalSize.width, x)), y: Math.max(0, Math.min(mobileNaturalSize.height, y)) }
                  setMobileCropPoints(next)
                }}
                onPointerUp={() => { draggingHandleRef.current = null }}
                onPointerLeave={() => { draggingHandleRef.current = null }}
              >
                <image href={mobilePreviewUrl} x={0} y={0} width={mobileNaturalSize.width} height={mobileNaturalSize.height} preserveAspectRatio="xMidYMid meet" />
                {mobileCropPoints && (
                  <>
                    <polygon points={mobileCropPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={4} />
                    {mobileCropPoints.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={18}
                        fill="#fff"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); draggingHandleRef.current = { index: i, type: 'mobile' } }}
                      />
                    ))}
                  </>
                )}
              </svg>
            ) : null}
            {isProcessingAuto && (
              <div className="absolute inset-0 grid place-items-center text-white/80 text-sm">Détection automatique…</div>
            )}
          </div>
          <DialogFooter className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => {
              setIsMobilePreviewOpen(false)
            }}>Annuler</Button>
            <Button onClick={async () => {
              if (!mobilePreviewUrl || !mobileNaturalSize || !mobileCropPoints) return
              setIsProcessingAuto(true)
              try {
                const warped = await generateWarpedBlob(mobilePreviewUrl, mobileNaturalSize, mobileCropPoints)
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                const file = new (globalThis as any).File([warped], `scan-${timestamp}.jpg`, { type: 'image/jpeg' }) as File
                addImageFileToList(file)
                setIsMobilePreviewOpen(false)
              } finally {
                setIsProcessingAuto(false)
              }
            }}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
