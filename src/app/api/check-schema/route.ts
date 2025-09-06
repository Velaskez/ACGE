import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Vérification du schéma et des politiques RLS...')
    
    const supabase = getSupabaseAdmin()
    
    // Vérifier l'état des tables
    const tables = ['users', 'documents', 'folders', 'notifications']
    const tableStatus: Record<string, any> = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        tableStatus[table] = {
          accessible: !error,
          error: error?.message || null,
          count: data?.length || 0
        }
      } catch (err) {
        tableStatus[table] = {
          accessible: false,
          error: err instanceof Error ? err.message : 'Erreur inconnue',
          count: 0
        }
      }
    }
    
    // Vérifier les politiques RLS
    const rlsStatus: Record<string, any> = {}
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .rpc('get_rls_policies', { table_name: table })
        
        rlsStatus[table] = {
          success: !error,
          policies: data || [],
          error: error?.message || null
        }
      } catch (err) {
        rlsStatus[table] = {
          success: false,
          policies: [],
          error: err instanceof Error ? err.message : 'Erreur inconnue'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      tableStatus,
      rlsStatus,
      message: 'Diagnostic du schéma terminé'
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du schéma:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la vérification du schéma',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
