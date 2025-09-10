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
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openChallengeId, setOpenChallengeId] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [firstCompleters, setFirstCompleters] = useState([]);
  const [firstCompletersLoading, setFirstCompletersLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch first completers when tab 1 is selected
  useEffect(() => {
    if (activeTab === 1 && firstCompleters.length === 0) {
      fetchFirstCompleters();
    }
  }, [activeTab]);

  // Countdown timer effect
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const newCountdowns = {};
      
      challenges.forEach(challenge => {
        if (challenge.endDate) {
          const endTime = new Date(challenge.endDate);
          const timeLeft = endTime - now;
          
          if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            newCountdowns[challenge._id] = {
              days,
              hours,
              minutes,
              seconds,
              total: timeLeft
            };
          } else {
            newCountdowns[challenge._id] = {
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              total: 0,
              expired: true
            };
          }
        }
      });
      
      setCountdowns(newCountdowns);
    };

    // Update immediately
    updateCountdowns();
    
    // Update every second
    const interval = setInterval(updateCountdowns, 1000);
    
    return () => clearInterval(interval);
  }, [challenges]);

  const validateJob = async () => {
    if (!jobId || jobId.trim() === '') {
      setSnackbarMessage('Please enter a valid job ID');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!selectedChallengeId) {
      setSnackbarMessage('Please select a challenge to apply this job to');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setJobValidationLoading(true);
      const data = JSON.stringify({
        jobId: parseInt(jobId, 10),
        selectedChallengeId
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
      console.log(result);
      setSnackbarMessage(result.message || (result.success ? 'Success' : 'Request failed'));
      setSnackbarSeverity(result.success ? 'success' : 'error');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error validating job:', error);
      const serverMsg = error.response?.data?.message;
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Failed to validate job. Please try again.';
      
      if (serverMsg) {
        if (serverMsg.includes('Job start time must be after challenge creation time')) {
          errorMessage = 'This job started before the selected challenge was created. Please choose a different job or challenge.';
        } else if (serverMsg.includes('No valid challenges found')) {
          errorMessage = 'No challenges are available for this job. The job may have started before any active challenges were created.';
        } else if (serverMsg.includes('missing job start time')) {
          errorMessage = 'Invalid job data: Job start time is missing. Please check the Job ID and try again.';
        } else if (serverMsg.includes('invalid job start time format')) {
          errorMessage = 'Invalid job data: Job start time format is incorrect. Please check the Job ID and try again.';
        } else if (serverMsg.includes('already been processed')) {
          errorMessage = 'This job has already been used for a challenge. Please choose a different job.';
        } else if (serverMsg.includes('does not meet selected challenge requirements')) {
          errorMessage = 'This job does not meet the selected challenge requirements. Please check the job details and try a different challenge.';
        } else if (serverMsg.includes('Selected challenge is not available for this job')) {
          errorMessage = 'The selected challenge is not available for this job. The job started before this challenge was created. Please choose a different challenge.';
        } else if (serverMsg.includes('Selected challenge not found')) {
          errorMessage = 'The selected challenge is no longer available. Please refresh and try again.';
        } else {
          errorMessage = serverMsg;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setJobValidationLoading(false);
    }
  };

  const applyJobToChallenge = async () => {
    if (!selectedChallengeId) {
      setSnackbarMessage('Please select a challenge to apply this job');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      setApplyLoading(true);
      const data = JSON.stringify({
        jobId: parseInt(jobId, 10),
        selectedChallengeId
      });
      const response = await axiosInstance.post('/webhook/job', data, {
        headers: { 'Content-Type': 'application/json' }
      });

      setValidationResult(response.data);
      setSnackbarMessage(response.data.message || 'Job applied to challenge');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error applying job to challenge:', error);
      const serverMsg = error.response?.data?.message;
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Failed to apply job to challenge. Please try again.';
      
      if (serverMsg) {
        if (serverMsg.includes('Job start time must be after challenge creation time')) {
          errorMessage = 'This job started before the selected challenge was created. Please choose a different job or challenge.';
        } else if (serverMsg.includes('No valid challenges found')) {
          errorMessage = 'No challenges are available for this job. The job may have started before any active challenges were created.';
        } else if (serverMsg.includes('already used for a challenge')) {
          errorMessage = 'This job has already been used for a challenge. Please choose a different job.';
        } else if (serverMsg.includes('does not meet selected challenge requirements')) {
          errorMessage = 'This job does not meet the selected challenge requirements. Please check the job details and try a different challenge.';
        } else if (serverMsg.includes('Selected challenge is not available for this job')) {
          errorMessage = 'The selected challenge is not available for this job. The job started before this challenge was created. Please choose a different challenge.';
        } else if (serverMsg.includes('Selected challenge not found')) {
          errorMessage = 'The selected challenge is no longer available. Please refresh and try again.';
        } else {
          errorMessage = serverMsg;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setApplyLoading(false);
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

  const fetchFirstCompleters = async () => {
    try {
      setFirstCompletersLoading(true);
      const response = await axiosInstance.get('/challenges/first-completers');
      setFirstCompleters(response.data.firstCompleters || []);
    } catch (error) {
      console.error('Error fetching first completers:', error);
      setError('Failed to fetch first completers data');
    } finally {
      setFirstCompletersLoading(false);
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
        
        {/* Time Validation Info */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Jobs can only be applied to challenges that were created before the job started. 
            Older jobs cannot be used for newer challenges.
          </Typography>
        </Alert>
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
          <FormControl sx={{ minWidth: { xs: '100%', sm: 280 } }}>
            <InputLabel id="challenge-select-label">Select Challenge</InputLabel>
            <Select
              labelId="challenge-select-label"
              label="Select Challenge"
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
            >
              {(challenges || []).map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <p>Enter JOB id for validation</p>
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

              {/* Challenge selection when multiple matches and not yet committed */}
              {Array.isArray(validationResult.matchedChallenges) && validationResult.matchedChallenges.length > 0 && !validationResult.committed && (
                <Box sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Select a challenge to apply this job</Typography>
                  <Stack spacing={1}>
                    {validationResult.matchedChallenges.map((mc) => (
                      <Paper key={mc.challengeId} variant="outlined" sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{mc.challengeName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Distance: {mc.distance} / {mc.minRequired} km • Top speed: {mc.topSpeedKmh} km/h{mc.maxTopSpeedKmh ? ` ≤ ${mc.maxTopSpeedKmh}` : ''}{mc.maxTruckDamagePercent ? ` • Damage ≤ ${mc.maxTruckDamagePercent}%` : ''}
                            </Typography>
                          </Box>
                          <Box>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name="challengeSelect"
                                value={mc.challengeId}
                                checked={selectedChallengeId === mc.challengeId}
                                onChange={(e) => setSelectedChallengeId(e.target.value)}
                                style={{ marginRight: 8 }}
                              />
                              Choose
                            </label>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                  <Box sx={{ textAlign: 'right', mt: 2 }}>
                    <Button
                      variant="contained"
                      disabled={!selectedChallengeId || applyLoading}
                      onClick={applyJobToChallenge}
                    >
                      {applyLoading ? 'Applying...' : 'Apply Job to Selected Challenge'}
                    </Button>
                  </Box>
                </Box>
              )}

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
            <Tab label="First Completers" />
            <Tab label="Champions" />
          </Tabs>
        </Paper>
      </Box>

      {/* Active Challenges Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {challenges.map((challenge) => (
            <Grid item xs={12} key={challenge._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                {/* Hero header */}
                <Box
                  onClick={() => setOpenChallengeId(prev => prev === challenge._id ? null : challenge._id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenChallengeId(prev => prev === challenge._id ? null : challenge._id); } }}
                  tabIndex={0}
                  role="button"
                  sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: 2,
                  background: (theme) => `yellow`,
                  color: 'primary.contrastText',
                  cursor: 'pointer'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 900, lineHeight: 1.1 ,color:'black'}}>
                      {challenge.name}
                    </Typography>
                    <p style={{color:'black'}}>Click to read more about the challenge</p>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip label="ACTIVE" color="success" size="medium" sx={{ fontWeight: 700, bgcolor: 'success.light', color: 'success.dark' }} />
                      {challenge.difficulty && (
                        <Chip 
                          label={`DIFFICULTY: ${String(challenge.difficulty).toUpperCase()}`}
                          size="medium"
                          color={
                            challenge.difficulty === 'easy' ? 'success' :
                            challenge.difficulty === 'medium' ? 'info' :
                            challenge.difficulty === 'hard' ? 'warning' : 'error'
                          }
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                      
                      {/* Quick countdown status in header */}
                      {challenge.endDate && countdowns[challenge._id] && (
                        <Chip 
                          label={
                            countdowns[challenge._id].expired 
                              ? "EXPIRED" 
                              : countdowns[challenge._id].total < 60 * 60 * 1000 
                                ? `${Math.floor(countdowns[challenge._id].total / (60 * 1000))}m LEFT`
                                : countdowns[challenge._id].total < 24 * 60 * 60 * 1000
                                  ? `${Math.floor(countdowns[challenge._id].total / (60 * 60 * 1000))}h LEFT`
                                  : `${countdowns[challenge._id].days}d LEFT`
                          }
                          size="medium"
                          sx={{ 
                            fontWeight: 600,
                            background: countdowns[challenge._id].expired 
                              ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                              : countdowns[challenge._id].total < 60 * 60 * 1000
                                ? 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: countdowns[challenge._id].expired 
                              ? '0 4px 16px rgba(255, 107, 107, 0.3)'
                              : countdowns[challenge._id].total < 60 * 60 * 1000
                                ? '0 4px 16px rgba(255, 154, 86, 0.3)'
                                : '0 4px 16px rgba(102, 126, 234, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            animation: countdowns[challenge._id].total < 60 * 1000 && !countdowns[challenge._id].expired 
                              ? 'pulse 1s infinite' 
                              : 'none',
                            '@keyframes pulse': {
                              '0%': { transform: 'scale(1)' },
                              '50%': { transform: 'scale(1.05)' },
                              '100%': { transform: 'scale(1)' }
                            }
                          }}
                        />
                      )}
                    </Stack>
                    
                    {/* Countdown Timer */}
                    {challenge.endDate && countdowns[challenge._id] && (
                      <Box sx={{ 
                        mt: 3, 
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        {countdowns[challenge._id].expired ? (
                          <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                          }}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="h5" sx={{ 
                                fontWeight: 700, 
                                mb: 1,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                              }}>
                                Challenge Expired
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                opacity: 0.9,
                                fontWeight: 500
                              }}>
                                No longer accepting submissions
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Animated background */}
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                              animation: 'shimmer 3s infinite',
                              '@keyframes shimmer': {
                                '0%': { transform: 'translateX(-100%)' },
                                '100%': { transform: 'translateX(100%)' }
                              }
                            }} />
                            
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                mb: 2,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                letterSpacing: '0.5px'
                              }}>
                                Time Remaining
                              </Typography>
                              
                              <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
                                {countdowns[challenge._id].days > 0 && (
                                  <Box sx={{ 
                                    textAlign: 'center',
                                    minWidth: 80,
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                  }}>
                                    <Typography variant="h3" sx={{ 
                                      fontWeight: 800, 
                                      lineHeight: 1,
                                      fontFamily: '"Roboto Mono", monospace',
                                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                      mb: 0.5
                                    }}>
                                      {countdowns[challenge._id].days.toString().padStart(2, '0')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '1px',
                                      opacity: 0.9
                                    }}>
                                      Days
                                    </Typography>
                                  </Box>
                                )}
                                
                                <Box sx={{ 
                                  textAlign: 'center',
                                  minWidth: 80,
                                  p: 1.5,
                                  borderRadius: 2,
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                  <Typography variant="h3" sx={{ 
                                    fontWeight: 800, 
                                    lineHeight: 1,
                                    fontFamily: '"Roboto Mono", monospace',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    mb: 0.5
                                  }}>
                                    {countdowns[challenge._id].hours.toString().padStart(2, '0')}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    opacity: 0.9
                                  }}>
                                    Hours
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ 
                                  textAlign: 'center',
                                  minWidth: 80,
                                  p: 1.5,
                                  borderRadius: 2,
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                  <Typography variant="h3" sx={{ 
                                    fontWeight: 800, 
                                    lineHeight: 1,
                                    fontFamily: '"Roboto Mono", monospace',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    mb: 0.5
                                  }}>
                                    {countdowns[challenge._id].minutes.toString().padStart(2, '0')}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    opacity: 0.9
                                  }}>
                                    Minutes
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ 
                                  textAlign: 'center',
                                  minWidth: 80,
                                  p: 1.5,
                                  borderRadius: 2,
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  animation: countdowns[challenge._id].total < 60 * 1000 ? 'pulse 1s infinite' : 'none',
                                  '@keyframes pulse': {
                                    '0%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.05)' },
                                    '100%': { transform: 'scale(1)' }
                                  }
                                }}>
                                  <Typography variant="h3" sx={{ 
                                    fontWeight: 800, 
                                    lineHeight: 1,
                                    fontFamily: '"Roboto Mono", monospace',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    mb: 0.5
                                  }}>
                                    {countdowns[challenge._id].seconds.toString().padStart(2, '0')}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    opacity: 0.9
                                  }}>
                                    Seconds
                                  </Typography>
                                </Box>
                              </Stack>
                              
                              {/* Elegant progress indicator */}
                              {countdowns[challenge._id].total < 24 * 60 * 60 * 1000 && (
                                <Box sx={{ mt: 3 }}>
                                  <Box sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                  }}>
                                    <Box sx={{
                                      height: '100%',
                                      width: `${(countdowns[challenge._id].total / (24 * 60 * 60 * 1000)) * 100}%`,
                                      background: 'linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)',
                                      borderRadius: 2,
                                      transition: 'width 1s ease-in-out'
                                    }} />
                                  </Box>
                                  <Typography variant="caption" sx={{ 
                                    mt: 1,
                                    display: 'block',
                                    fontWeight: 500,
                                    opacity: 0.9
                                  }}>
                                    Less than 24 hours remaining
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                <Collapse in={openChallengeId === challenge._id} timeout="auto" unmountOnExit>
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
 {challenge.rewards && (
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', border: '1px dashed', borderColor: 'success.main' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 ,color:'red'}}>
                        Rewards
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600,color:'black'}}>
                        {challenge.rewards}
                      </Typography>
                    </Box>
                  )}
                  {/* Route and Cargo tiles (same style as stats) */}
                  <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'info.main', color: 'info.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Route</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {`${challenge.startCity || 'Any City'} (${challenge.startCompany || 'Any Company'}) → ${challenge.endCity || 'Any City'} (${challenge.endCompany || 'Any Company'})`}
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
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Required Jobs</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{challenge.requiredJobs}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Min Distance</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{challenge.minDistance} km</Typography>
                      </Box>
                    </Grid>
                    {!!challenge.maxTopSpeedKmh && Number(challenge.maxTopSpeedKmh) > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'error.main', color: 'error.contrastText', textAlign: 'center' }}>
                          <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Max Top Speed</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900 }}>{Number(challenge.maxTopSpeedKmh)} km/h</Typography>
                        </Box>
                      </Grid>
                    )}
                    {!!challenge.maxTruckDamagePercent && Number(challenge.maxTruckDamagePercent) > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.dark', color: 'warning.contrastText', textAlign: 'center' }}>
                          <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Max Truck Damage allowed</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900 }}>{Number(challenge.maxTruckDamagePercent)}%</Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                 
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button size="small" endIcon={<LeaderboardIcon />} onClick={() => openLeaderboard(challenge)}>
                    View leaderboard
                  </Button>
                </CardActions>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Champions Tab */}
      {activeTab === 2 && (
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
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.9 }}>Completed Challenges</Typography>
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
                            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, opacity: 0.7 }}>Completed Challenges</Typography>
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

      {champions.length === 0 && activeTab === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No champions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Complete some challenges to appear on the leaderboard!
          </Typography>
        </Paper>
      )}

      {/* First Completers Tab */}
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: (theme) => theme.palette.background.paper, borderBottom: 1, borderColor: 'divider' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  First Completers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drivers who completed each challenge first
                </Typography>
                {firstCompleters.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Showing {firstCompleters.length} first completers from all challenges
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchFirstCompleters}
                disabled={firstCompletersLoading}
                size="small"
              >
                {firstCompletersLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </Box>
          </Paper>

          {firstCompletersLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : firstCompleters.length > 0 ? (
            <Grid container spacing={2}>
              {firstCompleters.map((challenge, index) => (
                <Grid item xs={12} key={challenge.challengeId}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Challenge Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            🏆 {challenge.challengeName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip 
                              label={challenge.challengeDifficulty?.toUpperCase() || 'MEDIUM'}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                            />
                            <Chip 
                              label={`${challenge.totalCompleters} Total Completers`}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                            />
                            <Chip 
                              label={challenge.challengeStatus === 'active' ? '🟢 Active' : '🔴 Completed'}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                              }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                            #{index + 1}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Challenge
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Top 3 Completers */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {challenge.completers.map((completer, completerIndex) => (
                          <Box key={completer.driverId} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: completerIndex === 0 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: completerIndex === 0 ? '2px solid rgba(255, 215, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                            position: 'relative'
                          }}>
                            {/* Position Badge */}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              left: 16,
                              bgcolor: completerIndex === 0 ? '#FFD700' : completerIndex === 1 ? '#C0C0C0' : '#CD7F32',
                              color: 'white',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}>
                              {completer.position}
                            </Box>
                            
                            <Box sx={{ flex: 1, ml: 4 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {completer.driverUsername}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                                Driver ID: {completer.driverId}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Distance: {Math.round(completer.totalDistance || 0)} km • {completer.completedJobs} jobs
                              </Typography>
                            </Box>
                            
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Completed in
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                {completer.daysToComplete > 0 ? `${completer.daysToComplete} days` : 
                                 completer.hoursToComplete > 0 ? `${completer.hoursToComplete} hours` : 'Same day'}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                                {completer.completionTime ? new Date(completer.completionTime).toLocaleDateString() : 'Unknown'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No first completers yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Complete challenges to see who finished first!
              </Typography>
            </Paper>
          )}
        </Box>
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