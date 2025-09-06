/**
 * Types partagés pour les documents dans l'application
 */

export interface DocumentVersion {
  id: string
  versionNumber: number
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  changeLog?: string
  createdAt: string
}

export interface DocumentAuthor {
  id: string
  name: string
  email: string
}

export interface DocumentFolder {
  id: string
  name: string
}

export interface DocumentTag {
  id: string
  name: string
}

export interface DocumentCounts {
  versions?: number
  comments?: number
  shares?: number
}

export interface DocumentItem {
  id: string
  title: string
  description?: string
  category?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  tags: DocumentTag[]
  folder?: DocumentFolder
  folderId?: string | null
  author: DocumentAuthor
  currentVersion?: DocumentVersion
  _count?: DocumentCounts
}

export interface DocumentPreviewProps {
  document: DocumentItem
  isOpen: boolean
  onClose: () => void
}

export interface DocumentEditProps {
  document: DocumentItem
  isOpen: boolean
  onClose: () => void
  onSave: (updatedDocument: DocumentItem) => void
}

export interface DocumentShareProps {
  document: DocumentItem
  isOpen: boolean
  onClose: () => void
  onShared: () => void
}
