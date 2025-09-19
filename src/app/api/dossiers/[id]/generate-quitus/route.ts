import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 📄 API GÉNÉRATION QUITUS - ACGE
 * 
 * Génère automatiquement un quitus pour un dossier validé définitivement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const dossierId = resolvedParams.id
    
    console.log('📄 Génération du quitus pour dossier:', dossierId)
    
    const admin = getSupabaseAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Service de base de données indisponible' },
        { status: 503 }
      )
    }
    
    // 1. Récupérer les informations complètes du dossier
    const { data: dossier, error: dossierError } = await admin
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('id', dossierId)
      .single()

    if (dossierError) {
      console.error('❌ Erreur récupération dossier:', dossierError)
      return NextResponse.json(
        { error: 'Dossier non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le dossier est validé définitivement
    if (dossier.statut !== 'VALIDÉ_DÉFINITIVEMENT') {
      return NextResponse.json(
        { error: 'Seuls les dossiers validés définitivement peuvent générer un quitus' },
        { status: 400 }
      )
    }

    // 2. Récupérer le rapport de vérification complet
    const rapportResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dossiers/${dossierId}/rapport-verification`)
    
    if (!rapportResponse.ok) {
      return NextResponse.json(
        { error: 'Impossible de récupérer le rapport de vérification' },
        { status: 500 }
      )
    }
    
    const rapportData = await rapportResponse.json()
    const rapport = rapportData.rapport

    // 3. Vérifier si un quitus existe déjà pour ce dossier
    const { data: existingQuitus, error: existingError } = await admin
      .from('quitus')
      .select('*')
      .eq('dossier_id', dossierId)
      .single()

    if (existingQuitus && !existingError) {
      console.log('📄 Quitus existant trouvé, retour du quitus existant')
      return NextResponse.json({
        success: true,
        message: `Quitus ${existingQuitus.id} récupéré (déjà généré)`,
        quitus: existingQuitus.contenu,
        existing: true
      })
    }

    // 3. Générer les données du quitus
    const timestamp = Date.now()
    const quitusData = {
      // Informations générales
      numeroQuitus: `QUITUS-${dossier.numeroDossier}-${new Date().getFullYear()}-${timestamp}`,
      dateGeneration: new Date().toISOString(),
      
      // Informations du dossier
      dossier: {
        numero: dossier.numeroDossier,
        objet: dossier.objetOperation,
        beneficiaire: dossier.beneficiaire,
        posteComptable: dossier.poste_comptable?.intitule || 'Non défini',
        natureDocument: dossier.nature_document?.nom || 'Non défini',
        dateDepot: dossier.dateDepot,
        montantOrdonnance: dossier.montantOrdonnance || 0
      },
      
      // Historique des validations
      historique: {
        creation: {
          date: dossier.createdAt,
          par: dossier.secretaire?.name || 'Secrétaire'
        },
        validationCB: {
          date: dossier.validatedAt || null,
          statut: 'VALIDÉ_CB'
        },
        ordonnancement: {
          date: dossier.ordonnancedAt || null,
          commentaire: dossier.ordonnancementComment || null,
          montant: dossier.montantOrdonnance || 0
        },
        validationDefinitive: {
          date: dossier.validatedDefinitivelyAt,
          commentaire: dossier.validationDefinitiveComment || null
        }
      },
      
      // Synthèse des vérifications
      verifications: {
        cb: {
          total: rapport.statistiquesGlobales.cb.total,
          valides: rapport.statistiquesGlobales.cb.valides,
          rejetes: rapport.statistiquesGlobales.cb.rejetes,
          statut: rapport.statistiquesGlobales.cb.statut,
          categories: rapport.voletCB.controlesParCategorie.map((cat: any) => ({
            nom: cat.categorie.nom,
            total: cat.controles.length,
            valides: cat.controles.filter((c: any) => c.valide).length
          }))
        },
        ordonnateur: {
          total: rapport.statistiquesGlobales.ordonnateur.total,
          valides: rapport.statistiquesGlobales.ordonnateur.valides,
          rejetes: rapport.statistiquesGlobales.ordonnateur.rejetes,
          statut: rapport.statistiquesGlobales.ordonnateur.statut,
          categories: rapport.voletOrdonnateur.verificationsParCategorie.map((cat: any) => ({
            nom: cat.categorie.nom,
            total: cat.verifications.length,
            valides: cat.verifications.filter((v: any) => v.valide).length
          }))
        }
      },
      
      // Incohérences détectées
      incoherences: rapport.incoherences,
      
      // Conclusion
      conclusion: {
        conforme: rapport.incoherences.length === 0,
        recommandations: rapport.incoherences.length > 0 
          ? 'Des incohérences ont été détectées et doivent être résolues.' 
          : 'Toutes les vérifications sont conformes. Le dossier peut être traité.',
        signature: {
          fonction: 'Agent Comptable',
          date: new Date().toISOString(),
          lieu: 'Libreville, Gabon'
        }
      }
    }

    // 4. Sauvegarder le quitus en base de données
    const { data: quitusRecord, error: quitusError } = await admin
      .from('quitus')
      .insert([{
        id: quitusData.numeroQuitus,
        dossier_id: dossierId,
        contenu: quitusData,
        statut: 'GÉNÉRÉ',
        genere_le: new Date().toISOString()
      }])
      .select()
      .single()

    if (quitusError) {
      console.error('❌ Erreur sauvegarde quitus:', quitusError)
      // Continuer même si la sauvegarde échoue
    }

    console.log('✅ Quitus généré avec succès:', quitusData.numeroQuitus)

    return NextResponse.json({
      success: true,
      message: `Quitus ${quitusData.numeroQuitus} généré avec succès`,
      quitus: quitusData
    })

  } catch (error) {
    console.error('❌ Erreur génération quitus:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
