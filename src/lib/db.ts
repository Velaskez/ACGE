import { PrismaClient } from '@prisma/client'

const resolveDatabaseUrl = (): string => {
  let url = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  
  // Ajouter des paramètres pour éviter les problèmes de prepared statements
  if (url.includes('postgresql://')) {
    const separator = url.includes('?') ? '&' : '?'
    url += `${separator}pgbouncer=true&connection_limit=1&pool_timeout=0&prepared_statements=false`
  }
  
  console.log('🔗 Database URL:', url)
  return url
}

const databaseUrl = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Fonction pour créer une nouvelle instance Prisma avec gestion des erreurs
function createPrismaClient(): PrismaClient {
  return new PrismaClient({ 
    datasources: { 
      db: { 
        url: databaseUrl
      } 
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Configuration spéciale pour éviter les problèmes de prepared statements
    __internal: {
      engine: {
        enableEngineDebugMode: false
      }
    }
  })
}

// Instance globale unique
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Gestion des erreurs de connexion
globalForPrisma.prisma = prisma

// Fonction de reconnexion en cas d'erreur
const handleConnectionError = async () => {
  try {
    await prisma.$disconnect()
    console.log('🔄 Tentative de reconnexion...')
    await prisma.$connect()
    console.log('✅ Reconnexion réussie')
  } catch (error) {
    console.error('❌ Échec de la reconnexion:', error)
  }
}

// Initialize connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma connected successfully to:', databaseUrl)
  })
  .catch((error) => {
    console.error('❌ Prisma connection failed:', error)
    console.error('Database URL was:', databaseUrl)
    // Tentative de reconnexion automatique
    handleConnectionError()
  })
