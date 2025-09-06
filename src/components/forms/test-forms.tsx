'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, FileText, Users, User, Edit3 } from 'lucide-react'

/**
 * Composant de test pour vérifier la cohérence des formulaires améliorés
 * Ce composant peut être utilisé pour tester tous les formulaires du projet
 */
export function TestForms() {
  const forms = [
    {
      name: 'Formulaire de création de dossier',
      component: 'FolderCreationForm',
      description: 'Formulaire multi-étapes pour créer des dossiers comptables',
      features: [
        'Validation par étapes',
        'Stepper visuel',
        'Validation en temps réel',
        'Messages d\'erreur contextuels',
        'Récapitulatif final'
      ],
      status: 'completed'
    },
    {
      name: 'Formulaire de gestion des utilisateurs',
      component: 'UserForm',
      description: 'Formulaire pour créer et modifier des utilisateurs',
      features: [
        'Validation avec react-hook-form',
        'Composants Radix UI',
        'Gestion des mots de passe',
        'Sélection de rôles',
        'Mode édition/création'
      ],
      status: 'completed'
    },
    {
      name: 'Formulaire de profil utilisateur',
      component: 'ProfileForm',
      description: 'Formulaire pour modifier le profil utilisateur',
      features: [
        'Modification des informations personnelles',
        'Changement de mot de passe optionnel',
        'Validation sécurisée',
        'Feedback visuel',
        'Récapitulatif des modifications'
      ],
      status: 'completed'
    },
    {
      name: 'Formulaire de modification de documents',
      component: 'DocumentEditForm',
      description: 'Formulaire pour modifier les métadonnées des documents',
      features: [
        'Modification du titre et description',
        'Classification par catégorie',
        'Gestion des dossiers',
        'Paramètres de visibilité',
        'Informations du fichier original'
      ],
      status: 'completed'
    }
  ]

  const components = [
    {
      name: 'Stepper',
      description: 'Composant de navigation par étapes',
      usage: 'Utilisé dans tous les formulaires multi-étapes'
    },
    {
      name: 'FormNavigation',
      description: 'Navigation entre les étapes du formulaire',
      usage: 'Boutons Précédent/Suivant/Valider'
    },
    {
      name: 'FormFieldWithIcon',
      description: 'Champ de formulaire avec icône',
      usage: 'Champs d\'entrée avec icônes contextuelles'
    },
    {
      name: 'FormSummary',
      description: 'Récapitulatif des informations saisies',
      usage: 'Dernière étape des formulaires'
    },
    {
      name: 'PasswordField',
      description: 'Champ de mot de passe avec toggle de visibilité',
      usage: 'Champs de mot de passe sécurisés'
    },
    {
      name: 'useMultiStepForm',
      description: 'Hook pour la gestion des formulaires multi-étapes',
      usage: 'Logique commune des formulaires'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>
      case 'in-progress':
        return <Badge variant="secondary">En cours</Badge>
      case 'pending':
        return <Badge variant="outline">En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Test des Formulaires Améliorés</h1>
        <p className="text-muted-foreground">
          Vérification de la cohérence et de la qualité des formulaires du projet
        </p>
      </div>

      {/* Formulaires principaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Formulaires Principaux
          </CardTitle>
          <CardDescription>
            Formulaires améliorés avec validation par étapes et UX moderne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((form, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                    {getStatusBadge(form.status)}
                  </div>
                  <CardDescription>{form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {form.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Composants réutilisables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Composants Réutilisables
          </CardTitle>
          <CardDescription>
            Composants créés pour maintenir la cohérence entre les formulaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((component, index) => (
              <Card key={index} className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{component.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {component.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Usage:</strong> {component.usage}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Améliorations apportées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Améliorations Apportées
          </CardTitle>
          <CardDescription>
            Liste des améliorations appliquées à tous les formulaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">UX/UI</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Navigation par étapes avec stepper visuel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Validation en temps réel avec feedback visuel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Messages d'erreur contextuels et clairs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Récapitulatif avant validation finale
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Icônes contextuelles pour les champs
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">Technique</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Utilisation de react-hook-form pour la validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Composants Radix UI pour l'accessibilité
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Hook personnalisé pour les formulaires multi-étapes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Composants réutilisables pour la cohérence
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Gestion d'état optimisée avec TypeScript
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions de test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Instructions de Test
          </CardTitle>
          <CardDescription>
            Comment tester les formulaires améliorés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Test de la navigation</h4>
              <p className="text-sm text-muted-foreground">
                Vérifiez que la navigation entre les étapes fonctionne correctement et que les validations empêchent d'avancer si les champs requis ne sont pas remplis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Test de la validation</h4>
              <p className="text-sm text-muted-foreground">
                Testez les messages d'erreur en laissant des champs vides ou en saisissant des données invalides.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Test de la cohérence</h4>
              <p className="text-sm text-muted-foreground">
                Vérifiez que tous les formulaires ont la même apparence et le même comportement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Test de l'accessibilité</h4>
              <p className="text-sm text-muted-foreground">
                Testez la navigation au clavier et l'utilisation avec un lecteur d'écran.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
