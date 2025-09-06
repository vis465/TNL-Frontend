import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelineIcon from '@mui/icons-material/Timeline';
import axiosInstance from '../utils/axios';

const RiderChallenges = () => {
  const [driverId, setDriverId] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Get driver ID from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlDriverId = urlParams.get('driverId');
    const storedDriverId = localStorage.getItem('driverId');
    
    const id = urlDriverId || storedDriverId;
    if (id) {
      setDriverId(id);
      fetchChallenges(id);
    }
  }, []);

  const fetchChallenges = async (id = driverId) => {
    if (!id) {
      setError('Driver ID is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/challenges/driver/${id}`);
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (challengeId) => {
    try {
      setLeaderboardLoading(true);
      const response = await axiosInstance.get(`/challenges/${challengeId}/leaderboard?limit=10`);
      setLeaderboard(response.data.leaderboard || []);
      setLeaderboardDialogOpen(true);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to fetch leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const openLeaderboard = (challenge) => {
    setSelectedChallenge(challenge);
    fetchLeaderboard(challenge._id);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'warning';
    return 'primary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (!driverId) {
    return (
      <Container maxWidth="md" sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        pt: { xs: 8, sm: 9 },
        pb: 3
      }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Driver ID Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please provide a driver ID to view challenges.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            You can access this page with a driver ID parameter: /riders/:driverId/challenges
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      px: { xs: 1, sm: 2, md: 3 },
      pt: { xs: 8, sm: 9 },
      pb: 3
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Driver Challenges
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Driver ID: {driverId}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchChallenges()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Challenges Grid */}
      <Grid container spacing={3}>
        {challenges.map((challenge) => (
          <Grid item xs={12} sm={6} md={4} key={challenge._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {challenge.name}
                  </Typography>
                  <Chip 
                    icon={challenge.progress.isCompleted ? <CheckCircleIcon /> : <PendingIcon />}
                    label={challenge.progress.isCompleted ? 'Completed' : 'In Progress'}
                    color={challenge.progress.isCompleted ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>
                
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Route:</strong> {challenge.startCity} ({challenge.startCompany}) → {challenge.endCity} ({challenge.endCompany})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Min Distance:</strong> {challenge.minDistance} km
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cargo:</strong> {challenge.cargo}
                  </Typography>
                </Stack>

                {/* Progress Section */}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {challenge.progress.totalDistance} / {challenge.minDistance} km
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(challenge.progress.completionPercentage, 100)}
                    color={getProgressColor(challenge.progress.completionPercentage)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {challenge.progress.completionPercentage}% complete
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Stats */}
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      <DirectionsCarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Jobs Completed:
                    </Typography>
                    <Typography variant="body2">
                      {challenge.progress.completedJobs} / {challenge.progress.totalJobs}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      <TimelineIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Total Distance:
                    </Typography>
                    <Typography variant="body2">
                      {challenge.progress.totalDistance} km
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Activity:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(challenge.progress.lastActivity)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  size="small"
                  onClick={() => openLeaderboard(challenge)}
                  disabled={leaderboardLoading}
                >
                  View Leaderboard
                </Button>
                {challenge.progress.isCompleted && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed!"
                    color="success"
                    size="small"
                  />
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {challenges.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No active challenges found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            There are currently no active challenges available for this driver.
          </Typography>
        </Paper>
      )}

      {/* Leaderboard Dialog */}
      <Dialog
        open={leaderboardDialogOpen}
        onClose={() => setLeaderboardDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Leaderboard - {selectedChallenge?.name}
        </DialogTitle>
        <DialogContent>
          {leaderboardLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Total Distance</TableCell>
                    <TableCell>Jobs</TableCell>
                    <TableCell>Completion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={entry._id}>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {entry.driverUsername || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            ID: {entry._id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.totalDistance.toFixed(2)} km
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.completedJobs} / {entry.totalJobs}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${entry.completionRate.toFixed(1)}%`}
                          color={entry.completionRate >= 80 ? 'success' : entry.completionRate >= 50 ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaderboardDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RiderChallenges;
