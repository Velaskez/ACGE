import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

/**
 * 🧪 API de test pour insérer directement un document dans Supabase
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test insertion directe dans Supabase...')
    
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json({
        error: 'Client Supabase non configuré'
      }, { status: 500 })
    }

    // Générer un UUID pour le document
    const documentId = crypto.randomUUID()
    const timestamp = Date.now()
    const fileName = `test-${timestamp}.txt`

    console.log('📝 Insertion du document de test...')
    
    // Insérer directement dans la table documents
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        title: 'Document Test Direct',
        description: 'Document créé directement pour test',
        file_name: fileName,
        file_size: 100,
        file_type: 'text/plain',
        file_path: `/test/${fileName}`,
        is_public: false,
        author_id: 'cmebotahv0000c17w3izkh2k9', // ID utilisateur de test
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['test', 'direct']
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Erreur insertion:', dbError)
      return NextResponse.json({
        error: 'Erreur insertion document',
        details: dbError.message,
        code: dbError.code,
        hint: dbError.hint
      }, { status: 500 })
    }

    console.log('✅ Document inséré avec succès:', documentId)

    // Vérifier que le document existe
    const { data: checkDoc, error: checkError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError)
      return NextResponse.json({
        error: 'Document inséré mais impossible à vérifier',
        documentId,
        checkError: checkError.message
      }, { status: 500 })
    }

    // Compter tous les documents
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Document de test créé avec succès',
      document: checkDoc,
      totalDocuments: count || 0
    })

  } catch (error) {
    console.error('❌ Erreur test insertion:', error)
    return NextResponse.json({
      error: 'Erreur interne',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
