import { useMemo, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { Box, Button, Chip, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { PlatformConfig, PlatformId, ScheduledPost } from '../types'

type Props = {
  platforms: PlatformConfig[]
  scheduledPosts: ScheduledPost[]
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ContentCalendar({ posts, month }: { posts: ScheduledPost[]; month: Dayjs }) {
  const start = month.startOf('month').startOf('week')
  const end = month.endOf('month').endOf('week')
  const days: Dayjs[] = []
  let cursor = start
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    days.push(cursor)
    cursor = cursor.add(1, 'day')
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}>
      {dayNames.map((name) => (
        <Typography key={name} variant="body2" color="text.secondary" textAlign="center">
          {name}
        </Typography>
      ))}
      {days.map((day) => {
        const items = posts.filter((post) => dayjs(post.scheduledAt).isSame(day, 'day'))
        return (
          <Paper
            key={day.toString()}
            sx={{
              minHeight: 120,
              p: 1,
              border: '1px solid rgba(255,255,255,0.05)',
              background: day.month() === month.month() ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {day.date()}
            </Typography>
            <Stack spacing={0.5} mt={0.5}>
              {items.map((item) => (
                <Chip
                  key={item.id}
                  label={item.title ?? 'Short video'}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ maxWidth: '100%' }}
                />
              ))}
              {items.length === 0 && (
                <Typography variant="caption" color="text.disabled">
                  –
                </Typography>
              )}
            </Stack>
          </Paper>
        )
      })}
    </Box>
  )
}

const CalendarPage = ({ platforms, scheduledPosts }: Props) => {
  const [month, setMonth] = useState<Dayjs>(dayjs())
  const [filter, setFilter] = useState<PlatformId | 'all'>('all')

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return scheduledPosts
    return scheduledPosts.filter((post) => post.platforms.includes(filter))
  }, [filter, scheduledPosts])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <div>
            <Typography variant="h5">Content calendar</Typography>
            <Typography variant="body2" color="text.secondary">
              Planned shorts across Instagram, YouTube, and TikTok. Connect a backend to sync with live queues.
            </Typography>
          </div>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setMonth((prev) => prev.subtract(1, 'month'))}
            >
              Prev
            </Button>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => setMonth((prev) => prev.add(1, 'month'))}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
          <Typography variant="h6">{month.format('MMMM YYYY')}</Typography>
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={(_, value) => value && setFilter(value)}
          >
            <ToggleButton value="all">All</ToggleButton>
            {platforms.map((platform) => (
              <ToggleButton key={platform.id} value={platform.id}>
                {platform.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <ContentCalendar posts={filteredPosts} month={month} />
      </Paper>
    </Stack>
  )
}

export default CalendarPage
