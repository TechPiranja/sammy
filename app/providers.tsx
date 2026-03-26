'use client'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { ReactNode } from 'react'
import { theme } from '../src/theme'
import { ScheduleProvider } from '../src/context/ScheduleContext'

type Props = {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  return (
    <AppRouterCacheProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ScheduleProvider>{children}</ScheduleProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </AppRouterCacheProvider>
  )
}
