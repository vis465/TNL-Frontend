import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import axiosInstance from '../utils/axios';

const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

function formatNumber(n) {
  return Number(n || 0).toLocaleString();
}

export default function AdminVtcMonthlyStats() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.jobs += Number(row.jobs || 0);
        acc.distance += Number(row.distance || 0);
        acc.income += Number(row.income || 0);
        return acc;
      },
      { jobs: 0, distance: 0, income: 0 }
    );
  }, [rows]);

  const loadData = async ({ refresh = false } = {}) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axiosInstance.get('/truckershub/vtc/monthly-stats', {
        params: { month, year, refresh: refresh ? 'true' : undefined },
      });
      setRows(Array.isArray(data?.data) ? data.data : []);
      setMeta({
        source: data?.source || 'unknown',
        stale: Boolean(data?.stale),
        fetchedAt: data?.fetchedAt || null,
        changedAt: data?.changedAt || null,
        count: Number(data?.count || 0),
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load monthly VTC stats');
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Monthly VTC Performance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Month index uses TruckersHub format: January = 0, December = 11.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            select
            label="Month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            SelectProps={{ native: true }}
            size="small"
            sx={{ minWidth: 200 }}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} ({m.value})
              </option>
            ))}
          </TextField>
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            size="small"
            sx={{ width: 140 }}
          />
          <Button variant="contained" onClick={() => loadData({ refresh: true })} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh from API'}
          </Button>
        </Stack>
      </Paper>

      {meta && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Chip label={`Source: ${meta.source}`} size="small" />
          <Chip label={`Rows: ${meta.count}`} size="small" />
          {meta.stale && <Chip label="Stale fallback in use" color="warning" size="small" />}
          {meta.fetchedAt && <Chip label={`Fetched: ${new Date(meta.fetchedAt).toLocaleString()}`} size="small" />}
          {meta.changedAt && <Chip label={`Changed: ${new Date(meta.changedAt).toLocaleString()}`} size="small" />}
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Typography variant="body2"><strong>Total jobs:</strong> {formatNumber(totals.jobs)}</Typography>
          <Typography variant="body2"><strong>Total distance:</strong> {formatNumber(totals.distance)}</Typography>
          <Typography variant="body2"><strong>Total income:</strong> {formatNumber(totals.income)}</Typography>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Steam ID</TableCell>
              <TableCell align="right">Jobs</TableCell>
              <TableCell align="right">Distance</TableCell>
              <TableCell align="right">Income</TableCell>
              <TableCell align="right">Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2">Loading...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
            {!loading && rows.map((row) => (
              <TableRow key={row.userId || row.steamID || row.username}>
                <TableCell>{row.username || 'Unknown'}</TableCell>
                <TableCell>{row.steamID || row.userId || '-'}</TableCell>
                <TableCell align="right">{formatNumber(row.jobs)}</TableCell>
                <TableCell align="right">{formatNumber(row.distance)}</TableCell>
                <TableCell align="right">{formatNumber(row.income)}</TableCell>
                <TableCell align="right">{formatNumber(row.level)}</TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">No data for selected month/year.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
