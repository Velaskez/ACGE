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
  Key
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Administrateur', className: 'bg-red-100 text-red-800' },
      MANAGER: { label: 'Gestionnaire', className: 'bg-blue-100 text-blue-800' },
      USER: { label: 'Utilisateur', className: 'bg-green-100 text-green-800' }
    }
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <MainLayout
      title="Mon Profil"
      description="Gérez vos informations personnelles et votre sécurité"
      icon={User}
    >
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skeleton pour les informations du profil */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-px w-full" />
                  
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skeleton pour le formulaire de modification */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  </div>

                  <Skeleton className="h-px w-full" />

                  {/* Changement de mot de passe */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-4 w-80" />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-9 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-9 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-44" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations du profil */}
            <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayProfile && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{displayProfile.name}</p>
                        <p className="text-sm text-primary">{displayProfile.email}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rôle</span>
                        {getRoleBadge(displayProfile.role)}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Documents</span>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{displayProfile._count.documents}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Partages reçus</span>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4 text-primary" />
                          <span className="text-sm">{displayProfile._count.sharedWith}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Membre depuis</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">{formatRelativeTime(displayProfile.createdAt)}</span>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Modifier le profil
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles et votre mot de passe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informations personnelles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Votre nom complet"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Adresse email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Changement de mot de passe */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Changer le mot de passe</h3>
                    </div>
                    <p className="text-sm text-primary">
                      Laissez vide si vous ne souhaitez pas changer votre mot de passe
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            placeholder="Votre mot de passe actuel"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => handleInputChange('newPassword', e.target.value)}
                              placeholder="Nouveau mot de passe (min. 6 caractères)"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirmer le nouveau mot de passe"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchProfile}
                      disabled={isSaving}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
