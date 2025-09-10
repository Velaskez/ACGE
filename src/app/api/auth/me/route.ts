import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 🔐 API AUTH ME - ACGE
 * 
 * Récupère l'utilisateur connecté via Supabase Auth
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Récupération utilisateur connecté...')
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'autorisation manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Créer un client Supabase avec le token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Récupérer l'utilisateur depuis Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      console.error('❌ Erreur auth user:', authError)
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    console.log('🔐 Utilisateur auth trouvé:', authUser.email)

    // Récupérer les données complètes depuis notre base de données
    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }

    const { data: userData, error: userError } = await admin
      .from('users')
      .select('id, name, email, role, createdAt, updatedAt')
      .eq('email', authUser.email)
      .single()

    if (userError || !userData) {
      console.error('❌ Erreur récupération user data:', userError)
      return NextResponse.json(
        { error: 'Utilisateur non trouvé dans la base de données' },
        { status: 404 }
      )
    }

    console.log('✅ Utilisateur trouvé:', userData.name, userData.email, userData.role)
    
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Erreur API auth me:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de l\'utilisateur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}