import { PrismaClient } from '@prisma/client'

const resolveDatabaseUrl = (): string => {
  // Utiliser directement DATABASE_URL qui pointe vers Supabase PostgreSQL
  return process.env.DATABASE_URL || 'file:./prisma/dev.db'
}

const databaseUrl = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ 
    datasources: { 
      db: { 
        url: databaseUrl
      } 
    } 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
