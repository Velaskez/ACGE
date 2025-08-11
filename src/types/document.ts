// Types partagés pour les documents

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

export interface DocumentItem {
  id: string
  title: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  currentVersion: DocumentVersion | null
  _count: {
    versions: number
  }
  author?: {
    name: string
    email: string
  }
  folder?: {
    id: string
    name: string
  }
}

export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'fileSize' | 'fileType'
export type SortOrder = 'asc' | 'desc'
export type ViewMode = 'list' | 'grid'
