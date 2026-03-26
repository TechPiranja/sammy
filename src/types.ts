export type PlatformId = 'instagram' | 'youtube' | 'tiktok'

export interface PlatformConfig {
  id: PlatformId
  name: string
  color: string
  requirements: string[]
}

export interface AccountMetric {
  platform: PlatformId
  followers: number
  views: number
  growth: number
  connected: boolean
}

export interface SeriesPoint {
  date: string
  instagram: number
  youtube: number
  tiktok: number
}

export interface ScheduledPost {
  id: string
  platforms: PlatformId[]
  title?: string
  description: string
  thumbnailUrl?: string
  scheduledAt: string
  status: 'scheduled' | 'published' | 'failed'
}

export interface UploadRequest {
  platforms: PlatformId[]
  title?: string
  description: string
  scheduledAt?: string
  file?: File
  thumbnailFile?: File | null
}
