'use client'

import React from 'react'
import { CompactPageLayout, PageHeader, ContentSection } from '@/components/shared/compact-page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Users,
  Upload,
  CheckCircle,
  Calculator,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react'

const helpSections = [
  {
    id: 'getting-started',
    title: 'Premiers pas',
    description: 'Découvrez les bases de l\'application ACGE',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700',
    items: [
      {
        title: 'Connexion et authentification',
        description: 'Comment se connecter et gérer son compte',
        link: '#'
      },
      {
        title: 'Navigation dans l\'interface',
        description: 'Comprendre l\'organisation des pages',
        link: '#'
      },
      {
        title: 'Rôles et permissions',
        description: 'Les différents rôles et leurs accès',
        link: '#'
      }
    ]
  },
  {
    id: 'workflow',
    title: 'Workflow des dossiers',
    description: 'Processus de validation des dossiers comptables',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700',
    items: [
      {
        title: 'Création d\'un dossier',
        description: 'Étapes pour créer un nouveau dossier',
        link: '#'
      },
      {
        title: 'Validation CB',
        description: 'Processus de validation par le Contrôleur Budgétaire',
        link: '#'
      },
      {
        title: 'Ordonnancement',
        description: 'Étape d\'ordonnancement des dépenses',
        link: '#'
      },
      {
        title: 'Comptabilisation',
        description: 'Finalisation comptable des dossiers',
        link: '#'
      }
    ]
  },
  {
    id: 'documents',
    title: 'Gestion des documents',
    description: 'Upload, organisation et partage de documents',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700',
    items: [
      {
        title: 'Upload de documents',
        description: 'Comment télécharger des fichiers',
        link: '#'
      },
      {
        title: 'Organisation en dossiers',
        description: 'Créer et gérer des dossiers',
        link: '#'
      },
      {
        title: 'Recherche de documents',
        description: 'Trouver rapidement vos fichiers',
        link: '#'
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications et alertes',
    description: 'Gérer vos notifications et alertes',
    icon: HelpCircle,
    color: 'bg-orange-100 text-orange-700',
    items: [
      {
        title: 'Types de notifications',
        description: 'Comprendre les différents types d\'alertes',
        link: '#'
      },
      {
        title: 'Configuration des notifications',
        description: 'Personnaliser vos préférences',
        link: '#'
      }
    ]
  }
]

const roleInfo = [
  {
    role: 'SECRETAIRE',
    title: 'Secrétaire',
    description: 'Création et gestion des dossiers comptables',
    permissions: ['Créer des dossiers', 'Uploader des documents', 'Gérer les dossiers rejetés'],
    color: 'bg-green-100 text-green-700'
  },
  {
    role: 'CONTROLEUR_BUDGETAIRE',
    title: 'Contrôleur Budgétaire',
    description: 'Validation des dossiers avant ordonnancement',
    permissions: ['Valider les dossiers', 'Rejeter avec motif', 'Consulter les statistiques'],
    color: 'bg-blue-100 text-blue-700'
  },
  {
    role: 'ORDONNATEUR',
    title: 'Ordonnateur',
    description: 'Ordonnancement des dépenses validées',
    permissions: ['Ordonnancer les dépenses', 'Suivre les paiements', 'Gérer les ordonnances'],
    color: 'bg-purple-100 text-purple-700'
  },
  {
    role: 'AGENT_COMPTABLE',
    title: 'Agent Comptable',
    description: 'Comptabilisation finale des dossiers',
    permissions: ['Comptabiliser les dossiers', 'Générer les écritures', 'Clôturer les dossiers'],
    color: 'bg-orange-100 text-orange-700'
  },
  {
    role: 'ADMIN',
    title: 'Administrateur',
    description: 'Gestion globale du système',
    permissions: ['Gérer les utilisateurs', 'Configurer le système', 'Accès à toutes les fonctionnalités'],
    color: 'bg-red-100 text-red-700'
  }
]

export default function HelpPage() {
  return (
    <CompactPageLayout>
      {/* Header */}
      <PageHeader
        title="Centre d'aide ACGE"
        subtitle="Trouvez rapidement l'aide dont vous avez besoin"
      />

      {/* Recherche rapide */}
      <ContentSection
        title="Recherche rapide"
        subtitle="Tapez votre question ou votre problème pour trouver une solution"
      >
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Comment créer un dossier ?"
            className="flex-1 h-8"
          />
          <Button className="h-8">Rechercher</Button>
        </div>
      </ContentSection>

      {/* Sections d'aide */}
      <ContentSection title="Sections d'aide">
        <div className="grid gap-4 md:grid-cols-2">
          {helpSections.map((section) => {
            const IconComponent = section.icon
            return (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${section.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            En savoir plus
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ContentSection>

      {/* Rôles et permissions */}
      <ContentSection
        title="Rôles et permissions"
        subtitle="Comprendre les différents rôles dans l'application et leurs responsabilités"
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roleInfo.map((role) => (
            <div key={role.role} className="border rounded-lg p-3">
              <div className="flex items-center mb-3">
                <Badge className={role.color}>{role.title}</Badge>
              </div>
              <h4 className="font-medium mb-2">{role.description}</h4>
              <ul className="space-y-1">
                {role.permissions.map((permission, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></div>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Contact et support */}
      <ContentSection
        title="Besoin d'aide supplémentaire ?"
        subtitle="Notre équipe de support est là pour vous aider"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="text-center p-3 border rounded-lg">
            <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-medium mb-1">Email</h4>
            <p className="text-sm text-muted-foreground mb-2">support@acge.gabon</p>
            <Button variant="outline" size="sm" className="h-8">
              Envoyer un email
            </Button>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Phone className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium mb-1">Téléphone</h4>
            <p className="text-sm text-muted-foreground mb-2">+241 XX XX XX XX</p>
            <Button variant="outline" size="sm" className="h-8">
              Appeler
            </Button>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium mb-1">Support technique</h4>
            <p className="text-sm text-muted-foreground mb-2">24h/7j</p>
            <Button variant="outline" size="sm" className="h-8">
              Contacter
            </Button>
          </div>
        </div>
      </ContentSection>
    </CompactPageLayout>
  )
}
