import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {

  try {
    console.log('📊 Dashboard activity - Début')
    
    const supabase = getSupabaseAdmin()
    
    // Pour l'instant, retourner les activités pour tous les utilisateurs (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    // Récupérer les activités récentes
    let recentDocuments: any[] = []
    let recentFolders: any[] = []
    let recentShares: any[] = []

    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          createdAt,
          updatedAt,
          currentVersion:document_versions!inner(fileName, fileType),
          author:users!inner(name, email)
        `)
        .order('updatedAt', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('Erreur récupération documents:', error)
      } else {
        recentDocuments = data || []
      }
    } catch (error) {
      console.error('Erreur récupération documents:', error)
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .select(`
          id,
          name,
          createdAt,
          updatedAt,
          author:users!inner(name, email)
        `)
        .order('createdAt', { ascending: false })
        .limit(5)
      
      if (error) {
        console.error('Erreur récupération dossiers:', error)
      } else {
        recentFolders = data || []
      }
    } catch (error) {
      console.error('Erreur récupération dossiers:', error)
    }

    // Note: document_share n'existe peut-être pas encore, on skip pour l'instant
    try {
      // Vérifier si la table document_share existe
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .limit(1)
      
      if (!error && data) {
        // Table existe, récupérer les partages
        const { data: shares, error: sharesError } = await supabase
          .from('document_shares')
          .select(`
            id,
            userId,
            documentId,
            createdAt,
            document:documents!inner(
              title,
              currentVersion:document_versions!inner(fileName, fileType)
            )
          `)
          .order('createdAt', { ascending: false })
          .limit(5)
        
        if (!sharesError) {
          recentShares = shares || []
        }
      }
    } catch (error) {
      console.error('Erreur récupération partages:', error)
    }

    // Combiner et trier toutes les activités par date
    const activities: Array<{
      id: string
      type: string
      action: string
      target: string
      targetId: string
      timestamp: Date | string
      metadata: Record<string, any>
    }> = []

    // Ajouter les documents
    recentDocuments.forEach(doc => {
      const isNew = new Date(doc.createdAt).getTime() === new Date(doc.updatedAt).getTime()
      
      activities.push({
        id: `doc-${doc.id}`,
        type: isNew ? 'document_created' : 'document_updated',
        action: isNew ? 'Nouveau document' : 'Document modifié',
        target: doc.title || doc.currentVersion?.[0]?.fileName || 'Sans titre',
        targetId: doc.id,
        timestamp: doc.updatedAt,
        metadata: {
          fileType: doc.currentVersion?.[0]?.fileType || 'unknown',
          author: doc.author?.[0]?.name || doc.author?.[0]?.email || 'Inconnu'
        }
      })
    })

    // Ajouter les dossiers
    recentFolders.forEach(folder => {
      activities.push({
        id: `folder-${folder.id}`,
        type: 'folder_created',
        action: 'Dossier créé',
        target: folder.name,
        targetId: folder.id,
        timestamp: folder.createdAt,
        metadata: {
          author: folder.author?.[0]?.name || folder.author?.[0]?.email || 'Inconnu'
        }
      })
    })

    // Ajouter les partages
    recentShares.forEach(share => {
      activities.push({
        id: `share-${share.id}`,
        type: 'document_shared',
        action: 'Document partagé avec vous',
        target: share.document?.title || share.document?.currentVersion?.[0]?.fileName || 'Sans titre',
        targetId: share.documentId,
        timestamp: share.createdAt,
        metadata: {
          fileType: share.document?.currentVersion?.[0]?.fileType || 'unknown'
        }
      })
    })

    // Trier par timestamp décroissant et limiter à 10 activités
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: sortedActivities })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)

    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
