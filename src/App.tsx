import { useMemo, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material'
import InsightsIcon from '@mui/icons-material/Insights'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import VideocamIcon from '@mui/icons-material/Videocam'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './sections/Dashboard'
import Scheduler from './sections/Scheduler'
import CalendarPage from './sections/CalendarPage'
import { accountMetrics, followerSeries, platforms, scheduledPostsSeed, viewsSeries } from './data/mockData'
import type { ScheduledPost, UploadRequest } from './types'
import { uploadShortVideo } from './services/integration'
import './App.css'

const navItems = [
  { label: 'Dashboard', path: '/', icon: <InsightsIcon fontSize="small" /> },
  { label: 'Schedule', path: '/schedule', icon: <VideocamIcon fontSize="small" /> },
  { label: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon fontSize="small" /> },
]

function App() {
  const { pathname } = useLocation()
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(scheduledPostsSeed)
  const activeTab = useMemo(
    () => navItems.findIndex((item) => item.path === pathname) ?? 0,
    [pathname],
  )

  const handleCreatePost = async (payload: UploadRequest) => {
    await uploadShortVideo(payload)
    const newPost: ScheduledPost = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      platforms: payload.platforms,
      title: payload.title,
      description: payload.description,
      scheduledAt: payload.scheduledAt ?? new Date().toISOString(),
      status: 'scheduled',
    }
    setScheduledPosts((prev) => [newPost, ...prev])
  }

  return (
    <Box className="shell">
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box className="logo-mark" />
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Sammy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Social media control room
              </Typography>
            </Box>
            <Chip label="Beta" size="small" color="secondary" variant="filled" />
          </Stack>
          <Tabs
            value={activeTab >= 0 ? activeTab : 0}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ minHeight: 48 }}
          >
            {navItems.map((item) => (
              <Tab
                key={item.path}
                component={Link}
                to={item.path}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
                disableRipple
                sx={{ minHeight: 48 }}
              />
            ))}
          </Tabs>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Connected: Instagram, YouTube
            </Typography>
            <Button variant="contained" color="secondary">
              Connect TikTok
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                accountMetrics={accountMetrics}
                followerSeries={followerSeries}
                viewsSeries={viewsSeries}
              />
            }
          />
          <Route
            path="/schedule"
            element={
              <Scheduler
                platforms={platforms}
                scheduledPosts={scheduledPosts}
                onCreatePost={handleCreatePost}
              />
            }
          />
          <Route
            path="/calendar"
            element={<CalendarPage platforms={platforms} scheduledPosts={scheduledPosts} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App
