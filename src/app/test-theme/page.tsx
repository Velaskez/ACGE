'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ThemeSelector } from '@/components/ui/theme-selector'
import { useThemeHook } from '@/hooks/use-theme'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  CheckCircle, 
  AlertCircle, 
  Info,
  FileText,
  Folder,
  Users,
  BarChart3,
  Eye
} from 'lucide-react'

export default function TestThemePage() {
  const { theme, isDark, isLight } = useThemeHook()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test du Mode Dark - ACGE</h1>
          <p className="text-muted-foreground">
            Démonstration de la cohérence des couleurs entre les modes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ThemeSelector />
        </div>
      </div>

      {/* Informations sur le thème actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            État du thème
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Mode clair: {isLight ? 'Actif' : 'Inactif'}</span>
              {isLight && <CheckCircle className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Mode sombre: {isDark ? 'Actif' : 'Inactif'}</span>
              {isDark && <CheckCircle className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>Thème actuel: {theme}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Démonstration de la cohérence des couleurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Cohérence des couleurs ACGE
          </CardTitle>
          <CardDescription>
            Le mode dark utilise le bleu primaire comme couleur de fond pour maintenir l'identité visuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Mode Light</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span className="text-sm">Bleu primaire (boutons, liens)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-background border border-border rounded"></div>
                  <span className="text-sm">Fond blanc</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-foreground rounded"></div>
                  <span className="text-sm">Texte noir</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Mode Dark</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span className="text-sm">Blanc (boutons, liens)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-background border border-border rounded"></div>
                  <span className="text-sm">Fond bleu primaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-foreground rounded"></div>
                  <span className="text-sm">Texte blanc</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composants de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Boutons</CardTitle>
            <CardDescription>Différents styles de boutons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Bouton principal</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="outline">Contour</Button>
              <Button variant="ghost">Fantôme</Button>
              <Button variant="destructive">Destructeur</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Petit</Button>
              <Button size="default">Normal</Button>
              <Button size="lg">Grand</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges et étiquettes</CardTitle>
            <CardDescription>Indicateurs visuels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Par défaut</Badge>
              <Badge variant="secondary">Secondaire</Badge>
              <Badge variant="outline">Contour</Badge>
              <Badge variant="destructive">Destructeur</Badge>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Entrez votre email" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartes de contenu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>Gestion des documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Accédez à tous vos documents et fichiers importants.
            </p>
            <div className="mt-4">
              <Badge variant="secondary">1,234 documents</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Dossiers
            </CardTitle>
            <CardDescription>Organisation des dossiers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organisez vos documents dans des dossiers structurés.
            </p>
            <div className="mt-4">
              <Badge variant="secondary">56 dossiers</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs
            </CardTitle>
            <CardDescription>Gestion des utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gérez les accès et permissions des utilisateurs.
            </p>
            <div className="mt-4">
              <Badge variant="secondary">12 utilisateurs</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertes</CardTitle>
            <CardDescription>Différents types d'alertes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-green-800 dark:text-green-200">Opération réussie</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-yellow-800 dark:text-yellow-200">Attention requise</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-blue-800 dark:text-blue-200">Information</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Données et métriques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Documents traités</span>
                <span className="text-2xl font-bold text-primary">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilisateurs actifs</span>
                <span className="text-2xl font-bold text-primary">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux de satisfaction</span>
                <span className="text-2xl font-bold text-primary">98%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Comment tester</CardTitle>
          <CardDescription>Instructions pour tester le mode dark</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Utilisez le bouton de toggle en haut à droite pour basculer entre les modes</p>
            <p>• Utilisez le sélecteur de thème pour choisir entre clair, sombre ou système</p>
            <p>• Observez la cohérence du bleu ACGE entre les modes</p>
            <p>• Le mode dark utilise le bleu primaire comme fond avec du texte blanc</p>
            <p>• Testez la persistance en rechargeant la page</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
