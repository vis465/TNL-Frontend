import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import MagicPageShell from '../../components/magicui/MagicPageShell';
import { getCacheStatus, invalidateCache, invalidateAttendanceCache } from '../../services/adminOpsService';

export default function CacheInspector() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setStatus(await getCacheStatus());
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load cache status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runInvalidate = async () => {
    if (!confirm) return;
    setLoading(true);
    setMsg('');
    try {
      let res;
      if (confirm.type === 'attendance') {
        res = await invalidateAttendanceCache(confirm.divisionId);
      } else if (confirm.type === 'revenue') {
        res = await invalidateCache({ scope: 'revenue_config' });
      } else {
        res = await invalidateCache({ pattern: confirm.pattern });
      }
      setMsg(`Done — deleted ${res.deleted ?? 0} key(s)`);
      setConfirm(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalidate failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MagicPageShell title="Cache / Redis inspector" subtitle="Redis health, hit/miss counters, and safe invalidation.">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ArrowBackOutlined fontSize="small" />
            <span>Maintenance tools</span>
          </Stack>
        </Link>
        <Typography color="text.primary">Cache inspector</Typography>
      </Breadcrumbs>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={load} disabled={loading}>
          Refresh status
        </Button>
        <Button variant="outlined" color="warning" onClick={() => setConfirm({ type: 'revenue', label: 'Invalidate in-memory revenue config cache?' })}>
          Invalidate revenue config
        </Button>
        <Button variant="outlined" color="warning" onClick={() => setConfirm({ type: 'attendance', label: 'Invalidate all division attendance caches?' })}>
          Invalidate attendance caches
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {loading && !status && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}

      {status && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontWeight={700}>Redis</Typography>
                <Chip
                  size="small"
                  color={status.redis?.connected ? 'success' : 'error'}
                  label={status.redis?.connected ? `Connected (${status.redis.ping})` : 'Disconnected'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontWeight={700}>Cache lookups</Typography>
                <Typography variant="body2">Hits: {status.metrics?.hits ?? 0}</Typography>
                <Typography variant="body2">Misses: {status.metrics?.misses ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontWeight={700}>Invalidations</Typography>
                <Typography variant="body2">{status.metrics?.invalidations ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Known prefixes — invalidate</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(status.knownPrefixes || []).map((pat) => (
                    <Button
                      key={pat}
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={() => setConfirm({ type: 'pattern', pattern: pat, label: `Invalidate cache pattern "${pat}"?` })}
                    >
                      {pat}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        <DialogTitle>Confirm invalidation</DialogTitle>
        <DialogContent><Typography>{confirm?.label}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={runInvalidate} disabled={loading}>
            Invalidate
          </Button>
        </DialogActions>
      </Dialog>
    </MagicPageShell>
  );
}
