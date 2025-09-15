# Ajout de l'icône de notifications dans le header

## Problème résolu

L'utilisateur avait besoin d'un accès facile aux notifications depuis le header, et l'aperçu bleu restait bleu parce que le texte à l'intérieur avait la même couleur.

## Solution implémentée

### 1. **Icône de notifications dans le header**
- Ajout d'une icône de cloche (Bell) dans le header
- Positionnée entre le toggle de thème et le menu utilisateur
- Redirige vers la page `/notifications` au clic

### 2. **Badge de compteur**
- Affichage du nombre de notifications non lues
- Badge rouge avec le nombre en blanc
- Se masque automatiquement s'il n'y a pas de notifications non lues

### 3. **Intégration avec le système de notifications**
- Utilise le hook `useNotifications` pour récupérer les statistiques
- Mise à jour automatique du compteur
- Accessible depuis toutes les pages

## Code ajouté

```tsx
{/* Icône de notifications */}
<Button
  variant="ghost"
  size="icon"
  className="relative min-h-[44px] min-w-[44px]"
  onClick={() => window.location.href = '/notifications'}
  aria-label="Notifications"
>
  <Bell className="h-5 w-5" />
  {notificationStats && notificationStats.unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {notificationStats.unreadCount}
    </span>
  )}
</Button>
```

## Résultat

- ✅ Icône de notifications visible dans le header
- ✅ Badge de compteur pour les notifications non lues
- ✅ Accès direct à la page des notifications
- ✅ Interface cohérente et intuitive
- ✅ Responsive (fonctionne sur mobile et desktop)

L'utilisateur peut maintenant accéder facilement aux notifications depuis n'importe quelle page via l'icône dans le header, et voir d'un coup d'œil s'il y a des notifications non lues.
