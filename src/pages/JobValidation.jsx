import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import AdminSidebar from '../components/AdminSidebar';

const LIMIT = 15;

export default function JobValidation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = getItemWithExpiry('user') || {};

  const [jobId, setJobId] = useState('');
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [validatedJobs, setValidatedJobs] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchValidatedJobs = async () => {
    try {
      setTableLoading(true);
      const { data } = await axiosInstance.get('/jobs/public', {
        params: { limit: LIMIT, sort: '-createdAt' },
      });
      const items = data.items || [];
      setValidatedJobs(
        items.map((job) => ({
          jobId: job.jobID,
          driverName: job.driver?.username,
          startCity: job.source?.city?.name,
          endCity: job.destination?.city?.name,
          cargo: job.cargo?.name,
          distanceDriven: job.distanceDriven,
          updatedAt: job.updatedAt || job.createdAt,
          challengeName: null,
          challengeCompleted: false,
          completed: job.status === 'delivered',
        }))
      );
    } catch (e) {
      console.warn('Failed to load validated jobs', e);
      setValidatedJobs([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchValidatedJobs();
  }, []);

  const showMessage = (msg, severity = 'info') => {
    setMessage(msg);
    setMessageSeverity(severity);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleValidate = async () => {
    const id = (jobId || '').toString().trim();
    if (!id) {
      showMessage('Please enter a Job ID', 'warning');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const payload = { jobIDs: [id] };
      const resp = await axiosInstance.post('/hook/manual-jobs', payload);
      const results = resp.data?.results || [];
      const first = results[0];

      if (first?.enqueued) {
        showMessage('Job submitted for validation. It may take a moment to appear below.', 'success');
        setJobId('');
        fetchValidatedJobs();
      } else {
        showMessage(first?.reason || resp.data?.message || 'Validation request failed', 'error');
      }
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      showMessage(serverMsg || 'Failed to submit job for validation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileDrawerClose = () => setMobileDrawerOpen(false);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
     

      <Box sx={{ flex: 1 }}>
        {isMobile && (
          <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setMobileDrawerOpen(true)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Job Validation
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Validate Job
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If a TruckersHub job was not auto-validated, enter its Job ID below to submit it for validation. The job will be processed and applied to eligible challenges.
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
                <TextField
                  label="Job ID"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="e.g. 12345678"
                  type="number"
                  inputProps={{ min: 1 }}
                  sx={{ minWidth: { sm: 220 } }}
                />
                <Button
                  variant="contained"
                  onClick={handleValidate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutline />}
                >
                  {loading ? 'Submitting…' : 'Validate Job'}
                </Button>
              </Stack>
              {message && (
                <Alert severity={messageSeverity} sx={{ mt: 2 }} onClose={() => setMessage('')}>
                  {message}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
            Recently validated jobs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Last {LIMIT} jobs validated into the system (for reference).
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            {tableLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : validatedJobs.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <LocalShippingOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No validated jobs yet. Submit a Job ID above to get started.</Typography>
              </Box>
            ) : (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Job ID</strong></TableCell>
                    <TableCell><strong>Rider</strong></TableCell>
                    <TableCell><strong>Challenge</strong></TableCell>
                    <TableCell><strong>Route</strong></TableCell>
                    <TableCell align="right"><strong>Distance (km)</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Validated</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validatedJobs.map((row) => (
                    <TableRow key={`${row.jobId}-${row.challengeId}-${row.updatedAt}`} hover>
                      <TableCell>
                        <a
                          href={`/jobs/${row.jobId}`}
                          style={{ textDecoration: 'none', color: '#1976d2' }}
                        >
                          {row.jobId}
                        </a>
                      </TableCell>
                      <TableCell>{row.driverName || '—'}</TableCell>
                      <TableCell>{row.challengeName || '—'}</TableCell>
                      <TableCell>
                        {[row.startCity, row.endCity].filter(Boolean).join(' → ') || '—'}
                      </TableCell>
                      <TableCell align="right">{row.distanceDriven != null ? Number(row.distanceDriven).toLocaleString() : '—'}</TableCell>
                      <TableCell>
                        {row.challengeCompleted ? (
                          <Chip size="small" color="success" label="Challenge completed" />
                        ) : row.completed ? (
                          <Chip size="small" color="primary" variant="outlined" label="Progress" />
                        ) : (
                          <Chip size="small" variant="outlined" label="Validated" />
                        )}
                      </TableCell>
                      <TableCell>
                        {row.updatedAt
                          ? new Date(row.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                          : row.timestamp
                            ? new Date(row.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                            : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}
