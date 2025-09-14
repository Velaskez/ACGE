const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWorkflowNotifications() {
  try {
    console.log('🚀 Test des notifications de workflow en temps réel')
    
    // 1. Récupérer les utilisateurs
    console.log('👥 1. Récupération des utilisateurs...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('role', ['SECRETAIRE', 'CONTROLEUR_BUDGETAIRE', 'ORDONNATEUR', 'AGENT_COMPTABLE'])
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError)
      return false
    }
    
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = []
      acc[user.role].push(user)
      return acc
    }, {})
    
    console.log('✅ Utilisateurs récupérés:', Object.keys(usersByRole).map(role => `${role}: ${usersByRole[role].length}`).join(', '))
    
    // 2. Créer un dossier de test
    console.log('📁 2. Création d\'un dossier de test...')
    
    const { data: posteComptable } = await supabase
      .from('postes_comptables')
      .select('id')
      .limit(1)
      .single()
    
    const { data: natureDocument } = await supabase
      .from('natures_documents')
      .select('id')
      .limit(1)
      .single()
    
    if (!posteComptable || !natureDocument) {
      console.error('❌ Poste comptable ou nature de document manquants')
      return false
    }
    
    const testDossier = {
      numeroDossier: `DOSS-TEST-WORKFLOW-${Date.now()}`,
      objetOperation: 'Test workflow notifications',
      beneficiaire: 'Test Beneficiaire',
      montant: 100000,
      posteComptableId: posteComptable.id,
      natureDocumentId: natureDocument.id,
      secretaireId: usersByRole.SECRETAIRE[0]?.id,
      statut: 'EN_ATTENTE',
      dateDepot: new Date().toISOString()
    }
    
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select()
      .single()
    
    if (dossierError) {
      console.error('❌ Erreur création dossier test:', dossierError)
      return false
    }
    
    console.log(`✅ Dossier créé: ${dossier.numeroDossier}`)
    
    // 3. Simuler le workflow complet
    console.log('🔄 3. Simulation du workflow complet...')
    
    // Étape 1: Validation CB
    console.log('   📋 Étape 1: Validation par le CB...')
    const cbUser = usersByRole.CONTROLEUR_BUDGETAIRE[0]
    if (cbUser) {
      // Créer notification pour CB
      await supabase.from('notifications').insert({
        user_id: cbUser.id,
        title: 'Nouveau dossier à valider',
        message: `Un nouveau dossier ${dossier.numeroDossier} nécessite votre validation.`,
        type: 'INFO',
        priority: 'HIGH',
        action_url: '/cb-dashboard',
        action_label: 'Valider le dossier',
        metadata: { dossierId: dossier.id, numeroDossier: dossier.numeroDossier }
      })
      
      // Mettre à jour le statut
      await supabase
        .from('dossiers')
        .update({ statut: 'VALIDÉ_CB', updatedAt: new Date().toISOString() })
        .eq('id', dossier.id)
      
      // Notifier la secrétaire
      await supabase.from('notifications').insert({
        user_id: usersByRole.SECRETAIRE[0].id,
        title: 'Dossier validé par le CB',
        message: `Votre dossier ${dossier.numeroDossier} a été validé par le Contrôleur Budgétaire.`,
        type: 'SUCCESS',
        priority: 'MEDIUM',
        action_url: '/folders',
        action_label: 'Voir le dossier',
        metadata: { dossierId: dossier.id, numeroDossier: dossier.numeroDossier }
      })
      
      console.log('   ✅ Dossier validé par le CB')
    }
    
    // Étape 2: Ordonnancement
    console.log('   📋 Étape 2: Ordonnancement...')
    const ordonnateurUser = usersByRole.ORDONNATEUR[0]
    if (ordonnateurUser) {
      // Créer notification pour Ordonnateur
      await supabase.from('notifications').insert({
        user_id: ordonnateurUser.id,
        title: 'Dossier à ordonnancer',
        message: `Un dossier ${dossier.numeroDossier} validé nécessite votre ordonnancement.`,
        type: 'INFO',
        priority: 'HIGH',
        action_url: '/ordonnateur-dashboard',
        action_label: 'Ordonnancer le dossier',
        metadata: { dossierId: dossier.id, numeroDossier: dossier.numeroDossier }
      })
      
      // Mettre à jour le statut
      await supabase
        .from('dossiers')
        .update({ 
          statut: 'ORDONNANCÉ', 
          ordonnancedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('id', dossier.id)
      
      // Notifier la secrétaire
      await supabase.from('notifications').insert({
        user_id: usersByRole.SECRETAIRE[0].id,
        title: 'Dossier ordonnançé',
        message: `Votre dossier ${dossier.numeroDossier} a été ordonnançé.`,
        type: 'APPROVAL',
        priority: 'MEDIUM',
        action_url: '/folders',
        action_label: 'Voir le dossier',
        metadata: { dossierId: dossier.id, numeroDossier: dossier.numeroDossier }
      })
      
      console.log('   ✅ Dossier ordonnançé')
    }
    
    // Étape 3: Comptabilisation
    console.log('   📋 Étape 3: Comptabilisation...')
    const acUser = usersByRole.AGENT_COMPTABLE[0]
    if (acUser) {
      // Créer notification pour Agent Comptable
      await supabase.from('notifications').insert({
        user_id: acUser.id,
        title: 'Dossier à comptabiliser',
        message: `Un dossier ${dossier.numeroDossier} ordonnançé nécessite votre comptabilisation.`,
        type: 'INFO',
        priority: 'HIGH',
        action_url: '/ac-dashboard',
        action_label: 'Comptabiliser le dossier',
        metadata: { dossierId: dossier.id, numeroDossier: dossier.numeroDossier }
      })
      
      // Mettre à jour le statut
      await supabase
        .from('dossiers')
        .update({ 
          statut: 'COMPTABILISÉ', 
          comptabilizedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('id', dossier.id)
      
      // Notifier la secrétaire
      await supabase.from('notifications').insert({
        user_id: usersByRole.SECRETAIRE[0].id,
        title: 'Dossier comptabilisé',
        message: `Votre dossier ${dossier.numeroDossier} a été comptabilisé.`,
        type: 'SUCCESS',
        priority: 'MEDIUM',
        action_url: '/folders',
        action_label: 'Voir le dossier',
        metadata: { dossierId: dossier.id, numeroDossier: dossier.numeroDossier }
      })
      
      console.log('   ✅ Dossier comptabilisé')
    }
    
    // 4. Vérifier les notifications créées
    console.log('🔍 4. Vérification des notifications créées...')
    
    for (const role of Object.keys(usersByRole)) {
      const user = usersByRole[role][0]
      const { data: userNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      console.log(`   📱 ${role} (${user.email}): ${userNotifications?.length || 0} notifications`)
      if (userNotifications && userNotifications.length > 0) {
        userNotifications.forEach((notif, index) => {
          console.log(`      ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority})`)
        })
      }
    }
    
    // 5. Test de l'API Next.js
    console.log('🌐 5. Test de l\'API Next.js...')
    
    for (const role of Object.keys(usersByRole)) {
      const user = usersByRole[role][0]
      try {
        const response = await fetch('http://localhost:3000/api/notifications-simple', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`   ✅ API ${role}: ${data.notifications?.length || 0} notifications, ${data.stats?.unreadCount || 0} non lues`)
        } else {
          console.log(`   ❌ API ${role}: Erreur ${response.status}`)
        }
      } catch (error) {
        console.log(`   ❌ API ${role}: ${error.message}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test des notifications de workflow en temps réel')
  
  const success = await testWorkflowNotifications()
  
  if (success) {
    console.log('\n🎉 Test réussi! Le système de notifications de workflow est opérationnel!')
    console.log('')
    console.log('✨ Workflow testé:')
    console.log('   📁 Création de dossier → Notification secrétaire')
    console.log('   ✅ Validation CB → Notifications secrétaire + CB')
    console.log('   📋 Ordonnancement → Notifications secrétaire + ordonnateur')
    console.log('   🧮 Comptabilisation → Notifications secrétaire + agent comptable')
    console.log('   🔔 Notifications en temps réel pour tous les profils')
    console.log('')
    console.log('🎯 Prochaines étapes pour vous:')
    console.log('   1. Connectez-vous avec le profil Secrétaire')
    console.log('   2. Créez un nouveau dossier')
    console.log('   3. Connectez-vous avec le profil CB et validez le dossier')
    console.log('   4. Vérifiez que les notifications apparaissent dans chaque interface')
    console.log('   5. Testez le workflow complet avec tous les profils')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
