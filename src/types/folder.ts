/**
 * Types partagés pour les dossiers dans l'application
 */

export interface Folder {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  authorId: string
  parentId?: string
  documentCount?: number
  children?: Folder[]
  documents?: any[] // Type générique pour éviter les dépendances circulaires
  _count?: {
    documents: number
    children: number
  }
  author?: {
    name: string
    email: string
  }
}

export interface FolderAuthor {
  id: string
  name: string
  email: string
}

export interface FolderWithAuthor extends Omit<Folder, 'authorId'> {
  author: FolderAuthor
}

export interface FolderCreationData {
  name: string
  description?: string
  parentId?: string
}

export interface FolderUpdateData {
  name?: string
  description?: string
  parentId?: string
}
