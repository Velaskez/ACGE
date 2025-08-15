import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Initializing test data...')

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@acge.com' },
      update: {},
      create: {
        email: 'admin@acge.com',
        name: 'Admin ACGE',
        password: adminPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created:', admin.email)

    // Create test manager
    const managerPassword = await bcrypt.hash('manager123', 12)
    const manager = await prisma.user.upsert({
      where: { email: 'manager@acge.com' },
      update: {},
      create: {
        email: 'manager@acge.com',
        name: 'Manager ACGE',
        password: managerPassword,
        role: 'MANAGER'
      }
    })
    console.log('✅ Manager user created:', manager.email)

    // Create test user
    const userPassword = await bcrypt.hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'user@acge.com' },
      update: {},
      create: {
        email: 'user@acge.com',
        name: 'User ACGE',
        password: userPassword,
        role: 'USER'
      }
    })
    console.log('✅ Regular user created:', user.email)

    // Create some test folders
    const folder1 = await prisma.folder.create({
      data: {
        name: 'Documents Administratifs',
        description: 'Documents administratifs de l\'ACGE',
        authorId: admin.id
      }
    })
    console.log('✅ Folder created:', folder1.name)

    const folder2 = await prisma.folder.create({
      data: {
        name: 'Rapports',
        description: 'Rapports mensuels et annuels',
        authorId: admin.id
      }
    })
    console.log('✅ Folder created:', folder2.name)

    // Create some test notifications
    await prisma.notification.create({
      data: {
        type: 'info',
        title: 'Bienvenue sur ACGE',
        message: 'Votre compte a été créé avec succès',
        userId: admin.id,
        isRead: false
      }
    })

    await prisma.notification.create({
      data: {
        type: 'alert',
        title: 'Nouveau document',
        message: 'Un nouveau document a été ajouté dans vos dossiers',
        userId: admin.id,
        isRead: false
      }
    })

    await prisma.notification.create({
      data: {
        type: 'success',
        title: 'Upload réussi',
        message: 'Votre document a été uploadé avec succès',
        userId: admin.id,
        isRead: true
      }
    })
    console.log('✅ Test notifications created')

    // Create test documents
    const doc1 = await prisma.document.create({
      data: {
        title: 'Rapport Annuel 2024',
        description: 'Rapport annuel des activités de l\'ACGE',
        authorId: admin.id,
        folderId: folder2.id,
        isPublic: false
      }
    })

    // Create a version for the document
    await prisma.documentVersion.create({
      data: {
        documentId: doc1.id,
        versionNumber: 1,
        fileName: 'rapport-annuel-2024.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        filePath: '/uploads/rapport-annuel-2024.pdf',
        changeLog: 'Version initiale',
        createdById: admin.id
      }
    })
    console.log('✅ Test document created:', doc1.title)

    console.log('\n📊 Database Summary:')
    const userCount = await prisma.user.count()
    const folderCount = await prisma.folder.count()
    const documentCount = await prisma.document.count()
    const notificationCount = await prisma.notification.count()

    console.log(`  - Users: ${userCount}`)
    console.log(`  - Folders: ${folderCount}`)
    console.log(`  - Documents: ${documentCount}`)
    console.log(`  - Notifications: ${notificationCount}`)

    console.log('\n✅ Test data initialized successfully!')
    console.log('\n🔑 Test Credentials:')
    console.log('  Admin: admin@acge.com / admin123')
    console.log('  Manager: manager@acge.com / manager123')
    console.log('  User: user@acge.com / user123')

  } catch (error) {
    console.error('❌ Error initializing test data:', error)
    throw error
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