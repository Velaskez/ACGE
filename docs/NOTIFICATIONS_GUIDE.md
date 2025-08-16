# 🔔 Guide du Système de Notifications - ACGE

## Vue d'ensemble

Le système de notifications d'ACGE permet aux utilisateurs de rester informés des activités importantes sur la plateforme. Les notifications sont affichées en temps réel dans l'interface utilisateur et peuvent être consultées depuis le dropdown dans l'en-tête ou la page dédiée.

## 📋 Types de Notifications

### 1. **WELCOME** - Notification de bienvenue
- **Déclencheur** : Création d'un nouveau compte utilisateur
- **Contenu** : Message de bienvenue personnalisé
- **Icône** : 👤 (bleu)
- **Exemple** : "Bonjour [Nom], votre compte a été créé avec succès."

### 2. **DOCUMENT_SHARED** - Document partagé
- **Déclencheur** : Un document est partagé avec l'utilisateur
- **Contenu** : Informations sur le document et les permissions
- **Icône** : 📤 (vert)
- **Exemple** : "Jean Dupont a partagé le document 'Rapport financier 2024' avec vous (lecture)."

### 3. **VERSION_ADDED** - Nouvelle version de document
- **Déclencheur** : Une nouvelle version d'un document est ajoutée
- **Contenu** : Détails de la nouvelle version
- **Icône** : 📄 (violet)
- **Exemple** : "Marie Martin a ajouté une nouvelle version (v2) au document 'Plan stratégique'."

### 4. **VERSION_RESTORED** - Version restaurée
- **Déclencheur** : Une version précédente est restaurée
- **Contenu** : Informations sur la version restaurée
- **Icône** : 🔄 (orange)
- **Exemple** : "L'administrateur a restauré la version 1.2 du document 'Procédures internes'."

### 5. **DOCUMENT_DELETED** - Document supprimé
- **Déclencheur** : Un document partagé est supprimé
- **Contenu** : Information sur la suppression
- **Icône** : 🗑️ (rouge)
- **Exemple** : "L'administrateur a supprimé le document 'Ancien rapport'."

### 6. **FOLDER_SHARED** - Dossier partagé
- **Déclencheur** : Un dossier est partagé avec l'utilisateur
- **Contenu** : Détails du dossier et permissions
- **Icône** : 📁 (indigo)
- **Exemple** : "Sophie Bernard a partagé le dossier 'Projets 2025' avec vous (écriture)."

### 7. **COMMENT_ADDED** - Nouveau commentaire
- **Déclencheur** : Un commentaire est ajouté sur un document
- **Contenu** : Information sur le commentaire
- **Icône** : 💬 (jaune)
- **Exemple** : "Pierre Durand a ajouté un commentaire sur le document 'Budget 2025'."

### 8. **SYSTEM** - Notification système
- **Déclencheur** : Événements système (maintenance, mises à jour, etc.)
- **Contenu** : Informations système importantes
- **Icône** : 🔧 (gris)
- **Exemple** : "Une maintenance est prévue le 15 janvier 2025 de 22h à 02h."

## 🎨 Interface Utilisateur

### Dropdown de notifications (en-tête)
- **Accès** : Icône de cloche dans l'en-tête
- **Affichage** : 
  - Badge rouge avec le nombre de notifications non lues
  - Liste des 10 dernières notifications
  - Bouton "Tout marquer comme lu"
  - Lien vers la page complète

### Page des notifications
- **Accès** : `/notifications`
- **Fonctionnalités** :
  - Filtrage (toutes / non lues)
  - Pagination
  - Actions en lot
  - Recherche (à venir)

## 🔧 Intégration Technique

### Service de notifications
```typescript
import { NotificationService } from '@/lib/notification-service'

// Créer une notification simple
await NotificationService.create({
  type: 'SYSTEM',
  title: 'Titre de la notification',
  message: 'Message de la notification',
  userId: 'user-id',
  data: { /* données supplémentaires */ }
})

// Notifier un partage de document
await NotificationService.notifyDocumentShared(
  documentId,
  documentTitle,
  sharedByUserId,
  sharedWithUserId,
  permission
)
```

### API Endpoints
- `GET /api/notifications` - Récupérer les notifications
- `PUT /api/notifications/[id]/read` - Marquer comme lu
- `PUT /api/notifications/mark-all-read` - Tout marquer comme lu
- `POST /api/notifications` - Créer une notification (admin)

### Base de données
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  data JSONB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE
);
```

## 📱 Fonctionnalités

### Polling automatique
- Vérification des nouvelles notifications toutes les 30 secondes
- Mise à jour du compteur en temps réel

### Marquage comme lu
- Clic sur une notification pour la marquer comme lue
- Bouton "Tout marquer comme lu" pour traiter toutes les notifications

### Navigation contextuelle
- Clic sur une notification pour naviguer vers le document concerné
- Support des liens directs vers les documents

### Gestion des erreurs
- Gestion gracieuse des erreurs de chargement
- Messages d'erreur informatifs
- Fallback en cas de problème de connexion

## 🧪 Tests et Développement

### Script de test
```bash
# Créer des notifications de test
npx tsx scripts/create-test-notifications.ts
```

### Page de test
- **URL** : `/test-notifications.html`
- **Fonctionnalités** :
  - Affichage des notifications en temps réel
  - Actions de test (marquer comme lu, créer notification)
  - Prévisualisation des différents types

### Débogage
```javascript
// Vérifier les notifications dans la console
fetch('/api/notifications').then(r => r.json()).then(console.log)
```

## 🚀 Évolutions Futures

### Fonctionnalités prévues
- [ ] Notifications par email
- [ ] Notifications push (navigateur)
- [ ] Préférences de notification par utilisateur
- [ ] Notifications groupées
- [ ] Historique des notifications
- [ ] Export des notifications

### Améliorations techniques
- [ ] WebSockets pour les notifications en temps réel
- [ ] Cache Redis pour les performances
- [ ] Système de templates pour les messages
- [ ] Support multilingue
- [ ] Notifications programmées

## 📊 Statistiques et Monitoring

### Métriques importantes
- Nombre de notifications créées par jour
- Taux de lecture des notifications
- Types de notifications les plus populaires
- Temps de réponse des utilisateurs

### Logs
```javascript
// Exemple de log de notification
console.log(`Notification créée: ${type} pour utilisateur ${userId}`)
```

## 🔒 Sécurité

### Contrôles d'accès
- Seuls les admins peuvent créer des notifications système
- Les utilisateurs ne voient que leurs propres notifications
- Validation des permissions pour les actions sensibles

### Données personnelles
- Les notifications contiennent des données personnelles
- Respect du RGPD pour la conservation des données
- Possibilité de suppression des notifications anciennes

## 📞 Support

Pour toute question sur le système de notifications :
1. Consulter ce guide
2. Utiliser la page de test `/test-notifications.html`
3. Vérifier les logs de l'application
4. Contacter l'équipe de développement

---

*Dernière mise à jour : Janvier 2025*
