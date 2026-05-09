import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import WhatshotOutlined from '@mui/icons-material/WhatshotOutlined';
import axiosInstance from '../../utils/axios';

function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(n)
  );
}

export default function ShowdownAnalyticsPanel() {
  const today = new Date();
  const defaultTo = today.toISOString().slice(0, 10);
  const defaultFrom = new Date(today.getTime() - 14 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data: d } = await axiosInstance.get('/admin/showdown/analytics', {
        params: {
          from: new Date(from + 'T00:00:00').toISOString(),
          to: new Date(to + 'T23:59:59').toISOString(),
        },
      });
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const s = data?.summary;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 4,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <WhatshotOutlined color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Showdown analytics
          </Typography>
          <Chip size="small" label="Payout jobs in window" variant="outlined" />
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <TextField
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Button size="small" variant="contained" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Revenue figures are EUR (same basis as normalized job revenue). Window: deliveries with
        Showdown payouts recorded (<code>useForPayouts</code>).
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !data && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={32} />
        </Box>
      )}

      {data && s && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Jobs (Showdown)
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {s.jobCount ?? 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Total uplift (€)
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {formatMoney(s.upliftSum)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Avg uplift / job (€)
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatMoney(s.avgUpliftPerJob)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Final revenue sum (€)
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatMoney(s.finalRevenueSum)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Modifier codes (deliveries)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.modifierBreakdown || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          No modifier tags in range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.modifierBreakdown.map((row) => (
                      <TableRow key={row.code}>
                        <TableCell>{row.code}</TableCell>
                        <TableCell align="right">{row.deliveries}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Top divisions by uplift (€)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Division</TableCell>
                    <TableCell align="right">Jobs</TableCell>
                    <TableCell align="right">Uplift</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.topDivisions || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          No division-linked jobs in range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.topDivisions.map((row) => (
                      <TableRow key={String(row.divisionId)}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.jobs}</TableCell>
                        <TableCell align="right">{formatMoney(row.upliftSum)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }} fontWeight={600}>
            Daily trend
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Jobs</TableCell>
                <TableCell align="right">Base €</TableCell>
                <TableCell align="right">Final €</TableCell>
                <TableCell align="right">Uplift €</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data.dailyTrend || []).map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right">{row.jobs}</TableCell>
                  <TableCell align="right">{formatMoney(row.baseRevenueSum)}</TableCell>
                  <TableCell align="right">{formatMoney(row.finalRevenueSum)}</TableCell>
                  <TableCell align="right">{formatMoney(row.upliftSum)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
}
