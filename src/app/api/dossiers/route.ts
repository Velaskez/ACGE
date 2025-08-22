import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Récupération des dossiers comptables')
    
    const dossiers = await prisma.dossier.findMany({
      include: {
        posteComptable: true,
        natureDocument: true,
        secretaire: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        validations: {
          include: {
            validateur: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📋 ${dossiers.length} dossiers comptables trouvés`)
    
    return NextResponse.json({ 
      success: true, 
      dossiers,
      count: dossiers.length 
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des dossiers comptables:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des dossiers comptables',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Création d\'un nouveau dossier comptable')
    
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

    // Validation des champs requis
    if (!numeroDossier || !numeroNature || !objetOperation || !beneficiaire) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tous les champs sont requis: numeroDossier, numeroNature, objetOperation, beneficiaire' 
        }, 
        { status: 400 }
      )
    }

    // Vérifier si le numéro de dossier existe déjà
    const existingDossier = await prisma.dossier.findUnique({
      where: { numeroDossier }
    })

    if (existingDossier) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un dossier avec ce numéro existe déjà' 
        }, 
        { status: 409 }
      )
    }

    // Créer le nouveau dossier
    const newDossier = await prisma.dossier.create({
      data: {
        numeroDossier,
        numeroNature,
        objetOperation,
        beneficiaire,
        posteComptableId: posteComptableId || 'default-poste-id', // ID par défaut temporaire
        natureDocumentId: natureDocumentId || 'default-nature-id', // ID par défaut temporaire
        secretaireId: secretaireId || 'cmecmvbvy0000c1ecbq58lmtm' // ID admin par défaut
      },
      include: {
        posteComptable: true,
        natureDocument: true,
        secretaire: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Dossier comptable créé:', newDossier.numeroDossier)
    
    return NextResponse.json({ 
      success: true, 
      dossier: newDossier,
      message: 'Dossier comptable créé avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la création du dossier comptable:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création du dossier comptable',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}
