import { PrismaClient } from '@prisma/client'

const resolveDatabaseUrl = (): string => {
  // En local, utiliser SQLite
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return process.env.DATABASE_URL || 'file:./prisma/dev.db'
  }
  
  // En production, utiliser l'URL de la base de données
  const candidates = [
    process.env.DATABASE_URL,
    process.env.MYSQL_URL,
    process.env.LWS_DATABASE_URL,
  ]
  return candidates.find(Boolean) || 'mysql://placeholder'
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
