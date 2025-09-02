import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Sidebar folders - Début')
    
    // Récupérer les dossiers avec les documents récents
    let folders: any[] = []
    try {
      const admin = getSupabaseAdmin()
      const { data: folderRows, error } = await admin
        .from('folders')
        .select('id, name, createdAt:created_at, updatedAt:updated_at')
        .order('updated_at', { ascending: false })
        .limit(10)

      if (error) throw error
      folders = folderRows || []

      console.log('📁 Dossiers trouvés:', folders.length)

      // Transformer les données pour correspondre à l'interface
      // Récupérer 3 docs récents par dossier
      const admin2 = getSupabaseAdmin()
      const transformedFolders = await Promise.all(
        folders.map(async (folder) => {
          const { data: docs } = await admin2
            .from('documents')
            .select('id, title, updatedAt:updated_at')
            .eq('folderId', folder.id)
            .order('updated_at', { ascending: false })
            .limit(3)
          return {
            id: folder.id,
            name: folder.name,
            documentCount: (docs?.length) || 0,
            recentDocuments: (docs || []).map(doc => ({
              id: doc.id,
              title: doc.title,
              fileName: doc.title,
              fileType: 'application/octet-stream'
            }))
          }
        })
      )

      console.log('📁 Dossiers transformés:', transformedFolders.length)
      return NextResponse.json({ folders: transformedFolders })

    } catch (dbError) {
      console.error('Erreur base de données sidebar dossiers:', dbError)
      return NextResponse.json({ folders: [] }, { status: 200 })
    }

  } catch (error) {
    console.error('Erreur API sidebar dossiers:', error)
    return NextResponse.json({ folders: [] }, { status: 200 })
  }
}
