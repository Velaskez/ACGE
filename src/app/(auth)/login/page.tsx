'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, EyeOff, Mail, Lock, Shield, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)

  const features = [
    { icon: "📊", title: "Gestion Comptable", desc: "Suivi complet des opérations financières" },
    { icon: "🔒", title: "Sécurité Avancée", desc: "Protection des données sensibles" },
    { icon: "⚡", title: "Performance", desc: "Interface rapide et intuitive" },
    { icon: "📁", title: "Archivage", desc: "Organisation optimale des documents" }
  ]

  const tips = [
    "Bienvenue dans votre espace de gestion",
    "Vos données sont sécurisées et protégées",
    "Interface intuitive et moderne",
    "Accès rapide à tous vos documents"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 4000)
    return () => clearInterval(tipInterval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(formData.email, formData.password)
      
      if (success) {
        router.push('/dashboard')
      } else {
        setError('Email ou mot de passe incorrect')
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Side gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Animation de texte */}
        <div className="text-center">
            <div className="h-8 flex items-center justify-center">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`absolute transition-all duration-1000 ${
                    index === currentTip 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-2'
                  }`}
                >
                  <p className="text-gray-400 text-sm font-medium">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-black p-6 text-white">
              <h2 className="text-2xl font-bold">Connexion</h2>
              <p className="text-gray-300 mt-1">Accédez à votre espace de gestion</p>
        </div>

            <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
              )}

              <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Adresse email
                </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg transition-all"
                    placeholder="votre@email.com"
                      autoFocus
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mot de passe
                </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                      className="pl-10 pr-12 h-12 border-gray-300 focus:border-black focus:ring-black rounded-lg transition-all"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                      onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                      onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                      onBlur={() => setCapsLockOn(false)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                  {capsLockOn && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Verr. Maj activée</span>
                    </div>
                  )}
              </div>

              <Button
                type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
            </div>
          </div>

          {/* Indicateurs de progression pour les tips */}
          <div className="flex justify-center space-x-1">
            {tips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTip 
                    ? 'bg-gray-400 scale-125' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Side droite - Logo et Animations */}
      <div className="hidden lg:flex flex-1 bg-black relative overflow-hidden">
        {/* Formes décoratives animées */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse [animation-delay:1s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        
        {/* Particules flottantes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-delay:0.5s]"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:1.5s]"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce [animation-delay:2.5s]"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full space-y-12">
          {/* Logo principal avec animation */}
          <div className="text-center space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 group-hover:border-white/30 transition-all duration-500">
                <Image
                  src="/TrésorPublicGabon.jpg"
                  alt="Logo ACGE"
                  width={120}
                  height={120}
                  className="mx-auto rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <h1 className="mt-6 text-4xl font-bold text-white group-hover:text-gray-100 transition-colors">
                  ACGE
                </h1>
                <p className="text-lg text-gray-300 mt-2 group-hover:text-gray-200 transition-colors">
                  Agence Comptable des Grandes Écoles
                </p>
              </div>
            </div>
          </div>

          {/* Features animées */}
          <div className="text-center space-y-6 max-w-md">
            <div className="h-32 flex items-center justify-center">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute transition-all duration-700 ${
                    index === currentFeature 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-4 scale-95'
                  }`}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">{feature.icon}</div>
                    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-300 text-lg">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Indicateurs de progression */}
            <div className="flex justify-center space-x-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeature 
                      ? 'bg-white scale-125' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            </div>

          {/* Stats animées */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Sécurisé</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse [animation-delay:0.5s]">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Rapide</p>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse [animation-delay:1s]">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Fiable</p>
            </div>
          </div>
            </div>
      </div>
    </div>
  )
}