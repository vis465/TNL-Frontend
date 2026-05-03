/**
 * Driver telemetry detail — matches admin MUI shell
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LocalGasStationOutlinedIcon from '@mui/icons-material/LocalGasStationOutlined';
import CarCrashOutlinedIcon from '@mui/icons-material/CarCrashOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';

function TelemetrySection({ title, icon: IconComp, children }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.grey[300]}`,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderBottom: `1px solid ${theme.palette.grey[300]}`,
        }}
      >
        <IconComp fontSize="small" color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  );
}

function MetricBlock({ title, icon: IconComp, primary, caption, footer, progress }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 2, height: '100%', borderRadius: 2, borderColor: theme.palette.grey[300] }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
        <IconComp fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" fontWeight={700} color="primary" sx={{ lineHeight: 1.15 }}>
        {primary}
      </Typography>
      {caption ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {caption}
        </Typography>
      ) : null}
      {progress != null ? (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 999 }} />
        </Box>
      ) : null}
      {footer}
    </Paper>
  );
}

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ py: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ ml: 2, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function DriverTelemetryPage() {
  const theme = useTheme();
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDriverDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/telemetry/drivers/${riderId}`);
      const data = await response.json();
      if (data.success) {
        setDriver(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch driver data');
      }
    } catch (err) {
      console.error('Error fetching driver details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchDriverDetails();
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchDriverDetails(), 3000);
    return () => clearInterval(interval);
  }, [riderId, autoRefresh, fetchDriverDetails]);

  if (loading && !driver) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !driver) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate('/telemetry')}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Back to live map
        </Button>
        <Alert severity="error">{error || 'Driver not found'}</Alert>
      </Box>
    );
  }

  const telemetry = driver.telemetry || {};
  const speedKph = telemetry.speed?.kph ?? 0;
  const fuelCap = telemetry.fuel?.capacity || 1;
  const fuelVal = telemetry.fuel?.value || 0;
  const fuelPct = Math.min(100, (fuelVal / fuelCap) * 100);
  const dmg = telemetry.damage || {};
  const hasTelemetry =
    !!(telemetry.speed || telemetry.position || telemetry.truck?.model || telemetry.job);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: 14 }} />}
        onClick={() => navigate('/telemetry')}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        Back to live map
      </Button>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <SensorsOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {driver.displayName || 'Driver telemetry'}
            </Typography>
          </Stack>
          <Stack direction="row" flexWrap="wrap" spacing={1} alignItems="center">
            {driver.employeeID ? (
              <Chip size="small" label={`Employee ${driver.employeeID}`} sx={{ fontWeight: 600 }} />
            ) : null}
            {driver.truckershubId ? (
              <Chip
                size="small"
                variant="outlined"
                label={`Hub ${driver.truckershubId}`}
                sx={{ fontWeight: 600 }}
              />
            ) : null}
            <Typography variant="body2" color="text.secondary" component="span">
              Steam <Box component="span" sx={{ fontFamily: 'monospace' }}>{driver.steamId}</Box>
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
            label="Auto-refresh"
          />
          <Button variant="contained" color="primary" onClick={fetchDriverDetails} disabled={loading} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {!hasTelemetry ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Session is active (online on TruckersHub) but telemetry packets have not arrived yet. Toggle auto-refresh
          or wait for the game client to push player data.
        </Alert>
      ) : null}

      <Stack spacing={2}>
        <TelemetrySection title="Vehicle status" icon={SpeedOutlinedIcon}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <MetricBlock
                title="Speed"
                icon={SpeedOutlinedIcon}
                primary={
                  <>
                    {speedKph}
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                      km/h
                    </Typography>
                  </>
                }
                caption={`${telemetry.speed?.mph ?? 0} mph · ${telemetry.speed?.value?.toFixed(2) ?? 0} m/s`}
                progress={Math.min(100, (speedKph / 120) * 100)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricBlock
                title="Fuel"
                icon={LocalGasStationOutlinedIcon}
                primary={
                  <>
                    {fuelPct.toFixed(1)}
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.25 }}>
                      %
                    </Typography>
                  </>
                }
                caption={`${fuelVal.toFixed(1)} L / ${fuelCap} L`}
                progress={fuelPct}
                footer={
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Range{' '}
                    {telemetry.fuel?.range != null
                      ? typeof telemetry.fuel.range === 'number'
                        ? `${telemetry.fuel.range.toFixed(0)} km`
                        : `${telemetry.fuel.range} km`
                      : '—'}
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricBlock
                title="Damage"
                icon={CarCrashOutlinedIcon}
                primary={
                  <>
                    {((dmg.total ?? 0) * 100).toFixed(2)}
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.25 }}>
                      %
                    </Typography>
                  </>
                }
                caption="Chassis / engine / wheels"
                footer={
                  <Stack sx={{ mt: 1 }} spacing={0}>
                    <DetailRow label="Chassis" value={`${((dmg.chassis ?? 0) * 100).toFixed(2)}%`} />
                    <DetailRow label="Engine" value={`${((dmg.engine ?? 0) * 100).toFixed(2)}%`} />
                    <DetailRow label="Wheels" value={`${((dmg.wheels ?? 0) * 100).toFixed(2)}%`} />
                  </Stack>
                }
              />
            </Grid>
          </Grid>
        </TelemetrySection>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <TelemetrySection title="Current location" icon={PlaceOutlinedIcon}>
              {telemetry.position ? (
                <Stack spacing={2}>
                  <Grid container spacing={1}>
                    {['X', 'Y', 'Z'].map((axis) => (
                      <Grid item xs={4} key={axis}>
                        <Typography variant="caption" color="text.secondary">
                          {axis}
                        </Typography>
                        <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
                          {telemetry.position[axis]?.toFixed(2)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {telemetry.location ? (
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: theme.palette.grey[300] }}>
                      <Typography variant="caption" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {telemetry.location.city?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distance {telemetry.location.distance?.toFixed(1)} km
                      </Typography>
                    </Paper>
                  ) : null}
                </Stack>
              ) : (
                <Typography color="text.secondary">No position data available</Typography>
              )}
            </TelemetrySection>
          </Grid>
          <Grid item xs={12} lg={6}>
            <TelemetrySection title="Current job" icon={Inventory2OutlinedIcon}>
              {telemetry.job ? (
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">Income</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {telemetry.job.income}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cargo
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {telemetry.job.cargo?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {telemetry.job.cargo?.mass} kg ({telemetry.job.cargo?.unitMass} kg/unit)
                    </Typography>
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                      Damage {((telemetry.job.cargo?.damage ?? 0) * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        From
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {telemetry.job.source?.city?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        To
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {telemetry.job.destination?.city?.name}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2">
                    Planned distance{' '}
                    <Box component="span" fontWeight={700} color="primary.main">
                      {telemetry.job.plannedDistance?.km} km
                    </Box>
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">No active job</Typography>
              )}
            </TelemetrySection>
          </Grid>
        </Grid>

        <TelemetrySection title="Vehicle details" icon={LocalShippingOutlinedIcon}>
          <Grid container spacing={1.5}>
            {[
              { label: 'Make', value: telemetry.truck?.make?.name || 'Unknown' },
              { label: 'Model', value: telemetry.truck?.model?.name || 'Unknown' },
              {
                label: 'License plate',
                value: telemetry.truck?.licensePlate?.value || 'N/A',
              },
              {
                label: 'Odometer',
                value:
                  telemetry.truck?.odometer != null ? `${telemetry.truck.odometer.toFixed(0)} km` : '—',
              },
            ].map((row) => (
              <Grid item xs={6} md={3} key={row.label}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: theme.palette.grey[300], height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }} noWrap title={String(row.value)}>
                    {row.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TelemetrySection>

        <Paper elevation={0} sx={{ ...paperSx(theme), px: 2, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <ScheduleOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Last updated
              </Typography>
            </Stack>
            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
              {driver.lastUpdate ? new Date(driver.lastUpdate).toLocaleString() : '—'}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

function paperSx(theme) {
  return {
    borderRadius: 2,
    border: `1px solid ${theme.palette.grey[300]}`,
  };
}
