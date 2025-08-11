import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkExistingFolders() {
  try {
    console.log('🔍 Vérification des dossiers existants...')
    
    const folders = await prisma.folder.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Nombre de dossiers existants: ${folders.length}`)
    
    if (folders.length > 0) {
      console.log('\n📁 Dossiers existants:')
      folders.forEach((folder, index) => {
        console.log(`${index + 1}. ${folder.name} (${folder.id}) - créé le ${folder.createdAt.toLocaleDateString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingFolders()
