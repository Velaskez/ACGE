import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {

  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      count: userCount,
      users: users,
      message: `Base de données connectée avec succès. ${userCount} utilisateur(s) trouvé(s).`
    })
  } catch (error: any) {
    console.error('Erreur test-users:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}