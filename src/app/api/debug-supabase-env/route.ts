import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug des variables Supabase...')

    const supabaseEnv = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Définie' : 'Non définie',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Définie' : 'Non définie',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Définie' : 'Non définie',
      JWT_SECRET: process.env.JWT_SECRET ? 'Définie' : 'Non définie',
    }

    // Afficher les valeurs réelles (sans les clés sensibles)
    const values = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'Non définie',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
        process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'Non définie',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 
        process.env.NEXTAUTH_SECRET.substring(0, 10) + '...' : 'Non définie',
      JWT_SECRET: process.env.JWT_SECRET ? 
        process.env.JWT_SECRET.substring(0, 10) + '...' : 'Non définie',
    }

    console.log('📊 Variables Supabase:', supabaseEnv)
    console.log('📊 Valeurs (partielles):', values)

    return NextResponse.json({
      success: true,
      message: 'Variables Supabase récupérées',
      env: supabaseEnv,
      values: values
    })

  } catch (error) {
    console.error('❌ Erreur lors du debug Supabase:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du debug Supabase',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
