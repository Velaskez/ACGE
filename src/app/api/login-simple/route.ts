import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  
  try {
    console.log('🔍 Login simple - Début')
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email et mot de passe requis'
      }, { status: 400 })
    }
    
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Utilisateur non trouvé'
      }, { status: 401 })
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Mot de passe incorrect'
      }, { status: 401 })
    }
    
    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
    
    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Connexion réussie'
    })
    
  } catch (error: any) {
    console.error('❌ Erreur login simple:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
