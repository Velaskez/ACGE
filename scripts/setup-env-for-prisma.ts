import fs from 'fs'
import path from 'path'

console.log('🔧 Configuration de l\'environnement pour Prisma CLI...')

const envContent = `# Base de données MySQL sur LWS
DATABASE_URL="mysql://acge_user:acge_password@localhost:3306/acge_db"

# NextAuth pour développement local
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NEXTAUTH_URL="http://localhost:3000"

# URL de base pour les API locales
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Configuration upload locale
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"
`

const envPath = path.join(process.cwd(), '.env')

try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env créé pour Prisma CLI')
  console.log('📁 Chemin :', envPath)
  console.log('🔗 DATABASE_URL : mysql://acge_user:acge_password@localhost:3306/acge_db')
  
  console.log('\n📋 Instructions :')
  console.log('1. Modifiez le fichier .env avec vos vraies informations MySQL LWS')
  console.log('2. Remplacez acge_user, acge_password, et acge_db par vos vraies valeurs')
  console.log('3. Assurez-vous que MySQL est accessible depuis votre machine locale')
  console.log('4. Exécutez ensuite : npx prisma db push')
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env :', error)
}
