import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🧪 Tester la structure exacte de la table documents
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test structure table documents...')
    
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Client Supabase non disponible' },
        { status: 500 }
      )
    }

    // Test 1: Essayer d'insérer avec snake_case
    const testDocSnake = {
      id: crypto.randomUUID(),
      title: 'Test Snake Case',
      description: 'Test avec snake_case',
      author_id: crypto.randomUUID(),
      folder_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('🔄 Test snake_case...')
    const { data: docSnake, error: errorSnake } = await supabase
      .from('documents')
      .insert(testDocSnake)
      .select()
      .single()

    if (errorSnake) {
      console.log('❌ Erreur snake_case:', errorSnake.message)
      
      // Test 2: Essayer avec camelCase
      const testDocCamel = {
        id: crypto.randomUUID(),
        title: 'Test Camel Case',
        description: 'Test avec camelCase',
        authorId: crypto.randomUUID(),
        folderId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('🔄 Test camelCase...')
      const { data: docCamel, error: errorCamel } = await supabase
        .from('documents')
        .insert(testDocCamel)
        .select()
        .single()

      if (errorCamel) {
        console.log('❌ Erreur camelCase:', errorCamel.message)
        
        // Test 3: Essayer de récupérer la structure via une requête simple
        console.log('🔄 Test récupération structure...')
        const { data: structure, error: structureError } = await supabase
          .from('documents')
          .select('*')
          .limit(1)

        return NextResponse.json({
          success: false,
          message: 'Impossible de déterminer la structure',
          errors: {
            snake_case: errorSnake.message,
            camelCase: errorCamel.message,
            structure: structureError?.message || 'OK'
          },
          structure: structure
        })
      }

      // Supprimer le document de test
      await supabase
        .from('documents')
        .delete()
        .eq('id', docCamel.id)

      return NextResponse.json({
        success: true,
        message: 'Table utilise camelCase',
        testDocument: docCamel,
        structure: 'camelCase'
      })
    }

    // Supprimer le document de test
    await supabase
      .from('documents')
      .delete()
      .eq('id', docSnake.id)

    return NextResponse.json({
      success: true,
      message: 'Table utilise snake_case',
      testDocument: docSnake,
      structure: 'snake_case'
    })

  } catch (error) {
    console.error('💥 Erreur test structure:', error)
    return NextResponse.json(
      { 
        error: 'Erreur test structure',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
