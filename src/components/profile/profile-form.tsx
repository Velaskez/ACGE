'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Eye, EyeOff, User, Mail, Shield } from 'lucide-react'

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

interface FormData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const steps = [
  { id: 1, title: 'Informations personnelles', description: 'Nom et email' },
  { id: 2, title: 'Sécurité', description: 'Changement de mot de passe' },
  { id: 3, title: 'Validation', description: 'Vérification des modifications' }
]

export function ProfileForm({ 
  user, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<FormData>({
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const { watch, trigger, formState: { errors } } = form
  const watchedValues = watch()

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof FormData)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ['name', 'email']
        break
      case 2:
        // Valider seulement si un nouveau mot de passe est fourni
        if (watchedValues.newPassword) {
          fieldsToValidate = ['currentPassword', 'newPassword', 'confirmPassword']
        }
        break
    }

    const isValid = await trigger(fieldsToValidate)
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      const submitData = { ...watchedValues }
      // Ne pas envoyer les mots de passe vides
      if (!submitData.newPassword) {
        delete submitData.currentPassword
        delete submitData.newPassword
        delete submitData.confirmPassword
      }
      onSubmit(submitData)
    }
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrateur',
      SECRETAIRE: 'Secrétaire',
      AGENT_COMPTABLE: 'Agent Comptable',
      CONTROLEUR_BUDGETAIRE: 'Contrôleur Budgétaire',
      ORDONNATEUR: 'Ordonnateur'
    }
    return roleLabels[role] || role
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: 'Le nom est requis',
                minLength: {
                  value: 2,
                  message: 'Le nom doit contenir au moins 2 caractères'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Nom complet *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Ex: Jean Dupont"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'L\'email est requis',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Format d\'email invalide'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Adresse email *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Ex: jean.dupont@acge.ga"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Changement de mot de passe</h3>
              <p className="text-sm text-muted-foreground">
                Remplissez les champs ci-dessous pour changer votre mot de passe
              </p>
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              rules={{
                required: watchedValues.newPassword ? 'Le mot de passe actuel est requis' : false,
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Mot de passe actuel
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe actuel"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              rules={{
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Nouveau mot de passe
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Votre nouveau mot de passe"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Laisser vide pour conserver le mot de passe actuel
                  </p>
                </FormItem>
              )}
            />

            {watchedValues.newPassword && (
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: watchedValues.newPassword ? 'La confirmation du mot de passe est requise' : false,
                  validate: (value) => 
                    !watchedValues.newPassword || value === watchedValues.newPassword || 'Les mots de passe ne correspondent pas'
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Confirmer le nouveau mot de passe
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirmez votre nouveau mot de passe"
                          className="pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Récapitulatif</h3>
              <p className="text-muted-foreground">
                Vérifiez les modifications avant de sauvegarder
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Informations personnelles</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nom:</span> {watchedValues.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {watchedValues.email}</p>
                    <p><span className="text-muted-foreground">Rôle:</span> {getRoleLabel(user.role)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Sécurité</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Mot de passe:</span> 
                      {watchedValues.newPassword ? 'Nouveau mot de passe défini' : 'Conservé'}
                    </p>
                    {watchedValues.newPassword && (
                      <p className="text-xs text-muted-foreground">
                        Le mot de passe sera changé lors de la sauvegarde
                      </p>
                    )}
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
    <Form {...form}>
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            disabled={isLoading}
          >
            {currentStep === 1 ? (
              'Annuler'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </>
            )}
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          )}
        </div>
      </div>
    </Form>
  )
}
