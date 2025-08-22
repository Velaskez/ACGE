import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('🔧 Création des données de test...')

    // Créer un poste comptable de test
    const posteComptable = await prisma.posteComptable.create({
      data: {
        numero: 'PC001',
        intitule: 'Poste Comptable Test',
        isActive: true
      }
    })
    console.log('✅ Poste comptable créé:', posteComptable.numero)

    // Créer une nature de document de test
    const natureDocument = await prisma.natureDocument.create({
      data: {
        numero: 'ND001',
        nom: 'Nature Document Test',
        description: 'Nature de document pour les tests',
        isActive: true
      }
    })
    console.log('✅ Nature document créée:', natureDocument.numero)

    // Créer un dossier comptable de test
    const dossier = await prisma.dossier.create({
      data: {
        numeroDossier: 'DOSS-ACGE-2025001',
        numeroNature: '01',
        objetOperation: 'Test dossier comptable',
        beneficiaire: 'Test Beneficiaire',
        posteComptableId: posteComptable.id,
        natureDocumentId: natureDocument.id,
        secretaireId: 'cmecmvbvy0000c1ecbq58lmtm' // ID admin existant
      }
    })
    console.log('✅ Dossier comptable créé:', dossier.numeroDossier)

    // Créer un folder de test
    const folder = await prisma.folder.create({
      data: {
        name: 'Folder Test',
        description: 'Folder de test pour vérifier la séparation',
        authorId: 'cmecmvbvy0000c1ecbq58lmtm' // ID admin existant
      }
    })
    console.log('✅ Folder créé:', folder.name)

    console.log('🎉 Toutes les données de test ont été créées avec succès!')
    
    return {
      posteComptable,
      natureDocument,
      dossier,
      folder
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createTestData()
  .then(() => {
    console.log('✅ Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
