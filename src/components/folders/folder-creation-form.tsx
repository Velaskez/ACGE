'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, FolderOpen, Calculator, FileText } from 'lucide-react'

interface PosteComptable {
  id: string
  numero: string
  intitule: string
}

interface NatureDocument {
  id: string
  numero: string
  nom: string
}

interface FolderCreationFormProps {
  postesComptables: PosteComptable[]
  naturesDocuments: NatureDocument[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

const steps = [
  { id: 1, title: 'Informations de base', description: 'Nom et description du dossier' },
  { id: 2, title: 'Informations comptables', description: 'Poste comptable et nature du document' },
  { id: 3, title: 'Détails de l\'opération', description: 'Objet et bénéficiaire' },
  { id: 4, title: 'Validation', description: 'Vérification des informations' }
]

export function FolderCreationForm({ 
  postesComptables, 
  naturesDocuments, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: FolderCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    posteComptableId: '',
    natureDocumentId: '',
    numeroNature: '',
    objetOperation: '',
    beneficiaire: '',
    numeroDossier: '',
    dateDepot: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Le nom du dossier est requis'
        }
        break
      case 2:
        if (!formData.posteComptableId) {
          newErrors.posteComptableId = 'Le poste comptable est requis'
        }
        if (!formData.natureDocumentId) {
          newErrors.natureDocumentId = 'La nature du document est requise'
        }
        break
      case 3:
        if (!formData.objetOperation.trim()) {
          newErrors.objetOperation = 'L\'objet de l\'opération est requis'
        }
        if (!formData.beneficiaire.trim()) {
          newErrors.beneficiaire = 'Le bénéficiaire est requis'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (validateStep(currentStep)) {
      onSubmit(formData)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const generateNumeroDossier = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `DOSS-ACGE-${year}${randomNum}`
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 ">
              <FolderOpen className="w-12 h-12 text-primary mx-auto mb-2 " />
              <h3 className="text-lg font-semibold">Informations de base</h3>
              <p className="text-sm text-muted-foreground">
                Définissez le nom et la description de votre dossier
              </p>
            </div>

            <div className="space-y-2 " >
              <Label htmlFor="name" className="text-sm font-medium">
                Nom du dossier *
              </Label>
              <div className="relative group">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Ex: Dossier ENS 2025"
                  className={`transition-colors duration-200 hover:border-primary/50  ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && <p className="text-sm text-destructive ">{errors.name}</p>}
            </div>
            <div className="space-y-2 " >
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <div className="relative group">
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Description optionnelle du dossier"
                  className="transition-colors duration-200 hover:border-primary/50 "
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 ">
              <Calculator className="w-12 h-12 text-primary mx-auto mb-2 " />
              <h3 className="text-lg font-semibold">Informations comptables</h3>
              <p className="text-sm text-muted-foreground">
                Renseignez les détails comptables du dossier
              </p>
            </div>

            <div className="space-y-2 " >
              <Label className="text-sm font-medium">Poste comptable *</Label>
              <Select 
                value={formData.posteComptableId} 
                onValueChange={(value) => updateFormData('posteComptableId', value)}
              >
                <SelectTrigger className={`transition-colors duration-200 hover:border-primary/50  ${errors.posteComptableId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Sélectionner un poste comptable" />
                </SelectTrigger>
                <SelectContent>
                  {postesComptables.map((poste) => (
                    <SelectItem key={poste.id} value={poste.id}>
                      {poste.numero} - {poste.intitule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.posteComptableId && <p className="text-sm text-destructive ">{errors.posteComptableId}</p>}
            </div>
            <div className="space-y-2 " >
              <Label className="text-sm font-medium">Nature du document *</Label>
              <Select 
                value={formData.natureDocumentId} 
                onValueChange={(value) => updateFormData('natureDocumentId', value)}
              >
                <SelectTrigger className={`transition-colors duration-200 hover:border-primary/50  ${errors.natureDocumentId ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Sélectionner une nature" />
                </SelectTrigger>
                <SelectContent>
                  {naturesDocuments.map((nature) => (
                    <SelectItem key={nature.id} value={nature.id}>
                      {nature.numero} - {nature.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.natureDocumentId && <p className="text-sm text-destructive ">{errors.natureDocumentId}</p>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6 ">
              <FileText className="w-12 h-12 text-primary mx-auto mb-2 " />
              <h3 className="text-lg font-semibold">Détails de l'opération</h3>
              <p className="text-sm text-muted-foreground">
                Complétez les informations spécifiques à l'opération
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 " >
                <Label htmlFor="numeroNature" className="text-sm font-medium">
                  Numéro nature
                </Label>
                <div className="relative group">
                  <Input
                    id="numeroNature"
                    value={formData.numeroNature}
                    onChange={(e) => updateFormData('numeroNature', e.target.value)}
                    placeholder="Ex: 01"
                    className="transition-colors duration-200 hover:border-primary/50 "
                  />
                </div>
              </div>
              <div className="space-y-2 " >
                <Label htmlFor="beneficiaire" className="text-sm font-medium">
                  Bénéficiaire *
                </Label>
                <div className="relative group">
                  <Input
                    id="beneficiaire"
                    value={formData.beneficiaire}
                    onChange={(e) => updateFormData('beneficiaire', e.target.value)}
                    placeholder="Nom du bénéficiaire"
                    className={`transition-colors duration-200 hover:border-primary/50  ${errors.beneficiaire ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.beneficiaire && <p className="text-sm text-destructive ">{errors.beneficiaire}</p>}
              </div>
            </div>
            <div className="space-y-2 " >
              <Label htmlFor="objetOperation" className="text-sm font-medium">
                Objet de l'opération *
              </Label>
              <div className="relative group">
                <Input
                  id="objetOperation"
                  value={formData.objetOperation}
                  onChange={(e) => updateFormData('objetOperation', e.target.value)}
                  placeholder="Description détaillée de l'opération"
                  className={`transition-colors duration-200 hover:border-primary/50  ${errors.objetOperation ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.objetOperation && <p className="text-sm text-destructive ">{errors.objetOperation}</p>}
            </div>
          </div>
        )

      case 4:
        const selectedPoste = postesComptables.find(p => p.id === formData.posteComptableId)
        const selectedNature = naturesDocuments.find(n => n.id === formData.natureDocumentId)
        
        return (
          <div className="space-y-6">
            <div className="text-center ">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 " />
              <h3 className="text-lg font-semibold mb-2">Récapitulatif</h3>
              <p className="text-muted-foreground">Vérifiez les informations avant de créer le dossier</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="" >
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Informations de base</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nom:</span> {formData.name}</p>
                    <p><span className="text-muted-foreground">Description:</span> {formData.description || 'Aucune'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="" >
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Informations comptables</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Poste:</span> {selectedPoste ? `${selectedPoste.numero} - ${selectedPoste.intitule}` : 'Non sélectionné'}</p>
                    <p><span className="text-muted-foreground">Nature:</span> {selectedNature ? `${selectedNature.numero} - ${selectedNature.nom}` : 'Non sélectionnée'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="" >
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Détails de l'opération</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Objet:</span> {formData.objetOperation}</p>
                    <p><span className="text-muted-foreground">Bénéficiaire:</span> {formData.beneficiaire}</p>
                    <p><span className="text-muted-foreground">Numéro nature:</span> {formData.numeroNature || 'Non renseigné'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="" >
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Informations système</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Numéro dossier:</span> {formData.numeroDossier || generateNumeroDossier()}</p>
                    <p><span className="text-muted-foreground">Date dépôt:</span> {formData.dateDepot}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Stepper amélioré */}
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="flex items-start justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative px-2">
                {/* Ligne de connexion */}
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-px bg-border -translate-x-1/2 -z-10">
                    <div className={`h-full transition-colors duration-200 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-border'
                    }`} style={{ width: '100%' }} />
                  </div>
                )}
                
                {/* Cercle et contenu */}
                <div className="flex flex-col items-center group relative z-10 w-full">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-200 transform
                    ${currentStep >= step.id 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                      : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5 " />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center w-full min-h-[3rem] flex flex-col justify-center">
                    <p className={`text-xs font-medium transition-colors duration-300 leading-tight ${
                      currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                    }`}>{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-tight mt-1 px-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content avec animation */}
        <div className="min-h-[400px] relative overflow-hidden px-4">
          <div className=" transition-all duration-500">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation améliorée */}
        <div className="flex justify-between pt-6 border-t px-4">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={isLoading}
          className="transition-colors duration-200 hover:scale-105 group"
        >
          {currentStep === 1 ? (
            'Annuler'
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Précédent
            </>
          )}
        </Button>

        {currentStep < steps.length ? (
          <Button 
            onClick={handleNext} 
            disabled={isLoading}
            className="transition-colors duration-200 hover:scale-105 group"
          >
            Suivant
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-xl transition-colors duration-200 hover:scale-105 group"
          >
            {isLoading ? 'Création...' : 'Créer le dossier'}
            {!isLoading && <CheckCircle className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-300" />}
          </Button>
        )}
        </div>
      </div>
    </div>
  )
}

// Styles CSS simplifiés - Suppression des animations superficielles
