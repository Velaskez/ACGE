'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Eye, EyeOff, Mail, Lock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { redirectByRole } from '@/lib/role-redirect'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useSupabaseAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)

  // Validation email en temps réel
  useEffect(() => {
    if (formData.email === '') {
      setEmailValid(null)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailValid(emailRegex.test(formData.email))
  }, [formData.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(formData.email, formData.password)
      
      if (success) {
        // Attendre un peu pour que l'état utilisateur soit mis à jour
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Récupérer les informations utilisateur pour la redirection basée sur le rôle
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          if (userData.user && userData.user.role) {
            console.log(`🔀 Redirection après connexion: ${userData.user.role}`)
            // Redirection basée sur le rôle
            redirectByRole(userData.user.role, router)
          } else {
            console.log('⚠️ Rôle utilisateur non trouvé, redirection vers dashboard')
            // Fallback vers dashboard général
            router.push('/dashboard')
          }
        } else {
          console.log('⚠️ Erreur récupération données utilisateur, redirection vers dashboard')
          // Fallback vers dashboard général
          router.push('/dashboard')
        }
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background to-muted/20 dark:from-background dark:to-muted/10">
      {/* Bouton de thème en haut à droite */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Arrière-plan avec logo en blur et particules subtiles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/TrésorPublicGabon.jpg"
              alt="Logo ACGE Background"
              width={1000}
              height={1000}
              className="object-contain opacity-10 dark:opacity-5"
              priority
            />
          </div>
          {/* Particules flottantes très discrètes */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-muted-foreground/20 dark:bg-muted-foreground/10 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-muted-foreground/15 dark:bg-muted-foreground/5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-muted-foreground/10 dark:bg-muted-foreground/5 rounded-full animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Contenu principal avec animations d'entrée */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        {/* Logo et titre avec animation d'entrée */}
        <div className="text-center mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="mb-8 group">
            <Image
              src="/TrésorPublicGabon.jpg"
              alt="Logo ACGE"
              width={150}
              height={150}
              className="mx-auto rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl dark:shadow-2xl"
            />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>ACGE</h1>
          <p className="text-xl text-primary animate-fade-in-up" style={{animationDelay: '0.3s'}}>Agence Comptable des Grandes Écoles</p>
        </div>

        {/* Formulaire avec animation d'entrée */}
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="bg-gradient-to-r from-primary to-primary/90 p-8 text-primary-foreground text-center">
            <h2 className="text-3xl font-bold text-primary-foreground animate-fade-in-up" style={{animationDelay: '0.5s'}}>Connexion</h2>
            <p className="text-primary-foreground/90 mt-2 text-sm animate-fade-in-up" style={{animationDelay: '0.6s'}}>Accédez à votre espace de gestion</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-shake">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Identifiant
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300 group-focus-within:scale-110" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`pl-10 h-12 border-input bg-background focus:border-primary focus:ring-primary rounded-lg transition-all duration-300 hover:border-primary/50 focus:scale-[1.02] ${
                      emailValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                      emailValid === false ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''
                    }`}
                    placeholder="votre@email.com"
                    autoFocus
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {emailValid !== null && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-fade-in">
                      {emailValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
                {emailValid === false && (
                  <p className="text-destructive text-xs animate-fade-in">Veuillez entrer votre identifiant</p>
                )}
              </div>

              <div className="space-y-2 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Mot de passe
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300 group-focus-within:scale-110" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-10 pr-12 h-12 border-input bg-background focus:border-primary focus:ring-primary rounded-lg transition-all duration-300 hover:border-primary/50 focus:scale-[1.02]"
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
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
                  <div className="flex items-center gap-2 text-muted-foreground text-xs animate-fade-in">
                    <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                    <span>Verr. Maj activée</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl animate-fade-in-up"
                style={{animationDelay: '1s'}}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Se connecter</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      {/* Copyright en bas de page */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <p className="text-muted-foreground text-sm text-center">
          © Powered by <span className="font-semibold text-primary">GTF</span>
        </p>
      </div>
    </div>
  )
}