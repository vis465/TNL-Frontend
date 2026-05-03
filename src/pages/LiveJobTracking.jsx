/**
 * Live job tracking — MUI
 */

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ListIcon from '@mui/icons-material/List';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { useTelemetryRealtime } from '../context/TelemetryRealtimeContext';
import { getTelemetryJson } from '../utils/telemetryApiFetch';

export default function LiveJobTrackingPage() {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const { subscribe, dashboardConnected } = useTelemetryRealtime();

  const mergeTelemetryJob = useCallback((data) => {
    const raw = data?.raw || {};
    const jobPayload = raw.job;
    if (!jobPayload) return;

    const id = String(data.riderId);
    setJobs((prev) => {
      const idx = prev.findIndex((j) => String(j.riderId) === id);
      const vehicleSlice = {
        speed: raw.truck?.speed,
        fuel: raw.truck?.fuel,
        damage: raw.truck?.damage,
        navigation: raw.navigation,
        job: jobPayload,
        truck: raw.truck,
      };
      if (idx === -1) {
        return [
          ...prev,
          {
            riderId: data.riderId,
            steamId: data.steamId,
            displayName: data.displayName,
            employeeID: data.employeeID,
            truckershubId: data.truckershubId,
            game: raw.game?.abbreviation,
            job: jobPayload,
            vehicle: vehicleSlice,
            position: raw.truck?.position,
            lastUpdate: new Date().toISOString(),
          },
        ];
      }
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        ...(data.displayName != null ? { displayName: data.displayName } : {}),
        ...(data.employeeID != null ? { employeeID: data.employeeID } : {}),
        ...(data.truckershubId != null ? { truckershubId: data.truckershubId } : {}),
        job: jobPayload,
        vehicle: { ...next[idx].vehicle, ...vehicleSlice },
        position: raw.truck?.position ?? next[idx].position,
        lastUpdate: new Date().toISOString(),
      };
      return next;
    });
  }, []);

  useEffect(() => {
    return subscribe((message) => {
      if (message.type === 'TELEMETRY_UPDATE') mergeTelemetryJob(message.data);
      if (message.type === 'DRIVER_OFFLINE') {
        const id = String(message.data?.riderId);
        setJobs((prev) => prev.filter((j) => String(j.riderId) !== id));
      }
    });
  }, [subscribe, mergeTelemetryJob]);

  const fetchActiveJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTelemetryJson('drivers');

      if (data.success) {
        const driversWithJobs = [];
        await Promise.all(
          data.data.drivers.map(async (driver) => {
            try {
              const detailData = await getTelemetryJson(`drivers/${driver.riderId}`);
              if (detailData.success && detailData.data.telemetry.job) {
                const tel = detailData.data.telemetry;
                driversWithJobs.push({
                  ...driver,
                  job: tel.job,
                  vehicle: tel,
                  position: tel.position,
                });
              }
            } catch (err) {
              console.error(`Error fetching details for ${driver.riderId}:`, err);
            }
          })
        );
        setJobs(driversWithJobs);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching active jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveJobs();
    const interval = setInterval(() => fetchActiveJobs(), 12000);
    return () => clearInterval(interval);
  }, [fetchActiveJobs]);

  const getProgressPercentage = (job, vehicle) => {
    const totalKm = job?.plannedDistance?.km;
    const nav = vehicle?.navigation;
    const remainingKm =
      nav?.remaining?.km ?? nav?.estimatedDistance?.km ?? nav?.distance?.km;
    if (totalKm > 0 && typeof remainingKm === 'number' && remainingKm >= 0) {
      const leg = Math.max(0, totalKm - remainingKm);
      return Math.max(0, Math.min(100, (leg / totalKm) * 100));
    }
    return 0;
  };

  const statPaper = {
    elevation: 0,
    sx: {
      p: 2,
      borderRadius: 2,
      border: `1px solid ${theme.palette.grey[300]}`,
      height: '100%',
    },
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalShippingOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Live jobs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Telemetry API refresh + realtime merges via WebSocket.
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={<SensorsOutlinedIcon />}
          label={dashboardConnected ? 'Realtime merges on' : 'Socket reconnecting'}
          size="small"
          sx={{
            fontWeight: 600,
            alignSelf: 'flex-start',
            bgcolor: dashboardConnected
              ? alpha(theme.palette.success.main, 0.12)
              : alpha(theme.palette.warning.main, 0.15),
          }}
        />
      </Stack>

      

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper {...statPaper}>
            <Typography variant="caption" color="text.secondary">
              Active jobs
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {jobs.length}
            </Typography>
          </Paper>
        </Grid>
       
        
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'list' ? (
        <JobList jobs={jobs} getProgressPercentage={getProgressPercentage} onSelectJob={setSelectedJob} />
      ) : viewMode === 'detail' && selectedJob ? (
        <JobDetail job={selectedJob} getProgressPercentage={getProgressPercentage} />
      ) : (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: `1px dashed ${theme.palette.grey[400]}` }}>
          <MapOutlinedIcon sx={{ fontSize: 48, color: theme.palette.grey[400] }} />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Map view not implemented yet.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

function JobList({ jobs, getProgressPercentage, onSelectJob }) {
  const theme = useTheme();
  if (!jobs.length) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: `1px dashed ${theme.palette.grey[400]}` }}>
        <Typography color="text.secondary">No drivers with active job telemetry.</Typography>
      </Paper>
    );
  }
  return (
    <Stack spacing={2}>
      {jobs.map((job) => {
        const pct = getProgressPercentage(job.job, job.vehicle);
        return (
          <Paper
            key={job.riderId}
            elevation={0}
            onClick={() => onSelectJob(job)}
            sx={{
              p: 2.5,
              border: `1px solid ${theme.palette.grey[300]}`,
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {job.displayName || `Driver (${String(job.steamId || '').slice(-8)})`}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'mono' }}>
                  {job.employeeID ? `Emp ${job.employeeID} · ` : ''}
                  TH {job.truckershubId || '—'} {job.steamId ? `· Steam ${job.steamId}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {job.job.source?.city?.name} → {job.job.destination?.city?.name}
                </Typography>
              </Box>
              <Stack alignItems="flex-end" spacing={0.5}>
                <Typography variant="h6" fontWeight={700} color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AttachMoneyOutlinedIcon fontSize="small" />
                  {job.job.income}
                </Typography>
                <Typography variant="caption">{job.job.plannedDistance?.km} km</Typography>
              </Stack>
            </Stack>
            <DividerLine />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {job.job.cargo?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {job.job.cargo?.mass} kg · cargo damage {(job.job.cargo?.damage * 100).toFixed(2)}%
            </Typography>
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Metric label="Speed" value={`${job.vehicle?.speed?.kph || 0} km/h`} />
              </Grid>
              <Grid item xs={4}>
                <Metric
                  label="Fuel"
                  value={`${(((job.vehicle?.fuel?.value || 0) / (job.vehicle?.fuel?.capacity || 1)) * 100).toFixed(0)}%`}
                />
              </Grid>
              <Grid item xs={4}>
                <Metric
                  label="Damage"
                  value={`${((job.vehicle?.damage?.total || 0) * 100).toFixed(1)}%`}
                />
              </Grid>
            </Grid>
           
          </Paper>
        );
      })}
    </Stack>
  );
}

function Metric({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Paper>
  );
}

function DividerLine() {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 1.5 }} />
  );
}

function JobDetail({ job, getProgressPercentage }) {
  const theme = useTheme();
  const pct = getProgressPercentage(job.job, job.vehicle);
  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[300]}` }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Job summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {job.displayName || 'Driver'}
          {job.employeeID ? ` · Emp ${job.employeeID}` : ''}{' '}
          {job.steamId ? <span style={{ fontFamily: 'monospace' }}>{job.steamId}</span> : null}{' '}
          {job.truckershubId ? `· TH ${job.truckershubId}` : ''}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Cargo
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {job.job.cargo?.name}
            </Typography>
          </Grid>
          <Grid item xs={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Income
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              €{job.job.income}
            </Typography>
          </Grid>
          <Grid item xs={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Distance
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {job.job.plannedDistance?.km} km
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Progress ({pct.toFixed(0)}%)
        </Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ mt: 0.5, height: 8, borderRadius: 2 }} />
      </Paper>
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.grey[300]}` }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Route
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          From <strong>{job.job.source?.city?.name}</strong>
        </Typography>
        <Typography variant="body1">
          To <strong>{job.job.destination?.city?.name}</strong>
        </Typography>
      </Paper>
    </Stack>
  );
}
