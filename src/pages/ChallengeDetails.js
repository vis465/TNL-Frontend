import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelineIcon from '@mui/icons-material/Timeline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axiosInstance from '../utils/axios';

const ChallengeDetails = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [jobsDialogOpen, setJobsDialogOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const challengeId = window.location.pathname.split('/').pop();
    fetchChallengeDetails(challengeId);
  }, [page]);

  const fetchChallengeDetails = async (challengeId) => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/challenges/${challengeId}/details?page=${page}&limit=20`);
      setChallenge(response.data.challenge);
      setDrivers(response.data.drivers);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      setError('Failed to fetch challenge details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobs = (driver) => {
    setSelectedDriver(driver);
    setJobsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'warning';
    return 'primary';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 8, sm: 9 },
        pb: 3
      }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!challenge) {
    return (
      <Container maxWidth="md" sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 8, sm: 9 },
        pb: 3
      }}>
        <Alert severity="info">Challenge not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      px: { xs: 1, sm: 2, md: 3 },
      pt: { xs: 8, sm: 9 },
      pb: 3
    }}>
      {/* Header */}
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.5,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => window.close()}
              variant="outlined"
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              Back
            </Button>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {challenge.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Challenge Details & Driver Progress
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchChallengeDetails(challenge._id)}
            sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.6)' }}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Challenge Info */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Challenge Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Route</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {challenge.startCity} ({challenge.startCompany}) → {challenge.endCity} ({challenge.endCompany})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.main', color: 'info.contrastText', textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ display: 'block', fontWeight: 900, opacity: 0.9 }}>Cargo</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{challenge.cargo}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ display: 'block', fontWeight: 900, opacity: 0.9 }}>Min Distance</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{challenge.minDistance} km</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ display: 'block', fontWeight: 900, opacity: 0.9 }}>Required Jobs</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{challenge.requiredJobs}</Typography>
                  </Box>
                </Grid>
                {challenge.description && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Description</Typography>
                      <Typography variant="body1">{challenge.description}</Typography>
                    </Box>
                  </Grid>
                )}
                {challenge.rewards && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Rewards</Typography>
                      <Typography variant="body1">{challenge.rewards}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>Drivers</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{drivers.length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>Completed</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>{drivers.filter(d => d.isCompleted).length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>Rate</Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>{drivers.length > 0 ? ((drivers.filter(d => d.isCompleted).length / drivers.length) * 100).toFixed(1) : 0}%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drivers Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Jobs Completed</TableCell>
                <TableCell>Total Distance</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {driver.driverUsername || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        ID: {driver._id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {driver.completedJobs} / {challenge.requiredJobs}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {driver.completionPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(driver.completionPercentage, 100)}
                        color={getCompletionColor(driver.completionPercentage)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {driver.completedJobs}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {driver.totalDistance.toFixed(2)} km
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(driver.lastActivity)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={driver.isCompleted ? <CheckCircleIcon /> : <PendingIcon />}
                      label={driver.isCompleted ? 'Completed' : 'In Progress'}
                      color={driver.isCompleted ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Job Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewJobs(driver)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Jobs Dialog */}
      <Dialog
        open={jobsDialogOpen}
        onClose={() => setJobsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Details - Driver {selectedDriver?._id}
        </DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Job ID</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Distance</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedDriver.jobs.map((job, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {job.jobId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.startCity} → {job.endCity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.distance.toFixed(2)} km
                        </Typography>
                      </TableCell>
                      <TableCell>
                         <Typography variant="body2">
                           {job.cargo}
                         </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(job.timestamp)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChallengeDetails;
