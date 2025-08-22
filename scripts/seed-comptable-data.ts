import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Ajout des données comptables de test...\n')

  try {
    // Ajouter des postes comptables
    console.log('📊 Ajout des postes comptables...')
    const postesComptables = [
      { numero: '123', intitule: 'Gislain' },
      { numero: '124', intitule: 'Fournitures de bureau' },
      { numero: '125', intitule: 'Services publics' },
      { numero: '126', intitule: 'Maintenance informatique' },
      { numero: '127', intitule: 'Formation du personnel' },
      { numero: '128', intitule: 'Déplacements et missions' },
      { numero: '129', intitule: 'Équipements informatiques' },
      { numero: '130', intitule: 'Services de nettoyage' },
    ]

    for (const poste of postesComptables) {
      await prisma.posteComptable.upsert({
        where: { numero: poste.numero },
        update: {},
        create: {
          numero: poste.numero,
          intitule: poste.intitule,
          isActive: true
        }
      })
      console.log(`✅ Poste comptable ajouté: ${poste.numero} - ${poste.intitule}`)
    }

    // Ajouter des natures de documents
    console.log('\n📄 Ajout des natures de documents...')
    const naturesDocuments = [
      { numero: '01', nom: 'Ordre recettes', description: 'Documents relatifs aux recettes' },
      { numero: '02', nom: 'Ordre paiement', description: 'Documents relatifs aux paiements' },
      { numero: '03', nom: 'Courrier', description: 'Correspondance administrative' },
      { numero: '04', nom: 'Facture', description: 'Factures fournisseurs' },
      { numero: '05', nom: 'Devis', description: 'Devis et estimations' },
      { numero: '06', nom: 'Bordereau', description: 'Bordereaux de versement' },
      { numero: '07', nom: 'Attestation', description: 'Attestations diverses' },
      { numero: '08', nom: 'Rapport', description: 'Rapports et études' },
    ]

    for (const nature of naturesDocuments) {
      await prisma.natureDocument.upsert({
        where: { numero: nature.numero },
        update: {},
        create: {
          numero: nature.numero,
          nom: nature.nom,
          description: nature.description,
          isActive: true
        }
      })
      console.log(`✅ Nature document ajoutée: ${nature.numero} - ${nature.nom}`)
    }

    console.log('\n🎉 Données comptables ajoutées avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
