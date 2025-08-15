'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSelector } from '@/components/ui/theme-selector'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Settings, Palette, Bell, Shield, User } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      <div className="grid gap-6">
        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Thème</label>
              <ThemeSelector />
            </div>
            <p className="text-sm text-muted-foreground">
              Le thème système suit automatiquement les préférences de votre appareil.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications par email
                  </p>
                </div>
                <Badge variant="secondary">Bientôt disponible</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications push</p>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications push dans le navigateur
                  </p>
                </div>
                <Badge variant="secondary">Bientôt disponible</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Changer le mot de passe</p>
                  <p className="text-sm text-muted-foreground">
                    Mettre à jour votre mot de passe
                  </p>
                </div>
                <Badge variant="secondary">Bientôt disponible</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-muted-foreground">
                    Ajouter une couche de sécurité supplémentaire
                  </p>
                </div>
                <Badge variant="secondary">Bientôt disponible</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Compte
            </CardTitle>
            <CardDescription>
              Informations de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modifier le profil</p>
                  <p className="text-sm text-muted-foreground">
                    Mettre à jour vos informations personnelles
                  </p>
                </div>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  <a href="/profile">Modifier</a>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
