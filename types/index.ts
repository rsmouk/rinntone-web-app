import { Ringtone, Category, Tag, Advertisement, AdPlacement, DownloadLog } from '@prisma/client'

// Extended types with relations
export interface RingtoneWithRelations extends Ringtone {
  category?: Category | null
  tags?: { tag: Tag }[]
}

export interface CategoryWithRelations extends Category {
  parent?: Category | null
  children?: Category[]
  _count?: {
    ringtones: number
  }
}

export interface AdvertisementWithPlacement extends Advertisement {
  placement: AdPlacement
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Search types
export interface SearchResult {
  ringtones: RingtoneWithRelations[]
  total: number
  query: string
}

export interface AutocompleteResult {
  id: number
  numericId: string
  name: string
  categoryName?: string
}

// Analytics types
export interface DownloadStats {
  totalDownloads: number
  todayDownloads: number
  weeklyDownloads: number
  monthlyDownloads: number
}

export interface TopRingtone {
  id: number
  numericId: string
  name: string
  downloadCount: number
  thumbnailPath?: string
}

export interface DailyStats {
  date: string
  downloads: number
  views: number
}

// Form types
export interface RingtoneFormData {
  name: string
  numericId: string
  description?: string
  categoryId?: number
  tagIds?: number[]
  audioFile?: File
  thumbnailFile?: File
}

export interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  parentId?: number
  icon?: string
  order?: number
}

export interface TagFormData {
  name: string
  slug?: string
}

export interface AdvertisementFormData {
  name: string
  adCode: string
  placementId: number
  isActive?: boolean
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Session types extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
