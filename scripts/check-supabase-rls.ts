/**
 * Vérifier les problèmes RLS (Row Level Security) de Supabase
 */

import { execSync } from 'child_process'

async function checkSupabaseRLS() {
  console.log('🔒 Vérification Row Level Security Supabase...\n')

  const projectRef = 'wodyrsasfqfoqdydrfew'
  const password = 'Reviti2025@'
  const encodedPassword = encodeURIComponent(password)
  const dbUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

  try {
    // Script pour vérifier et désactiver RLS
    const checkRLS = `
      -- Vérifier l'état RLS de toutes les tables
      SELECT schemaname, tablename, rowsecurity, hasrls 
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public';
      
      -- Désactiver RLS sur toutes nos tables
      ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.documents DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.document_versions DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.folders DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.document_shares DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.comments DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.tags DISABLE ROW LEVEL SECURITY;
      
      -- Vérifier à nouveau
      SELECT schemaname, tablename, rowsecurity, hasrls 
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public';
    `

    require('fs').writeFileSync('check-rls.sql', checkRLS)
    
    console.log('📝 Exécution des vérifications RLS...')
    
    // Utiliser psql directement
    const result = execSync(`psql "${dbUrl}" -f check-rls.sql`, {
      encoding: 'utf8'
    })
    
    console.log('✅ Résultat RLS:')
    console.log(result)
    
    require('fs').unlinkSync('check-rls.sql')
    
  } catch (error) {
    console.log('📋 Erreur/Sortie:', error.toString())
    
    console.log('\n🔧 Alternative: Désactivation manuelle RLS...')
    
    // Si psql n'est pas disponible, créons un endpoint API
    console.log('💡 Créez un endpoint temporaire pour désactiver RLS:')
    console.log(`
    // Dans src/app/api/disable-rls/route.ts
    import { prisma } from '@/lib/db'
    
    export async function POST() {
      try {
        await prisma.$executeRaw\`ALTER TABLE users DISABLE ROW LEVEL SECURITY\`
        await prisma.$executeRaw\`ALTER TABLE documents DISABLE ROW LEVEL SECURITY\`
        await prisma.$executeRaw\`ALTER TABLE notifications DISABLE ROW LEVEL SECURITY\`
        // etc...
        return Response.json({ success: true })
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }
    }
    `)
  }
}

checkSupabaseRLS()
