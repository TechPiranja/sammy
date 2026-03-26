import { Box, Chip, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
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

const chartColors = {
  instagram: '#f472b6',
  youtube: '#ef4444',
  tiktok: '#38bdf8',
}

function MetricCard({ metric }: { metric: AccountMetric }) {
  const platform = platforms.find((p) => p.id === metric.platform)

  return (
    <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: `${platform?.color}22`,
              border: `1px solid ${platform?.color}55`,
            }}
          />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {platform?.name}
            </Typography>
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
            Followers
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
        {accountMetrics.map((metric) => (
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
        <SeriesChart title="Followers by platform" data={followerSeries} yLabel="Total followers" />
        <SeriesChart title="Short-form views" data={viewsSeries} yLabel="30d rolling views" />
      </Box>
    </Stack>
  )
}

export default Dashboard
