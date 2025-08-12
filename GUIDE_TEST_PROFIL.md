# 🧪 Guide de Test - Page Profil Utilisateur

## 📋 Checklist de Tests Manuels

### **✅ Test 1: Chargement de la Page**
1. Connectez-vous à l'application (admin@acge.ga / admin123)
2. Cliquez sur votre avatar dans le header → "Profil"
3. **Vérifiez que :**
   - ✅ La page se charge sans erreur
   - ✅ La carte "Informations du compte" affiche vos données
   - ✅ Le formulaire est pré-rempli avec nom/email
   - ✅ Le badge de rôle "Administrateur" est affiché

---

### **✅ Test 2: Modification du Nom**
1. Dans le formulaire, changez votre nom (ex: "Super Administrateur")
2. Cliquez "Enregistrer les modifications"
3. **Vérifiez que :**
   - ✅ Message de succès vert apparaît
   - ✅ La carte de gauche se met à jour
   - ✅ Le header affiche le nouveau nom
   - ✅ Les champs de mot de passe se vident

---

### **✅ Test 3: Modification de l'Email**
1. Changez votre email (ex: "super-admin@acge.ga")
2. Cliquez "Enregistrer les modifications"
3. **Vérifiez que :**
   - ✅ Message de succès vert apparaît
   - ✅ La carte de gauche se met à jour
   - ✅ Le nouvel email est affiché

---

### **✅ Test 4: Validation des Erreurs**
**Test 4.1: Champ vide**
1. Videz le champ "Nom"
2. Cliquez "Enregistrer"
3. **Vérifiez :** Message d'erreur "Le nom est requis"

**Test 4.2: Email invalide**
1. Mettez un email invalide (ex: "test")
2. Cliquez "Enregistrer"
3. **Vérifiez :** Message d'erreur "Format d'email invalide"

**Test 4.3: Email déjà utilisé**
1. Créez un autre utilisateur depuis /users avec un email différent
2. Essayez de changer votre email vers cet email existant
3. **Vérifiez :** Message d'erreur "Cet email est déjà utilisé"

---

### **✅ Test 5: Changement de Mot de Passe**
**Test 5.1: Changement réussi**
1. Remplissez "Mot de passe actuel" avec : `admin123`
2. Mettez un nouveau mot de passe : `nouveaumdp123`
3. Confirmez le nouveau mot de passe : `nouveaumdp123`
4. Cliquez "Enregistrer les modifications"
5. **Vérifiez que :**
   - ✅ Message de succès apparaît
   - ✅ Les champs de mot de passe se vident
6. **Test de connexion :**
   - Déconnectez-vous
   - Reconnectez-vous avec le nouveau mot de passe
   - ✅ La connexion doit fonctionner

**Test 5.2: Mot de passe actuel incorrect**
1. Mettez un mauvais mot de passe actuel
2. Nouveau mot de passe : `test123`
3. Confirmez : `test123`
4. Cliquez "Enregistrer"
5. **Vérifiez :** Message d'erreur "Mot de passe actuel incorrect"

**Test 5.3: Confirmation différente**
1. Mot de passe actuel correct
2. Nouveau : `test123`
3. Confirmation : `test456`
4. Cliquez "Enregistrer"
5. **Vérifiez :** Message d'erreur "La confirmation du mot de passe ne correspond pas"

**Test 5.4: Mot de passe trop court**
1. Mot de passe actuel correct
2. Nouveau : `123` (moins de 6 caractères)
3. Confirmation : `123`
4. Cliquez "Enregistrer"
5. **Vérifiez :** Message d'erreur "Le nouveau mot de passe doit contenir au moins 6 caractères"

---

### **✅ Test 6: Interface Utilisateur**
**Test 6.1: Boutons de visibilité mot de passe**
1. Cliquez sur l'icône 👁️ à côté de chaque champ mot de passe
2. **Vérifiez :** Le mot de passe devient visible/masqué

**Test 6.2: États de chargement**
1. Pendant une modification, observez le bouton
2. **Vérifiez :** 
   - ✅ Bouton devient "Enregistrement..." avec spinner
   - ✅ Bouton désactivé pendant la sauvegarde

**Test 6.3: Bouton Annuler**
1. Modifiez des champs
2. Cliquez "Annuler"
3. **Vérifiez :** Les champs reviennent aux valeurs originales

---

## 🎯 Résultats Attendus

### **✅ Fonctionnalités qui DOIVENT marcher :**
- [x] Chargement des données utilisateur
- [x] Modification du nom
- [x] Modification de l'email
- [x] Changement de mot de passe sécurisé
- [x] Validation côté client
- [x] Validation côté serveur
- [x] Messages d'erreur contextuels
- [x] Messages de succès
- [x] Mise à jour du contexte utilisateur
- [x] Interface responsive

### **❌ Cas d'erreur à tester :**
- [ ] Champs vides
- [ ] Formats invalides
- [ ] Mots de passe incorrects
- [ ] Emails déjà utilisés
- [ ] Mots de passe trop courts
- [ ] Confirmations non correspondantes

---

## 🔧 Debugging

### **Si quelque chose ne fonctionne pas :**
1. **Ouvrez la console du navigateur** (F12)
2. **Regardez les logs :** Des messages détaillés sont affichés
3. **Vérifiez l'onglet Network :** Voir les requêtes API
4. **Regardez le terminal du serveur :** Erreurs backend

### **Messages de log à surveiller :**
```javascript
// Dans la console du navigateur :
"Données envoyées: { name: '...', email: '...' }"
"Réponse API: { status: 200, data: {...} }"

// Dans le terminal du serveur :
"Profil mis à jour pour l'utilisateur xyz à timestamp"
```

---

## 🎉 Validation Finale

**✅ Le système de profil est validé si :**
- Toutes les modifications se sauvegardent correctement
- Les erreurs sont affichées clairement
- La sécurité des mots de passe fonctionne
- L'interface est fluide et responsive
- Le contexte utilisateur se met à jour

**🔄 N'oubliez pas de remettre votre mot de passe original après les tests !**
