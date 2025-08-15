'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeSelector } from '@/components/ui/theme-selector'
import { Badge } from '@/components/ui/badge'
import { Settings, Palette, Bell, Shield, User, ArrowLeft, ExternalLink, ChevronRight, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'

interface SettingItem {
  id: string
  title: string
  description: string
  section: string
  keywords: string[]
  available: boolean
  action?: () => void
}

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Définition de tous les paramètres disponibles
  const allSettings: SettingItem[] = [
    // Apparence
    {
      id: 'theme',
      title: 'Thème',
      description: 'Personnalisez l\'apparence de l\'application',
      section: 'Apparence',
      keywords: ['thème', 'apparence', 'couleur', 'mode', 'clair', 'sombre', 'système'],
      available: true
    },
    // Notifications
    {
      id: 'email-notifications',
      title: 'Notifications par email',
      description: 'Recevoir des notifications par email',
      section: 'Notifications',
      keywords: ['email', 'notification', 'courriel', 'mail'],
      available: false
    },
    {
      id: 'push-notifications',
      title: 'Notifications push',
      description: 'Recevoir des notifications push dans le navigateur',
      section: 'Notifications',
      keywords: ['push', 'notification', 'navigateur', 'browser'],
      available: false
    },
    // Sécurité
    {
      id: 'change-password',
      title: 'Changer le mot de passe',
      description: 'Mettre à jour votre mot de passe',
      section: 'Sécurité',
      keywords: ['mot de passe', 'password', 'sécurité', 'changer', 'modifier'],
      available: false
    },
    {
      id: '2fa',
      title: 'Authentification à deux facteurs',
      description: 'Ajouter une couche de sécurité supplémentaire',
      section: 'Sécurité',
      keywords: ['2fa', 'authentification', 'deux facteurs', 'sécurité', 'double'],
      available: false
    },
    // Compte
    {
      id: 'edit-profile',
      title: 'Modifier le profil',
      description: 'Mettre à jour vos informations personnelles',
      section: 'Compte',
      keywords: ['profil', 'profile', 'modifier', 'informations', 'personnelles'],
      available: true
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

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header amélioré */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="h-12 w-12 p-0 rounded-full hover:bg-white/80 dark:hover:bg-slate-800/80">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-muted-foreground">Gérez vos préférences et votre compte</p>
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un paramètre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-muted-foreground">
                {filteredSettings.length} résultat{filteredSettings.length > 1 ? 's' : ''} trouvé{filteredSettings.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          {/* Affichage conditionnel basé sur la recherche */}
          {Object.keys(groupedSettings).length === 0 ? (
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
            // Affichage des sections filtrées
            Object.entries(groupedSettings).map(([sectionName, settings]) => (
              <Card key={sectionName} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      sectionName === 'Apparence' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      sectionName === 'Notifications' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      sectionName === 'Sécurité' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {sectionName === 'Apparence' && <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                      {sectionName === 'Notifications' && <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                      {sectionName === 'Sécurité' && <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />}
                      {sectionName === 'Compte' && <User className="h-5 w-5 text-green-600 dark:text-green-400" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{sectionName}</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionName === 'Apparence' && 'Personnalisez l\'apparence de l\'application'}
                        {sectionName === 'Notifications' && 'Gérez vos préférences de notifications'}
                        {sectionName === 'Sécurité' && 'Paramètres de sécurité de votre compte'}
                        {sectionName === 'Compte' && 'Informations de votre compte'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {settings.map((setting) => (
                      <div key={setting.id} className="group/item flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
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
                          {setting.id === 'theme' && <ThemeSelector />}
                          {setting.id === 'edit-profile' && (
                            <Link href="/profile">
                              <Button variant="outline" size="sm" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Modifier
                              </Button>
                            </Link>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/item:text-foreground transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer amélioré */}
        <div className="flex justify-center pt-8">
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="flex items-center gap-2 px-8 py-3 rounded-xl hover:shadow-md transition-all">
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
