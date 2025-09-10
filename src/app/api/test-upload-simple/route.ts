import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🧪 Test upload simple sans authentification
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test upload simple...')
    
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Client Supabase non disponible' },
        { status: 500 }
      )
    }

    // Récupérer l'utilisateur admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', 'admin@acge-gabon.com')
      .single()

    if (adminError) {
      return NextResponse.json(
        { error: 'Admin non trouvé', details: adminError.message },
        { status: 500 }
      )
    }

    // Créer un document de test
    const testDoc = {
      id: crypto.randomUUID(),
      title: 'Test Upload Simple',
      description: 'Document créé via test upload simple',
      authorId: admin.id,
      folderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert(testDoc)
      .select()
      .single()

    if (docError) {
      return NextResponse.json(
        { error: 'Erreur création document', details: docError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document de test créé avec succès',
      document: document,
      admin: {
        id: admin.id,
        email: admin.email
      }
    })

  } catch (error) {
    console.error('💥 Erreur test upload simple:', error)
    return NextResponse.json(
      { 
        error: 'Erreur test upload simple',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
