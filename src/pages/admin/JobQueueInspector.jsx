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
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import axiosInstance from '../../utils/axios';
import MagicPageShell from '../../components/magicui/MagicPageShell';

export default function JobQueueInspector() {
  const [status, setStatus] = useState(null);
  const [peek, setPeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statusRes, peekRes] = await Promise.all([
        axiosInstance.get('/admin/job-tools/queue-status'),
        axiosInstance.get('/admin/job-tools/queue-peek', { params: { limit: 15 } }),
      ]);
      setStatus(statusRes.data);
      setPeek(peekRes.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load queue data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (key, fn) => {
    setActionLoading(key);
    setMessage('');
    setError('');
    try {
      const { data } = await fn();
      setMessage(data.message || 'Done');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  const rmq = status?.rabbitmq;
  const fallback = status?.fallbackQueue;

  return (
    <MagicPageShell title="Job queue inspector" subtitle="RabbitMQ depth, peek messages, and fallback drain.">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          Maintenance
        </Link>
        <Typography color="text.primary">Job queue</Typography>
      </Breadcrumbs>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Button component={RouterLink} to="/admin/operations" startIcon={<ArrowBackOutlined />} size="small">
          All tools
        </Button>
        <Button startIcon={loading ? <CircularProgress size={16} /> : <RefreshOutlined />} size="small" onClick={load} disabled={loading}>
          Refresh
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={!!actionLoading}
          onClick={() => runAction('flush', () => axiosInstance.post('/admin/job-tools/queue-flush-fallback'))}
        >
          {actionLoading === 'flush' ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          Flush RabbitMQ fallback
        </Button>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          disabled={!!actionLoading}
          onClick={() => runAction('file', () => axiosInstance.post('/admin/job-tools/queue-process-file'))}
        >
          {actionLoading === 'file' ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          Process legacy file queue
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {status && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Queue status</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`RabbitMQ: ${rmq?.messageCount ?? '?'} msgs`} color={rmq?.connected ? 'success' : 'default'} size="small" />
              <Chip label={`Consumers: ${rmq?.consumerCount ?? '?'}`} size="small" />
              <Chip label={`Fallback: ${fallback?.length ?? 0}`} size="small" color={fallback?.length ? 'warning' : 'default'} />
              <Chip label={`File queue: ${status?.fileQueue?.queueLength ?? 0}`} size="small" />
              <Chip label={status.simulatorEnabled ? 'Simulator on' : 'Simulator off'} size="small" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      )}

      {peek && (
        <>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <VisibilityOutlined fontSize="small" color="action" />
                <Typography variant="subtitle1" fontWeight={600}>RabbitMQ peek (redacted)</Typography>
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Queue ID</TableCell>
                      <TableCell>Job ID</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>Driver TH ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(peek.rabbitmq || []).length === 0 ? (
                      <TableRow><TableCell colSpan={4}><Typography variant="body2" color="text.secondary">Empty</Typography></TableCell></TableRow>
                    ) : (
                      peek.rabbitmq.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.jobID ?? '—'}</TableCell>
                          <TableCell>{row.eventType ?? '—'}</TableCell>
                          <TableCell>{row.driverUserId ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>In-memory fallback</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Job ID</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(peek.fallback || []).length === 0 ? (
                      <TableRow><TableCell colSpan={3}><Typography variant="body2" color="text.secondary">Empty</Typography></TableCell></TableRow>
                    ) : (
                      peek.fallback.map((row, i) => (
                        <TableRow key={`${row.id}-${i}`}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.jobID ?? '—'}</TableCell>
                          <TableCell>{row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !peek && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PlayArrowOutlined color="disabled" sx={{ fontSize: 48 }} />
          <Typography color="text.secondary">No queue data</Typography>
        </Box>
      )}
    </MagicPageShell>
  );
}
