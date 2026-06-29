import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import PreviewOutlined from '@mui/icons-material/PreviewOutlined';
import ReplayOutlined from '@mui/icons-material/ReplayOutlined';
import axiosInstance from '../../utils/axios';
import MagicPageShell from '../../components/magicui/MagicPageShell';

const EVENT_TYPES = [
  { value: 'job.delivered', label: 'job.delivered' },
  { value: 'job.started', label: 'job.started' },
  { value: 'job.updated', label: 'job.updated' },
];

const REPLAY_FLAGS = [
  { value: 'statsApplied', label: 'Leaderboard stats' },
  { value: 'progressionApplied', label: 'Driver progression' },
  { value: 'fleetOdometerApplied', label: 'Fleet odometer' },
  { value: 'aggApplied', label: 'Read-model projection' },
];

const STEP_COLOR = {
  done: 'success',
  pending: 'warning',
  skipped: 'default',
};

function buildSimPayload(form) {
  return {
    jobID: form.jobID ? Number(form.jobID) : undefined,
    eventType: form.eventType,
    driverUserId: form.driverUserId ? Number(form.driverUserId) : undefined,
    driverUsername: form.driverUsername || undefined,
    distanceKm: Number(form.distanceKm) || undefined,
    revenueEur: Number(form.revenueEur) || undefined,
    sourceCity: form.sourceCity || undefined,
    destCity: form.destCity || undefined,
    cargoName: form.cargoName || undefined,
    cargoDamagePct: form.cargoDamagePct !== '' ? Number(form.cargoDamagePct) : undefined,
    truckBrand: form.truckBrand || undefined,
    truckModel: form.truckModel || undefined,
    multiplayerType: form.multiplayerType || undefined,
    autoParked: form.autoParked,
    topSpeedKmh: form.topSpeedKmh !== '' ? Number(form.topSpeedKmh) : undefined,
    fuelPercent: form.fuelPercent !== '' ? Number(form.fuelPercent) : undefined,
    status: form.status || undefined,
  };
}

const defaultForm = {
  jobID: '',
  eventType: 'job.delivered',
  driverUserId: '',
  driverUsername: '',
  distanceKm: '120',
  revenueEur: '8500',
  sourceCity: 'Sim City A',
  destCity: 'Sim City B',
  cargoName: 'Simulated Cargo',
  cargoDamagePct: '0',
  truckBrand: 'Volvo',
  truckModel: 'FH16',
  multiplayerType: 'singleplayer',
  autoParked: false,
  topSpeedKmh: '90',
  fuelPercent: '50',
  status: 'delivered',
};

export default function JobWorkflowDebugger() {
  const [form, setForm] = useState(defaultForm);
  const [confirmSimulate, setConfirmSimulate] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [error, setError] = useState('');
  const [simulatorEnabled, setSimulatorEnabled] = useState(null);
  const pollRef = useRef(null);

  const [replayJobId, setReplayJobId] = useState('');
  const [replayFlags, setReplayFlags] = useState(['statsApplied']);
  const [replayPreview, setReplayPreview] = useState(null);
  const [replayConfirm, setReplayConfirm] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.get('/admin/job-tools/queue-status');
        if (!cancelled) {
          setSimulatorEnabled(data.simulatorEnabled);
          if (!form.jobID && data.suggestedTestJobId) {
            setForm((f) => ({ ...f, jobID: String(data.suggestedTestJobId) }));
          }
        }
      } catch (_) {
        if (!cancelled) setSimulatorEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWorkflow = useCallback(async (jobId, meta = {}) => {
    const params = {};
    if (meta.submittedAt) params.submittedAt = meta.submittedAt;
    if (meta.queueId) params.queueId = meta.queueId;
    if (meta.enqueued) params.enqueued = 'true';
    const { data } = await axiosInstance.get(`/admin/job-tools/workflow/${jobId}`, { params });
    setWorkflow(data);
    return data;
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId, meta) => {
    stopPolling();
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const snap = await fetchWorkflow(jobId, meta);
        if (snap.complete || attempts >= 60) stopPolling();
      } catch (_) {
        if (attempts >= 60) stopPolling();
      }
    };
    poll();
    pollRef.current = setInterval(poll, 2000);
  };

  useEffect(() => () => stopPolling(), []);

  const runPreview = async () => {
    setPreviewing(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/admin/job-tools/preview', buildSimPayload(form));
      setPreview(data);
      if (data.jobID) await fetchWorkflow(data.jobID);
    } catch (e) {
      setPreview(null);
      setError(e?.response?.data?.message || 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  };

  const runSimulate = async () => {
    if (!confirmSimulate) {
      setError('Check the confirmation box before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/admin/job-tools/simulate', {
        ...buildSimPayload(form),
        confirm: true,
      });
      setSubmitResult(data);
      startPolling(data.jobID, {
        submittedAt: data.submittedAt,
        queueId: data.queueId,
        enqueued: data.enqueued,
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const runReplayPreview = async () => {
    setError('');
    setReplaying(true);
    try {
      const { data } = await axiosInstance.post('/admin/job-tools/replay', {
        jobID: Number(replayJobId),
        resetFlags: replayFlags,
        confirm: false,
      });
      setReplayPreview(data.preview || data);
    } catch (e) {
      setReplayPreview(null);
      setError(e?.response?.data?.message || 'Replay preview failed');
    } finally {
      setReplaying(false);
    }
  };

  const runReplay = async () => {
    if (!replayConfirm) {
      setError('Confirm replay before submitting.');
      return;
    }
    setReplaying(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/admin/job-tools/replay', {
        jobID: Number(replayJobId),
        resetFlags: replayFlags,
        confirm: true,
      });
      setSubmitResult(data);
      startPolling(data.jobID, {
        submittedAt: data.submittedAt,
        queueId: data.queueId,
        enqueued: data.enqueued,
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Replay failed');
    } finally {
      setReplaying(false);
    }
  };

  const lookupWorkflow = async () => {
    const id = form.jobID || replayJobId;
    if (!id) return;
    setError('');
    try {
      await fetchWorkflow(Number(id));
    } catch (e) {
      setError(e?.response?.data?.message || 'Workflow lookup failed');
    }
  };

  const activeStep = workflow?.steps?.findIndex((s) => s.status === 'pending') ?? -1;

  return (
    <MagicPageShell
      title="Job workflow debugger"
      subtitle="Preview synthetic jobs, enqueue via RabbitMQ, and watch pipeline steps."
    >
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          Maintenance
        </Link>
        <Typography color="text.primary">Job workflow</Typography>
      </Breadcrumbs>

      <Button component={RouterLink} to="/admin/operations" startIcon={<ArrowBackOutlined />} size="small" sx={{ mb: 2 }}>
        All tools
      </Button>

      {simulatorEnabled === false && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Simulator is disabled on the server. Set <code>ALLOW_ADMIN_JOB_SIMULATOR=true</code> to enable preview and submit.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Synthetic job form
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Job ID (test range)"
                type="number"
                fullWidth
                size="small"
                value={form.jobID}
                onChange={(e) => update('jobID', e.target.value)}
                helperText="900000000–999999999"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select label="Event type" fullWidth size="small" value={form.eventType} onChange={(e) => update('eventType', e.target.value)}>
                {EVENT_TYPES.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Driver TruckersHub ID"
                type="number"
                fullWidth
                size="small"
                value={form.driverUserId}
                onChange={(e) => update('driverUserId', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Driver username" fullWidth size="small" value={form.driverUsername} onChange={(e) => update('driverUsername', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Distance (km)" type="number" fullWidth size="small" value={form.distanceKm} onChange={(e) => update('distanceKm', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Revenue (EUR)" type="number" fullWidth size="small" value={form.revenueEur} onChange={(e) => update('revenueEur', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Source city" fullWidth size="small" value={form.sourceCity} onChange={(e) => update('sourceCity', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Dest city" fullWidth size="small" value={form.destCity} onChange={(e) => update('destCity', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Cargo" fullWidth size="small" value={form.cargoName} onChange={(e) => update('cargoName', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Truck" fullWidth size="small" value={`${form.truckBrand} / ${form.truckModel}`} disabled />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={previewing ? <CircularProgress size={16} /> : <PreviewOutlined />} onClick={runPreview} disabled={previewing || submitting}>
              Preview
            </Button>
            <FormControlLabel
              control={<Checkbox checked={confirmSimulate} onChange={(e) => setConfirmSimulate(e.target.checked)} />}
              label="I understand this will credit wallets / update stats"
            />
            <Button
              variant="contained"
              color="warning"
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PlayArrowOutlined />}
              onClick={runSimulate}
              disabled={submitting || previewing || simulatorEnabled === false}
            >
              Submit via webhook queue
            </Button>
            <Button variant="text" onClick={lookupWorkflow}>Lookup workflow</Button>
          </Stack>
        </CardContent>
      </Card>

      {preview && (
        <Accordion variant="outlined" sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <Typography fontWeight={600}>Preview result</Typography>
            {preview.rider ? (
              <Chip size="small" color="success" label={`Rider: ${preview.rider.name}`} sx={{ ml: 2 }} />
            ) : (
              <Chip size="small" color="warning" label="No rider match" sx={{ ml: 2 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box component="pre" sx={{ fontSize: 12, overflow: 'auto', m: 0 }}>
              {JSON.stringify(preview, null, 2)}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {workflow && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Workflow timeline — job {workflow.jobID}
              </Typography>
              {workflow.complete && <Chip size="small" color="success" label="Complete" />}
            </Stack>
            <Stepper activeStep={activeStep >= 0 ? activeStep : workflow.steps.length} orientation="vertical">
              {workflow.steps.map((step) => (
                <Step key={step.id} completed={step.status === 'done'}>
                  <StepLabel
                    error={false}
                    optional={
                      <Chip size="small" color={STEP_COLOR[step.status] || 'default'} label={step.status} />
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {submitResult && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Enqueued job {submitResult.jobID} (queue: {submitResult.queueId || 'n/a'}). Polling workflow every 2s…
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Replay existing job
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Job ID"
                type="number"
                fullWidth
                size="small"
                value={replayJobId}
                onChange={(e) => setReplayJobId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {REPLAY_FLAGS.map((f) => (
                  <FormControlLabel
                    key={f.value}
                    control={
                      <Checkbox
                        size="small"
                        checked={replayFlags.includes(f.value)}
                        onChange={(e) => {
                          setReplayFlags((prev) =>
                            e.target.checked ? [...prev, f.value] : prev.filter((x) => x !== f.value)
                          );
                        }}
                      />
                    }
                    label={f.label}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" startIcon={<PreviewOutlined />} onClick={runReplayPreview} disabled={replaying}>
                  Preview replay
                </Button>
                <FormControlLabel
                  control={<Checkbox checked={replayConfirm} onChange={(e) => setReplayConfirm(e.target.checked)} />}
                  label="Confirm re-enqueue"
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={replaying ? <CircularProgress size={16} /> : <ReplayOutlined />}
                  onClick={runReplay}
                  disabled={replaying || simulatorEnabled === false}
                >
                  Replay via queue
                </Button>
              </Stack>
            </Grid>
          </Grid>
          {replayPreview && (
            <Box component="pre" sx={{ fontSize: 12, overflow: 'auto', mt: 2, mb: 0 }}>
              {JSON.stringify(replayPreview, null, 2)}
            </Box>
          )}
        </CardContent>
      </Card>
    </MagicPageShell>
  );
}
