'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { MainLayout } from '@/components/layout/main-layout'
import { DiagnosticPanel } from '@/components/debug/diagnostic-panel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  MoreHorizontal, 
  Eye, 
  ArrowLeft, 
  Download, 
  Share2,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

interface DossierComptable {
  id: string
  numeroDossier: string
  numeroNature: string
  objetOperation: string
  beneficiaire: string
  statut: 'EN_ATTENTE' | 'VALIDÉ_CB' | 'REJETÉ_CB' | 'VALIDÉ_ORDONNATEUR' | 'PAYÉ' | 'TERMINÉ'
  dateDepot: string
  posteComptable: {
    id: string
    numero: string
    intitule: string
  }
  natureDocument: {
    id: string
    numero: string
    nom: string
  }
  secretaire: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function CBDashboardPage() {
  const { user } = useSupabaseAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // États pour la gestion des dossiers
  const [dossiers, setDossiers] = React.useState<DossierComptable[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list')
  const [sortField, setSortField] = React.useState<'numeroDossier' | 'dateDepot' | 'statut' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  
  // États pour les actions de validation
  const [selectedDossier, setSelectedDossier] = React.useState<DossierComptable | null>(null)
  const [validationOpen, setValidationOpen] = React.useState(false)
  const [rejectionOpen, setRejectionOpen] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [actionLoading, setActionLoading] = React.useState(false)

  // Vérifier si l'utilisateur est CB
  React.useEffect(() => {
    if (user?.role !== 'CONTROLEUR_BUDGETAIRE') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Charger les dossiers en attente de validation CB
  const loadDossiers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/dossiers/cb-pending', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDossiers(data.dossiers || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du chargement des dossiers')
      }
    } catch (error) {
      console.error('Erreur chargement dossiers:', error)
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Charger les dossiers au montage
  React.useEffect(() => {
    loadDossiers()
  }, [loadDossiers])

  // Filtrage et tri des dossiers
  const filteredDossiers = React.useMemo(() => {
    let items = dossiers

    // Filtrage par recherche textuelle
    if (query) {
      items = items.filter(d => 
        d.numeroDossier.toLowerCase().includes(query.toLowerCase()) ||
        d.objetOperation.toLowerCase().includes(query.toLowerCase()) ||
        d.beneficiaire.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Tri
    items.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'numeroDossier':
          aValue = a.numeroDossier.toLowerCase()
          bValue = b.numeroDossier.toLowerCase()
          break
        case 'dateDepot':
          aValue = new Date(a.dateDepot).getTime()
          bValue = new Date(b.dateDepot).getTime()
          break
        case 'statut':
          aValue = a.statut
          bValue = b.statut
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return items
  }, [dossiers, query, sortField, sortOrder])

  // Actions de validation
  const handleValidate = async (dossier: DossierComptable) => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/dossiers/${dossier.id}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
      
      if (response.ok) {
        await loadDossiers() // Recharger la liste
        setValidationOpen(false)
        setSelectedDossier(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la validation')
      }
    } catch (error) {
      console.error('Erreur validation:', error)
      setError('Erreur lors de la validation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDossier || !rejectionReason.trim()) return

    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/dossiers/${selectedDossier.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason })
      })
      
      if (response.ok) {
        await loadDossiers() // Recharger la liste
        setRejectionOpen(false)
        setSelectedDossier(null)
        setRejectionReason('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du rejet')
      }
    } catch (error) {
      console.error('Erreur rejet:', error)
      setError('Erreur lors du rejet')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatutBadge = (statut: string) => {
    const configs = {
      'EN_ATTENTE': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'VALIDÉ_CB': { label: 'Validé CB', className: 'bg-green-100 text-green-800 border-green-200' },
      'REJETÉ_CB': { label: 'Rejeté CB', className: 'bg-red-100 text-red-800 border-red-200' },
      'VALIDÉ_ORDONNATEUR': { label: 'Validé Ordonnateur', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'PAYÉ': { label: 'Payé', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'TERMINÉ': { label: 'Terminé', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    
    const config = configs[statut as keyof typeof configs] || configs['EN_ATTENTE']
    return <Badge className={`${config.className} border`}>{config.label}</Badge>
  }

  if (user?.role !== 'CONTROLEUR_BUDGETAIRE') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-muted-foreground" />
                Accès refusé
              </CardTitle>
              <CardDescription>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/dashboard')}>
                Retour au dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Dashboard Contrôleur Budgétaire</h1>
            <p className="text-primary text-sm sm:text-base">Validez ou rejetez les dossiers en attente</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={loadDossiers} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rafraîchir
            </Button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher par numéro, objet ou bénéficiaire..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date de création</SelectItem>
                    <SelectItem value="numeroDossier">Numéro dossier</SelectItem>
                    <SelectItem value="dateDepot">Date de dépôt</SelectItem>
                    <SelectItem value="statut">Statut</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats rapides */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dossiers.filter(d => d.statut === 'EN_ATTENTE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dossiers.filter(d => d.statut === 'VALIDÉ_CB').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dossiers.filter(d => d.statut === 'REJETÉ_CB').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dossiers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des dossiers */}
        <Card>
          <CardHeader>
            <CardTitle>Dossiers à valider</CardTitle>
            <CardDescription>
              {filteredDossiers.length} dossier{filteredDossiers.length > 1 ? 's' : ''} trouvé{filteredDossiers.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredDossiers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead>Bénéficiaire</TableHead>
                    <TableHead>Poste Comptable</TableHead>
                    <TableHead>Date Dépôt</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDossiers.map((dossier) => (
                    <TableRow key={dossier.id}>
                      <TableCell className="font-medium">{dossier.numeroDossier}</TableCell>
                      <TableCell className="max-w-xs truncate">{dossier.objetOperation}</TableCell>
                      <TableCell>{dossier.beneficiaire}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{dossier.posteComptable.numero}</div>
                          <div className="text-muted-foreground">{dossier.posteComptable.intitule}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(dossier.dateDepot).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{getStatutBadge(dossier.statut)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedDossier(dossier)
                              // Ici on pourrait ouvrir une modal de détails
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            {dossier.statut === 'EN_ATTENTE' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedDossier(dossier)
                                    setValidationOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Valider
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedDossier(dossier)
                                    setRejectionOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Rejeter
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Aucun dossier</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aucun dossier en attente de validation.
                </p>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Modal de validation */}
        <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valider le dossier</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir valider le dossier {selectedDossier?.numeroDossier} ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setValidationOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={() => selectedDossier && handleValidate(selectedDossier)}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? 'Validation...' : 'Valider'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de rejet */}
        <Dialog open={rejectionOpen} onOpenChange={setRejectionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter le dossier</DialogTitle>
              <DialogDescription>
                Veuillez indiquer la raison du rejet pour le dossier {selectedDossier?.numeroDossier}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Raison du rejet</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Expliquez pourquoi ce dossier est rejeté..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRejectionOpen(false)
                setRejectionReason('')
              }}>
                Annuler
              </Button>
              <Button 
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Rejet...' : 'Rejeter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Panel de diagnostic */}
      <DiagnosticPanel />
    </MainLayout>
  )
}
