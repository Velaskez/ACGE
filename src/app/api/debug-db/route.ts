import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  
  const response: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set'
    },
    database: {
      connection: 'unknown',
      error: null
    },
    tables: {},
    testQueries: {},
    schema: {
      success: false,
      error: null
    }
  }

  try {
    // Test de connexion basique
    await prisma.$connect()
    response.database.connection = 'connected'

    // Vérifier les tables
    const tables = [
      'users', 'documents', 'document_versions', 'folders', 
      'tags', 'document_shares', 'comments', 'notifications'
    ]

    for (const table of tables) {
      try {
        const count = await (prisma as any)[table.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase())].count()
        response.tables[table] = {
          exists: true,
          count: count
        }
      } catch (error: any) {
        response.tables[table] = {
          exists: false,
          error: error.message
        }
      }
    }

    // Tests de requêtes
    try {
      const userCount = await prisma.user.count()
      const firstUser = await prisma.user.findFirst()
      response.testQueries.users = {
        success: true,
        count: userCount,
        hasData: !!firstUser
      }
    } catch (error: any) {
      response.testQueries.users = {
        success: false,
        error: error.message
      }
    }

    try {
      const notificationCount = await prisma.notification.count()
      response.testQueries.notifications = {
        success: true,
        count: notificationCount
      }
    } catch (error: any) {
      response.testQueries.notifications = {
        success: false,
        error: error.message
      }
    }

    // Test de transaction
    try {
      await prisma.$transaction(async (tx) => {
        const count = await tx.user.count()
        response.testQueries.transaction = {
          success: true,
          userCount: count
        }
      })
    } catch (error: any) {
      response.testQueries.transaction = {
        success: false,
        error: error.message
      }
    }

    response.schema.success = true

  } catch (error: any) {
    response.database.connection = 'failed'
    response.database.error = error.message
  } finally {
    
  }

  return NextResponse.json(response)
}
