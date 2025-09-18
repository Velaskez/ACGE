'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { CompactPageLayout, PageHeader, CompactStats, ContentSection, EmptyState } from '@/components/shared/compact-page-layout'
import { AgentComptableGuard } from '@/components/auth/role-guard'
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
  RefreshCw,
  Calculator,
  CreditCard,
  Receipt
} from 'lucide-react'

interface DossierComptable {
  id: string
  numeroDossier: string
  numeroNature: string
  objetOperation: string
  beneficiaire: string
  statut: 'EN_ATTENTE' | 'VALIDÉ_CB' | 'REJETÉ_CB' | 'VALIDÉ_ORDONNATEUR' | 'PAYÉ' | 'TERMINÉ'
  dateDepot: string
  poste_comptable: {
    id: string
    numero: string
    intitule: string
  }
  nature_document: {
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
  // Colonnes de rejet
  rejectedAt?: string
  rejectionReason?: string
  rejectionDetails?: string
}

function ACDashboardContent() {
  const { user } = useSupabaseAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // États pour la gestion des dossiers
  const [dossiers, setDossiers] = React.useState<DossierComptable[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [sortField, setSortField] = React.useState<'numeroDossier' | 'dateDepot' | 'statut' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  
  // États pour les actions de comptabilisation
  const [selectedDossier, setSelectedDossier] = React.useState<DossierComptable | null>(null)
  const [paiementOpen, setPaiementOpen] = React.useState(false)
  const [recetteOpen, setRecetteOpen] = React.useState(false)
  const [clotureOpen, setClotureOpen] = React.useState(false)
  const [montant, setMontant] = React.useState('')
  const [reference, setReference] = React.useState('')
  const [commentaire, setCommentaire] = React.useState('')
  const [actionLoading, setActionLoading] = React.useState(false)

  // Vérifier si l'utilisateur est AC
  React.useEffect(() => {
    if (user?.role !== 'AGENT_COMPTABLE') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Charger les dossiers validés par Ordonnateur
  const loadDossiers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/dossiers/ac-pending', {
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

  // Actions de comptabilisation
  const handlePaiement = async (dossier: DossierComptable) => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/dossiers/${dossier.id}/paiement`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          montant: parseFloat(montant),
          reference,
          commentaire 
        })
      })
      
      if (response.ok) {
        await loadDossiers()
        setPaiementOpen(false)
        setSelectedDossier(null)
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du paiement')
      }
    } catch (error) {
      console.error('Erreur paiement:', error)
      setError('Erreur lors du paiement')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecette = async (dossier: DossierComptable) => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/dossiers/${dossier.id}/recette`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          montant: parseFloat(montant),
          reference,
          commentaire 
        })
      })
      
      if (response.ok) {
        await loadDossiers()
        setRecetteOpen(false)
        setSelectedDossier(null)
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de l\'enregistrement de la recette')
      }
    } catch (error) {
      console.error('Erreur recette:', error)
      setError('Erreur lors de l\'enregistrement de la recette')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCloture = async (dossier: DossierComptable) => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/dossiers/${dossier.id}/cloturer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commentaire })
      })
      
      if (response.ok) {
        await loadDossiers()
        setClotureOpen(false)
        setSelectedDossier(null)
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la clôture')
      }
    } catch (error) {
      console.error('Erreur clôture:', error)
      setError('Erreur lors de la clôture')
    } finally {
      setActionLoading(false)
    }
  }

  const resetForm = () => {
    setMontant('')
    setReference('')
    setCommentaire('')
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
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
  }

  if (user?.role !== 'AGENT_COMPTABLE') {
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
    <CompactPageLayout>
      <PageHeader
        title="Dashboard Agent Comptable"
        subtitle="Effectuez les paiements et enregistrez les recettes"
        actions={
          <Button 
            variant="outline" 
            onClick={loadDossiers} 
            className="w-full sm:w-auto h-8"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        }
      />

      <ContentSection
        title="Recherche et filtres"
        actions={
          <div className="flex gap-2">
            <Select value={sortField} onValueChange={(value: any) => setSortField(value)}>
              <SelectTrigger className="w-[180px] h-8">
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
              className="h-8"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        }
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par numéro, objet ou bénéficiaire..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </ContentSection>

      <CompactStats
        stats={[
          {
            label: "À comptabiliser",
            value: dossiers.filter(d => d.statut === 'VALIDÉ_ORDONNATEUR').length,
            icon: <Clock className="h-4 w-4 text-yellow-600" />,
            color: "text-yellow-600"
          },
          {
            label: "Payés",
            value: dossiers.filter(d => d.statut === 'PAYÉ').length,
            icon: <CreditCard className="h-4 w-4 text-purple-600" />,
            color: "text-purple-600"
          },
          {
            label: "Terminés",
            value: dossiers.filter(d => d.statut === 'TERMINÉ').length,
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            color: "text-green-600"
          },
          {
            label: "Total",
            value: dossiers.length,
            icon: <FileText className="h-4 w-4 text-primary" />,
            color: "text-primary"
          }
        ]}
        columns={4}
      />

      <ContentSection
        title="Dossiers à comptabiliser"
        subtitle={`${filteredDossiers.length} dossier${filteredDossiers.length > 1 ? 's' : ''} trouvé${filteredDossiers.length > 1 ? 's' : ''}`}
      >
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
                      <TableCell className="font-medium text-reference">{dossier.numeroDossier}</TableCell>
                      <TableCell className="max-w-xs truncate">{dossier.objetOperation}</TableCell>
                      <TableCell>{dossier.beneficiaire}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-code">{dossier.poste_comptable?.numero || 'N/A'}</div>
                          <div className="text-muted-foreground">{dossier.poste_comptable?.intitule || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-date">{new Date(dossier.dateDepot).toLocaleDateString('fr-FR')}</span>
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
                            {dossier.statut === 'VALIDÉ_ORDONNATEUR' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedDossier(dossier)
                                    setPaiementOpen(true)
                                  }}
                                  className="text-purple-600"
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Effectuer paiement
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedDossier(dossier)
                                    setRecetteOpen(true)
                                  }}
                                  className="text-green-600"
                                >
                                  <Receipt className="mr-2 h-4 w-4" />
                                  Enregistrer recette
                                </DropdownMenuItem>
                              </>
                            )}
                            {(dossier.statut === 'PAYÉ' || dossier.statut === 'RECETTE_ENREGISTRÉE') && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedDossier(dossier)
                                  setClotureOpen(true)
                                }}
                                className="text-blue-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Clôturer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={<FileText className="h-10 w-10 text-muted-foreground" />}
                title="Aucun dossier"
                description="Aucun dossier ordonné en attente de comptabilisation."
              />
            )}
            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}
      </ContentSection>

        {/* Modal de paiement */}
        <Dialog open={paiementOpen} onOpenChange={setPaiementOpen}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Effectuer le paiement</DialogTitle>
              <DialogDescription>
                Enregistrez le paiement pour le dossier {selectedDossier?.numeroDossier}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="montant-paiement">Montant</Label>
                <Input
                  id="montant-paiement"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reference-paiement">Référence</Label>
                <Input
                  id="reference-paiement"
                  placeholder="Référence du paiement"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="commentaire-paiement">Commentaire</Label>
                <Textarea
                  id="commentaire-paiement"
                  placeholder="Commentaire sur le paiement..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setPaiementOpen(false)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button 
                onClick={() => selectedDossier && handlePaiement(selectedDossier)}
                disabled={actionLoading || !montant}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {actionLoading ? 'Paiement...' : 'Enregistrer paiement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de recette */}
        <Dialog open={recetteOpen} onOpenChange={setRecetteOpen}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Enregistrer la recette</DialogTitle>
              <DialogDescription>
                Enregistrez la recette pour le dossier {selectedDossier?.numeroDossier}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="montant-recette">Montant</Label>
                <Input
                  id="montant-recette"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reference-recette">Référence</Label>
                <Input
                  id="reference-recette"
                  placeholder="Référence de la recette"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="commentaire-recette">Commentaire</Label>
                <Textarea
                  id="commentaire-recette"
                  placeholder="Commentaire sur la recette..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRecetteOpen(false)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button 
                onClick={() => selectedDossier && handleRecette(selectedDossier)}
                disabled={actionLoading || !montant}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? 'Enregistrement...' : 'Enregistrer recette'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de clôture */}
        <Dialog open={clotureOpen} onOpenChange={setClotureOpen}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Clôturer le dossier</DialogTitle>
              <DialogDescription>
                Clôturez le dossier {selectedDossier?.numeroDossier}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="commentaire-cloture">Commentaire de clôture</Label>
                <Textarea
                  id="commentaire-cloture"
                  placeholder="Commentaire sur la clôture..."
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setClotureOpen(false)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button 
                onClick={() => selectedDossier && handleCloture(selectedDossier)}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? 'Clôture...' : 'Clôturer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </CompactPageLayout>
  )
}

export default function ACDashboardPage() {
  return (
    <AgentComptableGuard>
      <ACDashboardContent />
    </AgentComptableGuard>
  )
}
