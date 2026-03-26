import type { UploadRequest } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const ensureResponse = async (response: Response) => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }
  return response.json()
}

export interface UploadResult {
  id: string
  status: 'queued' | 'published' | 'failed' | 'stubbed'
  note?: string
}

export async function uploadShortVideo(payload: UploadRequest): Promise<UploadResult> {
  if (!API_BASE) {
    return {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      status: 'stubbed',
      note: 'Set VITE_API_BASE_URL to call your backend integrations.',
    }
  }

  const formData = new FormData()
  formData.append('description', payload.description)
  if (payload.title) formData.append('title', payload.title)
  if (payload.scheduledAt) formData.append('scheduledAt', payload.scheduledAt)
  formData.append('platforms', JSON.stringify(payload.platforms))
  if (payload.file) formData.append('file', payload.file)
  if (payload.thumbnailFile) formData.append('thumbnail', payload.thumbnailFile)

  const response = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    body: formData,
  })

  return ensureResponse(response)
}

export async function fetchAnalytics() {
  if (!API_BASE) {
    return {
      followers: [],
      views: [],
    }
  }

  const response = await fetch(`${API_BASE}/analytics`)
  return ensureResponse(response)
}

export async function fetchSchedule() {
  if (!API_BASE) {
    return []
  }

  const response = await fetch(`${API_BASE}/schedule`)
  return ensureResponse(response)
}
