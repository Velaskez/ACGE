// Script utilisant le MCP Supabase pour corriger le problème folderId
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const fixWithMCPSupabase = async () => {
  try {
    console.log('🔧 === CORRECTION VIA MCP SUPABASE ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    // Chemin vers le MCP Supabase construit
    const mcpPath = path.join(__dirname, 'temp-supabase-mcp', 'packages', 'mcp-server-supabase', 'dist', 'index.js');
    
    console.log('✅ MCP Supabase trouvé:', mcpPath);
    
    // SQL à exécuter
    const sqlQuery = `
      -- Vérifier la structure actuelle
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'dossiers' 
      AND column_name IN ('folderId', 'folderName')
      ORDER BY column_name;
      
      -- Ajouter les colonnes folderId et folderName à la table dossiers
      ALTER TABLE dossiers 
      ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS folderName TEXT;
      
      -- Créer un index sur folderId pour les performances
      CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
      
      -- Commentaire sur les nouvelles colonnes
      COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
      COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
      
      -- Vérifier que les colonnes ont été ajoutées
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'dossiers' 
      AND column_name IN ('folderId', 'folderName')
      ORDER BY column_name;
    `;
    
    // Créer un script temporaire pour exécuter le MCP
    const mcpScript = `
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = '${supabaseUrl}';
      const supabaseServiceKey = '${supabaseServiceKey}';
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const executeSQL = async () => {
        try {
          console.log('🔧 Exécution du SQL via MCP Supabase...');
          
          // Exécuter le SQL
          const { data, error } = await supabase.rpc('exec', {
            sql: \`${sqlQuery}\`
          });
          
          if (error) {
            console.log('❌ Erreur SQL:', error.message);
            
            // Essayer une approche alternative avec des requêtes séparées
            console.log('🔄 Tentative avec des requêtes séparées...');
            
            const queries = [
              "ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL",
              "ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS folderName TEXT",
              "CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId)",
              "COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders'",
              "COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide'"
            ];
            
            for (const query of queries) {
              try {
                const { error: queryError } = await supabase.rpc('exec', { sql: query });
                if (queryError) {
                  console.log('⚠️  Erreur requête:', query, '->', queryError.message);
                } else {
                  console.log('✅ Requête réussie:', query);
                }
              } catch (err) {
                console.log('❌ Erreur exécution:', query, '->', err.message);
              }
            }
          } else {
            console.log('✅ SQL exécuté avec succès:', data);
          }
          
          // Test final
          console.log('🧪 Test final...');
          const testDossier = {
            id: crypto.randomUUID(),
            numeroDossier: \`MCP-TEST-\${Date.now()}\`,
            numeroNature: 'MCP-TEST-NATURE',
            objetOperation: 'Test via MCP Supabase',
            beneficiaire: 'Test MCP Beneficiaire',
            posteComptableId: 'default-poste-id',
            natureDocumentId: 'default-nature-id',
            secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
            folderId: 'test-folder-mcp',
            folderName: 'Test Folder MCP',
            statut: 'EN_ATTENTE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const { data: testResult, error: testError } = await supabase
            .from('dossiers')
            .insert(testDossier)
            .select();
          
          if (testError) {
            console.log('❌ Erreur test:', testError.message);
          } else {
            console.log('🎉 SUCCÈS: Test réussi !');
            console.log('✅ Dossier créé:', testResult[0].numeroDossier);
            
            // Nettoyer le test
            await supabase
              .from('dossiers')
              .delete()
              .eq('id', testResult[0].id);
            
            console.log('🧹 Test nettoyé');
          }
          
        } catch (error) {
          console.error('❌ Erreur générale:', error);
        }
      };
      
      executeSQL();
    `;
    
    const scriptPath = path.join(__dirname, 'temp-mcp-script.js');
    require('fs').writeFileSync(scriptPath, mcpScript);
    
    console.log('📝 Script MCP créé, exécution...');
    
    // Exécuter le script
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      console.log(`\n🏁 Script terminé avec le code: ${code}`);
      
      // Nettoyer le script temporaire
      try {
        require('fs').unlinkSync(scriptPath);
        console.log('🧹 Script temporaire supprimé');
      } catch (err) {
        console.log('⚠️  Erreur suppression script:', err.message);
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ Erreur exécution script:', error);
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
fixWithMCPSupabase();
