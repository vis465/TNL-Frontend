/**
 * TruckersHub Real-time Driver Dashboard — MUI (matches site theme via AdminLayout)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SatelliteAltOutlinedIcon from '@mui/icons-material/SatelliteAltOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha, useTheme } from '@mui/material/styles';
import { useTelemetryRealtime } from '../context/TelemetryRealtimeContext';

function telemetryFromPayload(data) {
  const raw = data?.raw || {};
  return {
    speed: raw.truck?.speed,
    fuel: raw.truck?.fuel,
    position: raw.truck?.position,
    damage: raw.truck?.damage,
    navigation: raw.navigation,
    job: raw.job,
    truck: raw.truck,
  };
}

export default function TruckersHubDashboard() {
  const theme = useTheme();
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval] = useState(15000);
  const { subscribe, dashboardConnected, lastMessageAt } = useTelemetryRealtime();

  useEffect(() => {
    return subscribe((message) => {
      switch (message.type) {
        case 'STATUS':
          setStatus(message.data);
          break;
        case 'TELEMETRY_UPDATE':
          updateDriverTelemetry(message.data);
          break;
        case 'SPEED_VIOLATION':
          break;
        case 'DRIVER_ONLINE':
        case 'DRIVER_OFFLINE':
          fetchDriversQuiet();
          break;
        default:
          break;
      }
    });
  }, [subscribe]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/telemetry/status');
      const data = await response.json();
      if (data.success) setStatus(data.data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/telemetry/drivers');
      const data = await response.json();

      if (data.success) {
        const driversWithDetails = await Promise.all(
          data.data.drivers.map(async (driver) => {
            try {
              const detailResponse = await fetch(`/api/telemetry/drivers/${driver.riderId}`);
              const detailData = await detailResponse.json();
              if (detailData.success) {
                const d = detailData.data;
                return {
                  ...driver,
                  displayName: driver.displayName || d.displayName,
                  employeeID: driver.employeeID || d.employeeID,
                  truckershubId: driver.truckershubId || d.truckershubId,
                  hubDriverKey: driver.hubDriverKey || d.hubDriverKey,
                  details: d.telemetry,
                };
              }
            } catch (err) {
              console.error(`Error fetching details for ${driver.riderId}:`, err);
            }
            return driver;
          })
        );

        setDrivers(driversWithDetails);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDriversQuiet = useCallback(async () => {
    try {
      const response = await fetch('/api/telemetry/drivers');
      const data = await response.json();
      if (!data.success) return;

      setDrivers((prev) => {
        const prevById = new Map(prev.map((d) => [String(d.riderId), d]));
        return data.data.drivers.map((driver) => {
          const old = prevById.get(String(driver.riderId));
          return old ? { ...driver, details: old.details } : driver;
        });
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateDriverTelemetry = (data) => {
    const { riderId, displayName, employeeID, truckershubId, hubDriverKey } = data;
    const id = String(riderId);
    const details = telemetryFromPayload(data);

    setDrivers((prev) => {
      const idx = prev.findIndex((d) => String(d.riderId) === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        ...(displayName != null ? { displayName } : {}),
        ...(employeeID != null ? { employeeID } : {}),
        ...(truckershubId != null ? { truckershubId } : {}),
        ...(hubDriverKey != null ? { hubDriverKey } : {}),
        details,
        lastUpdate: new Date().toISOString(),
      };
      return next;
    });
  };

  useEffect(() => {
    fetchStatus();
    fetchDrivers();
    const interval = setInterval(() => {
      fetchStatus();
      fetchDrivers();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchDrivers, refreshInterval]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleTimeString();
  };

  const gatewayOk = status?.websocket?.connected;

  const statSx = {
    p: 2,
    borderRadius: 2,
    border: `1px solid ${theme.palette.grey[300]}`,
    height: '100%',
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Fleet overview
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip
            icon={<SatelliteAltOutlinedIcon />}
            label={gatewayOk ? 'Gateway connected' : 'Gateway disconnected'}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: gatewayOk
                ? alpha(theme.palette.success.main, 0.12)
                : alpha(theme.palette.error.main, 0.1),
            }}
          />
          <Chip
            label={dashboardConnected ? 'Relay socket OK' : 'Relay reconnecting'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={statSx}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Active drivers
              </Typography>
              <PeopleOutlineOutlinedIcon fontSize="small" color="action" />
            </Stack>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {status?.activeSessions ?? drivers.length}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={statSx}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Connected since
              </Typography>
              <HubOutlinedIcon fontSize="small" color="action" />
            </Stack>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
              {status?.websocket?.connectedAt ? formatTime(status.websocket.connectedAt) : 'Not connected'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={statSx}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TIME: 
              </Typography>
              <TrendingUpOutlinedIcon fontSize="small" color="action" />
            </Stack>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
              {lastMessageAt ? lastMessageAt.toLocaleTimeString() : '—'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        On the road
      </Typography>

      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : drivers.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.grey[400]}` }}>
          <Typography color="text.secondary">No active telemetry sessions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ensure riders have <strong>TruckersHub ID</strong> (and optionally Steam IDs) populated. AUTH includes all
            <code style={{ margin: '0 4px' }}> truckershubId </code>
            values from your roster via the gateway&nbsp;
            <code>to_drivers</code>.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {drivers.map((driver) => (
            <Grid item xs={12} lg={6} key={String(driver.riderId)}>
              <DriverCard driver={driver} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function barColor(status) {
  if (status === 'violation') return 'error';
  if (status === 'warning') return 'warning';
  return 'success';
}

function DriverCard({ driver }) {
  const theme = useTheme();
  const details = driver.details || {};
  const speed = details.speed?.kph ?? 0;
  const limit = details.navigation?.speedLimit?.kph ?? 90;
  const speedStatus =
    limit && speed > limit + 10 ? 'violation' : limit && speed > limit ? 'warning' : 'normal';
  const fuelPct = details.fuel?.capacity > 0 ? (details.fuel.value / details.fuel.capacity) * 100 : 0;
  const primaryName = driver.displayName || driver.name || driver.username || 'Unknown rider';

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${theme.palette.grey[300]}`, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {primaryName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
            {driver.employeeID ? `Emp ${driver.employeeID} · ` : ''}
            TH {driver.truckershubId || driver.hubDriverKey || '—'}
            {driver.steamId && driver.truckershubId ? ` · Steam ${driver.steamId}` : driver.steamId ? ` · ${driver.steamId}` : ''}
          </Typography>
          <Chip label={driver.game?.toUpperCase() || '—'} size="small" sx={{ mt: 1 }} variant="outlined" />
        </Box>
        <Button
          component={RouterLink}
          to={`/telemetry/driver/${driver.riderId}`}
          variant="contained"
          color="primary"
          size="small"
          endIcon={<ChevronRightIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Details
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Speed ({Math.round(limit)} km/h limit)
      </Typography>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 0.5,
          color:
            speedStatus === 'violation'
              ? theme.palette.error.main
              : speedStatus === 'warning'
                ? theme.palette.warning.dark
                : theme.palette.success.main,
        }}
      >
        {Math.round(speed)} km/h
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min((speed / 120) * 100, 100)}
        color={barColor(speedStatus)}
        sx={{ height: 8, borderRadius: 1, mb: 2 }}
      />

      <Typography variant="caption" color="text.secondary">
        Fuel {fuelPct.toFixed(1)}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(fuelPct, 100)}
        color="info"
        sx={{ height: 6, borderRadius: 1, mb: details.damage?.total !== undefined ? 2 : 0 }}
      />

      {details.damage?.total !== undefined && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Damage {(details.damage.total * 100).toFixed(2)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(details.damage.total * 100, 100)}
            color="warning"
            sx={{ height: 6, borderRadius: 1, mb: 1 }}
          />
        </>
      )}

      {details.job?.cargo?.name && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cargo <strong>{details.job.cargo.name}</strong>
        </Typography>
      )}

      <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
        Updated{' '}
        {driver.lastUpdate ? new Date(driver.lastUpdate).toLocaleTimeString() : '—'}
      </Typography>
    </Paper>
  );
}
