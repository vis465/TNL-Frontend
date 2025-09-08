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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  TextField,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import WorkIcon from '@mui/icons-material/Work';
import axiosInstance from '../utils/axios';

const PublicChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const [jobId, setJobId] = useState('');
  const [jobValidationLoading, setJobValidationLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchData();
  }, []);

  const validateJob = async () => {
    if (!jobId || jobId.trim() === '') {
      setSnackbarMessage('Please enter a valid job ID');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setJobValidationLoading(true);
      const data = JSON.stringify({
        "jobId": parseInt(jobId, 10) // Ensure it's a number
      });
      
      const response = await axiosInstance.post("/webhook/job", data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(response.data);
      setValidationResult(response.data);
      
      // More specific success messaging
      const result = response.data;
      if (result.success) {
        if (result.matchedChallenges && result.matchedChallenges.length > 0) {
          setSnackbarMessage(`Job validated! Matched ${result.matchedChallenges.length} challenge(s)`);
        } else {
          setSnackbarMessage('Job validated but no challenges matched');
        }
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Job validation failed');
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error validating job:', error);
      setSnackbarMessage('Failed to validate job. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setJobValidationLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [challengesResponse, championsResponse] = await Promise.all([
        axiosInstance.get('/challenges/active'),
        axiosInstance.get('/challenges/champions?limit=10')
      ]);
      console.log(challengesResponse.data);
      console.log(championsResponse.data);
      setChallenges(challengesResponse.data.challenges || []);
      setChampions(championsResponse.data.champions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch challenges data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (challengeId) => {
    try {
      setLeaderboardLoading(true);
      const response = await axiosInstance.get(`/challenges/${challengeId}/leaderboard?limit=20`);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'warning';
    return 'primary';
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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
        <Typography variant="h4" component="h1" gutterBottom>
          Driving Challenges
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Job Validation Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            Job Validation
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <TextField
            label="Job ID"
            type="number"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Enter job number"
            variant="outlined"
            size="medium"
            sx={{ minWidth: { xs: '100%', sm: '200px' } }}
            inputProps={{
              min: 1,
              step: 1
            }}
          />
          <Button
            variant="contained"
            onClick={validateJob}
            disabled={jobValidationLoading || !jobId}
            sx={{ 
              minWidth: '120px',
              height: '56px' // Match TextField height
            }}
          >
            {jobValidationLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Validate Job'
            )}
          </Button>
        </Box>
        
        {validationResult && (
          <Box sx={{ mt: 2 }} >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                
                border: `2px solid ${validationResult.success ? '#4caf50' : '#f44336'}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {validationResult.success ? (
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28, mr: 1 }} />
                ) : (
                  <PendingIcon sx={{ color: 'error.main', fontSize: 28, mr: 1 }} />
                )}
                <Typography variant="h6" fontWeight="bold" color={validationResult.success ? 'success.main' : 'error.main'}>
                  {validationResult.success ? 'Job Validation Successful!' : 'Job Validation Failed'}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {validationResult.message}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                   
                    borderRadius: 1 
                  }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {validationResult.matchedChallenges?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Challenges Matched
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                  
                    borderRadius: 1 
                  }}>
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                      {validationResult.progressEntriesCreated || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress Entries
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                   
                    borderRadius: 1 
                  }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {validationResult.success ? '✓' : '✗'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {validationResult.matchedChallenges && validationResult.matchedChallenges.length > 0 ? (
                <Box>
                  <Typography variant="body1" fontWeight="bold" gutterBottom sx={{ color: 'success.dark' }}>
                    🎉 Great job! Your delivery matched these challenges:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {validationResult.matchedChallenges.map((challenge, index) => (
                      <Chip
                        key={index}
                        label={challenge.name || `Challenge ${index + 1}`}
                        color="success"
                        variant="filled"
                        sx={{ 
                          fontWeight: 'bold',
                          '& .MuiChip-label': { px: 2 }
                        }}
                        icon={<EmojiEventsIcon />}
                      />
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    bgcolor: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}
                >
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    No challenges matched this time
                  </Typography>
                  <Typography variant="body2">
                    Your job was processed successfully, but it didn't match any active challenge criteria. 
                    This could be due to route, distance, or cargo requirements. Keep driving - more challenges await! 🚛
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: { xs: 1, sm: 2 }
            }}
          >
            <Tab label="Active Challenges" />
            <Tab label="Champions" />
          </Tabs>
        </Paper>
      </Box>

      {/* Active Challenges Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {challenges.map((challenge) => (
            <Grid item xs={12} key={challenge._id}>
              <Card
                onClick={() => openLeaderboard(challenge)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLeaderboard(challenge); } }}
                tabIndex={0}
                role="button"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 } }}
              >
                {/* Hero header */}
                <Box sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: 2,
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'primary.contrastText'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                      {challenge.name}
                    </Typography>
                    <Chip label="ACTIVE" color="success" size="medium" sx={{ fontWeight: 700, bgcolor: 'success.light', color: 'success.dark' }} />
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, sm: 3 } }}>
                  {/* Story / description */}
                  {challenge.description && (
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>
                        Story
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontSize: { xs: '0.98rem', sm: '1.05rem' }, lineHeight: 1.6 }}>
                        {challenge.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Route and Cargo tiles (same style as stats) */}
                  <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.main', color: 'info.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Route</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {`${challenge.startCity} (${challenge.startCompany}) → ${challenge.endCity} (${challenge.endCompany})`}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.main', color: 'warning.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Cargo</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {challenge.cargo}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Key stats */}
                  <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Required Jobs</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{challenge.requiredJobs}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Min Distance</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{challenge.minDistance} km</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {challenge.rewards && (
                    <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', border: '1px dashed', borderColor: 'success.main' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Rewards
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {challenge.rewards}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button size="small" endIcon={<LeaderboardIcon />}>
                    Tap to view leaderboard
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Champions Tab */}
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: (theme) => theme.palette.background.paper, borderBottom: 1, borderColor: 'divider' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Overall Champions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drivers who have completed the most challenges
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={2}>
            {champions.map((champion, index) => (
              <Grid item xs={12} md={6} key={champion._id}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden', border: index > 2 ? '1px solid' : 'none', borderColor: index > 2 ? 'divider' : 'transparent' }}>
                  {index <= 2 ? (
                    <Box sx={{
                      px: { xs: 2.5, sm: 3 },
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: (theme) => `linear-gradient(135deg, ${index === 0 ? theme.palette.warning.main : index === 1 ? theme.palette.grey[500] : '#cd7f32'} 0%, ${theme.palette.primary.dark} 100%)`,
                      color: 'primary.contrastText'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEventsIcon sx={{ color: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32' }} />
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>#{index + 1}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {champion.driverUsername || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          ID: {champion._id}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{
                      px: { xs: 2.5, sm: 3 },
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'background.paper'
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={`#${index + 1}`} size="small" />
                        {champion.driverUsername || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">ID: {champion._id}</Typography>
                    </Box>
                  )}

                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    {index <= 2 ? (
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.main', color: 'success.contrastText', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Completed</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                              {Number.isFinite(champion.completedChallenges) ? champion.completedChallenges : 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.main', color: 'info.contrastText', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Jobs</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>
                              {Number.isFinite(champion.totalJobs) ? champion.totalJobs : 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Distance</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>
                              {(Number(champion.totalDistance) || 0)} km
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.7 }}>Completed</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {Number.isFinite(champion.completedChallenges) ? champion.completedChallenges : 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.7 }}>Jobs</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {Number.isFinite(champion.totalJobs) ? champion.totalJobs : 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.7 }}>Distance</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {(Number(champion.totalDistance) || 0)} km
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {challenges.length === 0 && activeTab === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No active challenges found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Check back later for new challenges!
          </Typography>
        </Paper>
      )}

      {champions.length === 0 && activeTab === 1 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No champions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Complete some challenges to appear on the leaderboard!
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LeaderboardIcon sx={{ mr: 1 }} />
            Leaderboard - {selectedChallenge?.name}
          </Box>
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
                    <TableCell>Jobs Completed</TableCell>
                    <TableCell>Total Distance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Activity</TableCell>
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
                          {Math.min(entry?.completedJobs ?? 0, selectedChallenge?.requiredJobs ?? 0)} / {selectedChallenge?.requiredJobs ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.totalDistance} km
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={entry.isCompleted ? <CheckCircleIcon /> : <PendingIcon />}
                          label={entry.isCompleted ? 'Completed' : 'In Progress'}
                          color={entry.isCompleted ? 'success' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(entry.lastActivity)}
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
          <Button onClick={() => setLeaderboardDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PublicChallenges;