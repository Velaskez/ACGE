# Guide d'utilisation des polices - ACGE

## Configuration des polices

### Police principale : Outfit
- **Utilisation** : Police par défaut pour tout le texte de l'interface
- **Emplacement** : `/public/fonts/outfit/`
- **Poids disponibles** : 200 (ExtraLight) à 900 (Black)

### Police monospace : FreeMono
- **Utilisation** : Numéros, dates, codes, références, montants
- **Emplacement** : `/public/fonts/freemono/`
- **Poids disponibles** : 400 (Regular), 700 (Bold)
- **Styles disponibles** : Normal, Italic

## Classes CSS disponibles

### Classes Outfit (police par défaut)
```css
.font-outfit              /* Police Outfit standard */
.font-outfit-light        /* Poids 300 */
.font-outfit-regular      /* Poids 400 */
.font-outfit-medium       /* Poids 500 */
.font-outfit-semibold     /* Poids 600 */
.font-outfit-bold         /* Poids 700 */
.font-outfit-extrabold    /* Poids 800 */
.font-outfit-black        /* Poids 900 */
```

### Classes FreeMono (police monospace)
```css
.font-mono                /* Police FreeMono standard */
.font-free-mono           /* Alias pour FreeMono */
.font-free-mono-regular   /* Poids 400 */
.font-free-mono-bold      /* Poids 700 */
.font-free-mono-italic    /* Style italic */
.font-free-mono-bold-italic /* Poids 700 + italic */
```

### Classes spécialisées pour le contenu
```css
.text-number              /* Pour les numéros (poids 500) */
.text-date                /* Pour les dates (poids 400) */
.text-code                /* Pour les codes (poids 400) */
.text-reference           /* Pour les références (poids 500) */
.text-amount              /* Pour les montants (poids 600) */
.text-id                  /* Pour les identifiants (poids 500, taille réduite) */
```

## Classes Tailwind CSS

### Police par défaut (Outfit)
```html
<!-- Utilisation automatique -->
<p class="text-lg">Texte normal</p>

<!-- Poids spécifiques -->
<p class="font-light">Texte léger</p>
<p class="font-medium">Texte medium</p>
<p class="font-semibold">Texte semi-gras</p>
<p class="font-bold">Texte gras</p>
```

### Police monospace (FreeMono)
```html
<!-- Police monospace standard -->
<p class="font-mono">Code ou numéro</p>

<!-- Classes spécialisées -->
<span class="text-number">123456</span>
<span class="text-date">2024-01-15</span>
<span class="text-code">ABC123</span>
<span class="text-reference">REF-2024-001</span>
<span class="text-amount">1,250.00 €</span>
<span class="text-id">#ID-12345</span>
```

## Exemples d'utilisation

### Interface utilisateur standard
```html
<div class="font-outfit">
  <h1 class="font-bold text-2xl">Titre principal</h1>
  <p class="font-regular text-base">Description du contenu</p>
  <button class="font-medium">Bouton d'action</button>
</div>
```

### Données numériques et codes
```html
<div class="space-y-2">
  <div class="flex justify-between">
    <span class="font-outfit-medium">Numéro de dossier :</span>
    <span class="text-reference">DOS-2024-001</span>
  </div>
  <div class="flex justify-between">
    <span class="font-outfit-medium">Date de création :</span>
    <span class="text-date">15/01/2024</span>
  </div>
  <div class="flex justify-between">
    <span class="font-outfit-medium">Montant :</span>
    <span class="text-amount">2,500.00 €</span>
  </div>
</div>
```

### Tableaux de données
```html
<table class="w-full">
  <thead>
    <tr class="font-outfit-semibold">
      <th>Référence</th>
      <th>Date</th>
      <th>Montant</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="text-reference">REF-001</td>
      <td class="text-date">15/01/2024</td>
      <td class="text-amount">1,250.00 €</td>
    </tr>
  </tbody>
</table>
```

## Bonnes pratiques

1. **Utilisez Outfit** pour tous les textes d'interface (titres, descriptions, boutons, etc.)
2. **Utilisez FreeMono** pour :
   - Numéros de dossier
   - Dates
   - Codes de référence
   - Montants financiers
   - Identifiants techniques
   - Codes de statut

3. **Évitez** de mélanger les polices dans un même élément de texte
4. **Privilégiez** les classes spécialisées (`.text-number`, `.text-date`, etc.) pour un style cohérent
5. **Testez** l'affichage sur différents navigateurs et appareils

## Configuration technique

- Les polices sont chargées avec `font-display: swap` pour optimiser les performances
- Les polices variables sont utilisées quand disponibles (Outfit)
- Les polices de fallback sont configurées pour assurer la compatibilité
- Les polices sont optimisées pour l'affichage web
