import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug simple - Début...')
    
    // Test 1: Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    console.log('Token présent:', !!token)
    
    if (!token) {
      return NextResponse.json({
        error: 'Non authentifié',
        step: 'auth-check'
      })
    }

    // Test 2: Vérifier la base de données
    try {
      const { prisma } = await import('@/lib/db')
      console.log('Prisma importé avec succès')
      
      // Test simple de connexion
      const userCount = await prisma.user.count()
      console.log('Nombre d\'utilisateurs:', userCount)
      
      const documentCount = await prisma.document.count()
      console.log('Nombre de documents:', documentCount)
      
      return NextResponse.json({
        success: true,
        message: 'Base de données accessible',
        stats: {
          users: userCount,
          documents: documentCount
        }
      })
      
    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      return NextResponse.json({
        error: 'Erreur base de données',
        details: dbError instanceof Error ? dbError.message : 'Erreur inconnue',
        step: 'database-check'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Erreur générale:', error)
    return NextResponse.json({
      error: 'Erreur générale',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      step: 'general'
    }, { status: 500 })
  }
}
