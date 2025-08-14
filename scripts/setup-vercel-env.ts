#!/usr/bin/env node
import { execSync } from 'child_process'
import dotenv from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import readline from 'readline'

// Interface pour les questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Fonction pour poser une question
function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve)
  })
}

// Variables d'environnement à configurer sur Vercel
const ENV_VARS = [
  {
    name: 'DATABASE_URL',
    description: 'URL de connexion MySQL LWS',
    example: 'mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579',
    required: true
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'URL de votre application',
    example: 'https://acge-gabon.com',
    required: true
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'Secret pour JWT (générez avec: openssl rand -base64 32)',
    example: null,
    required: true,
    generate: () => {
      try {
        return execSync('openssl rand -base64 32').toString().trim()
      } catch {
        return 'changez-ce-secret-' + Math.random().toString(36).substring(2)
      }
    }
  },
  {
    name: 'NODE_ENV',
    description: 'Environnement',
    example: 'production',
    required: true,
    default: 'production'
  },
  {
    name: 'NEXT_PUBLIC_API_URL',
    description: 'URL publique de l\'API',
    example: 'https://acge-gabon.com',
    required: true
  },
  {
    name: 'STORAGE_TYPE',
    description: 'Type de stockage (local ou ftp)',
    example: 'ftp',
    required: true,
    default: 'ftp'
  },
  {
    name: 'FTP_HOST',
    description: 'Serveur FTP LWS',
    example: 'ftp.acge-gabon.com',
    required: true
  },
  {
    name: 'FTP_USER',
    description: 'Utilisateur FTP',
    example: 'acgeg2647579',
    required: true
  },
  {
    name: 'FTP_PASSWORD',
    description: 'Mot de passe FTP',
    example: null,
    required: true,
    sensitive: true
  },
  {
    name: 'FTP_PORT',
    description: 'Port FTP',
    example: '21',
    required: true,
    default: '21'
  },
  {
    name: 'FTP_SECURE',
    description: 'FTP sécurisé (true/false)',
    example: 'false',
    required: true,
    default: 'false'
  },
  {
    name: 'UPLOAD_DIR',
    description: 'Dossier racine pour les uploads',
    example: '/uploads',
    required: true,
    default: '/uploads'
  }
]

async function main() {
  console.log('🚀 Configuration des variables d\'environnement Vercel')
  console.log('====================================================\n')

  // Vérifier si Vercel CLI est installé
  try {
    execSync('vercel --version', { stdio: 'ignore' })
  } catch {
    console.error('❌ Vercel CLI n\'est pas installé.')
    console.log('\n📦 Installation:')
    console.log('   npm install -g vercel')
    console.log('\n📚 Documentation:')
    console.log('   https://vercel.com/docs/cli')
    process.exit(1)
  }

  // Charger le fichier .env.local si présent
  const envPath = join(process.cwd(), '.env.local')
  let envVars: Record<string, string> = {}
  
  if (existsSync(envPath)) {
    console.log('📄 Chargement de .env.local...\n')
    const envConfig = dotenv.parse(readFileSync(envPath, 'utf8'))
    envVars = envConfig
  }

  // Mode de configuration
  const mode = await question('Mode de configuration:\n1. Automatique (utiliser .env.local)\n2. Manuel (entrer chaque valeur)\n\nChoix (1 ou 2): ')
  
  console.log('\n')

  const commands: string[] = []
  const summary: Array<{ name: string, value: string, sensitive?: boolean }> = []

  for (const envVar of ENV_VARS) {
    let value: string = ''

    if (mode === '1' && envVars[envVar.name]) {
      // Mode automatique
      value = envVars[envVar.name]
      console.log(`✅ ${envVar.name}: Valeur trouvée dans .env.local`)
    } else {
      // Mode manuel
      console.log(`\n📝 ${envVar.name}`)
      console.log(`   ${envVar.description}`)
      
      if (envVar.example) {
        console.log(`   Exemple: ${envVar.example}`)
      }

      if (envVar.generate) {
        const generated = envVar.generate()
        const useGenerated = await question(`   Utiliser la valeur générée? (${generated.substring(0, 20)}...) [O/n]: `)
        
        if (!useGenerated || useGenerated.toLowerCase() === 'o') {
          value = generated
        } else {
          value = await question(`   Valeur: `)
        }
      } else if (envVar.default) {
        const input = await question(`   Valeur [${envVar.default}]: `)
        value = input || envVar.default
      } else {
        value = await question(`   Valeur${envVar.sensitive ? ' (sera masquée)' : ''}: `)
      }
    }

    if (!value && envVar.required) {
      console.error(`❌ ${envVar.name} est requis`)
      continue
    }

    // Créer la commande Vercel
    const cmd = `vercel env add ${envVar.name} production`
    commands.push(`echo "${value}" | ${cmd}`)
    
    summary.push({
      name: envVar.name,
      value: envVar.sensitive ? '***' : value,
      sensitive: envVar.sensitive
    })
  }

  // Afficher le résumé
  console.log('\n\n📊 RÉSUMÉ DES VARIABLES')
  console.log('=======================\n')
  
  summary.forEach(item => {
    const displayValue = item.sensitive ? '***' : 
                        item.value.length > 50 ? item.value.substring(0, 47) + '...' : 
                        item.value
    console.log(`${item.name}: ${displayValue}`)
  })

  // Demander confirmation
  const confirm = await question('\n\n🔄 Appliquer ces variables sur Vercel? [O/n]: ')
  
  if (!confirm || confirm.toLowerCase() === 'o') {
    console.log('\n🚀 Application des variables...\n')
    
    for (let i = 0; i < commands.length; i++) {
      const envVar = ENV_VARS[i]
      try {
        console.log(`⏳ Configuration de ${envVar.name}...`)
        execSync(commands[i], { stdio: 'pipe' })
        console.log(`✅ ${envVar.name} configuré`)
      } catch (error: any) {
        console.error(`❌ Erreur pour ${envVar.name}: ${error.message}`)
      }
    }

    console.log('\n✅ Configuration terminée!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Allez sur https://vercel.com/dashboard')
    console.log('2. Sélectionnez votre projet')
    console.log('3. Allez dans Settings > Environment Variables')
    console.log('4. Vérifiez que toutes les variables sont présentes')
    console.log('5. Redéployez votre application')
    
  } else {
    console.log('\n❌ Configuration annulée')
    
    // Générer un script bash
    const scriptPath = join(process.cwd(), 'setup-vercel-env.sh')
    const scriptContent = `#!/bin/bash
# Script généré pour configurer les variables Vercel
# Exécutez: bash setup-vercel-env.sh

${commands.join('\n')}

echo "✅ Configuration terminée"
`
    
    const { writeFileSync } = await import('fs')
    writeFileSync(scriptPath, scriptContent, { mode: 0o755 })
    
    console.log(`\n📄 Script sauvegardé: ${scriptPath}`)
    console.log('   Exécutez: bash setup-vercel-env.sh')
  }

  rl.close()
}

// Gestion des erreurs
process.on('unhandledRejection', (error: any) => {
  console.error('\n❌ Erreur:', error.message)
  rl.close()
  process.exit(1)
})

// Lancer le script
main().catch(error => {
  console.error('\n❌ Erreur:', error)
  rl.close()
  process.exit(1)
})
