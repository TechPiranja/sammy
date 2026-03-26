import type { AccountMetric, PlatformConfig, ScheduledPost, SeriesPoint } from '../types'

export const platforms: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#f472b6',
    requirements: ['Instagram Graph API app', 'Business/Creator account', 'Valid access token'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#f87171',
    requirements: ['YouTube Data API v3 project', 'OAuth client with upload scope'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#38bdf8',
    requirements: ['TikTok for Developers app', 'Video upload scope'],
  },
]

export const accountMetrics: AccountMetric[] = [
  { platform: 'instagram', followers: 140, views: 98200, growth: 8.4, connected: true },
  { platform: 'youtube', followers: 100, views: 143200, growth: 5.1, connected: true },
  { platform: 'tiktok', followers: 120, views: 121400, growth: 11.3, connected: false },
]

export const followerSeries: SeriesPoint[] = [
  { date: '2025-01-01', instagram: 110, youtube: 80, tiktok: 95 },
  { date: '2025-02-01', instagram: 118, youtube: 84, tiktok: 100 },
  { date: '2025-03-01', instagram: 124, youtube: 89, tiktok: 106 },
  { date: '2025-04-01', instagram: 130, youtube: 93, tiktok: 111 },
  { date: '2025-05-01', instagram: 136, youtube: 97, tiktok: 116 },
  { date: '2025-06-01', instagram: 140, youtube: 100, tiktok: 120 },
]

export const viewsSeries: SeriesPoint[] = [
  { date: '2025-01-01', instagram: 86000, youtube: 119000, tiktok: 97000 },
  { date: '2025-02-01', instagram: 90100, youtube: 123400, tiktok: 104000 },
  { date: '2025-03-01', instagram: 93000, youtube: 129800, tiktok: 110200 },
  { date: '2025-04-01', instagram: 95400, youtube: 133400, tiktok: 114300 },
  { date: '2025-05-01', instagram: 97000, youtube: 137600, tiktok: 118900 },
  { date: '2025-06-01', instagram: 98200, youtube: 143200, tiktok: 121400 },
]

export const scheduledPostsSeed: ScheduledPost[] = [
  {
    id: 'sp-1',
    platforms: ['instagram', 'youtube'],
    title: 'Behind the scenes drop',
    description: 'Short reel + YT Short: new workflow walk-through.',
    scheduledAt: '2025-03-28T14:00:00Z',
    status: 'scheduled',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=60',
  },
  {
    id: 'sp-2',
    platforms: ['tiktok'],
    title: 'Quick edit tips',
    description: '3 rapid-fire tips for editing faster.',
    scheduledAt: '2025-03-29T16:30:00Z',
    status: 'scheduled',
  },
  {
    id: 'sp-3',
    platforms: ['instagram', 'tiktok'],
    title: 'Creator Q&A',
    description: 'Answering the top 3 community questions.',
    scheduledAt: '2025-04-02T12:00:00Z',
    status: 'scheduled',
  },
]
