import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Force disconnect any existing connections
    await prisma.$disconnect()
    
    // Clear the global prisma instance
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect()
      globalForPrisma.prisma = undefined
    }
    
    // Reconnect the global instance
    await prisma.$connect()
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection reset successfully',
      userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Using SQLite'
    })
    
  } catch (error: any) {
    console.error('Error resetting database connection:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
