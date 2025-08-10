'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  FolderOpen, 
  Users, 
  Upload, 
  TrendingUp, 
  Clock,
  Eye,
  Download
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  const handleNewDocument = () => {
    router.push('/upload')
  }

  const handleNewFolder = () => {
    // TODO: Implémenter la création de dossier
    console.log('Créer un nouveau dossier')
  }

  const handleShare = () => {
    // TODO: Implémenter le partage
    console.log('Partager des documents')
  }

  const handleHistory = () => {
    // TODO: Implémenter l'historique
    console.log('Afficher l\'historique')
  }

  const handleViewAllDocuments = () => {
    router.push('/documents')
  }

  const handleViewUsers = () => {
    router.push('/users')
  }

  const handleDownloadDocument = async (documentName: string) => {
    // TODO: Implémenter le téléchargement réel
    console.log('Télécharger:', documentName)
  }

  const handleViewDocument = (documentName: string) => {
    // TODO: Implémenter la visualisation
    console.log('Voir:', documentName)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de vos fichiers et activités
            </p>
          </div>
          <Button onClick={handleNewDocument}>
            <Upload className="mr-2 h-4 w-4" />
            Nouveau document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleViewAllDocuments}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fichiers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossiers</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                +3 nouveaux ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5 GB</div>
              <p className="text-xs text-muted-foreground">
                65% de votre quota
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleViewUsers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                3 en ligne actuellement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Documents récents */}
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fichiers récents</CardTitle>
                  <CardDescription>
                    Vos derniers fichiers ajoutés ou modifiés
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewAllDocuments}>
                  Voir tous
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Rapport_2024.pdf', date: 'Il y a 2 heures', size: '2.3 MB', type: 'PDF' },
                  { name: 'Présentation_Q1.pptx', date: 'Hier', size: '15.7 MB', type: 'PPTX' },
                  { name: 'Budget_2024.xlsx', date: 'Il y a 3 jours', size: '1.2 MB', type: 'XLSX' },
                  { name: 'Contrat_client.docx', date: 'Il y a 1 semaine', size: '3.1 MB', type: 'DOCX' },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-powder-blue/20 rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-powder-blue" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.date} • {doc.size} • {doc.type}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc.name)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voir le document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.name)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Télécharger</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Dernières actions sur vos fichiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Document téléchargé', doc: 'Rapport_2024.pdf', time: 'Il y a 5 min' },
                  { action: 'Document partagé', doc: 'Présentation_Q1.pptx', time: 'Il y a 1 heure' },
                  { action: 'Nouveau document', doc: 'Budget_2024.xlsx', time: 'Il y a 3 heures' },
                  { action: 'Document modifié', doc: 'Contrat_client.docx', time: 'Hier' },
                  { action: 'Dossier créé', doc: 'Projet_2024', time: 'Il y a 2 jours' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-powder-blue rounded-full mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.doc}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col" onClick={handleNewDocument}>
                <Upload className="h-6 w-6 mb-2" />
                <span>Upload</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleNewFolder}>
                <FolderOpen className="h-6 w-6 mb-2" />
                <span>Nouveau dossier</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleShare}>
                <Users className="h-6 w-6 mb-2" />
                <span>Partager</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleHistory}>
                <Clock className="h-6 w-6 mb-2" />
                <span>Historique</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
