"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
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
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VideocamIcon from "@mui/icons-material/Videocam";

const navItems = [
  { label: "Dashboard", path: "/", icon: <InsightsIcon fontSize="small" /> },
  {
    label: "Schedule",
    path: "/schedule",
    icon: <VideocamIcon fontSize="small" />,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: <CalendarMonthIcon fontSize="small" />,
  },
];

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const activeTab = useMemo(() => {
    const idx = navItems.findIndex((item) => item.path === pathname);
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  return (
    <Box className="shell">
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: "blur(10px)" }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
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
            <Chip
              label="Beta"
              size="small"
              color="secondary"
              variant="filled"
            />
          </Stack>
          <Tabs
            value={activeTab}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ minHeight: 48 }}
          >
            {navItems.map((item) => (
              <Tab
                key={item.path}
                component={NextLink}
                href={item.path}
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
              Start with YouTube integration
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              component={NextLink}
              href="/api/auth/youtube/start"
            >
              Connect YouTube
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  );
}
