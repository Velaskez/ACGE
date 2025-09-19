import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { verify } from 'jsonwebtoken'
import { notifyDossierUpdate } from '@/lib/notifications'

/**
 * 📝 API MISE À JOUR DOSSIER - ACGE
 * 
 * Met à jour un dossier en attente avec les nouvelles informations
 * et envoie une notification au CB pour signaler la modification
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📝 Mise à jour du dossier:', id)
    
    const body = await request.json()
    const {
      numeroDossier,
      numeroNature,
      objetOperation,
      beneficiaire,
      posteComptableId,
      natureDocumentId
    } = body
    
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

    // Vérifier que le dossier existe et appartient à la secrétaire
    const { data: existingDossier, error: checkError } = await admin
      .from('dossiers')
      .select('secretaireId, statut, numeroDossier, folderId')
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

    // Vérifier que le dossier est en attente (peut être modifié)
    if (existingDossier.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { 
          error: 'Seuls les dossiers en attente peuvent être modifiés',
          details: `Le dossier a le statut "${existingDossier.statut}" et ne peut plus être modifié`
        },
        { status: 400 }
      )
    }

    // Vérifier si le nouveau numéro de dossier n'existe pas déjà (si changé)
    if (numeroDossier && numeroDossier !== existingDossier.numeroDossier) {
      const { data: existingDossierByNumber, error: numberCheckError } = await admin
        .from('dossiers')
        .select('id, numeroDossier')
        .eq('numeroDossier', numeroDossier)
        .neq('id', id)
        .maybeSingle()

      if (numberCheckError && numberCheckError.code !== 'PGRST116') {
        throw numberCheckError
      }

      if (existingDossierByNumber) {
        return NextResponse.json(
          { 
            error: 'Un dossier avec ce numéro existe déjà',
            details: `Le numéro ${numeroDossier} est déjà utilisé par un autre dossier`
          },
          { status: 409 }
        )
      }
    }

    // Mettre à jour le dossier
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (numeroDossier) updateData.numeroDossier = numeroDossier
    if (numeroNature) updateData.numeroNature = numeroNature
    if (objetOperation) updateData.objetOperation = objetOperation
    if (beneficiaire) updateData.beneficiaire = beneficiaire
    if (posteComptableId) updateData.posteComptableId = posteComptableId
    if (natureDocumentId) updateData.natureDocumentId = natureDocumentId

    const { data: updatedDossier, error: updateError } = await admin
      .from('dossiers')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
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

    console.log('✅ Dossier mis à jour avec succès:', updatedDossier.numeroDossier)
    
    // 🔔 NOTIFICATION DE MISE À JOUR
    try {
      // Notifier le CB qu'un dossier a été mis à jour
      const cbUserId = 'cmebotahv0000c17w3izkh2k9' // ID par défaut - à remplacer par la logique de rôles
      await notifyDossierUpdate(updatedDossier, cbUserId, userData)
      console.log('🔔 Notification de mise à jour envoyée au CB')
      
    } catch (notificationError) {
      console.warn('⚠️ Erreur envoi notification mise à jour:', notificationError)
      // Ne pas faire échouer la mise à jour pour une erreur de notification
    }
    
    return NextResponse.json({ 
      success: true,
      dossier: updatedDossier,
      message: 'Dossier mis à jour avec succès. Le CB a été notifié de la modification.'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
