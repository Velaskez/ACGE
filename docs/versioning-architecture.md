# 🔄 Architecture du Versioning des Documents

## 📋 Problème Actuel
Le modèle `Document` actuel stocke :
- Une seule version par document
- Les métadonnées et le fichier dans le même enregistrement
- Pas d'historique des versions précédentes

## 🎯 Solution Proposée : Modèle Document/Version

### Nouveau Modèle Conceptuel

```
Document (logique)
├── DocumentVersion 1 (fichier v1)
├── DocumentVersion 2 (fichier v2)  ← Version actuelle
└── DocumentVersion 3 (fichier v3)
```

### Structure Base de Données

1. **`Document`** = Conteneur logique
   - id, titre, description, dossier
   - Métadonnées partagées entre versions
   - Référence vers la version actuelle

2. **`DocumentVersion`** = Version de fichier
   - id, version number, fichier, taille, path
   - Qui a créé cette version et quand
   - Métadonnées spécifiques à cette version

## 📊 Avantages

✅ **Historique complet** des modifications
✅ **Restauration** de versions antérieures
✅ **Audit trail** - qui a modifié quoi et quand
✅ **Économie d'espace** - métadonnées partagées
✅ **Performance** - version actuelle facilement accessible
✅ **Sécurité** - pas de perte de données lors des mises à jour

## 🔧 Implémentation

1. **Migration** du schéma actuel
2. **APIs** pour gérer les versions
3. **Interface** pour l'historique des versions
4. **Fonctionnalité** de restauration
5. **Nettoyage** automatique des anciennes versions (optionnel)
