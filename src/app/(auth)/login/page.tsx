'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Eye, EyeOff, Mail, Lock, CheckCircle, XCircle } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Arrière-plan avec logo en blur et particules subtiles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/TrésorPublicGabon.jpg"
              alt="Logo ACGE Background"
              width={1000}
              height={1000}
              className="object-contain opacity-25"
              priority
            />
          </div>
          {/* Particules flottantes très discrètes */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-gray-300/20 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-gray-300/15 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-gray-300/10 rounded-full animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Contenu principal avec animations d'entrée */}
      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        {/* Logo et titre avec animation d'entrée */}
        <div className="text-center mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="mb-6 group">
            <Image
              src="/TrésorPublicGabon.jpg"
              alt="Logo ACGE"
              width={80}
              height={80}
              className="mx-auto rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>ACGE</h1>
                        <p className="text-primary animate-fade-in-up" style={{animationDelay: '0.3s'}}>Agence Comptable des Grandes Écoles</p>
        </div>

        {/* Formulaire avec animation d'entrée */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="bg-primary p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Connexion</h2>
            <p className="text-gray-300 mt-1">Accédez à votre espace de gestion</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-primary">
                  Identifiant
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary rounded-lg transition-all duration-200 ${
                      emailValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                      emailValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="votre@email.com"
                    autoFocus
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {emailValid !== null && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {emailValid === false && (
                  <p className="text-red-500 text-xs">Veuillez entrer votre identifiant</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-primary">
                  Mot de passe
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-10 pr-12 h-12 border-gray-300 focus:border-primary focus:ring-primary rounded-lg transition-all duration-200"
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors duration-200"
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
                className="w-full h-12 bg-primary hover:bg-white hover:text-primary hover:border-2 hover:border-primary text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      {/* Copyright en bas de page */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <p className="text-gray-500 text-sm text-center">
                        © Powered by <span className="font-semibold text-primary">GTF</span>
        </p>
      </div>
    </div>
  )
}