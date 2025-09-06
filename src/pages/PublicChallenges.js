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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchData();
  }, []);

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
            <Grid item xs={12} sm={6} md={4} key={challenge._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {challenge.name}
                    </Typography>
                    <Chip 
                      label="Active" 
                      color="success"
                      size="small"
                    />
                  </Box>
                  
                  {challenge.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {challenge.description}
                    </Typography>
                  )}
                  
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Route:</strong> {challenge.startCity} ({challenge.startCompany}) → {challenge.endCity} ({challenge.endCompany})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cargo:</strong> {challenge.cargo}
                    </Typography>
                    <Typography variant="h5" color="text.secondary">
                      <strong>Requirements:</strong> {challenge.requiredJobs} jobs • Min {challenge.minDistance} km per job
                    </Typography>
                  </Stack>

                  {challenge.rewards && (
                    <Box sx={{ mt: 2, p: 1, borderRadius: 1 ,color:'black',bgcolor:"red"}}>
                      <Typography variant="body" color="white">
                    <strong>Rewards: {challenge.rewards}</strong>
                        
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="small"
                    startIcon={<LeaderboardIcon />}
                    onClick={() => openLeaderboard(challenge)}
                    disabled={leaderboardLoading}
                  >
                    View Leaderboard
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Champions Tab */}
      {activeTab === 1 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Overall Champions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drivers who have completed the most challenges
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Challenges Completed</TableCell>
                  <TableCell>Total Jobs</TableCell>
                  <TableCell>Total Distance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {champions.map((champion, index) => (
                  <TableRow key={champion._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index === 0 && <EmojiEventsIcon sx={{ color: 'gold', mr: 1 }} />}
                        {index === 1 && <EmojiEventsIcon sx={{ color: 'silver', mr: 1 }} />}
                        {index === 2 && <EmojiEventsIcon sx={{ color: '#cd7f32', mr: 1 }} />}
                        <Typography variant="h6" color="primary">
                          #{index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {champion.driverUsername || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                          ID: {champion._id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={champion.completedChallenges}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {champion.totalJobs}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {champion.totalDistance.toFixed(2)} km
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
                          {entry.completedJobs} / {selectedChallenge?.requiredJobs}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.totalDistance.toFixed(2)} km
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
    </Container>
  );
};

export default PublicChallenges;
