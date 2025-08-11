import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFolderSchema() {
  try {
    console.log('🔍 Vérification de la structure de la table folders...')
    
    // Utiliser une requête SQL directe pour vérifier la structure de la table
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'folders' 
      ORDER BY ordinal_position;
    ` as any[]
    
    console.log('\n📊 Colonnes de la table folders:')
    console.log('─'.repeat(80))
    console.log('| Nom de la colonne | Type | Nullable | Défaut |')
    console.log('─'.repeat(80))
    
    result.forEach(column => {
      const name = column.column_name.padEnd(17)
      const type = column.data_type.padEnd(12)
      const nullable = column.is_nullable.padEnd(8)
      const defaultVal = (column.column_default || 'NULL').substring(0, 20)
      console.log(`| ${name} | ${type} | ${nullable} | ${defaultVal} |`)
    })
    console.log('─'.repeat(80))
    
    // Vérifier spécifiquement la colonne folderNumber
    const folderNumberColumn = result.find(col => col.column_name === 'folderNumber')
    if (folderNumberColumn) {
      console.log('\n✅ Colonne folderNumber trouvée!')
      console.log(`   Type: ${folderNumberColumn.data_type}`)
      console.log(`   Défaut: ${folderNumberColumn.column_default}`)
      console.log(`   Nullable: ${folderNumberColumn.is_nullable}`)
    } else {
      console.log('\n❌ Colonne folderNumber NON trouvée!')
    }
    
    // Vérifier les contraintes unique
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'folders' AND constraint_type = 'UNIQUE';
    ` as any[]
    
    console.log('\n🔐 Contraintes UNIQUE sur la table folders:')
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name} (${constraint.constraint_type})`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFolderSchema()
