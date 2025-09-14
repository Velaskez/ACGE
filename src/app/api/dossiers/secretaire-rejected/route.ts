import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { verify } from 'jsonwebtoken'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 📊 API DOSSIERS SECRETAIRE REJECTED - ACGE
 * 
 * Récupère les dossiers rejetés de la secrétaire connectée
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération des dossiers rejetés de la secrétaire')
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer l'utilisateur connecté (même logique que /api/auth/me)
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

    // Vérifier que l'utilisateur est une secrétaire
    if (userData.role !== 'SECRETAIRE') {
      return NextResponse.json(
        { error: 'Accès refusé: rôle secrétaire requis' },
        { status: 403 }
      )
    }

    console.log('✅ Utilisateur authentifié via', authMethod, ':', userData.name, userData.email, userData.role)

    // Récupérer les dossiers rejetés de la secrétaire connectée
    const { data: dossiers, error } = await admin
      .from('dossiers')
      .select(`
        *,
        posteComptable:posteComptableId(*),
        natureDocument:natureDocumentId(*),
        secretaire:secretaireId(id, name, email),
        folder:folderId(id, name, description)
      `)
      .eq('statut', 'REJETÉ_CB')
      .eq('secretaireId', userData.id) // Filtrer par la secrétaire connectée
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('❌ Erreur Supabase dossiers rejetés secrétaire:', error)
      throw error
    }

    console.log(`📊 ${dossiers?.length || 0} dossiers rejetés de la secrétaire trouvés`)
    
    // Log détaillé pour diagnostic
    if (dossiers && dossiers.length > 0) {
      console.log('📊 Détails des dossiers rejetés de la secrétaire:')
      dossiers.forEach((dossier, index) => {
        console.log(`  ${index + 1}. ${dossier.numeroDossier} - Statut: ${dossier.statut} - Créé: ${dossier.createdAt}`)
      })
    } else {
      console.log('📊 Aucun dossier rejeté de la secrétaire trouvé')
    }
    
    return NextResponse.json({ 
      success: true, 
      dossiers: dossiers || [],
      count: dossiers?.length || 0
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des dossiers rejetés de la secrétaire:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des dossiers rejetés',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
