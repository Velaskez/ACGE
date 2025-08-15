import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test de configuration Supabase...')
    
    const config = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAdmin: !!supabaseAdmin,
      supabase: !!supabase
    }
    
    console.log('📋 Configuration:', config)
    
    // Test de connexion Supabase
    let storageTest = null
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.storage.listBuckets()
        storageTest = {
          success: !error,
          buckets: data?.length || 0,
          error: error?.message
        }
      } catch (error) {
        storageTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      config,
      storageTest,
      message: 'Test de configuration Supabase terminé'
    })
    
  } catch (error) {
    console.error('❌ Erreur test Supabase:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du test Supabase',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
