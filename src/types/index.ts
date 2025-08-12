// Types pour l'application GED basés sur le schéma Prisma

// Types de rôles comme chaînes (compatible SQLite)
export type Role = 'ADMIN' | 'MANAGER' | 'USER'

export type Permission = 'READ' | 'WRITE' | 'ADMIN'

export interface User {
  id: string
  name: string | null
  email: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  title: string
  description: string | null
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  version: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  authorId: string
  folderId: string | null
  author: User
  folder?: Folder
  tags: Tag[]
  shares: DocumentShare[]
  comments: Comment[]
}

export interface Folder {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  parentId: string | null
  author: User
  parent?: Folder
  children: Folder[]
  documents: Document[]
}

export interface Tag {
  id: string
  name: string
  color: string | null
  createdAt: Date
  documents: Document[]
}

export interface DocumentShare {
  id: string
  permission: Permission
  createdAt: Date
  documentId: string
  userId: string
  document: Document
  user: User
}

export interface Comment {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  documentId: string
  authorId: string
  document: Document
  author: User
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  data?: any
  createdAt: Date
  userId: string
  user?: User
}

export type NotificationType = 
  | 'DOCUMENT_SHARED'
  | 'DOCUMENT_UNSHARED'
  | 'VERSION_ADDED'
  | 'VERSION_RESTORED'
  | 'DOCUMENT_DELETED'
  | 'FOLDER_SHARED'
  | 'COMMENT_ADDED'
  | 'SYSTEM'
  | 'WELCOME'

// Types pour les formulaires
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface DocumentFormData {
  title: string
  description?: string
  folderId?: string
  tags: string[]
  isPublic: boolean
}

export interface FolderFormData {
  name: string
  description?: string
  parentId?: string
}

// Types pour les props des composants
export interface DocumentCardProps {
  document: Document
  onEdit?: (document: Document) => void
  onDelete?: (document: Document) => void
  onShare?: (document: Document) => void
}

export interface FolderCardProps {
  folder: Folder
  onEdit?: (folder: Folder) => void
  onDelete?: (folder: Folder) => void
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}
