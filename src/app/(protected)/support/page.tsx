'use client'

import React, { useState } from 'react'
import { CompactPageLayout, PageHeader, ContentSection } from '@/components/shared/compact-page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

const supportCategories = [
  { value: 'technical', label: 'Problème technique', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  { value: 'account', label: 'Gestion de compte', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  { value: 'billing', label: 'Facturation', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'feature', label: 'Demande de fonctionnalité', icon: CheckCircle, color: 'bg-purple-100 text-purple-700' },
  { value: 'other', label: 'Autre', icon: CheckCircle, color: 'bg-gray-100 text-gray-700' },
]

const priorityLevels = [
  { value: 'high', label: 'Urgent', color: 'bg-red-100 text-red-700' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-700' },
]

export default function SupportPage() {
  const [formData, setFormData] = useState({
    category: '',
    priority: '',
    subject: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler l'envoi du formulaire
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <CompactPageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Demande envoyée !</CardTitle>
              <CardDescription>
                Votre demande de support a été transmise à notre équipe. 
                Nous vous répondrons dans les plus brefs délais.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => setIsSubmitted(false)} className="w-full h-8">
                Envoyer une nouvelle demande
              </Button>
            </CardContent>
          </Card>
        </div>
      </CompactPageLayout>
    )
  }

  return (
    <CompactPageLayout>
      {/* Header */}
      <PageHeader
        title="Support Technique"
        subtitle="Contactez notre équipe pour toute assistance"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire de contact */}
        <div className="lg:col-span-2">
          <ContentSection title="Formulaire de contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Envoyer une demande
                </CardTitle>
                <CardDescription>
                  Décrivez votre problème et nous vous aiderons rapidement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center">
                                <category.icon className="mr-2 h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priorité</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${priority.color.split(' ')[0]}`} />
                                {priority.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Résumé de votre problème"
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez votre problème en détail..."
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email de contact</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="votre@email.com"
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Téléphone (optionnel)</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        className="h-8"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-8">
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer la demande
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ContentSection>
        </div>

        {/* Informations de contact */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact direct</CardTitle>
              <CardDescription>
                Pour les urgences, contactez-nous directement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@acge.gabon</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">+241 XX XX XX XX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temps de réponse</CardTitle>
              <CardDescription>
                Délais moyens selon la priorité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Urgent</span>
                  <Badge className="bg-red-100 text-red-700">2h</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Moyenne</span>
                  <Badge className="bg-blue-100 text-blue-700">24h</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Faible</span>
                  <Badge className="bg-gray-100 text-gray-700">48h</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CompactPageLayout>
  )
}