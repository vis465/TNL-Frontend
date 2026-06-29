import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axiosInstance from '../utils/axios';

const methodOptions = ['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const PRESETS = [
  { id: '', label: 'All' },
  { id: 'job_tools', label: 'Job tools' },
  { id: 'bank_ops', label: 'Bank ops' },
  { id: 'wallet_ops', label: 'Wallet ops' },
  { id: 'cache_ops', label: 'Cache ops' },
  { id: 'admin_mutations', label: 'Mutations' },
  { id: 'errors', label: 'Errors' },
  { id: 'cargo_rates', label: 'Cargo rates' },
];

function statusColor(status) {
  if (status >= 500) return 'error';
  if (status >= 400) return 'error';
  if (status >= 200 && status < 300) return 'success';
  return 'default';
}

export default function AdminAuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [method, setMethod] = useState('');
  const [actor, setActor] = useState('');
  const [path, setPath] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [preset, setPreset] = useState(searchParams.get('preset') || '');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const load = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/audit-logs', {
        params: {
          page,
          limit,
          method: method || undefined,
          actor: actor || undefined,
          path: path || undefined,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          preset: preset || undefined,
        },
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data?.message || 'Failed to load audit logs');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(1);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, actor, path, status, from, to, preset]);

  useEffect(() => {
    const p = searchParams.get('preset') || '';
    if (p !== preset) setPreset(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const applyPreset = (id) => {
    setPreset(id);
    if (id) setSearchParams({ preset: id });
    else setSearchParams({});
    setPage(1);
  };

  const summarizeChange = (row) => {
    const base = `${row.method || 'REQ'} ${row.path || '/'}`;
    if ((row.method || '').toUpperCase() === 'GET') return `Viewed ${base}`;
    return `Changed ${base}`;
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', px: 3, py: 2 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Audit logs
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {PRESETS.map((p) => (
          <Chip
            key={p.id || 'all'}
            label={p.label}
            clickable
            color={preset === p.id ? 'primary' : 'default'}
            variant={preset === p.id ? 'filled' : 'outlined'}
            onClick={() => applyPreset(p.id)}
          />
        ))}
      </Stack>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select label="Method" fullWidth size="small" value={method} onChange={(e) => setMethod(e.target.value)}>
                {methodOptions.map((m) => (
                  <MenuItem key={m || 'all'} value={m}>{m || 'All'}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Actor username" fullWidth size="small" value={actor} onChange={(e) => setActor(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Path contains" fullWidth size="small" value={path} onChange={(e) => setPath(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="HTTP status" fullWidth size="small" value={status} onChange={(e) => setStatus(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setMethod('');
                  setActor('');
                  setPath('');
                  setStatus('');
                  setFrom('');
                  setTo('');
                  setPreset('');
                  setSearchParams({});
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField type="date" label="From" fullWidth size="small" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField type="date" label="To" fullWidth size="small" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Change log</Typography>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} size="small" />
          </Stack>
          <Stack spacing={1}>
            {items.map((row) => (
              <Accordion key={row._id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    alignItems={{ md: 'center' }}
                    sx={{ width: '100%' }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                      {summarizeChange(row)}
                    </Typography>
                    <Chip
                      size="small"
                      label={row.actor?.username || 'anonymous'}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={String(row.status)}
                      color={statusColor(row.status)}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">Time</Typography>
                      <Typography variant="body2">{new Date(row.createdAt).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary">Method</Typography>
                      <Typography variant="body2">{row.method || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Path</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{row.path || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                      <Typography variant="body2">{row.durationMs || 0} ms</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">Role</Typography>
                      <Typography variant="body2">{row.actor?.role || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="caption" color="text.secondary">IP</Typography>
                      <Typography variant="body2">{row.ip || '—'}</Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            {!items.length && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No audit logs found.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
