import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { NotificationsByRole } from '@/lib/notifications-by-role'

/**
 * ❌ API REJET DOSSIER CB - ACGE
 * 
 * Rejette un dossier par le Contrôleur Budgétaire avec motif
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    console.log('❌ Rejet dossier CB:', id)
    
    const body = await request.json()
    const { reason, details } = body
    
    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Le motif de rejet est requis' },
        { status: 400 }
      )
    }
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Récupérer le dossier avec toutes les informations
    const { data: dossier, error: fetchError } = await admin
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le dossier est en attente
    if (dossier.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { error: 'Seuls les dossiers en attente peuvent être rejetés' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut du dossier avec le motif de rejet
    const { data: updatedDossier, error: updateError } = await admin
      .from('dossiers')
      .update({
        statut: 'REJETÉ_CB',
        rejectionReason: reason.trim(),
        rejectionDetails: details?.trim() || null,
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()

    if (updateError) {
      console.error('❌ Erreur rejet dossier:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors du rejet' },
        { status: 500 }
      )
    }

    console.log('❌ Dossier rejeté avec succès:', updatedDossier.numeroDossier)
    
    // 🔔 NOTIFICATIONS INTELLIGENTES PAR RÔLE
    try {
      // Notifier la secrétaire
      if (dossier.secretaire?.id) {
        await NotificationsByRole.notifySecretaire({
          userId: dossier.secretaire.id,
          dossierId: dossier.id,
          numeroDossier: dossier.numeroDossier,
          action: 'dossier_rejected',
          details: `${reason.trim()}${details ? `\n\nDétails: ${details.trim()}` : ''}`
        })
        console.log('🔔 Notification de rejet envoyée à la secrétaire')
      }

      // Notifier le CB
      const { data: cbUsers } = await admin
        .from('users')
        .select('id')
        .eq('role', 'CONTROLEUR_BUDGETAIRE')
        .limit(1)

      if (cbUsers && cbUsers.length > 0) {
        await NotificationsByRole.notifyCB({
          userId: cbUsers[0].id,
          dossierId: dossier.id,
          numeroDossier: dossier.numeroDossier,
          action: 'dossier_rejected',
          details: reason.trim()
        })
        console.log('🔔 Notification envoyée au CB')
      }

    } catch (notificationError) {
      console.warn('⚠️ Erreur envoi notifications:', notificationError)
      // Ne pas faire échouer le rejet pour une erreur de notification
    }
    
    return NextResponse.json({ 
      success: true,
      dossier: updatedDossier,
      message: 'Dossier rejeté avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors du rejet du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors du rejet du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}