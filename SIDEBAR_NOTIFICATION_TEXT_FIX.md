# Correction du problème d'affichage des notifications dans la sidebar

## Problème identifié

L'aperçu bleu des notifications dans la sidebar affichait "Dossier à ordonnancer" mais le texte était invisible car il avait la même couleur que le fond bleu.

## Cause du problème

Dans le composant `SidebarNotificationItem`, les notifications non lues utilisaient :
- Fond : `bg-blue-50` (bleu très clair)
- Titre : `text-blue-900` (bleu très foncé)
- Message : `text-blue-700` (bleu foncé)

Le contraste était insuffisant, rendant le texte difficile à lire.

## Solution appliquée

Modification des couleurs de texte pour améliorer le contraste :

### Avant :
```tsx
<p className={`text-xs font-medium truncate ${
  isUnread ? 'text-blue-900' : 'text-muted-foreground'
}`}>
  {notification.title}
</p>

<p className={`text-xs truncate ${
  isUnread ? 'text-blue-700' : 'text-muted-foreground'
}`}>
  {notification.message}
</p>
```

### Après :
```tsx
<p className={`text-xs font-medium truncate ${
  isUnread ? 'text-blue-800' : 'text-muted-foreground'
}`}>
  {notification.title}
</p>

<p className={`text-xs truncate ${
  isUnread ? 'text-blue-600' : 'text-muted-foreground'
}`}>
  {notification.message}
</p>
```

## Résultat

- ✅ Le texte des notifications non lues est maintenant parfaitement lisible
- ✅ Le contraste est amélioré tout en gardant l'identité visuelle bleue
- ✅ Les notifications lues restent inchangées
- ✅ L'interface est plus accessible et professionnelle

## Fichiers modifiés

- `src/components/notifications/sidebar-notification-item.tsx`

Le problème d'affichage des notifications dans la sidebar est maintenant résolu !
