import { PrismaClient } from '@prisma/client'

const resolveDatabaseUrl = (): string => {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
  const url = candidates.find(Boolean)
  if (!url) {
    throw new Error('Aucune URL de base de données trouvée (DATABASE_URL/POSTGRES_PRISMA_URL/POSTGRES_URL/POSTGRES_URL_NON_POOLING)')
  }
  return url
}

const databaseUrl = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasources: { db: { url: databaseUrl } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
