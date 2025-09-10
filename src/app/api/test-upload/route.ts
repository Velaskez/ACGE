import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test upload sans authentification...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = formData.get('metadata') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }
    
    console.log('📁 Fichier reçu:', file.name, file.size, 'bytes')
    
    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Le dossier existe déjà
    }
    
    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, file.name)
    
    await writeFile(filePath, buffer)
    
    console.log('✅ Fichier sauvegardé:', filePath)
    
    // Simuler un document en base (sans vraie base de données)
    const document = {
      id: `test-${Date.now()}`,
      title: file.name,
      description: metadata ? JSON.parse(metadata).description : null,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: filePath,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      message: 'Fichier uploadé avec succès (test)',
      document
    })
    
  } catch (error) {
    console.error('❌ Erreur test upload:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}
