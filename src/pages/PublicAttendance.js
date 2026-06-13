import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import StreakCard from '../components/StreakCard';
import { claimMilestone, getMilestones, getStreakInfo } from '../services/rewardsService';

const scrollLeaders = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const PublicAttendance = () => {
  const [events, setEvents] = useState([]);
  const [activeWindows, setActiveWindows] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [streakData, setStreakData] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState('');
  const [claimingId, setClaimingId] = useState('');
  const [claimMessage, setClaimMessage] = useState('');

  const hasToken = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setLoading(true);
    setError('');

    try {
      const [attendanceRes, leaderboardRes, activeWindowsRes] = await Promise.all([
        axiosInstance.get('/attendance-events/public/attendance'),
        axiosInstance.get('/attendance-events/public/leaderboard?limit=10'),
        axiosInstance.get('/attendance-events/active')
      ]);

      setEvents(Array.isArray(attendanceRes.data?.events) ? attendanceRes.data.events : []);
      setLeaderboard(Array.isArray(leaderboardRes.data?.leaderboard) ? leaderboardRes.data.leaderboard : []);
      setActiveWindows(Array.isArray(activeWindowsRes.data) ? activeWindowsRes.data : []);
    } catch (loadError) {
      console.error('Error loading attendance page:', loadError);
      setError('Failed to load attendance records. Please refresh and try again.');
    } finally {
      setLoading(false);
    }

    if (hasToken) {
      loadRewards();
    }
  };

  const loadRewards = async () => {
    setRewardLoading(true);
    setRewardError('');

    try {
      const [streakRes, milestonesRes] = await Promise.all([getStreakInfo(), getMilestones()]);
      setStreakData(streakRes || null);
      setMilestones(Array.isArray(milestonesRes) ? milestonesRes : []);
    } catch (loadError) {
      console.error('Error loading streak/rewards:', loadError);
      setRewardError('Unable to load your streak rewards right now.');
    } finally {
      setRewardLoading(false);
    }
  };

  const onClaimMilestone = async (milestone) => {
    if (!milestone?._id || claimingId) return;

    setClaimingId(milestone._id);
    setClaimMessage('');

    try {
      const response = await claimMilestone(milestone._id);
      setClaimMessage(response?.message || 'Reward claimed successfully.');
      await loadRewards();
    } catch (claimError) {
      console.error('Error claiming milestone:', claimError);
      setRewardError(claimError?.response?.data?.message || 'Could not claim reward right now.');
    } finally {
      setClaimingId('');
    }
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const title = (event.title || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return title.includes(query) || description.includes(query);
      }),
    [events, searchTerm]
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const totalAttendances = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
  const activeEvents = activeWindows.length;
  const completedEvents = events.length;
  const totalEventIds = new Set([
    ...activeWindows.map((event) => String(event._id)),
    ...events.map((event) => String(event._id))
  ]);
  const totalAttendanceEvents = totalEventIds.size;
  const topAttendanceLeaders = leaderboard.slice(0, 8);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress size={42} />
          <Typography variant="h6">Loading attendance command center...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box
        sx={{
          p: { xs: 2.25, md: 3 },
          borderRadius: 3,
          background:
            'linear-gradient(130deg, rgba(191,161,74,0.24) 0%, rgba(34,34,34,0.5) 45%, rgba(191,161,74,0.09) 100%)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 2.5
        }}
      >
        <Typography variant="overline">Attendance Intelligence</Typography>
        <Typography variant="h4" sx={{ mb: 0.75, fontWeight: 700 }}>
          Attendance Command Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 680, lineHeight: 1.7 }}>
          Monitor event participation, track rank momentum, and manage streak rewards from one unified view.
        </Typography>

        <Grid container spacing={1.5} sx={{ mt: 1.75 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">Total Events</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalAttendanceEvents}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">Total Attendances</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalAttendances}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">Active Events</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{activeEvents}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">Completed Events</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{completedEvents}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 2.5,
          overflow: 'hidden',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(90deg, rgba(191,161,74,0.08) 0%, rgba(18,18,18,0.75) 50%, rgba(191,161,74,0.08) 100%)',
          py: 1.25
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: 'max-content',
            whiteSpace: 'nowrap',
            animation: `${scrollLeaders} 24s linear infinite`,
            '&:hover': { animationPlayState: 'paused' }
          }}
        >
          {topAttendanceLeaders.length ? topAttendanceLeaders.map((member, index) => (
            <Box
              key={`${member._id || member.username}-${index}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'rgba(0,0,0,0.22)',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{member.username}</Typography>
              <Chip label={`${member.totalEventsAttended} events`} size="small" color="primary" />
            </Box>
          )) : (
            <Typography sx={{ px: 2, color: 'text.secondary' }}>No attendance leaders yet.</Typography>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          {hasToken ? (
            rewardLoading ? (
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={24} />
                  <Typography>Loading streak progress...</Typography>
                </Stack>
              </Paper>
            ) : (
              <StreakCard
                streakData={streakData || {}}
                milestones={milestones}
                onClaimClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onClaimReward={onClaimMilestone}
              />
            )
          ) : (
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">Streak Progress</Typography>
                <Typography variant="body2" color="text.secondary">
                  Log in to view your streak card and milestone rewards.
                </Typography>
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 1.5, maxWidth: 1100, mx: 'auto' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="primary" />
                <Typography variant="h6">Event Participation Stream</Typography>
              </Stack>
              <TextField
                size="small"
                placeholder="Search events"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>

            <Stack spacing={1.5}>
              {!filteredEvents.length ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    {searchTerm ? 'No matching events found.' : 'No events to display yet.'}
                  </Typography>
                </Paper>
              ) : (
                filteredEvents.map((event) => (
                  <Paper
                    key={event._id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      background:
                        'linear-gradient(105deg, rgba(191,161,74,0.08) 0%, rgba(18,18,18,0.24) 100%)'
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={1}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{event.title}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={event.status || 'unknown'} size="small" />
                          <Chip
                            icon={<PeopleIcon />}
                            label={`${event.attendees?.length || 0} attendees`}
                            size="small"
                            color="primary"
                          />
                        </Stack>
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.eventDate)}
                      </Typography>

                      {!!event.description && (
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                      )}

                      {!!event.attendees?.length && (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {event.attendees.slice(0, 4).map((attendee) => (
                            <Chip
                              key={attendee._id}
                              label={`${attendee.username} (${attendee.totalEventsAttended || 0})`}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PublicAttendance;
