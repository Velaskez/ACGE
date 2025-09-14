# 🎨 Règles Shadcn/UI - Projet ACGE

## 📋 **Règle Obligatoire**

**TOUJOURS utiliser les composants Shadcn/UI pour tous les éléments d'interface utilisateur dans le projet ACGE.**

## ✅ **Directives à suivre**

### **1. Utilisation des composants existants**
- Vérifier d'abord si le composant existe dans `src/components/ui/`
- Utiliser les composants Shadcn/UI existants en priorité
- Respecter l'API et les props des composants existants

### **2. Création de nouveaux composants**
- Si un composant n'existe pas, le créer en suivant les standards Shadcn/UI
- Baser les nouveaux composants sur Radix UI
- Suivre la structure et les conventions Shadcn/UI
- Utiliser les dépendances Radix UI appropriées

### **3. Interdictions**
- ❌ NE JAMAIS utiliser de composants UI personnalisés
- ❌ NE JAMAIS utiliser d'autres bibliothèques UI (Material-UI, Ant Design, etc.)
- ❌ NE JAMAIS créer de composants HTML natifs pour l'UI

## 🛠️ **Processus de développement**

### **Étape 1 : Vérification**
```bash
# Vérifier si le composant existe
ls src/components/ui/ | grep "nom-du-composant"
```

### **Étape 2 : Utilisation ou création**
- **Si existe** : Utiliser le composant existant
- **Si n'existe pas** : Créer un nouveau composant Shadcn/UI

### **Étape 3 : Structure du composant**
```tsx
"use client"

import * as React from "react"
import * as ComponentPrimitive from "@radix-ui/react-component"
import { cn } from "@/lib/utils"

const Component = React.forwardRef<
  React.ElementRef<typeof ComponentPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ComponentPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ComponentPrimitive.Root
    ref={ref}
    className={cn("classes-shadcn", className)}
    {...props}
  />
))
Component.displayName = ComponentPrimitive.Root.displayName

export { Component }
```

## 📦 **Dépendances Radix UI disponibles**

### **Installées**
- `@radix-ui/react-checkbox`
- `@radix-ui/react-switch`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-dropdown-menu`

### **À installer si nécessaire**
```bash
# Exemples de dépendances Radix UI courantes
npm install @radix-ui/react-dialog
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-popover
npm install @radix-ui/react-accordion
npm install @radix-ui/react-tabs
npm install @radix-ui/react-avatar
npm install @radix-ui/react-progress
```

## 🎯 **Composants Shadcn/UI disponibles**

### **Composants de base**
- `Button` - Boutons et actions
- `Card` - Conteneurs et cartes
- `Input` - Champs de saisie
- `Label` - Étiquettes
- `Badge` - Indicateurs et tags

### **Composants de sélection**
- `Checkbox` - Cases à cocher
- `Switch` - Interrupteurs
- `Select` - Listes déroulantes
- `RadioGroup` - Boutons radio

### **Composants d'interface**
- `DropdownMenu` - Menus déroulants
- `AlertDialog` - Dialogues d'alerte
- `Dialog` - Dialogues modaux
- `Sheet` - Panneaux latéraux
- `Tooltip` - Info-bulles

### **Composants de navigation**
- `Pagination` - Pagination
- `ScrollArea` - Zones de défilement
- `Tabs` - Onglets
- `Accordion` - Accordéons

### **Composants de feedback**
- `Skeleton` - États de chargement
- `Progress` - Barres de progression
- `Alert` - Alertes et notifications

## 📝 **Exemples d'utilisation**

### **Bouton**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="sm">
  Cliquer ici
</Button>
```

### **Carte**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    Contenu de la carte
  </CardContent>
</Card>
```

### **Sélection**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## 🚀 **Avantages de cette approche**

- ✅ **Cohérence** : Design uniforme dans toute l'application
- ✅ **Accessibilité** : Composants Radix UI accessibles par défaut
- ✅ **Maintenabilité** : Code standardisé et réutilisable
- ✅ **Performance** : Composants optimisés
- ✅ **Évolutivité** : Facile d'ajouter de nouveaux composants

---

**Cette règle est OBLIGATOIRE et doit être respectée pour tous les développements du projet ACGE.**
