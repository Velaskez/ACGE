'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { formatRelativeTime } from '@/lib/utils'
import {
  User,
  Mail,
  Shield,
  Calendar,
  FileText,
  Share2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  Key,
  Camera,
  Edit3
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/components/profile/profile-form'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  _count: {
    documents: number
    sharedWith: number
  }
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Gestion de l'affichage des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // États pour les animations
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  // Initialiser avec les données du contexte si disponibles
  useEffect(() => {
    if (user && !profile && formData.name === '' && formData.email === '') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user, profile, formData.name, formData.email])

  // Fallback sur les données du contexte auth si le profil n'est pas chargé
  const displayProfile = profile || (user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { documents: 0, sharedWith: 0 }
  } : null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(`Erreur lors du chargement du profil: ${errorData.error || response.status}`)
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Effacer les messages d'erreur/succès quand on modifie
    if (error) setError('')
    if (success) setSuccess('')
    
    // Activer le mode édition
    if (!isEditing) setIsEditing(true)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis')
      return false
    }

    if (!formData.email.trim()) {
      setError('L\'email est requis')
      return false
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format d\'email invalide')
      return false
    }

    // Si un nouveau mot de passe est fourni
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Le mot de passe actuel est requis pour changer le mot de passe')
        return false
      }

      if (formData.newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
        return false
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('La confirmation du mot de passe ne correspond pas')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim()
      }

      // Ajouter les mots de passe seulement si nécessaire
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profil mis à jour avec succès !')
        setIsEditing(false)
        
        // Réinitialiser les champs de mot de passe
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))

        // Rafraîchir le profil et le contexte utilisateur
        await Promise.all([fetchProfile(), refreshUser()])

        // Faire disparaître le message de succès après 5 secondes
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Réinitialiser le formulaire avec les données originales
    if (displayProfile) {
      setFormData({
        name: displayProfile.name || '',
        email: displayProfile.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Administrateur', className: 'bg-primary/10 text-primary border-primary/20' },
      MANAGER: { label: 'Gestionnaire', className: 'bg-primary/20 text-primary border-primary/30' },
      USER: { label: 'Utilisateur', className: 'bg-primary/10 text-primary border-primary/20' }
    }
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
    return <Badge className={`${config.className} border transition-colors duration-200`}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 1)
  }

  return (
    <MainLayout>
      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skeleton pour les informations du profil */}
            <div className="lg:col-span-1">
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-7 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-36" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-px w-full" />
                  
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skeleton pour le formulaire de modification */}
            <div className="lg:col-span-2">
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-7 w-40" />
                  </div>
                  <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Informations personnelles */}
                  <div className="space-y-6">
                    <Skeleton className="h-6 w-44" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>

                  <Skeleton className="h-px w-full" />

                  {/* Changement de mot de passe */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-44" />
                    </div>
                    <Skeleton className="h-4 w-80" />

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-48" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Messages */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations du profil */}
            <div className="lg:col-span-1">
              <Card className="card-elevated group animate-fade-in-scale">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {displayProfile && (
                    <>
                                             <div className="flex items-center gap-4">
                         <div className="relative group/avatar">
                           <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg shadow-lg avatar-hover">
                             {getInitials(displayProfile.name)}
                           </div>
                         </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-foreground">{displayProfile.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {displayProfile.email}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                          <span className="text-sm font-medium text-foreground">Rôle</span>
                          <div className="badge-animated">
                            {getRoleBadge(displayProfile.role)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                          <span className="text-sm font-medium text-foreground">Documents</span>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{displayProfile._count.documents}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                          <span className="text-sm font-medium text-foreground">Partages reçus</span>
                          <div className="flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{displayProfile._count.sharedWith}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200">
                          <span className="text-sm font-medium text-foreground">Membre depuis</span>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{formatRelativeTime(displayProfile.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de modification */}
            <div className="lg:col-span-2">
              <Card className="card-elevated animate-fade-in-scale">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        Modifier le profil
                      </CardTitle>
                      <CardDescription className="mt-2 text-base text-muted-foreground">
                        Mettez à jour vos informations personnelles et votre mot de passe
                      </CardDescription>
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full animate-pulse-glow">
                        <Edit3 className="h-4 w-4" />
                        Mode édition
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {displayProfile && (
                    <ProfileForm
                      user={displayProfile}
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                      isLoading={isSaving}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
