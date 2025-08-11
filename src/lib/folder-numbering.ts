import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Génère un numéro de dossier personnalisé au format DOS-YYYY-XXX
 * DOS = Dossier
 * YYYY = Année actuelle
 * XXX = Numéro séquentiel sur 3 chiffres
 */
export async function generateFolderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = `DOS-${currentYear}-`
  
  try {
    // Trouver le dernier numéro de dossier pour l'année actuelle
    const lastFolder = await prisma.folder.findFirst({
      where: {
        folderNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        folderNumber: 'desc'
      }
    })
    
    let nextSequence = 1
    
    if (lastFolder) {
      // Extraire le numéro séquentiel du dernier dossier
      const lastSequenceStr = lastFolder.folderNumber.replace(prefix, '')
      const lastSequence = parseInt(lastSequenceStr, 10)
      
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1
      }
    }
    
    // Formater le numéro séquentiel sur 3 chiffres (001, 002, etc.)
    const sequenceStr = nextSequence.toString().padStart(3, '0')
    
    return `${prefix}${sequenceStr}`
    
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de dossier:', error)
    
    // Fallback en cas d'erreur
    const timestamp = Date.now().toString().slice(-6)
    return `DOS-${currentYear}-${timestamp}`
  }
}

/**
 * Génère les initiales d'un nom de dossier
 * Exemple: "Comptabilité Générale" → "CG"
 */
function generateInitials(folderName: string): string {
  const words = folderName
    .trim()
    .split(/\s+/) // Diviser par espaces
    .filter(word => word.length > 0)
    .filter(word => !['de', 'la', 'le', 'du', 'des', 'et', 'ou', 'à', 'au', 'aux'].includes(word.toLowerCase())) // Exclure les mots vides
  
  // Prendre la première lettre de chaque mot (max 4 lettres)
  const initials = words
    .slice(0, 4)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
  
  // Assurer au moins 2 caractères
  return initials.length >= 2 ? initials : initials.padEnd(2, 'X')
}

/**
 * Génère un numéro de dossier avec code établissement et initiales
 * Format: ACGE-YYYY-XXX-INI
 */
export async function generateFolderNumberWithInitials(
  folderName: string, 
  establishmentCode: string = 'ACGE'
): Promise<string> {
  const currentYear = new Date().getFullYear()
  const initials = generateInitials(folderName)
  const basePrefix = `${establishmentCode}-${currentYear}-`
  
  try {
    // Trouver le dernier numéro pour cette année (tous dossiers confondus)
    const lastFolder = await prisma.folder.findFirst({
      where: {
        folderNumber: {
          startsWith: basePrefix
        }
      },
      orderBy: {
        folderNumber: 'desc'
      }
    })
    
    let nextSequence = 1
    
    if (lastFolder) {
      // Extraire le numéro séquentiel (entre le 2ème et 3ème tiret)
      const parts = lastFolder.folderNumber.split('-')
      if (parts.length >= 3) {
        const sequencePart = parts[2]
        const sequence = parseInt(sequencePart, 10)
        
        if (!isNaN(sequence)) {
          nextSequence = sequence + 1
        }
      }
    }
    
    const sequenceStr = nextSequence.toString().padStart(3, '0')
    return `${basePrefix}${sequenceStr}-${initials}`
    
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de dossier:', error)
    const timestamp = Date.now().toString().slice(-3)
    return `${establishmentCode}-${currentYear}-${timestamp}-${initials}`
  }
}

/**
 * Valide qu'un numéro de dossier n'existe pas déjà
 */
export async function validateFolderNumber(folderNumber: string): Promise<boolean> {
  try {
    const existingFolder = await prisma.folder.findUnique({
      where: {
        folderNumber: folderNumber
      }
    })
    
    return !existingFolder // Retourne true si le numéro n'existe pas
    
  } catch (error) {
    console.error('Erreur lors de la validation du numéro de dossier:', error)
    return false
  }
}
