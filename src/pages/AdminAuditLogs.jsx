import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axiosInstance from '../utils/axios';

const methodOptions = ['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function AdminAuditLogs() {
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
  }, [method, actor, path, status, from, to]);

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
                onClick={() => {
                  setMethod('');
                  setActor('');
                  setPath('');
                  setStatus('');
                  setFrom('');
                  setTo('');
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
                      color={row.status >= 500 ? 'error' : row.status >= 400 ? 'warning' : 'success'}
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

