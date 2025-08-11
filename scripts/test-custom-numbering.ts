import { generateFolderNumberWithInitials } from '../src/lib/folder-numbering'

async function testCustomNumbering() {
  console.log('🧪 Test de la numérotation personnalisée avec initiales...\n')
  
  const testCases = [
    'Comptabilité Générale',
    'Ressources Humaines',
    'Gestion de la Paie',
    'Audit Interne et Contrôle',
    'Investissements Financiers',
    'Contrats et Conventions',
    'Documentation Technique',
    'Archives Historiques'
  ]
  
  console.log('📊 Exemples de numérotation:')
  console.log('─'.repeat(60))
  
  for (const folderName of testCases) {
    const folderNumber = await generateFolderNumberWithInitials(folderName)
    console.log(`${folderName.padEnd(30)} → ${folderNumber}`)
  }
  
  console.log('─'.repeat(60))
  console.log('\n✅ Format: ACGE-YYYY-XXX-INI')
  console.log('   - ACGE = Code établissement')
  console.log('   - YYYY = Année actuelle')
  console.log('   - XXX = Numéro séquentiel (001, 002, etc.)')
  console.log('   - INI = Initiales du nom (2-4 lettres)')
}

testCustomNumbering().catch(console.error)
