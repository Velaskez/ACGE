// Guide pratique : Accéder à PostgreSQL dans Docker

import { execSync } from 'child_process'

async function guideAccessPostgreSQLDocker() {
  console.log('🐳 GUIDE COMPLET: Accéder à PostgreSQL dans Docker\n')
  
  console.log('🎯 VOTRE CONFIGURATION ACTUELLE:\n')
  console.log('📦 Container PostgreSQL: acge-postgres')
  console.log('🗄️ Base de données: acge_database')
  console.log('👤 Utilisateur: acge_user')
  console.log('🔑 Mot de passe: acge_password_dev')
  console.log('🔌 Port: 5432 (dans Docker) → 5432 (sur votre PC)')
  console.log('')
  
  console.log('🌟 MÉTHODE 1: pgAdmin (Interface Web - LE PLUS SIMPLE)\n')
  
  console.log('🔵 Accès pgAdmin:')
  console.log('   URL: http://localhost:8080')
  console.log('   Email: admin@acge.local')
  console.log('   Mot de passe: admin123')
  console.log('')
  
  console.log('🔵 Connexion à votre base de données dans pgAdmin:')
  console.log('   1. Clic droit sur "Servers" → "Create" → "Server"')
  console.log('   2. Onglet "General":')
  console.log('      Name: ACGE Database')
  console.log('   3. Onglet "Connection":')
  console.log('      Host: acge-postgres')
  console.log('      Port: 5432')
  console.log('      Database: acge_database')
  console.log('      Username: acge_user')
  console.log('      Password: acge_password_dev')
  console.log('   4. Cliquer "Save"')
  console.log('')
  
  console.log('✨ Après ça, vous pourrez:')
  console.log('   - Voir toutes vos tables')
  console.log('   - Exécuter des requêtes SQL')
  console.log('   - Visualiser vos données')
  console.log('   - Faire des backups')
  console.log('   - Importer/Exporter des données')
  console.log('')
  
  console.log('🌟 MÉTHODE 2: Ligne de Commande (Pour les Développeurs)\n')
  
  console.log('🔵 Accès direct au container:')
  console.log('   docker exec -it acge-postgres bash')
  console.log('   → Vous êtes maintenant "dans" le container PostgreSQL')
  console.log('')
  
  console.log('🔵 Connexion à la base de données:')
  console.log('   psql -U acge_user -d acge_database')
  console.log('   → Mot de passe: acge_password_dev')
  console.log('')
  
  console.log('🔵 Commandes SQL utiles une fois connecté:')
  console.log('   \\l              → Lister toutes les bases de données')
  console.log('   \\dt             → Lister toutes les tables')
  console.log('   \\d table_name   → Décrire une table')
  console.log('   SELECT * FROM users LIMIT 5;  → Voir les utilisateurs')
  console.log('   \\q              → Quitter')
  console.log('')
  
  console.log('🌟 MÉTHODE 3: Depuis Votre Application (Next.js)\n')
  
  console.log('🔵 Votre application accède déjà à PostgreSQL Docker via:')
  console.log('   DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"')
  console.log('')
  
  console.log('🔵 Commandes Prisma utiles:')
  console.log('   npx prisma studio     → Interface graphique des données')
  console.log('   npx prisma db pull     → Synchroniser le schéma')
  console.log('   npx prisma generate    → Régénérer le client')
  console.log('')
  
  console.log('🌟 MÉTHODE 4: Outils Externes (Client SQL)\n')
  
  console.log('🔵 Connexion depuis n\'importe quel client SQL:')
  console.log('   Host: localhost')
  console.log('   Port: 5432')
  console.log('   Database: acge_database')
  console.log('   Username: acge_user')
  console.log('   Password: acge_password_dev')
  console.log('')
  
  console.log('🔵 Clients recommandés:')
  console.log('   - DBeaver (gratuit)')
  console.log('   - TablePlus')
  console.log('   - DataGrip (JetBrains)')
  console.log('   - VS Code avec extension PostgreSQL')
  console.log('')
  
  console.log('🛠️ COMMANDES DE GESTION DOCKER:\n')
  
  console.log('🔵 Voir l\'état de vos containers:')
  console.log('   docker ps                    → Containers actifs')
  console.log('   docker ps -a                 → Tous les containers')
  console.log('')
  
  console.log('🔵 Gérer PostgreSQL Docker:')
  console.log('   docker-compose up -d         → Démarrer PostgreSQL+pgAdmin')
  console.log('   docker-compose down          → Arrêter tout')
  console.log('   docker-compose restart       → Redémarrer')
  console.log('')
  
  console.log('🔵 Logs et debugging:')
  console.log('   docker logs acge-postgres    → Voir les logs PostgreSQL')
  console.log('   docker logs acge-pgadmin     → Voir les logs pgAdmin')
  console.log('')
  
  console.log('💾 SAUVEGARDE ET RESTAURATION:\n')
  
  console.log('🔵 Créer une sauvegarde:')
  console.log('   docker exec acge-postgres pg_dump -U acge_user acge_database > backup.sql')
  console.log('')
  
  console.log('🔵 Restaurer une sauvegarde:')
  console.log('   docker exec -i acge-postgres psql -U acge_user acge_database < backup.sql')
  console.log('')
  
  console.log('🎯 POURQUOI DOCKER EST PARFAIT POUR VOUS:\n')
  
  console.log('✅ Isolation complète (pas de conflit avec d\'autres installations)')
  console.log('✅ Configuration prédéfinie (pas de setup compliqué)')
  console.log('✅ Portable (même config sur n\'importe quel PC)')
  console.log('✅ Facile à supprimer/recréer si problème')
  console.log('✅ pgAdmin inclus (interface web moderne)')
  console.log('✅ Même performance qu\'une installation locale')
  console.log('✅ Backups automatiques possibles')
  console.log('')
  
  console.log('🚀 ÉTAPES POUR COMMENCER MAINTENANT:\n')
  
  console.log('1. 🐳 Vérifier que Docker tourne:')
  console.log('   docker ps')
  console.log('')
  
  console.log('2. 📱 Ouvrir pgAdmin:')
  console.log('   http://localhost:8080')
  console.log('   → admin@acge.local / admin123')
  console.log('')
  
  console.log('3. 🔗 Connecter à votre base:')
  console.log('   → Host: acge-postgres')
  console.log('   → Database: acge_database')
  console.log('   → User: acge_user')
  console.log('   → Password: acge_password_dev')
  console.log('')
  
  console.log('4. 🎉 Profiter de vos données!')
  console.log('')
  
  console.log('💡 BONUS: Si vous préférez la ligne de commande, je peux vous créer')
  console.log('    des scripts personnalisés pour les tâches courantes!')
}

guideAccessPostgreSQLDocker().catch(console.error)
