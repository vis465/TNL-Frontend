import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import axiosInstance from '../../utils/axios';
import MagicPageShell from '../../components/magicui/MagicPageShell';

function StatusChip({ ok, label }) {
  return <Chip size="small" color={ok ? 'success' : 'default'} variant={ok ? 'filled' : 'outlined'} label={label} />;
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Box>
  );
}

export default function AdminSystemOverview() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/admin/system-info');
      setInfo(data);
    } catch (e) {
      setInfo(null);
      setError(e?.response?.data?.message || 'Failed to load system info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MagicPageShell title="System overview" subtitle="Redacted infrastructure status — no credentials exposed.">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          Maintenance
        </Link>
        <Typography color="text.primary">System</Typography>
      </Breadcrumbs>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button component={RouterLink} to="/admin/operations" startIcon={<ArrowBackOutlined />} size="small">
          All tools
        </Button>
        <Button startIcon={loading ? <CircularProgress size={16} /> : <RefreshOutlined />} size="small" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && !info && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {info && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Application</Typography>
                <InfoRow label="Environment" value={info.app?.nodeEnv} />
                <InfoRow label="Uptime" value={`${info.app?.uptimeSeconds ?? 0}s`} />
                <InfoRow label="RabbitMQ enabled" value={String(info.app?.enableRabbitmq)} />
                <InfoRow label="Job simulator" value={info.app?.allowAdminJobSimulator ? 'enabled' : 'disabled'} />
                <InfoRow label="Worker concurrency (env)" value={info.app?.workerConcurrency} />
                <InfoRow label="Mongoose" value={info.app?.mongooseVersion} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>MongoDB</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <StatusChip ok={info.mongodb?.readyState === 1} label={info.mongodb?.readyStateLabel || 'unknown'} />
                </Stack>
                <InfoRow label="Host" value={info.mongodb?.host} />
                <InfoRow label="Database" value={info.mongodb?.database} />
                {info.mongodb?.authSource && <InfoRow label="Auth source" value={info.mongodb.authSource} />}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Redis</Typography>
                <StatusChip ok={info.redis?.connected} label={info.redis?.connected ? `ping: ${info.redis.ping}` : 'disconnected'} />
                <InfoRow label="Host" value={`${info.redis?.host}:${info.redis?.port}`} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>RabbitMQ</Typography>
                <StatusChip ok={info.rabbitmq?.connected} label={info.rabbitmq?.connected ? 'connected' : 'disconnected'} />
                <InfoRow label="Queue" value={info.rabbitmq?.queueName} />
                <InfoRow label="Messages" value={info.rabbitmq?.messageCount ?? '—'} />
                <InfoRow label="Consumers" value={info.rabbitmq?.consumerCount ?? '—'} />
                <InfoRow label="In-memory fallback" value={info.rabbitmq?.fallbackQueueLength ?? 0} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Integrations</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StatusChip ok={info.integrations?.truckershubApiKeyConfigured} label="TruckersHub API" />
                  <StatusChip ok={info.integrations?.discordWebhookConfigured} label="Discord webhook" />
                  <StatusChip ok={info.integrations?.discordBotTokenConfigured} label="Discord bot" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Counts</Typography>
                <InfoRow label="Total jobs" value={info.counts?.totalJobs} />
                <InfoRow label="Unmapped jobs" value={info.counts?.unmappedJobs} />
                <InfoRow label="File queue (legacy)" value={info.counts?.fileQueueLength} />
                <InfoRow label="RabbitMQ fallback" value={info.counts?.fallbackQueueLength} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </MagicPageShell>
  );
}
