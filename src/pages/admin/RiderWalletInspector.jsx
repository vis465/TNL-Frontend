import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
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
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import MagicPageShell from '../../components/magicui/MagicPageShell';
import { inspectRider, getRiderWalletTransactions } from '../../services/adminOpsService';

export default function RiderWalletInspector() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('riderId') || searchParams.get('q') || '');
  const [profile, setProfile] = useState(null);
  const [txs, setTxs] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txPages, setTxPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (page = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const q = query.trim();
      const params = /^[a-f0-9]{24}$/i.test(q) ? { riderId: q } : { q };
      const data = await inspectRider(params);
      setProfile(data);
      const wallet = await getRiderWalletTransactions(data.identity._id, { page, limit: 15 });
      setTxs(wallet.items || []);
      setTxPages(wallet.pagination?.totalPages || 1);
      setTxPage(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Search failed');
      setProfile(null);
      setTxs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('riderId') || searchParams.get('q')) search(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MagicPageShell title="Rider & wallet inspector" subtitle="Identity, recent jobs, and paginated wallet history.">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ArrowBackOutlined fontSize="small" />
            <span>Maintenance tools</span>
          </Stack>
        </Link>
        <Typography color="text.primary">Rider inspector</Typography>
      </Breadcrumbs>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Search (name, TH ID, steam, employee ID, rider ID)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search(1)}
              fullWidth
            />
            <Button variant="contained" startIcon={<SearchOutlined />} onClick={() => search(1)} disabled={loading}>
              Inspect
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}

      {profile && !loading && (
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700}>{profile.identity.name}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Chip size="small" label={`Balance: ${profile.identity.balance}`} />
                <Chip size="small" label={`TH: ${profile.identity.truckershubId || '—'}`} />
                <Chip size="small" label={`Steam: ${profile.identity.steamID || '—'}`} />
                <Chip size="small" label={`Emp: ${profile.identity.employeeID || '—'}`} />
                {profile.division && <Chip size="small" color="primary" label={profile.division.name} />}
              </Stack>
              {profile.latestDeliveredFlags && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Latest delivered job #{profile.latestDeliveredFlags.jobID} — statsApplied={String(profile.latestDeliveredFlags.statsApplied)}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1 }}>Recent jobs</Typography>
              <Stack spacing={0.5}>
                {(profile.recentJobs || []).map((j) => (
                  <Typography key={j.jobID} variant="body2">
                    #{j.jobID} · {j.status} · {j.revenue ?? '—'} · {new Date(j.createdAt).toLocaleString()}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1 }}>Wallet transactions</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Kind</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {txs.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{t.source?.kind}</TableCell>
                      <TableCell>{t.title}</TableCell>
                      <TableCell align="right">{t.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={txPages} page={txPage} onChange={(_, p) => search(p)} />
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}
    </MagicPageShell>
  );
}
