import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { cache, CacheKeys } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Sidebar folders - Début')
    
    // Vérifier le cache d'abord
    const cached = cache.get<any[]>(CacheKeys.sidebarFolders)
    if (cached) {
      console.log('🎯 Sidebar folders depuis le cache')
      return NextResponse.json({ folders: cached })
    }
    
    // Récupérer les dossiers avec les documents récents
    let folders: any[] = []
    try {
      const admin = getSupabaseAdmin()
      const { data: folderRows, error } = await admin
        .from('folders')
        .select('id, name, createdAt, updatedAt')
        .order('updatedAt', { ascending: false })
        .limit(10)

      if (error) throw error
      folders = folderRows || []

      console.log('📁 Dossiers trouvés:', folders.length)

      // Transformer les données pour correspondre à l'interface
      // Récupérer 3 docs récents par dossier
      const admin2 = getSupabaseAdmin()
      const transformedFolders = await Promise.all(
        folders.map(async (folder) => {
          // Gérer les IDs UUID et legacy
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          const legacyRegex = /^folder[-_]\d+$/i
          
          let docs: any[] = []
          
          if (uuidRegex.test(folder.id)) {
            // Dossier UUID - requête directe
            const { data } = await admin2
              .from('documents')
              .select('id, title, updated_at')
              .eq('folder_id', folder.id)
              .order('updated_at', { ascending: false })
              .limit(3)
            docs = data || []
          } else if (legacyRegex.test(folder.id)) {
            // Dossier legacy - filtrage côté application
            const { data: allDocs } = await admin2
              .from('documents')
              .select('id, title, updated_at, folder_id')
              .order('updated_at', { ascending: false })
            docs = (allDocs || [])
              .filter(doc => doc.folder_id === folder.id)
              .slice(0, 3)
          }
          
          return {
            id: folder.id,
            name: folder.name,
            documentCount: docs.length,
            recentDocuments: docs.map(doc => ({
              id: doc.id,
              title: doc.title,
              fileName: doc.title,
              fileType: 'application/octet-stream'
            }))
          }
        })
      )

      console.log('📁 Dossiers transformés:', transformedFolders.length)
      
      // Mettre en cache pour 2 minutes
      cache.set(CacheKeys.sidebarFolders, transformedFolders, 120000)
      
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
