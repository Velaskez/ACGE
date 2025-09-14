# Soumission Manuelle des Dossiers - Résumé des Modifications

## Problème Identifié
Lors de la création d'un dossier par la secrétaire, celui-ci était automatiquement soumis au Contrôleur Budgétaire, ce qui ne permettait pas à la secrétaire de contrôler le moment de la soumission.

## Solution Implémentée

### 1. Suppression de la Soumission Automatique
**Fichier modifié :** `src/app/(protected)/folders/page.tsx`
- Suppression de la logique de soumission automatique dans `handleCreateFolder` (lignes 521-546)
- Les dossiers sont maintenant créés sans être automatiquement soumis

### 2. Ajout du Statut BROUILLON
**Fichiers modifiés :**
- `src/app/api/folders/route.ts` : Ajout du statut 'BROUILLON' par défaut lors de la création
- `src/lib/folder-status.ts` : Ajout de la gestion du statut BROUILLON
- `src/app/(protected)/folders/page.tsx` : Mise à jour des types pour inclure BROUILLON

### 3. Bouton de Soumission Manuelle
**Fichiers modifiés :**
- `src/app/(protected)/folders/page.tsx` : Ajout du bouton "Soumettre au CB" dans le menu déroulant
- `src/components/folders/folder-grid-item.tsx` : Ajout du bouton dans la vue grille
- Modal de confirmation de soumission avec gestion des états de chargement

### 4. Fonctionnalités Ajoutées
- **Fonction `handleSubmitFolder`** : Gère la soumission manuelle des dossiers
- **Modal de confirmation** : Demande confirmation avant soumission
- **Gestion des états** : Loading states et gestion d'erreurs
- **Conditions d'affichage** : Le bouton n'apparaît que pour les dossiers en BROUILLON ou EN_ATTENTE

## Workflow Modifié

### Avant
1. Secrétaire crée un dossier
2. Dossier automatiquement soumis au CB
3. Dossier passe en statut EN_ATTENTE

### Après
1. Secrétaire crée un dossier
2. Dossier créé en statut BROUILLON
3. Secrétaire peut modifier le dossier si nécessaire
4. Secrétaire clique sur "Soumettre au CB" quand prêt
5. Confirmation de soumission
6. Dossier passe en statut EN_ATTENTE

## Types de Statuts
- **BROUILLON** : Dossier créé mais pas encore soumis
- **EN_ATTENTE** : Dossier soumis, en attente de validation CB
- **VALIDÉ_CB** : Dossier validé par le CB
- **REJETÉ_CB** : Dossier rejeté par le CB
- **VALIDÉ_ORDONNATEUR** : Dossier validé par l'ordonnateur
- **PAYÉ** : Dossier payé
- **TERMINÉ** : Dossier entièrement traité

## Interface Utilisateur

### Bouton de Soumission
- **Emplacement** : Menu déroulant des actions (liste et grille)
- **Icône** : Send (📤)
- **Couleur** : Bleu
- **Condition** : Visible uniquement pour les dossiers en BROUILLON ou EN_ATTENTE

### Modal de Confirmation
- **Titre** : "Soumettre le dossier"
- **Description** : Explication des conséquences de la soumission
- **Actions** : Annuler / Soumettre
- **État de chargement** : "Soumission..." pendant le traitement

## Tests
Un script de test a été créé (`test-manual-submission-workflow.js`) pour vérifier :
1. Création d'un dossier en statut BROUILLON
2. Absence de soumission automatique
3. Soumission manuelle fonctionnelle
4. Passage en statut EN_ATTENTE après soumission

## Avantages
- **Contrôle total** : La secrétaire décide quand soumettre
- **Flexibilité** : Possibilité de modifier le dossier avant soumission
- **Transparence** : Statut clair du dossier à chaque étape
- **Sécurité** : Confirmation avant soumission
- **UX améliorée** : Workflow plus intuitif et contrôlé
