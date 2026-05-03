/**
 * TruckersHub gateway / relay status — MUI
 */

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { useTelemetryRealtime } from '../context/TelemetryRealtimeContext';

function buildStatsFromPayload(data) {
  const connectedAt = data?.websocket?.connectedAt;
  let uptime = 'N/A';
  if (connectedAt) {
    const ms = Date.now() - new Date(connectedAt).getTime();
    const uptimeMinutes = Math.floor(ms / 60000);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    uptime =
      uptimeHours > 0
        ? `${uptimeHours}h ${uptimeMinutes % 60}m`
        : `${uptimeMinutes}m`;
  }
  return {
    uptime,
    connected: data?.websocket?.connected,
    reconnectAttempts: data?.websocket?.reconnectAttempts || 0,
    activeSessions: data?.activeSessions || 0,
  };
}

export default function TruckersHubStatusPage() {
  const theme = useTheme();
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastPushAt, setLastPushAt] = useState(null);
  const { subscribe, dashboardConnected } = useTelemetryRealtime();

  const applyStatusPayload = useCallback((data) => {
    setStatus(data);
    setStats(buildStatsFromPayload(data));
  }, []);

  useEffect(() => {
    return subscribe((msg) => {
      if (msg.type !== 'STATUS') return;
      applyStatusPayload(msg.data);
      setLastPushAt(new Date());
    });
  }, [subscribe, applyStatusPayload]);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/telemetry/status');
      const data = await response.json();
      if (data.success) {
        applyStatusPayload(data.data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  }, [applyStatusPayload]);

  useEffect(() => {
    fetchStatus();
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchStatus(), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStatus]);

  const paperSx = { p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.grey[300]}` };

  const hubOk = stats?.connected;

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SettingsEthernetOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Gateway status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Relay + TruckersHub WebSocket heartbeat.
              {lastPushAt ? ` Last push ${lastPushAt.toLocaleTimeString()}.` : ''}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={<SensorsOutlinedIcon />}
            label={dashboardConnected ? 'Admin stream OK' : 'Admin stream reconnecting'}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: dashboardConnected
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.warning.main, 0.15),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress color="inherit" size={18} /> : <RefreshOutlinedIcon />}
            onClick={fetchStatus}
            disabled={loading}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {loading && !status ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={0} sx={{ ...paperSx, mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              {hubOk ? (
                <CheckCircleOutlineOutlinedIcon color="success" />
              ) : (
                <ErrorOutlineOutlinedIcon color="error" />
              )}
              <Typography variant="subtitle1" fontWeight={700}>
                TruckersHub gateway
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Connected since
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {status?.websocket?.connectedAt
                    ? new Date(status.websocket.connectedAt).toLocaleTimeString()
                    : '—'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Uptime
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {stats?.uptime}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Heartbeat
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {status?.websocket?.heartbeatInterval ?? '—'}s
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Typography variant="caption" color="text.secondary">
                  Active sessions / reconnects
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {stats?.activeSessions ?? 0} drivers · retries {stats?.reconnectAttempts ?? 0}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={paperSx}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Polling controls
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <FormControlLabel
                control={
                  <Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                }
                label="Auto-refresh REST status"
              />
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="ref-int">Interval</InputLabel>
                <Select
                  labelId="ref-int"
                  label="Interval"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  disabled={!autoRefresh}
                >
                  <MenuItem value={2000}>Every 2s</MenuItem>
                  <MenuItem value={5000}>Every 5s</MenuItem>
                  <MenuItem value={10000}>Every 10s</MenuItem>
                  <MenuItem value={30000}>Every 30s</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
}
