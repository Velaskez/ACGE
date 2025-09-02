// Fichier de compatibilité pour maintenir les imports existants
// TODO: Migrer progressivement vers Supabase

// Interface compatible avec Prisma pour la transition
export interface PrismaClient {
  user: any
  document: any
  folder: any
  notification: any
  documentVersion: any
  documentShare: any
  // Ajouter d'autres modèles selon les besoins
}

// Client factice pour éviter les erreurs d'import
// Les vrais endpoints devraient utiliser Supabase via @/lib/supabase-server
export const prisma: PrismaClient = {
  user: {},
  document: {},
  folder: {},
  notification: {},
  documentVersion: {},
  documentShare: {},
} as any

// Note: Ce fichier est temporaire pour maintenir la compatibilité
// Les nouveaux endpoints devraient utiliser Supabase via @/lib/supabase-server
// Pour migrer un endpoint, remplacez l'import de @/lib/db par @/lib/supabase-server
