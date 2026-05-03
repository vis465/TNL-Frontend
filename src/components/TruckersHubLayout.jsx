/**
 * TruckersHub live telemetry — MUI shell inside AdminLayout (theme.js).
 */

import React from 'react';
import { Outlet, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { alpha, useTheme } from '@mui/material/styles';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import {
  TelemetryRealtimeProvider,
  useTelemetryRealtime,
} from '../context/TelemetryRealtimeContext';

export function TruckersHubLayout() {
  return (
    <TelemetryRealtimeProvider>
      <TruckersHubLayoutInner />
    </TelemetryRealtimeProvider>
  );
}

function TruckersHubLayoutInner() {
  const theme = useTheme();
  const location = useLocation();
  const { dashboardConnected } = useTelemetryRealtime();

  const nav = [
    { to: '/telemetry', end: true, label: 'Fleet overview', Icon: DashboardOutlinedIcon },
    // { to: '/telemetry/violations', label: 'Speed violations', Icon: WarningAmberOutlinedIcon },
    // { to: '/telemetry/jobs', label: 'Live jobs', Icon: MapOutlinedIcon },
    // { to: '/telemetry/status', label: 'Gateway status', Icon: SettingsEthernetOutlinedIcon },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '100%',
        pb: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SensorsOutlinedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                TruckersHub live
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time data from our backend WebSocket relay (TruckersHub gateway).
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={dashboardConnected ? 'Dashboard stream connected' : 'Dashboard stream reconnecting'}
            sx={{
              fontWeight: 600,
              bgcolor: dashboardConnected
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.warning.main, 0.15),
            }}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 0.75, md: 1 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[300]}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          {nav.map(({ to, label, Icon, end }) => {
            const path = location.pathname.replace(/\/$/, '') || '/';
            const resolved = end
              ? path === '/telemetry'
              : path === to.replace(/\/$/, '');
            return (
              <Button
                key={to}
                component={RouterNavLink}
                to={to}
                end={end}
                variant={resolved ? 'contained' : 'text'}
                color={resolved ? 'primary' : 'inherit'}
                startIcon={<Icon fontSize="small" />}
                sx={{
                  px: 1.5,
                  textTransform: 'none',
                  fontWeight: resolved ? 700 : 500,
                  color: resolved ? undefined : theme.palette.grey[700],
                  borderRadius: 1.5,
                }}
              >
                {label}
              </Button>
            );
          })}
        </Paper>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, maxWidth: 1280, mx: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default TruckersHubLayout;
