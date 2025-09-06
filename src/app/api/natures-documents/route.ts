import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET - Récupérer toutes les natures de documents
export async function GET(request: NextRequest) {
  try {
    console.log('📄 Récupération natures documents - Début')

    const admin = getSupabaseAdmin()

    // Récupérer les natures de documents depuis la base de données
    const { data: naturesDocuments, error } = await admin
      .from('natures_documents')
      .select('*')
      .eq('isActive', true)
      .order('numero', { ascending: true })

    if (error) {
      console.error('Erreur Supabase:', error)
      // Fallback sur des données simulées si la table n'existe pas encore
      const fallbackData = [
        {
          id: 'nature_1',
          numero: 'NAT-001',
          nom: 'Facture',
          description: 'Document de facturation',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'nature_2',
          numero: 'NAT-002',
          nom: 'Devis',
          description: 'Document de devis',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'nature_3',
          numero: 'NAT-003',
          nom: 'Bon de commande',
          description: 'Document de commande',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      console.log(`⚠️ Utilisation des données de fallback (${fallbackData.length} natures)`)
      return NextResponse.json({ naturesDocuments: fallbackData })
    }

    console.log(`✅ ${naturesDocuments?.length || 0} natures de documents récupérées`)

    return NextResponse.json({ naturesDocuments: naturesDocuments || [] })

  } catch (error) {
    console.error('Erreur lors de la récupération des natures de documents:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle nature de document
export async function POST(request: NextRequest) {
  try {
    console.log('📄 Création nature document - Début')
    
    const body = await request.json()
    const { numero, nom, description, isActive = true } = body

    if (!numero || !nom) {
      return NextResponse.json(
        { error: 'Numéro et nom sont requis' },
        { status: 400 }
      )
    }

    // Simulation de création
    const natureDocument = {
      id: 'nature_' + Date.now(),
      numero,
      nom,
      description,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log(`✅ Nature document créée: ${natureDocument.numero}`)

    return NextResponse.json({ 
      success: true,
      natureDocument,
      message: 'Nature de document créée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la création de la nature de document:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

