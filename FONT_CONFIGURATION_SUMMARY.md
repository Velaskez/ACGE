# Configuration des polices ACGE - Résumé

## ✅ Configuration terminée

### 1. **Structure des polices**
```
public/fonts/
├── outfit/
│   ├── OutfitRegular.ttf
│   ├── OutfitBold.ttf
│   └── ... (autres poids)
└── freemono/
    ├── FreeMono.ttf
    ├── FreeMonoBold.ttf
    └── ... (autres variantes)
```

### 2. **Configuration CSS**
- **Fichier** : `src/app/globals.css`
- **Polices chargées** : Outfit (normal, bold) et FreeMono (normal, bold)
- **Format** : TTF avec `font-display: swap`
- **Fallbacks** : Polices système appropriées

### 3. **Configuration Tailwind**
- **Fichier** : `tailwind.config.ts`
- **Police par défaut** : Outfit (sans-serif)
- **Police monospace** : FreeMono (monospace)
- **Classes disponibles** : Toutes les classes Tailwind standard

### 4. **Configuration Layout**
- **Fichier** : `src/app/layout.tsx`
- **Classe appliquée** : `font-outfit` sur le body
- **Preload** : Polices principales préchargées

## 🧪 Pages de test disponibles

### 1. **Page de test simple**
- **URL** : `http://localhost:3000/font-test-simple`
- **Contenu** : Tests avec styles inline et classes Tailwind
- **Objectif** : Vérifier le chargement des polices

### 2. **Page de test complète**
- **URL** : `http://localhost:3000/font-test`
- **Contenu** : Tests complets avec toutes les classes
- **Objectif** : Vérifier toutes les fonctionnalités

### 3. **Page de debug**
- **URL** : `http://localhost:3000/test-fonts`
- **Contenu** : Tests de debug avec styles inline
- **Objectif** : Diagnostiquer les problèmes

## 🔍 Comment tester

### 1. **Ouvrir les pages de test**
```bash
# Démarrer le serveur (si pas déjà fait)
npm run dev

# Ouvrir dans le navigateur
http://localhost:3000/font-test-simple
```

### 2. **Vérifier les polices**
- **Outfit** : Doit avoir une apparence différente d'Arial
- **FreeMono** : Doit avoir une apparence monospace
- **Classes spécialisées** : Doit utiliser FreeMono pour les numéros/dates

### 3. **Vérifier dans les outils de développement**
- **Onglet Network** : Vérifier que les polices se chargent (200 OK)
- **Onglet Elements** : Vérifier que les classes CSS sont appliquées
- **Onglet Console** : Vérifier qu'il n'y a pas d'erreurs de chargement

## 🚨 Problèmes possibles et solutions

### 1. **Polices ne se chargent pas**
- **Cause** : Problème de chemin ou de format
- **Solution** : Vérifier que les fichiers sont dans `public/fonts/`
- **Test** : Accéder directement à `http://localhost:3000/fonts/outfit/OutfitRegular.ttf`

### 2. **Polices se chargent mais ne s'appliquent pas**
- **Cause** : Problème de configuration CSS ou Tailwind
- **Solution** : Vérifier la configuration dans `globals.css` et `tailwind.config.ts`
- **Test** : Utiliser les styles inline dans les pages de test

### 3. **Polices s'appliquent partiellement**
- **Cause** : Problème de poids de police ou de classe CSS
- **Solution** : Vérifier les classes CSS et les poids de police
- **Test** : Comparer avec les styles inline

## 📝 Classes CSS disponibles

### Classes Outfit
```css
.font-outfit              /* Police Outfit standard */
.font-outfit-bold         /* Police Outfit Bold */
```

### Classes FreeMono
```css
.font-mono                /* Police FreeMono standard */
.font-free-mono           /* Alias pour FreeMono */
.font-free-mono-bold      /* Police FreeMono Bold */
```

### Classes spécialisées
```css
.text-number              /* Pour les numéros */
.text-date                /* Pour les dates */
.text-code                /* Pour les codes */
.text-reference           /* Pour les références */
.text-amount              /* Pour les montants */
.text-id                  /* Pour les identifiants */
```

## 🎯 Utilisation recommandée

### 1. **Interface utilisateur**
- Utiliser Outfit pour tous les textes d'interface
- Utiliser les classes Tailwind standard (`font-bold`, `font-semibold`, etc.)

### 2. **Données numériques**
- Utiliser FreeMono pour les numéros, dates, codes
- Utiliser les classes spécialisées (`text-number`, `text-date`, etc.)

### 3. **Exemple d'utilisation**
```jsx
<div>
  <h1 className="font-bold text-2xl">Titre avec Outfit</h1>
  <p className="text-base">Description avec Outfit</p>
  <span className="text-number">123456</span>
  <span className="text-date">15/01/2024</span>
</div>
```

## 🔧 Maintenance

### 1. **Ajouter de nouveaux poids de police**
- Ajouter le fichier TTF dans `public/fonts/outfit/`
- Ajouter la déclaration `@font-face` dans `globals.css`
- Ajouter la classe CSS correspondante

### 2. **Modifier les polices par défaut**
- Modifier la configuration dans `tailwind.config.ts`
- Mettre à jour la classe sur le body dans `layout.tsx`

### 3. **Optimiser les performances**
- Utiliser `font-display: swap` (déjà configuré)
- Précharger les polices principales (déjà configuré)
- Minimiser le nombre de poids de police chargés
