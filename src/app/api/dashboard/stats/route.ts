import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {

  try {
    console.log('📊 Dashboard stats - Début')
    
    const supabase = getSupabaseAdmin()
    
    // Pour l'instant, retourner les stats pour tous les utilisateurs (ADMIN)
    // En production, vous pourriez vérifier l'authentification côté client
    
    // Récupérer les statistiques de base avec gestion d'erreur
    let totalDocuments = 0
    let totalFolders = 0
    let totalUsers = 0
    let totalSize = 0

    try {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Erreur comptage documents:', error)
      } else {
        totalDocuments = count || 0
      }
    } catch (error) {
      console.error('Erreur comptage documents:', error)
    }

    try {
      const { count, error } = await supabase
        .from('folders')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Erreur comptage dossiers:', error)
      } else {
        totalFolders = count || 0
      }
    } catch (error) {
      console.error('Erreur comptage dossiers:', error)
    }

    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Erreur comptage utilisateurs:', error)
      } else {
        totalUsers = count || 0
      }
    } catch (error) {
      console.error('Erreur comptage utilisateurs:', error)
    }

    // Calculer la taille totale de manière simple
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id')
      
      if (!error && documents) {
        for (const doc of documents) {
          try {
            const { data: versions, error: versionError } = await supabase
              .from('document_versions')
              .select('fileSize')
              .eq('documentId', doc.id)
              .order('versionNumber', { ascending: false })
              .limit(1)
            
            if (!versionError && versions && versions.length > 0) {
              const version = versions[0]
              if (version.fileSize) {
                totalSize += version.fileSize
              }
            }
          } catch (versionError) {
            console.error('Erreur récupération version pour document:', doc.id, versionError)
          }
        }
      }
    } catch (sizeError) {
      console.error('Erreur calcul taille totale:', sizeError)
      totalSize = 0
    }

    // Statistiques simplifiées
    const stats = {
      totalDocuments,
      totalFolders,
      totalUsers,
      activeUsers: totalUsers,
      monthlyGrowthPercentage: 0,
      spaceUsed: {
        bytes: totalSize,
        gb: Math.round((totalSize / (1024 * 1024 * 1024)) * 100) / 100,
        percentage: 0,
        quota: 10 * 1024 * 1024 * 1024
      },
      recentDocuments: [],
      documentsThisMonth: 0,
      documentsLastMonth: 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur API stats:', error)

    // Toujours retourner du JSON valide
    return NextResponse.json({
      totalDocuments: 0,
      totalFolders: 0,
      totalUsers: 0,
      activeUsers: 0,
      monthlyGrowthPercentage: 0,
      spaceUsed: {
        bytes: 0,
        gb: 0,
        percentage: 0,
        quota: 10 * 1024 * 1024 * 1024
      },
      recentDocuments: [],
      documentsThisMonth: 0,
      documentsLastMonth: 0,
      error: 'Erreur temporaire de la base de données'
    })
  }
}
