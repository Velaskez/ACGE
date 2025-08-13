// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API Stats...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        error: 'Non authentifié',
        step: 'auth_check'
      }, { status: 401 })
    }

    console.log('✅ Token trouvé')
    
    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
      const userId = decoded.userId
      console.log('✅ Token décodé, userId:', userId)

      // Test 1: Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        return NextResponse.json({
          error: 'Utilisateur non trouvé',
          step: 'user_check',
          userId
        }, { status: 404 })
      }
      
      console.log('✅ Utilisateur trouvé:', user.email)

      // Test 2: Compter les documents (test simple)
      let documentsCount = 0
      try {
        documentsCount = await prisma.document.count({
          where: { authorId: userId }
        })
        console.log('✅ Documents count (authorId):', documentsCount)
      } catch (error) {
        console.log('❌ Erreur avec authorId, essai avec userId...')
        try {
          documentsCount = await prisma.document.count({
            where: { userId } as any
          })
          console.log('✅ Documents count (userId):', documentsCount)
        } catch (error2) {
          console.log('❌ Erreur avec userId aussi:', error2)
          return NextResponse.json({
            error: 'Erreur lors du comptage des documents',
            step: 'documents_count',
            details: error2 instanceof Error ? error2.message : 'Erreur inconnue'
          }, { status: 500 })
        }
      }

      // Test 3: Compter les utilisateurs
      let usersCount = 0
      try {
        usersCount = await prisma.user.count()
        console.log('✅ Users count:', usersCount)
      } catch (error) {
        console.log('❌ Erreur users count:', error)
        return NextResponse.json({
          error: 'Erreur lors du comptage des utilisateurs',
          step: 'users_count',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        }, { status: 500 })
      }

      // Test 4: Vérifier la structure de la table Document
      try {
        const sampleDoc = await prisma.document.findFirst({
          include: {
            author: true,
            currentVersion: true,
            folder: true
          }
        })
        console.log('✅ Sample document structure OK')
      } catch (error) {
        console.log('❌ Erreur structure document:', error)
        return NextResponse.json({
          error: 'Erreur dans la structure de la table Document',
          step: 'document_structure',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: {
          userId,
          userEmail: user.email,
          documentsCount,
          usersCount,
          timestamp: new Date().toISOString()
        }
      })

    } catch (tokenError) {
      console.log('❌ Erreur décodage token:', tokenError)
      return NextResponse.json({
        error: 'Token invalide',
        step: 'token_decode',
        details: tokenError instanceof Error ? tokenError.message : 'Erreur inconnue'
      }, { status: 401 })
    }

  } catch (error) {
    console.error('❌ Erreur générale debug stats:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      step: 'general_error',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
