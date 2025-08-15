'use client'

import { useState, useMemo, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeSelector } from '@/components/ui/theme-selector'
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  User,
  Search,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

interface SettingItem {
  id: string
  title: string
  description: string
  section: string
  keywords: string[]
  available: boolean
  component?: React.ReactNode
  action?: () => void
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // États du formulaire
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // États pour les paramètres
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    language: 'fr',
    timezone: 'Africa/Libreville',
    security: {
      sessionTimeout: 15,
      passwordExpiry: 90
    }
  })

  // Gestion de l'affichage des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Définition de tous les paramètres disponibles
  const allSettings: SettingItem[] = [
    // Apparence
    {
      id: 'theme',
      title: 'Thème',
      description: 'Personnalisez l\'apparence de l\'application',
      section: 'Apparence',
      keywords: ['thème', 'apparence', 'couleur', 'mode', 'clair', 'sombre', 'système'],
      available: true,
      component: <ThemeSelector />
    },
    // Notifications
    {
      id: 'email-notifications',
      title: 'Notifications par email',
      description: 'Recevoir des notifications par email',
      section: 'Notifications',
      keywords: ['email', 'notification', 'courriel', 'mail'],
      available: true,
      component: (
        <Switch
          checked={settings.emailNotifications}
          onCheckedChange={(checked: boolean) => handleSettingsChange('emailNotifications', checked)}
        />
      )
    },
    {
      id: 'push-notifications',
      title: 'Notifications push',
      description: 'Recevoir des notifications push dans le navigateur',
      section: 'Notifications',
      keywords: ['push', 'notification', 'navigateur', 'browser'],
      available: true,
      component: (
        <Switch
          checked={settings.pushNotifications}
          onCheckedChange={(checked: boolean) => handleSettingsChange('pushNotifications', checked)}
        />
      )
    },
    // Compte
    {
      id: 'edit-profile',
      title: 'Modifier le profil',
      description: 'Mettre à jour vos informations personnelles',
      section: 'Compte',
      keywords: ['profil', 'profile', 'modifier', 'informations', 'personnelles'],
      available: true,
      action: () => window.location.href = '/profile'
    },
    {
      id: 'change-password',
      title: 'Changer le mot de passe',
      description: 'Modifier votre mot de passe de sécurité',
      section: 'Compte',
      keywords: ['mot de passe', 'password', 'sécurité', 'changer'],
      available: true,
      action: () => setSelectedSection('Sécurité')
    },

    {
      id: 'session-timeout',
      title: 'Délai d\'expiration de session',
      description: 'Définir le délai d\'expiration de session',
      section: 'Sécurité',
      keywords: ['session', 'expiration', 'délai', 'timeout'],
      available: true,
      component: (
        <Select
          value={settings.security.sessionTimeout.toString()}
          onValueChange={(value) => handleSecurityChange('sessionTimeout', parseInt(value))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
                                 <SelectContent>
                         <SelectItem value="5">5 minutes</SelectItem>
                         <SelectItem value="10">10 minutes</SelectItem>
                         <SelectItem value="15">15 minutes</SelectItem>
                         <SelectItem value="30">30 minutes</SelectItem>
                       </SelectContent>
        </Select>
      )
    },
    // Régional
    {
      id: 'language',
      title: 'Langue',
      description: 'Choisir la langue de l\'interface',
      section: 'Régional',
      keywords: ['langue', 'language', 'interface', 'locale'],
      available: true,
      component: (
        <Select
          value={settings.language}
          onValueChange={(value) => handleSettingsChange('language', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: 'timezone',
      title: 'Fuseau horaire',
      description: 'Définir votre fuseau horaire',
      section: 'Régional',
      keywords: ['fuseau', 'horaire', 'timezone', 'heure'],
      available: true,
      component: (
        <Select
          value={settings.timezone}
          onValueChange={(value) => handleSettingsChange('timezone', value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Africa/Libreville">Libreville (GMT+1)</SelectItem>
            <SelectItem value="Europe/Paris">Paris (GMT+1/+2)</SelectItem>
            <SelectItem value="UTC">UTC</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ]

  // Filtrage des paramètres basé sur la recherche
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return allSettings

    const query = searchQuery.toLowerCase()
    return allSettings.filter(setting => 
      setting.title.toLowerCase().includes(query) ||
      setting.description.toLowerCase().includes(query) ||
      setting.section.toLowerCase().includes(query) ||
      setting.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  }, [searchQuery])

  // Groupement des paramètres par section
  const groupedSettings = useMemo(() => {
    const grouped: Record<string, SettingItem[]> = {}
    filteredSettings.forEach(setting => {
      if (!grouped[setting.section]) {
        grouped[setting.section] = []
      }
      grouped[setting.section].push(setting)
    })
    return grouped
  }, [filteredSettings])

  // Sections disponibles
  const sections = [
    { name: 'Apparence', icon: Palette, color: 'blue' },
    { name: 'Notifications', icon: Bell, color: 'orange' },
    { name: 'Compte', icon: User, color: 'green' },
    { name: 'Sécurité', icon: Shield, color: 'red' },
    { name: 'Régional', icon: Globe, color: 'purple' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSettingsChange = (key: string, value: boolean | string) => {
    const newSettings = {
      ...settings,
      [key]: value
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleSecurityChange = (key: string, value: boolean | number) => {
    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        [key]: value
      }
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validation des mots de passe
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }

      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Paramètres mis à jour avec succès')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      setError('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case 'Apparence': return Palette
      case 'Notifications': return Bell
      case 'Compte': return User
      case 'Sécurité': return Shield
      case 'Régional': return Globe
      default: return Settings
    }
  }

  const getSectionColor = (sectionName: string) => {
    switch (sectionName) {
      case 'Apparence': return 'blue'
      case 'Notifications': return 'orange'
      case 'Compte': return 'green'
      case 'Sécurité': return 'red'
      case 'Régional': return 'purple'
      default: return 'gray'
    }
  }

  // Charger les paramètres depuis l'API
  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  // Sauvegarder les paramètres
  const saveSettings = async (newSettings: any) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      })

      if (response.ok) {
        setSuccess('Paramètres mis à jour avec succès')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les paramètres au montage
  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
              Paramètres
            </h1>
            <p className="text-primary text-sm sm:text-base">
              Gérez vos préférences et paramètres de compte
            </p>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Layout avec sidebar */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Navigation des sections */}
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon
                    const isActive = selectedSection === section.name || (!selectedSection && section.name === 'Apparence')
                    const hasResults = Object.keys(groupedSettings).includes(section.name)
                    
                    return (
                      <Button
                        key={section.name}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive ? '' : ''
                        } ${!hasResults && searchQuery ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedSection(section.name)}
                        disabled={!hasResults && !!searchQuery}
                      >
                        <div className="p-1.5 bg-muted rounded-md mr-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{section.name}</span>
                        {!hasResults && searchQuery && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            0
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>

                {/* Compteur de résultats */}
                {searchQuery && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {filteredSettings.length} résultat{filteredSettings.length > 1 ? 's' : ''} trouvé{filteredSettings.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {Object.keys(groupedSettings).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground">
                    Aucun paramètre ne correspond à "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={clearSearch} className="mt-4">
                    Effacer la recherche
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSettings).map(([sectionName, settings]) => {
                  const Icon = getSectionIcon(sectionName)
                  const color = getSectionColor(sectionName)
                  
                  return (
                    <Card key={sectionName}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-md">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{sectionName}</CardTitle>
                            <CardDescription className="text-sm">
                              {sectionName === 'Apparence' && 'Personnalisez l\'apparence de l\'application'}
                              {sectionName === 'Notifications' && 'Gérez vos préférences de notifications'}
                              {sectionName === 'Compte' && 'Informations de votre compte'}
                              {sectionName === 'Sécurité' && 'Paramètres de sécurité de votre compte'}
                              {sectionName === 'Régional' && 'Paramètres régionaux et de langue'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {settings.map((setting) => (
                            <div key={setting.id} className="group flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                              <div className="flex-1">
                                <p className="font-semibold">{setting.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {setting.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!setting.available && (
                                  <Badge variant="secondary" className="text-xs">
                                    Bientôt disponible
                                  </Badge>
                                )}
                                {setting.component && setting.component}
                                {setting.action && (
                                  <Button variant="outline" size="sm" className="text-xs" onClick={setting.action}>
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Modifier
                                  </Button>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de changement de mot de passe (caché par défaut) */}
        {selectedSection === 'Sécurité' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>
                Modifiez votre mot de passe de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Mot de passe actuel"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Nouveau mot de passe"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setSelectedSection(null)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
