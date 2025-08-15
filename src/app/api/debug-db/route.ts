import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      DIRECT_URL: process.env.DIRECT_URL ? 'Set (hidden)' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set'
    },
    database: {
      connection: 'unknown',
      error: null
    },
    tables: {},
    testQueries: {}
  }

  try {
    // Test 1: Basic connection test
    console.log('Testing database connection...')
    await prisma.$connect()
    results.database.connection = 'connected'
    console.log('Database connected successfully')

    // Test 2: Check if tables exist
    console.log('Checking tables...')
    const tables = [
      'users',
      'documents',
      'document_versions',
      'folders',
      'tags',
      'document_shares',
      'comments',
      'notifications'
    ]

    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`)
        results.tables[table] = {
          exists: true,
          count: (count as any)[0].count
        }
      } catch (error: any) {
        results.tables[table] = {
          exists: false,
          error: error.message
        }
      }
    }

    // Test 3: Try to query users table
    console.log('Testing user queries...')
    try {
      const userCount = await prisma.user.count()
      results.testQueries.userCount = {
        success: true,
        count: userCount
      }

      // Try to get first user
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
      results.testQueries.firstUser = {
        success: true,
        data: firstUser
      }
    } catch (error: any) {
      results.testQueries.users = {
        success: false,
        error: error.message,
        stack: error.stack
      }
    }

    // Test 4: Try to query notifications table
    console.log('Testing notification queries...')
    try {
      const notificationCount = await prisma.notification.count()
      results.testQueries.notificationCount = {
        success: true,
        count: notificationCount
      }

      // Try to get first notification
      const firstNotification = await prisma.notification.findFirst({
        select: {
          id: true,
          type: true,
          title: true,
          createdAt: true
        }
      })
      results.testQueries.firstNotification = {
        success: true,
        data: firstNotification
      }
    } catch (error: any) {
      results.testQueries.notifications = {
        success: false,
        error: error.message,
        stack: error.stack
      }
    }

    // Test 5: Check database schema
    console.log('Checking database schema...')
    try {
      const schemaInfo = await prisma.$queryRaw`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
        LIMIT 20
      `
      results.schema = {
        success: true,
        sample: schemaInfo
      }
    } catch (error: any) {
      results.schema = {
        success: false,
        error: error.message
      }
    }

    // Test 6: Test transaction capability
    console.log('Testing transaction capability...')
    try {
      await prisma.$transaction(async (tx) => {
        const count = await tx.user.count()
        return count
      })
      results.testQueries.transaction = {
        success: true,
        message: 'Transaction support working'
      }
    } catch (error: any) {
      results.testQueries.transaction = {
        success: false,
        error: error.message
      }
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    console.error('Database debug error:', error)
    results.database.connection = 'failed'
    results.database.error = {
      message: error.message,
      code: error.code,
      stack: error.stack
    }
    
    return NextResponse.json(results, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      console.error('Error disconnecting from database:', e)
    }
  }
}