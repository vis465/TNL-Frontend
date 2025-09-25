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
  Pagination
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { Link as RouterLink } from 'react-router-dom';

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Started', value: 'started' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function RiderJobs() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState('');
  const [username, setUsername] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/jobs/public', {
        params: {
          page,
          limit,
          status: status || undefined,
          username: username || undefined,
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
  }, [status, username, dateFrom, dateTo]);

  const applyFilters = () => {
    setPage(1);
    fetchJobs();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Jobs • All Riders</Typography>
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
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
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
                  <TableRow key={j._id} hover component={RouterLink} to={`/jobs/${j.jobID || j._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} size="small" />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}


