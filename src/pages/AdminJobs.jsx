import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import axiosInstance from '../utils/axios';

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Started', value: 'started' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AdminJobs() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState('');
  const [username, setUsername] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [unmapped, setUnmapped] = useState(false);

  // Import progress + dead letters
  const [progress, setProgress] = useState(null);
  const [deadLetters, setDeadLetters] = useState([]);
  const [deadLettersTotal, setDeadLettersTotal] = useState(0);
  const [deadLettersPage, setDeadLettersPage] = useState(1);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [olderThanMonths, setOlderThanMonths] = useState('');
  const [withinLastMonths, setWithinLastMonths] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [deletePreview, setDeletePreview] = useState(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/jobs', {
        params: {
          page,
          limit,
          status: status || undefined,
          username: username || undefined,
          unmapped: unmapped || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    // refetch on filter changes
    setPage(1);
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, username, dateFrom, dateTo, unmapped]);

  const fetchProgress = async () => {
    try {
      const { data } = await axiosInstance.get('/jobs/import/progress');
      setProgress(data);
    } catch (e) { console.error(e); }
  };

  const fetchDeadLetters = async () => {
    try {
      const { data } = await axiosInstance.get('/jobs/deadletters', { params: { page: deadLettersPage, limit: 10 } });
      setDeadLetters(data.items || []);
      setDeadLettersTotal(data.total || 0);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchProgress();
    fetchDeadLetters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadLettersPage]);

  const applyFilters = () => {
    setPage(1);
    fetchJobs();
  };

  const handleDeletePreview = async () => {
    try {
      const { data } = await axiosInstance.delete('/jobs', {
        data: {
          status: status || undefined,
          username: username || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          olderThanMonths: olderThanMonths ? Number(olderThanMonths) : undefined,
          withinLastMonths: withinLastMonths ? Number(withinLastMonths) : undefined,
          dryRun: true,
        },
      });
      setDeletePreview(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const { data } = await axiosInstance.delete('/jobs', {
        data: {
          status: status || undefined,
          username: username || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          olderThanMonths: olderThanMonths ? Number(olderThanMonths) : undefined,
          withinLastMonths: withinLastMonths ? Number(withinLastMonths) : undefined,
          dryRun: false,
        },
      });
      setDeletePreview(data);
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const runImport = async (dry = true) => {
    try {
      await axiosInstance.post('/jobs/import/run', { dryRun: dry });
      await fetchProgress();
      await fetchJobs();
    } catch (e) { console.error(e); }
  };

  const linkAll = async () => {
    try {
      await axiosInstance.post('/jobs/link/all', { dryRun: false });
      await fetchProgress();
      await fetchJobs();
    } catch (e) { console.error(e); }
  };

  const retryDeadLetter = async (id) => {
    try {
      await axiosInstance.post(`/jobs/import/retry/${id}`);
      await fetchProgress();
      await fetchDeadLetters();
    } catch (e) { console.error(e); }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Admin • Job Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="error" onClick={() => { setDeleteOpen(true); setDeletePreview(null); }}>Bulk Delete…</Button>
        </Stack>
      </Stack>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField select label="Status" fullWidth size="small" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Username" fullWidth size="small" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="date" label="From" fullWidth size="small" InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="date" label="To" fullWidth size="small" InputLabelProps={{ shrink: true }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={applyFilters}>Apply</Button>
                <Button variant="outlined" onClick={() => { setStatus(''); setUsername(''); setDateFrom(''); setDateTo(''); setPage(1); }}>Reset</Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel control={<Checkbox checked={unmapped} onChange={(e) => setUnmapped(e.target.checked)} />} label="Show unmapped only" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Import Progress */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Legacy Import • Progress</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={() => runImport(true)}>Dry Run</Button>
              <Button size="small" variant="contained" onClick={() => runImport(false)}>Run Import</Button>
              <Button size="small" variant="contained" color="secondary" onClick={linkAll}>Link All</Button>
              <Button size="small" onClick={fetchProgress}>Refresh</Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Legacy Total</Typography><Typography variant="h6">{progress?.legacyTotal ?? '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Imported Jobs</Typography><Typography variant="h6">{progress?.jobsTotal ?? '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Unmapped Jobs</Typography><Typography variant="h6">{progress?.unmappedJobs ?? '-'}</Typography></Grid>
            <Grid item xs={6} md={3}><Typography variant="body2" color="text.secondary">Dead Letters</Typography><Typography variant="h6">{progress?.deadLetters ?? '-'}</Typography></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Jobs</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField select size="small" label="Per page" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} sx={{ width: 120 }}>
                {[10,20,50,100].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </TextField>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" size="small" />
            </Stack>
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>From → To</TableCell>
                  <TableCell align="right">Distance</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((j) => (
                  <TableRow key={j._id} hover>
                    <TableCell>{j.jobID || '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={j.status} color={j.status === 'delivered' ? 'success' : (j.status === 'started' ? 'warning' : 'default')} variant="outlined" />
                    </TableCell>
                    <TableCell>{j.driver?.username || '-'}</TableCell>
                    <TableCell>{j.source?.city?.name || '-'} → {j.destination?.city?.name || '-'}</TableCell>
                    <TableCell align="right">{j.distanceDriven || 0}</TableCell>
                    <TableCell align="right">${j.revenue || j.income || 0}</TableCell>
                    <TableCell>{new Date(j.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">No jobs found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" />
          </Stack>
        </CardContent>
      </Card>

      {/* Dead Letters */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Dead Letters</Typography>
            <Pagination count={Math.max(1, Math.ceil(deadLettersTotal / 10))} page={deadLettersPage} onChange={(_, p) => setDeadLettersPage(p)} shape="rounded" size="small" />
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>jobID</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deadLetters.map(dl => (
                  <TableRow key={dl._id} hover>
                    <TableCell>{dl.jobID || '-'}</TableCell>
                    <TableCell>{dl.reason || '-'}</TableCell>
                    <TableCell>{dl.error || '-'}</TableCell>
                    <TableCell>{new Date(dl.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right"><Button size="small" variant="contained" onClick={() => retryDeadLetter(dl._id)}>Retry</Button></TableCell>
                  </TableRow>
                ))}
                {deadLetters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center"><Typography variant="body2" color="text.secondary">No dead letters.</Typography></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Delete Jobs</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">Choose a quick rule or date range. You can preview the count before deleting.</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField type="number" label="Older than (months)" fullWidth size="small" value={olderThanMonths} onChange={(e) => setOlderThanMonths(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="number" label="Within last (months)" fullWidth size="small" value={withinLastMonths} onChange={(e) => setWithinLastMonths(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="From" fullWidth size="small" InputLabelProps={{ shrink: true }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="To" fullWidth size="small" InputLabelProps={{ shrink: true }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField select label="Status (optional)" fullWidth size="small" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {statusOptions.map(o => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Username (optional)" fullWidth size="small" value={username} onChange={(e) => setUsername(e.target.value)} />
              </Grid>
            </Grid>
            <Divider />
            <FormControlLabel control={<Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />} label="Dry run (preview only)" />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleDeletePreview}>Preview Count</Button>
              <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={dryRun}>Delete</Button>
            </Stack>
            {deletePreview && (
              <Typography variant="body2">Matched: {deletePreview.matchedCount} • Deleted: {deletePreview.deletedCount} {deletePreview.dryRun ? '(dry run)' : ''}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


