import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Récupérer tous les postes comptables
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Récupération postes comptables - Début')

    const postesComptables = await prisma.posteComptable.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        numero: 'asc'
      }
    })

    console.log(`✅ ${postesComptables.length} postes comptables récupérés`)

    return NextResponse.json({ postesComptables })

  } catch (error) {
    console.error('Erreur lors de la récupération des postes comptables:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau poste comptable
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Création poste comptable - Début')
    
    const body = await request.json()
    const { numero, intitule, isActive = true } = body

    if (!numero || !intitule) {
      return NextResponse.json(
        { error: 'Numéro et intitulé sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si le numéro existe déjà
    const existing = await prisma.posteComptable.findUnique({
      where: { numero }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un poste comptable avec ce numéro existe déjà' },
        { status: 409 }
      )
    }

    const posteComptable = await prisma.posteComptable.create({
      data: {
        numero,
        intitule,
        isActive
      }
    })

    console.log(`✅ Poste comptable créé: ${posteComptable.numero}`)

    return NextResponse.json({ 
      success: true,
      posteComptable,
      message: 'Poste comptable créé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la création du poste comptable:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

