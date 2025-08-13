import { PrismaClient } from '@prisma/client'

const resolveDatabaseUrl = (): string | undefined => {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
  return candidates.find(Boolean)
}

const databaseUrl = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ 
    datasources: { 
      db: { 
        url: databaseUrl || 'postgresql://placeholder' 
      } 
    } 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
