export {}
console.log('🧪 Test des APIs après correction versioning...\n')

async function testAPI(url: string, name: string) {
  try {
    console.log(`📡 Test ${name}: ${url}`)
    
    const response = await fetch(`http://localhost:3000${url}`, {
      headers: {
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU1dmNobWwwMDAwOGtpamEzMGl6NXdhIiwiZW1haWwiOiJhZG1pbkBhY2dlLmdhIiwiaWF0IjoxNzU0ODk5OTg5LCJleHAiOjE3NTU1MDQ3ODl9.AZyYjy5bkkWIK-vVImpBG2f8PqdiwbYBfmIyVDtxtrQ'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ ${name}: OK (${response.status})`)
      return data
    } else {
      const error = await response.text()
      console.log(`   ❌ ${name}: Erreur ${response.status}`)
      console.log(`      ${error.substring(0, 100)}...`)
      return null
    }
  } catch (error) {
    console.log(`   ❌ ${name}: Erreur réseau`)
    console.log(`      ${error}`)
    return null
  }
}

async function main() {
  console.log('⏳ Attente du serveur...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Test des APIs principales
  console.log('\n🔍 Test des APIs principales:\n')

  const statsData = await testAPI('/api/dashboard/stats', 'Dashboard Stats')
  if (statsData) {
    console.log(`      - Documents: ${statsData.totalDocuments}`)
    console.log(`      - Espace: ${statsData.spaceUsed?.gb || 0} GB`)
    console.log(`      - Documents récents: ${statsData.recentDocuments?.length || 0}`)
  }

  console.log()
  const activityData = await testAPI('/api/dashboard/activity', 'Dashboard Activity')
  if (activityData) {
    console.log(`      - Activités: ${activityData.activities?.length || 0}`)
  }

  console.log()
  const foldersData = await testAPI('/api/sidebar/folders', 'Sidebar Folders')
  if (foldersData) {
    console.log(`      - Dossiers: ${foldersData.folders?.length || 0}`)
  }

  console.log()
  const documentsData = await testAPI('/api/documents', 'Documents List')
  if (documentsData) {
    console.log(`      - Documents: ${documentsData.documents?.length || 0}`)
    if (documentsData.documents?.length > 0) {
      const doc = documentsData.documents[0]
      console.log(`      - Premier doc: ${doc.title}`)
      console.log(`      - Version actuelle: ${doc.currentVersion?.versionNumber || 'N/A'}`)
      console.log(`      - Nombre de versions: ${doc._count?.versions || 0}`)
    }
  }

  console.log('\n✅ Test des APIs terminé!')
}

main().catch(console.error)
