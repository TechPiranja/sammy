import { useState, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ScheduleIcon from '@mui/icons-material/Schedule'
import dayjs, { Dayjs } from 'dayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import type { PlatformConfig, PlatformId, ScheduledPost, UploadRequest } from '../types'

type Props = {
  platforms: PlatformConfig[]
  scheduledPosts: ScheduledPost[]
  onCreatePost: (payload: UploadRequest) => Promise<void>
}

const Scheduler = ({ platforms, scheduledPosts, onCreatePost }: Props) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['instagram', 'youtube'])
  const [title, setTitle] = useState('Hero short for launch')
  const [description, setDescription] = useState('Upload short video with description for IG/YouTube/TikTok.')
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(dayjs().add(1, 'day').hour(14).minute(0))
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (selectedPlatforms.length === 0) {
      setError('Select at least one platform.')
      return
    }
    if (!videoFile) {
      setError('Attach the short-form video file.')
      return
    }

    setSubmitting(true)
    try {
      await onCreatePost({
        platforms: selectedPlatforms,
        title,
        description,
        scheduledAt: scheduledAt?.toISOString(),
        file: videoFile,
        thumbnailFile,
      })
      setSuccess('Queued for upload and scheduling.')
      setTitle('')
      setDescription('')
      setVideoFile(null)
      setThumbnailFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const upcoming = scheduledPosts
    .slice()
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 4)

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <ScheduleIcon color="secondary" />
          <Typography variant="h5">Schedule short-form uploads</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Title is required for YouTube. Thumbnail is optional for platforms that support it.
          All calls run through your backend (configure VITE_API_BASE_URL).
        </Typography>
      </Paper>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2.5,
        }}
      >
        <Box>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack spacing={1}>
              <InputLabel id="platforms">Platforms</InputLabel>
              <Select
                labelId="platforms"
                multiple
                value={selectedPlatforms}
                onChange={(e) => setSelectedPlatforms(e.target.value as PlatformId[])}
                renderValue={(selected) => (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {(selected as PlatformId[]).map((id) => {
                      const platform = platforms.find((p) => p.id === id)
                      return <Chip key={id} label={platform?.name ?? id} color="primary" />
                    })}
                  </Stack>
                )}
              >
                {platforms.map((platform) => (
                  <MenuItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            <TextField
              label="Title (YouTube required)"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Description / caption"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <DateTimePicker
              label="Publish at"
              value={scheduledAt}
              onChange={(value) => setScheduledAt(value)}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {videoFile ? videoFile.name : 'Attach short video'}
                <input
                  type="file"
                  hidden
                  accept="video/mp4,video/mov,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {thumbnailFile ? thumbnailFile.name : 'Optional thumbnail'}
                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                />
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {platforms.map((platform) => (
                <Chip
                  key={platform.id}
                  label={`${platform.name}: ${platform.requirements.join(' • ')}`}
                  variant="outlined"
                  color="secondary"
                  size="small"
                />
              ))}
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Scheduling…' : 'Schedule upload'}
            </Button>
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="h6">Upcoming content</Typography>
            <Typography variant="body2" color="text.secondary">
              Synced after each successful API call.
            </Typography>
            <Divider />
            <Stack spacing={1.5}>
              {upcoming.map((post) => (
                <Box
                  key={post.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={600}>{post.title ?? 'Untitled short'}</Typography>
                    <Chip
                      label={post.status}
                      size="small"
                      color={post.status === 'scheduled' ? 'info' : 'success'}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {dayjs(post.scheduledAt).format('MMM D, YYYY • h:mm A')}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {post.platforms.map((platform) => (
                      <Chip key={platform} label={platform} size="small" />
                    ))}
                  </Stack>
                </Box>
              ))}
              {upcoming.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No upcoming content yet.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Stack>
  )
}

export default Scheduler
