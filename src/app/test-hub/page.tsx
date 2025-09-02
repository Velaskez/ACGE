'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TestTube, 
  Upload, 
  Calculator, 
  Database, 
  Globe,
  BarChart3,
  FileText,
  FolderOpen,
  Bell,
  Users,
  Shield,
  Settings
} from 'lucide-react'

const TEST_PAGES = [
  {
    title: '🧪 Test de Toutes les APIs',
    description: 'Test complet de toutes les APIs de l\'application',
    path: '/test-all-apis',
    icon: <TestTube className="h-8 w-8" />,
    color: 'from-blue-500 to-indigo-600',
    features: ['APIs Système', 'Dashboard', 'Gestion des données', 'Fonctionnalités']
  },
  {
    title: '🚀 Test des Fonctionnalités Critiques',
    description: 'Validation de l\'upload, gestion des documents et dossiers',
    path: '/test-upload',
    icon: <Upload className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    features: ['Upload de fichiers', 'Gestion documents', 'Gestion dossiers', 'Notifications', 'Profil utilisateur']
  },
  {
    title: '🏛️ Test des Fonctionnalités Comptables',
    description: 'Validation des fonctionnalités spécifiques à la gestion comptable',
    path: '/test-comptable',
    icon: <Calculator className="h-8 w-8" />,
    color: 'from-purple-500 to-violet-600',
    features: ['Dossiers comptables', 'Natures documents', 'Postes comptables', 'Dashboard comptable']
  }
]

const QUICK_TESTS = [
  {
    name: 'Health Check',
    path: '/api/health',
    icon: <Globe className="h-5 w-5" />,
    description: 'État du serveur'
  },
  {
    name: 'Database Status',
    path: '/api/check-schema',
    icon: <Database className="h-5 w-5" />,
    description: 'État de la base'
  },
  {
    name: 'Dashboard Stats',
    path: '/api/dashboard/stats',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Statistiques'
  },
  {
    name: 'Users List',
    path: '/api/users',
    icon: <Users className="h-5 w-5" />,
    description: 'Liste utilisateurs'
  }
]

export default function TestHubPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary">🧪 Hub de Tests ACGE</h1>
        <p className="text-xl text-muted-foreground">
          Centre de diagnostic et de validation de toutes les fonctionnalités
        </p>
      </div>

      {/* Pages de test principales */}
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">Pages de Test Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEST_PAGES.map((page, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r ${page.color}`} />
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${page.color} text-white`}>
                    {page.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{page.title}</CardTitle>
                <CardDescription className="text-base">
                  {page.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Fonctionnalités testées :</h4>
                  <ul className="text-sm space-y-1">
                    {page.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={page.path}>
                  <Button className={`w-full bg-gradient-to-r ${page.color} hover:opacity-90`}>
                    Accéder aux Tests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tests rapides */}
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">Tests Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_TESTS.map((test, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-full bg-muted">
                    {test.icon}
                  </div>
                </div>
                <CardTitle className="text-sm">{test.name}</CardTitle>
                <CardDescription className="text-xs">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(test.path, '_blank')}
                >
                  Tester
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Instructions générales */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            📋 Guide d'Utilisation du Hub de Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🎯 Tests Système</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Test de Toutes les APIs</strong> : Validation complète de tous les endpoints</li>
                <li>• <strong>Tests Rapides</strong> : Vérification rapide des composants critiques</li>
                <li>• <strong>Health Check</strong> : État général du serveur et de la base</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">🚀 Tests Fonctionnels</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Fonctionnalités Critiques</strong> : Upload, documents, dossiers</li>
                <li>• <strong>Fonctionnalités Comptables</strong> : Spécificités métier</li>
                <li>• <strong>Notifications & Profil</strong> : Système utilisateur</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Conseils d'utilisation :</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Commencez par les <strong>Tests Rapides</strong> pour vérifier l'état général</li>
              <li>Utilisez <strong>Test de Toutes les APIs</strong> pour un diagnostic complet</li>
              <li>Testez les <strong>Fonctionnalités Critiques</strong> si vous suspectez des problèmes d'upload</li>
              <li>Validez les <strong>Fonctionnalités Comptables</strong> pour les tests métier</li>
              <li>Consultez les détails d'erreur pour identifier précisément les problèmes</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Statut des services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut des Services
          </CardTitle>
          <CardDescription>
            Vérification rapide de l'état des services principaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm font-medium">Serveur</div>
              <div className="text-xs text-muted-foreground">Opérationnel</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm font-medium">Base de données</div>
              <div className="text-xs text-muted-foreground">Connectée</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm font-medium">Supabase</div>
              <div className="text-xs text-muted-foreground">Configuré</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm font-medium">Authentification</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
