import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Mode test - Upload simulé...')
    
    // Parser le FormData
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadataStr = formData.get('metadata') as string
    
    console.log('📁 Fichiers reçus:', files.length)
    
    if (!files || files.length === 0) {
      console.log('❌ Aucun fichier fourni')
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    let metadata: any
    try {
      metadata = JSON.parse(metadataStr)
      console.log('📋 Métadonnées:', metadata)
    } catch {
      metadata = {}
      console.log('⚠️ Métadonnées invalides, utilisation des valeurs par défaut')
    }

    const uploadedFiles: Array<{
      id: string
      title: string
      name: string
      size: number
      type: string
      path: string
      version: {
        id: string
        number: number
        changeLog: string | null
        isNewDocument: boolean
      }
    }> = []

    // Traiter chaque fichier (simulation)
    for (const file of files) {
      try {
        console.log(`📤 Traitement du fichier: ${file.name}`)
        
        // Simuler un upload réussi
        const fileId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        const versionId = `version-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        
        const uploadedFile = {
          id: fileId,
          title: metadata.name || file.name.split('.')[0],
          name: file.name,
          size: file.size,
          type: file.type,
          path: `/uploads/test/${file.name}`,
          version: {
            id: versionId,
            number: 1,
            changeLog: 'Version de test (simulation)',
            isNewDocument: true
          }
        }
        
        uploadedFiles.push(uploadedFile)
        console.log('✅ Fichier simulé:', uploadedFile.name)
        
      } catch (error) {
        console.error(`❌ Erreur simulation fichier ${file.name}:`, error)
      }
    }

    if (uploadedFiles.length === 0) {
      console.log('❌ Aucun fichier traité avec succès')
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être traité' },
        { status: 500 }
      )
    }

    console.log('✅ Upload simulé terminé avec succès:', uploadedFiles.length, 'fichiers')
    return NextResponse.json({
      message: `${uploadedFiles.length} fichier(s) traité(s) avec succès (mode test)`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('💥 Erreur upload test:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
