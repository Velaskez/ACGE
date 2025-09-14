/**
 * 🔀 Redirection basée sur le rôle utilisateur
 * 
 * Cette fonction détermine la page de destination appropriée
 * selon le rôle de l'utilisateur connecté.
 */

export function getRoleRedirectPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard'
    
    case 'SECRETAIRE':
      return '/folders'
    
    case 'CONTROLEUR_BUDGETAIRE':
      return '/cb-dashboard'
    
    case 'ORDONNATEUR':
      return '/ordonnateur-dashboard'
    
    case 'AGENT_COMPTABLE':
      return '/ac-dashboard'
    
    default:
      // Rôle inconnu, rediriger vers le dashboard général
      return '/dashboard'
  }
}

/**
 * 🎯 Redirection intelligente avec fallback
 * 
 * Redirige vers la page appropriée selon le rôle,
 * avec fallback vers le dashboard général si le rôle n'est pas reconnu.
 */
export function redirectByRole(role: string | undefined, router: any): void {
  console.log(`🔀 redirectByRole appelé avec role: ${role}`)
  
  if (!role) {
    console.warn('⚠️ Rôle utilisateur non défini, redirection vers dashboard général')
    router.push('/dashboard')
    return
  }

  const redirectPath = getRoleRedirectPath(role)
  console.log(`🔀 Redirection ${role} vers: ${redirectPath}`)
  
  // Forcer la redirection
  router.replace(redirectPath)
}
