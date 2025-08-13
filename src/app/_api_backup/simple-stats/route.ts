// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Simple Stats API...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        error: 'Non authentifié'
      }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    console.log('✅ User ID:', userId)

    // Tests simples un par un
    console.log('🔍 Test 1: Compter les utilisateurs...')
    const totalUsers = await prisma.user.count()
    console.log('✅ Total users:', totalUsers)

    console.log('🔍 Test 2: Compter les documents...')
    let totalDocuments = 0
    try {
      totalDocuments = await prisma.document.count({
        where: { authorId: userId }
      })
      console.log('✅ Documents (authorId):', totalDocuments)
    } catch (e) {
      console.log('⚠️ authorId failed, trying userId...')
      totalDocuments = await prisma.document.count({
        where: { userId } as any
      })
      console.log('✅ Documents (userId):', totalDocuments)
    }

    console.log('🔍 Test 3: Compter les dossiers...')
    let totalFolders = 0
    try {
      totalFolders = await prisma.folder.count({
        where: { authorId: userId }
      })
      console.log('✅ Folders (authorId):', totalFolders)
    } catch (e) {
      console.log('⚠️ authorId failed, trying userId...')
      totalFolders = await prisma.folder.count({
        where: { userId } as any
      })
      console.log('✅ Folders (userId):', totalFolders)
    }

    const stats = {
      totalDocuments,
      totalFolders,
      totalUsers,
      activeUsers: 1,
      monthlyGrowthPercentage: 0,
      spaceUsed: {
        bytes: 0,
        gb: 0,
        percentage: 0,
        quota: 10
      },
      recentDocuments: [],
      documentsThisMonth: 0,
      documentsLastMonth: 0
    }

    console.log('✅ Stats calculées:', stats)

    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ Erreur simple stats:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
