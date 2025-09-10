const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndCreateTables() {
  try {
    console.log('🔍 Vérification des tables comptables...\n')

    // 1. Vérifier si les tables existent
    console.log('📋 Vérification de l\'existence des tables...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['postes_comptables', 'natures_documents'])

    if (tablesError) {
      console.error('❌ Erreur lors de la vérification des tables:', tablesError)
      return
    }

    const existingTables = tables?.map(t => t.table_name) || []
    console.log(`✅ Tables existantes: ${existingTables.join(', ') || 'Aucune'}`)

    // 2. Créer les tables manquantes
    if (!existingTables.includes('postes_comptables')) {
      console.log('\n📊 Création de la table postes_comptables...')
      
      const { error: createPostesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS "postes_comptables" (
            "id" TEXT NOT NULL,
            "numero" TEXT NOT NULL,
            "intitule" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "postes_comptables_pkey" PRIMARY KEY ("id")
          );
          
          CREATE UNIQUE INDEX IF NOT EXISTS "postes_comptables_numero_key" ON "postes_comptables"("numero");
        `
      })

      if (createPostesError) {
        console.error('❌ Erreur création table postes_comptables:', createPostesError)
      } else {
        console.log('✅ Table postes_comptables créée')
      }
    }

    if (!existingTables.includes('natures_documents')) {
      console.log('\n📄 Création de la table natures_documents...')
      
      const { error: createNaturesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS "natures_documents" (
            "id" TEXT NOT NULL,
            "numero" TEXT NOT NULL,
            "nom" TEXT NOT NULL,
            "description" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "natures_documents_pkey" PRIMARY KEY ("id")
          );
          
          CREATE UNIQUE INDEX IF NOT EXISTS "natures_documents_numero_key" ON "natures_documents"("numero");
        `
      })

      if (createNaturesError) {
        console.error('❌ Erreur création table natures_documents:', createNaturesError)
      } else {
        console.log('✅ Table natures_documents créée')
      }
    }

    // 3. Vérifier et insérer des données de test
    console.log('\n🌱 Vérification des données de test...')
    
    // Vérifier les postes comptables
    const { data: postesData, error: postesError } = await supabase
      .from('postes_comptables')
      .select('count')
      .limit(1)

    if (postesError) {
      console.error('❌ Erreur vérification postes comptables:', postesError)
    } else if (!postesData || postesData.length === 0) {
      console.log('📊 Insertion des données de test pour postes_comptables...')
      
      const { error: insertPostesError } = await supabase
        .from('postes_comptables')
        .insert([
          { id: 'poste_1', numero: '4855', intitule: 'ENS', isActive: true },
          { id: 'poste_2', numero: '4856', intitule: 'ENSET', isActive: true },
          { id: 'poste_3', numero: '4857', intitule: 'INSG', isActive: true },
          { id: 'poste_4', numero: '4858', intitule: 'IUSO', isActive: true },
          { id: 'poste_5', numero: '4860', intitule: 'ENA', isActive: true },
          { id: 'poste_6', numero: '4861', intitule: 'EPCA', isActive: true },
          { id: 'poste_7', numero: '4862', intitule: 'IEF', isActive: true }
        ])

      if (insertPostesError) {
        console.error('❌ Erreur insertion postes comptables:', insertPostesError)
      } else {
        console.log('✅ Données de test postes_comptables insérées')
      }
    } else {
      console.log('✅ Données postes_comptables déjà présentes')
    }

    // Vérifier les natures de documents
    const { data: naturesData, error: naturesError } = await supabase
      .from('natures_documents')
      .select('count')
      .limit(1)

    if (naturesError) {
      console.error('❌ Erreur vérification natures documents:', naturesError)
    } else if (!naturesData || naturesData.length === 0) {
      console.log('📄 Insertion des données de test pour natures_documents...')
      
      const { error: insertNaturesError } = await supabase
        .from('natures_documents')
        .insert([
          { id: 'nature_1', numero: '001', nom: 'Ordre recettes', description: 'Ordre de recettes', isActive: true },
          { id: 'nature_2', numero: '002', nom: 'Ordre paiement', description: 'Ordre de paiement', isActive: true },
          { id: 'nature_3', numero: '003', nom: 'Courrier', description: 'Courrier administratif', isActive: true },
          { id: 'nature_4', numero: '004', nom: 'Facture', description: 'Factures fournisseurs', isActive: true },
          { id: 'nature_5', numero: '005', nom: 'Devis', description: 'Devis et estimations', isActive: true },
          { id: 'nature_6', numero: '006', nom: 'Bordereau', description: 'Bordereaux de versement', isActive: true }
        ])

      if (insertNaturesError) {
        console.error('❌ Erreur insertion natures documents:', insertNaturesError)
      } else {
        console.log('✅ Données de test natures_documents insérées')
      }
    } else {
      console.log('✅ Données natures_documents déjà présentes')
    }

    // 4. Test final
    console.log('\n🧪 Test des APIs...')
    
    const { data: finalPostes } = await supabase
      .from('postes_comptables')
      .select('*')
      .eq('isActive', true)
      .order('numero')

    const { data: finalNatures } = await supabase
      .from('natures_documents')
      .select('*')
      .eq('isActive', true)
      .order('numero')

    console.log(`✅ ${finalPostes?.length || 0} postes comptables disponibles`)
    console.log(`✅ ${finalNatures?.length || 0} natures de documents disponibles`)

    console.log('\n🎉 Configuration terminée avec succès!')
    console.log('📝 Les dropdowns du formulaire de création de dossier devraient maintenant être alimentés avec les vraies données.')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
checkAndCreateTables()
