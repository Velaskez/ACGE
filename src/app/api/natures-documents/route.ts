import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Récupérer toutes les natures de documents
export async function GET(request: NextRequest) {
  try {
    console.log('📄 Récupération natures documents - Début')

    const naturesDocuments = await prisma.natureDocument.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        numero: 'asc'
      }
    })

    console.log(`✅ ${naturesDocuments.length} natures de documents récupérées`)

    return NextResponse.json({ naturesDocuments })

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

    // Vérifier si le numéro existe déjà
    const existing = await prisma.natureDocument.findUnique({
      where: { numero }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Une nature de document avec ce numéro existe déjà' },
        { status: 409 }
      )
    }

    const natureDocument = await prisma.natureDocument.create({
      data: {
        numero,
        nom,
        description,
        isActive
      }
    })

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

