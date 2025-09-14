import { Clock, FileText, Trash2 } from 'lucide-react'

export type FolderStatus = 'BROUILLON' | 'EN_ATTENTE' | 'VALIDÉ_CB' | 'REJETÉ_CB' | 'VALIDÉ_ORDONNATEUR' | 'PAYÉ' | 'TERMINÉ'

export interface StatusInfo {
  label: string
  color: string
  icon: typeof Clock | typeof FileText | typeof Trash2
  description: string
}

export function getFolderStatusInfo(status: FolderStatus | undefined): StatusInfo {
  switch (status) {
    case 'BROUILLON':
      return {
        label: 'Brouillon',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Clock,
        description: 'Dossier créé mais pas encore soumis pour validation'
      }
    case 'EN_ATTENTE':
      return {
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        description: 'Dossier soumis et en attente de validation par le Contrôleur Budgétaire'
      }
    case 'VALIDÉ_CB':
      return {
        label: 'Validé CB',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FileText,
        description: 'Dossier validé par le Contrôleur Budgétaire, en attente d\'ordonnancement'
      }
    case 'VALIDÉ_ORDONNATEUR':
      return {
        label: 'Validé Ordonnateur',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FileText,
        description: 'Dossier validé par l\'Ordonnateur, en attente de comptabilisation'
      }
    case 'PAYÉ':
      return {
        label: 'Payé',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: FileText,
        description: 'Dossier payé, en attente de comptabilisation'
      }
    case 'TERMINÉ':
      return {
        label: 'Terminé',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FileText,
        description: 'Dossier entièrement traité et comptabilisé'
      }
    case 'REJETÉ_CB':
      return {
        label: 'Rejeté CB',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Trash2,
        description: 'Dossier rejeté par le Contrôleur Budgétaire'
      }
    default:
      return {
        label: 'Brouillon',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Clock,
        description: 'Dossier créé mais pas encore soumis pour validation'
      }
  }
}

export function getStatusFilterCount(folders: any[], filter: 'all' | 'en_attente' | 'valide' | 'rejete'): number {
  switch (filter) {
    case 'all':
      return folders.length
    case 'en_attente':
      return folders.filter(f => f.statut === 'BROUILLON' || f.statut === 'EN_ATTENTE' || !f.statut).length
    case 'valide':
      return folders.filter(f => {
        const status = f.statut
        return status === 'VALIDÉ_CB' || status === 'VALIDÉ_ORDONNATEUR' || status === 'PAYÉ' || status === 'TERMINÉ'
      }).length
    case 'rejete':
      return folders.filter(f => f.statut === 'REJETÉ_CB').length
    default:
      return 0
  }
}

export function getStatusProgress(status: FolderStatus | undefined): number {
  switch (status) {
    case 'EN_ATTENTE':
      return 20
    case 'VALIDÉ_CB':
      return 40
    case 'VALIDÉ_ORDONNATEUR':
      return 60
    case 'PAYÉ':
      return 80
    case 'TERMINÉ':
      return 100
    case 'REJETÉ_CB':
      return 0
    default:
      return 0
  }
}
