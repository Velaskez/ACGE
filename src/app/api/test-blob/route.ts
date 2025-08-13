import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('🧪 Test Vercel Blob...')
    
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'test-file.txt';

    console.log('📝 Nom de fichier:', filename)

    // Test avec un buffer simple comme dans l'exemple officiel
    const testContent = 'Ceci est un test Vercel Blob'
    const buffer = Buffer.from(testContent, 'utf-8')
    
    console.log('📤 Upload vers Vercel Blob...')
    const blob = await put(filename, buffer, {
      access: 'public',
    });

    console.log('✅ Blob créé:', blob.url)
    return NextResponse.json(blob);
    
  } catch (error) {
    console.error('❌ Erreur test blob:', error)
    return NextResponse.json(
      { error: 'Erreur test blob', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
