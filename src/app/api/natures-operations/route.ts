import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeId = searchParams.get('type_id')

    if (!typeId) {
      return NextResponse.json({ error: 'type_id est requis' }, { status: 400 })
    }

    const { data: natures, error } = await supabase
      .from('natures_operations')
      .select('*')
      .eq('type_operation_id', typeId)
      .eq('actif', true)
      .order('nom')

    if (error) {
      console.error('Erreur lors de la récupération des natures:', error)
      return NextResponse.json({ error: 'Erreur lors de la récupération des natures d\'opérations' }, { status: 500 })
    }

    return NextResponse.json({ natures: natures || [] })
  } catch (error) {
    console.error('Erreur lors de la récupération des natures:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des natures d\'opérations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const natureData = await request.json()
    
    const { data: nature, error } = await supabase
      .from('natures_operations')
      .insert([natureData])
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la nature:', error)
      return NextResponse.json({ error: 'Erreur lors de la création de la nature d\'opération' }, { status: 500 })
    }

    return NextResponse.json({ nature })
  } catch (error) {
    console.error('Erreur lors de la création de la nature:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la nature d\'opération' }, { status: 500 })
  }
}