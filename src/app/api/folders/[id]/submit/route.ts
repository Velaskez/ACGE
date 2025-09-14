import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { randomUUID } from 'crypto'
import { notifyDossierSubmission, notifyCBDossierPending } from '@/lib/notifications'

/**
 * 📤 API SOUMISSION DOSSIER - ACGE
 * 
 * Soumet un dossier de la table 'folders' vers la table 'dossiers' 
 * avec le statut 'EN_ATTENTE' pour validation par le CB
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const folderId = resolvedParams.id
    
    console.log('📤 Soumission du dossier:', folderId)
    
    const body = await request.json()
    const { 
      numeroDossier, 
      numeroNature, 
      objetOperation, 
      beneficiaire, 
      posteComptableId, 
      natureDocumentId,
      secretaireId 
    } = body
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // Vérifier que le dossier existe dans la table folders
    const { data: existingFolder, error: checkError } = await admin
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single()

    if (checkError || !existingFolder) {
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le dossier n'a pas déjà été soumis
    const { data: existingDossier, error: dossierCheckError } = await admin
      .from('dossiers')
      .select('id, numeroDossier')
      .eq('numeroDossier', numeroDossier)
      .maybeSingle()

    if (dossierCheckError && dossierCheckError.code !== 'PGRST116') {
      throw dossierCheckError
    }

    if (existingDossier) {
      return NextResponse.json(
        { error: 'Un dossier avec ce numéro a déjà été soumis' },
        { status: 409 }
      )
    }

    // Récupérer l'ID de l'utilisateur actuel ou utiliser un ID par défaut valide
    let defaultSecretaireId = secretaireId
    
    if (!defaultSecretaireId) {
      // Récupérer le premier utilisateur avec le rôle SECRETAIRE
      const { data: secretaires } = await admin
        .from('users')
        .select('id')
        .eq('role', 'SECRETAIRE')
        .limit(1)
      
      if (secretaires && secretaires.length > 0) {
        defaultSecretaireId = secretaires[0].id
      } else {
        // Récupérer n'importe quel utilisateur si aucun secrétaire n'existe
        const { data: anyUser } = await admin
          .from('users')
          .select('id')
          .limit(1)
        
        if (anyUser && anyUser.length > 0) {
          defaultSecretaireId = anyUser[0].id
        } else {
          return NextResponse.json(
            { error: 'Aucun utilisateur trouvé dans la base de données' },
            { status: 500 }
          )
        }
      }
    }

    // Récupérer ou créer des valeurs par défaut pour posteComptableId et natureDocumentId
    let defaultPosteComptableId = posteComptableId
    let defaultNatureDocumentId = natureDocumentId
    
    console.log(`🔍 Poste comptable fourni par la secrétaire: ${posteComptableId}`)
    console.log(`🔍 Nature document fournie par la secrétaire: ${natureDocumentId}`)

    if (!defaultPosteComptableId) {
      // Récupérer le premier poste comptable disponible
      const { data: postesComptables } = await admin
        .from('postes_comptables')
        .select('id, numero, intitule')
        .limit(1)
      
      if (postesComptables && postesComptables.length > 0) {
        defaultPosteComptableId = postesComptables[0].id
        console.log(`🔍 Poste comptable par défaut utilisé: ${postesComptables[0].numero} - ${postesComptables[0].intitule} (ID: ${postesComptables[0].id})`)
      } else {
        // Créer un poste comptable par défaut si aucun n'existe
        const { data: newPoste } = await admin
          .from('postes_comptables')
          .insert({
            id: randomUUID(),
            numero: 'PC-001',
            intitule: 'Poste Comptable par défaut',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .select('id')
          .single()
        
        defaultPosteComptableId = newPoste?.id
      }
    }

    if (!defaultNatureDocumentId) {
      // Récupérer la première nature de document disponible
      const { data: naturesDocuments } = await admin
        .from('natures_documents')
        .select('id')
        .limit(1)
      
      if (naturesDocuments && naturesDocuments.length > 0) {
        defaultNatureDocumentId = naturesDocuments[0].id
      } else {
        // Créer une nature de document par défaut si aucune n'existe
        const { data: newNature } = await admin
          .from('natures_documents')
          .insert({
            id: randomUUID(),
            numero: 'NAT-001',
            nom: 'Nature par défaut',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .select('id')
          .single()
        
        defaultNatureDocumentId = newNature?.id
      }
    }
    
    // Créer le dossier dans la table dossiers avec statut EN_ATTENTE
    const { data: newDossier, error: insertError } = await admin
      .from('dossiers')
      .insert({
        id: randomUUID(), // Générer un UUID valide
        numeroDossier: numeroDossier || `DOSS-ACGE-${Date.now()}`,
        numeroNature: numeroNature || 'NATURE-001',
        objetOperation: objetOperation || existingFolder.description || 'Opération comptable',
        beneficiaire: beneficiaire || 'Bénéficiaire non spécifié',
        posteComptableId: defaultPosteComptableId,
        natureDocumentId: defaultNatureDocumentId,
        secretaireId: defaultSecretaireId,
        folderId: folderId, // ID du dossier original
        foldername: existingFolder.name, // Nom du dossier original
        statut: 'EN_ATTENTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()

    if (insertError) {
      console.error('❌ Erreur création dossier comptable:', insertError)
      throw insertError
    }

    console.log('✅ Dossier soumis avec succès:', newDossier.numeroDossier)
    
    // 🔔 NOTIFICATIONS INTELLIGENTES
    try {
      // Notifier la secrétaire de la soumission réussie
      if (newDossier.secretaire) {
        await notifyDossierSubmission(newDossier, newDossier.secretaire)
        console.log('🔔 Notification envoyée à la secrétaire')
      }
      
      // Notifier le CB qu'un nouveau dossier est en attente
      // Pour l'instant, on utilise un ID CB par défaut - à améliorer avec un système de rôles
      const cbUserId = 'cmebotahv0000c17w3izkh2k9' // ID par défaut - à remplacer par la logique de rôles
      await notifyCBDossierPending(newDossier, cbUserId)
      console.log('🔔 Notification envoyée au CB')
      
    } catch (notificationError) {
      console.warn('⚠️ Erreur envoi notifications:', notificationError)
      // Ne pas faire échouer la soumission pour une erreur de notification
    }
    
    return NextResponse.json({ 
      success: true,
      dossier: newDossier,
      message: 'Dossier soumis avec succès pour validation par le CB'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la soumission du dossier:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la soumission du dossier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
