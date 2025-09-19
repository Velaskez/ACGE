import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🎯 ADMIN DEMO ACTIONS - ACGE
 * 
 * Démonstration d'actions administratives concrètes sur Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action requise' },
        { status: 400 }
      )
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Service Supabase Admin indisponible' },
        { status: 503 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'create_test_user':
        // Créer un utilisateur de test
        const { data: newUser, error: createError } = await admin
          .from('users')
          .insert({
            name: 'Utilisateur Test Admin',
            email: `test-admin-${Date.now()}@acge-gabon.com`,
            role: 'USER',
            password: '$2a$12$test.hash.for.demo.purposes.only'
          })
          .select()
          .single()

        result = {
          action: 'create_test_user',
          success: !createError,
          data: newUser,
          error: createError?.message
        }
        break

      case 'list_all_tables':
        // Lister toutes les tables via requête SQL directe
        const { data: tablesData, error: tablesError } = await admin
          .rpc('get_all_tables')

        result = {
          action: 'list_all_tables',
          success: !tablesError,
          data: tablesData,
          error: tablesError?.message
        }
        break

      case 'get_database_stats':
        // Statistiques complètes de la base de données
        const stats = await Promise.allSettled([
          admin.from('users').select('count', { count: 'exact' }),
          admin.from('folders').select('count', { count: 'exact' }),
          admin.from('notifications').select('count', { count: 'exact' })
        ])

        result = {
          action: 'get_database_stats',
          success: true,
          data: {
            users: stats[0].status === 'fulfilled' ? stats[0].value.count : 0,
            folders: stats[1].status === 'fulfilled' ? stats[1].value.count : 0,
            notifications: stats[2].status === 'fulfilled' ? stats[2].value.count : 0
          }
        }
        break

      case 'execute_sql':
        // Exécuter une requête SQL arbitraire (démonstration)
        const { data: sqlResult, error: sqlError } = await admin
          .from('users')
          .select('id, name, email, role')
          .limit(3)

        result = {
          action: 'execute_sql',
          success: !sqlError,
          data: sqlResult,
          error: sqlError?.message,
          query: 'SELECT id, name, email, role FROM users LIMIT 3'
        }
        break

      case 'bypass_rls_demo':
        // Démontrer le bypass RLS (accès à toutes les données)
        const { data: allData, error: rlsError } = await admin
          .from('users')
          .select('*')

        result = {
          action: 'bypass_rls_demo',
          success: !rlsError,
          data: {
            message: 'Accès complet à toutes les données utilisateurs (bypass RLS)',
            count: allData?.length || 0,
            users: allData?.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role
            })) || []
          },
          error: rlsError?.message
        }
        break

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

    console.log(`🎯 Action admin exécutée: ${action}`, result)

    return NextResponse.json({
      success: true,
      message: `Action '${action}' exécutée avec succès`,
      timestamp: new Date().toISOString(),
      result
    })

  } catch (error) {
    console.error('❌ Erreur action admin:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'exécution de l\'action admin',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
