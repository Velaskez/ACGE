import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verify } from 'jsonwebtoken'

/**
 * 📝 API DOSSIER INDIVIDUEL - ACGE
 * 
 * Gère les opérations CRUD sur un dossier spécifique
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📖 Récupération du dossier:', id)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }

    // Récupérer le dossier avec ses relations
    const { data: dossier, error } = await admin
      .from('dossiers')
      .select(`
        *,
        posteComptable:posteComptableId(*),
        natureDocument:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Erreur récupération dossier:', error)
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      dossier 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('✏️ Modification du dossier:', id)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }

    // Récupérer l'utilisateur connecté
    let userData = null
    const authToken = request.cookies.get('auth-token')?.value
    
    if (authToken) {
      try {
        const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
        const userId = decoded.userId
        
        const { data: user, error: userError } = await admin
          .from('users')
          .select('id, name, email, role, createdAt, updatedAt')
          .eq('id', userId)
          .single()

        if (!userError && user) {
          userData = user
        }
      } catch (jwtError) {
        console.log('⚠️ JWT cookie invalide:', jwtError)
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'Non authentifié' },
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

    const body = await request.json()
    const { numeroDossier, numeroNature, objetOperation, beneficiaire, dateDepot } = body

    // Validation des champs requis
    if (!numeroDossier || !numeroNature || !objetOperation || !beneficiaire) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le dossier appartient à la secrétaire
    const { data: existingDossier, error: checkError } = await admin
      .from('dossiers')
      .select('secretaireId, statut')
      .eq('id', id)
      .single()

    if (checkError) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    if (existingDossier.secretaireId !== userData.id) {
      return NextResponse.json(
        { error: 'Accès refusé: ce dossier ne vous appartient pas' },
        { status: 403 }
      )
    }

    // Vérifier que le dossier est rejeté
    if (existingDossier.statut !== 'REJETÉ_CB') {
      return NextResponse.json(
        { error: 'Seuls les dossiers rejetés peuvent être modifiés' },
        { status: 400 }
      )
    }

    // Mettre à jour le dossier
    const { data: updatedDossier, error: updateError } = await admin
      .from('dossiers')
      .update({
        numeroDossier,
        numeroNature,
        objetOperation,
        beneficiaire,
        dateDepot: dateDepot || existingDossier.dateDepot,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        posteComptable:posteComptableId(*),
        natureDocument:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()

    if (updateError) {
      console.error('❌ Erreur mise à jour dossier:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    console.log('✅ Dossier modifié avec succès:', updatedDossier.numeroDossier)
    
    return NextResponse.json({ 
      success: true,
      dossier: updatedDossier,
      message: 'Dossier modifié avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la modification du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la modification du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ Suppression du dossier:', id)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }

    // Récupérer l'utilisateur connecté
    let userData = null
    const authToken = request.cookies.get('auth-token')?.value
    
    if (authToken) {
      try {
        const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
        const userId = decoded.userId
        
        const { data: user, error: userError } = await admin
          .from('users')
          .select('id, name, email, role, createdAt, updatedAt')
          .eq('id', userId)
          .single()

        if (!userError && user) {
          userData = user
        }
      } catch (jwtError) {
        console.log('⚠️ JWT cookie invalide:', jwtError)
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'Non authentifié' },
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

    // Vérifier que le dossier appartient à la secrétaire
    const { data: existingDossier, error: checkError } = await admin
      .from('dossiers')
      .select('secretaireId, statut, numeroDossier')
      .eq('id', id)
      .single()

    if (checkError) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    if (existingDossier.secretaireId !== userData.id) {
      return NextResponse.json(
        { error: 'Accès refusé: ce dossier ne vous appartient pas' },
        { status: 403 }
      )
    }

    // Vérifier que le dossier est rejeté
    if (existingDossier.statut !== 'REJETÉ_CB') {
      return NextResponse.json(
        { error: 'Seuls les dossiers rejetés peuvent être supprimés' },
        { status: 400 }
      )
    }

    // Supprimer le dossier
    const { error: deleteError } = await admin
      .from('dossiers')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Erreur suppression dossier:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    console.log('✅ Dossier supprimé avec succès:', existingDossier.numeroDossier)
    
    return NextResponse.json({ 
      success: true,
      message: 'Dossier supprimé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
