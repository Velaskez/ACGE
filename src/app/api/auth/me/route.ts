import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verify } from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 🔐 API AUTH ME - ACGE
 * 
 * Récupère l'utilisateur connecté via JWT cookie OU Supabase Auth token
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Récupération utilisateur connecté...')
    
    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }

    let userData = null
    let authMethod = ''

    // Méthode 1: Vérifier le cookie JWT (système principal)
    const authToken = request.cookies.get('auth-token')?.value
    
    if (authToken) {
      try {
        console.log('🔐 Tentative avec cookie JWT...')
        const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
        const userId = decoded.userId
        
        const { data: user, error: userError } = await admin
          .from('users')
          .select('id, name, email, role, createdAt, updatedAt')
          .eq('id', userId)
          .single()

        if (!userError && user) {
          userData = user
          authMethod = 'JWT_COOKIE'
          console.log('✅ Utilisateur trouvé via JWT cookie:', user.email)
        }
      } catch (jwtError) {
        console.log('⚠️ JWT cookie invalide:', jwtError)
      }
    }

    // Méthode 2: Vérifier le token Supabase Auth (système alternatif)
    if (!userData) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          console.log('🔐 Tentative avec token Supabase Auth...')
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
          
          if (!authError && authUser) {
            console.log('🔐 Utilisateur auth trouvé:', authUser.email)

            // Récupérer les données complètes depuis notre base de données
            const { data: user, error: userError } = await admin
              .from('users')
              .select('id, name, email, role, createdAt, updatedAt')
              .eq('email', authUser.email)
              .single()

            if (!userError && user) {
              userData = user
              authMethod = 'SUPABASE_AUTH'
              console.log('✅ Utilisateur trouvé via Supabase Auth:', user.email)
            }
          }
        } catch (supabaseError) {
          console.log('⚠️ Token Supabase Auth invalide:', supabaseError)
        }
      }
    }

    // Si aucune méthode n'a fonctionné
    if (!userData) {
      console.log('❌ Aucune authentification valide trouvée')
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    console.log('✅ Utilisateur trouvé via', authMethod, ':', userData.name, userData.email, userData.role)
    
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      authMethod
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