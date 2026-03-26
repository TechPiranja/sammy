'use client'

import { useEffect, useMemo, useState } from 'react'
import { Avatar, Box, Chip, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts'
import type { AccountMetric, SeriesPoint } from '../types'
import { platforms } from '../data/mockData'

const currency = new Intl.NumberFormat('en', { notation: 'compact' })
const number = new Intl.NumberFormat('en')

type Props = {
  accountMetrics: AccountMetric[]
  followerSeries: SeriesPoint[]
  viewsSeries: SeriesPoint[]
}

type YouTubeChannelPayload = {
  connected: boolean
  subscribers: number | null
  profileImageUrl: string | null
  title: string | null
}

type YouTubeHistoryPayload = {
  connected: boolean
  history: Array<{
    date: string
    youtubeFollowers: number
    youtubeViews: number
  }>
}

type DisplayMetric = AccountMetric & {
  profileImageUrl?: string | null
  channelTitle?: string | null
}

const chartColors = {
  instagram: '#f472b6',
  youtube: '#ef4444',
  tiktok: '#38bdf8',
}

function MetricCard({ metric }: { metric: DisplayMetric }) {
  const platform = platforms.find((p) => p.id === metric.platform)
  const followerLabel = metric.platform === 'youtube' ? 'Subscribers' : 'Followers'
  const showProfileImage = metric.platform === 'youtube' && Boolean(metric.profileImageUrl)
  const displayTitle = metric.platform === 'youtube' ? metric.channelTitle ?? platform?.name : platform?.name
  const isYoutube = metric.platform === 'youtube'

  return (
    <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          {showProfileImage ? (
            <Avatar
              src={metric.profileImageUrl ?? undefined}
              alt={`${platform?.name ?? 'Platform'} profile`}
              sx={{ width: 42, height: 42, border: `1px solid ${platform?.color}66` }}
            />
          ) : (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                background: `${platform?.color}22`,
                border: `1px solid ${platform?.color}55`,
              }}
            />
          )}
          <Box>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                {displayTitle}
              </Typography>
              {isYoutube && <YouTubeIcon fontSize="small" sx={{ color: '#ef4444' }} />}
            </Stack>
            {isYoutube && (
              <Typography variant="caption" color="text.disabled">
                YouTube
              </Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendingUpIcon fontSize="small" color="secondary" />
              <Typography variant="body2" color="text.secondary">
                {metric.growth}% MoM
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Chip
          label={metric.connected ? 'Connected' : 'Needs auth'}
          color={metric.connected ? 'success' : 'warning'}
          variant={metric.connected ? 'outlined' : 'filled'}
          size="small"
        />
      </Stack>
      <Divider flexItem light />
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PeopleIcon fontSize="small" color="info" />
          <Typography variant="body2" color="text.secondary">
            {followerLabel}
          </Typography>
        </Stack>
        <Typography variant="h5">{number.format(metric.followers)}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <VisibilityIcon fontSize="small" color="secondary" />
          <Typography variant="body2" color="text.secondary">
            Views (30d)
          </Typography>
        </Stack>
        <Typography variant="h6">{currency.format(metric.views)}</Typography>
      </Stack>
    </Paper>
  )
}

function SeriesChart({
  title,
  data,
  yLabel,
}: {
  title: string
  data: SeriesPoint[]
  yLabel: string
}) {
  return (
    <Paper sx={{ p: 2.5, minHeight: 320 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <div>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Rolling six-month trend
          </Typography>
        </div>
        <Tooltip title="Refresh from API">
          <IconButton size="small" color="secondary">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" width={72} />
          <RechartsTooltip
            contentStyle={{ background: '#0b0c13', border: '1px solid #1e293b' }}
            labelFormatter={(value) => `Month starting ${value}`}
          />
          <Legend />
          <Line type="monotone" dataKey="instagram" stroke={chartColors.instagram} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="youtube" stroke={chartColors.youtube} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tiktok" stroke={chartColors.tiktok} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary">
        {yLabel}
      </Typography>
    </Paper>
  )
}

const Dashboard = ({ accountMetrics, followerSeries, viewsSeries }: Props) => {
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannelPayload | null>(null)
  const [youtubeHistory, setYoutubeHistory] = useState<YouTubeHistoryPayload | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadYoutubeChannel = async () => {
      try {
        const response = await fetch('/api/youtube/channel', { cache: 'no-store' })
        const payload = await response.json()

        if (!isMounted) return

        if (!response.ok) {
          setYoutubeChannel({ connected: false, subscribers: null, profileImageUrl: null, title: null })
          return
        }

        setYoutubeChannel({
          connected: Boolean(payload.connected),
          subscribers:
            typeof payload.subscribers === 'number' && Number.isFinite(payload.subscribers)
              ? payload.subscribers
              : null,
          profileImageUrl: typeof payload.profileImageUrl === 'string' ? payload.profileImageUrl : null,
          title: typeof payload.title === 'string' ? payload.title : null,
        })
      } catch {
        if (isMounted) {
          setYoutubeChannel({ connected: false, subscribers: null, profileImageUrl: null, title: null })
        }
      }
    }

    void loadYoutubeChannel()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadYoutubeHistory = async () => {
      try {
        const response = await fetch('/api/youtube/history', { cache: 'no-store' })
        const payload = await response.json()

        if (!isMounted || !response.ok || !Array.isArray(payload.history)) return

        setYoutubeHistory({
          connected: Boolean(payload.connected),
          history: payload.history
            .filter((point: { date?: unknown }) => typeof point?.date === 'string')
            .map((point: { date: string; youtubeFollowers?: unknown; youtubeViews?: unknown }) => ({
              date: point.date,
              youtubeFollowers:
                typeof point.youtubeFollowers === 'number' && Number.isFinite(point.youtubeFollowers)
                  ? point.youtubeFollowers
                  : 0,
              youtubeViews:
                typeof point.youtubeViews === 'number' && Number.isFinite(point.youtubeViews)
                  ? point.youtubeViews
                  : 0,
            })),
        })
      } catch {
      }
    }

    void loadYoutubeHistory()

    return () => {
      isMounted = false
    }
  }, [])

  const displayMetrics = useMemo(
    () =>
      accountMetrics.map((metric) => {
        if (metric.platform !== 'youtube' || !youtubeChannel) return metric

        return {
          ...metric,
          connected: youtubeChannel.connected,
          followers: youtubeChannel.subscribers ?? metric.followers,
          profileImageUrl: youtubeChannel.profileImageUrl,
          channelTitle: youtubeChannel.title,
        }
      }),
    [accountMetrics, youtubeChannel],
  )

  const mergedFollowerSeries = useMemo(() => {
    if (!youtubeHistory?.history?.length) {
      if (!youtubeChannel?.connected || typeof youtubeChannel.subscribers !== 'number') {
        return followerSeries
      }

      return followerSeries.map((point) => ({
        ...point,
        youtube: youtubeChannel.subscribers ?? point.youtube,
      }))
    }

    const history = youtubeHistory.history
    const output = followerSeries.map((point) => ({ ...point }))
    const offset = Math.max(0, output.length - history.length)

    for (let index = 0; index < output.length; index += 1) {
      const historyPoint = history[index - offset]
      if (historyPoint && Number.isFinite(historyPoint.youtubeFollowers)) {
        output[index].youtube = historyPoint.youtubeFollowers
      }
    }

    if (
      youtubeChannel?.connected &&
      typeof youtubeChannel.subscribers === 'number' &&
      output.length > 0
    ) {
      output[output.length - 1].youtube = youtubeChannel.subscribers
    }

    return output
  }, [followerSeries, youtubeChannel, youtubeHistory])

  const mergedViewsSeries = useMemo(() => {
    if (!youtubeHistory?.history?.length) return viewsSeries

    const youtubeByDate = new Map(
      youtubeHistory.history.map((point) => [point.date.slice(0, 7), point.youtubeViews]),
    )

    return viewsSeries.map((point) => ({
      ...point,
      youtube: youtubeByDate.get(point.date.slice(0, 7)) ?? point.youtube,
    }))
  }, [viewsSeries, youtubeHistory])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="h4" component="h1">
          Multi-platform control
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={760}>
          Monitor follower growth, short-form views, and connection status for Instagram, YouTube, and TikTok.
          Integrations default to mock data until you attach your API base URL.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Chip label="Instagram Graph API" color="secondary" variant="outlined" />
          <Chip label="YouTube Data API" color="primary" variant="outlined" />
          <Chip label="TikTok Open API" color="default" variant="outlined" />
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {displayMetrics.map((metric) => (
          <MetricCard metric={metric} key={metric.platform} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 2.5,
        }}
      >
        <SeriesChart title="Followers by platform" data={mergedFollowerSeries} yLabel="Total followers" />
        <SeriesChart title="Short-form views" data={mergedViewsSeries} yLabel="30d rolling views" />
      </Box>
    </Stack>
  )
}

export default Dashboard
