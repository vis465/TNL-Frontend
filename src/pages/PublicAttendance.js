import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Event as EventIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { getEventStatusMeta } from '../utils/attendanceUi';

const PublicAttendance = () => {
  const [events, setEvents] = useState([]);
  const [activeWindows, setActiveWindows] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setLoading(true);
    setError('');

    try {
      const [attendanceRes, leaderboardRes, activeWindowsRes] = await Promise.all([
        axiosInstance.get('/attendance-events/public/attendance'),
        axiosInstance.get('/attendance-events/public/leaderboard?limit=20'),
        axiosInstance.get('/attendance-events/active'),
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
      minute: '2-digit',
    });

  const totalCheckIns = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
  const openWindows = activeWindows.length;
  const eventsOnBoard = events.length;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <CircularProgress size={42} />
          <Typography variant="h6">Loading attendance leaderboard…</Typography>
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
          mb: 2.5,
        }}
      >
        <Typography variant="overline">Community</Typography>
        <Typography variant="h4" sx={{ mb: 0.75, fontWeight: 700 }}>
          Attendance Leaderboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.7 }}>
          See who shows up most at VTC events. This page is public — rankings and event history only.
          {isLoggedIn ? ' To mark attendance, track your streak, or claim rewards, use your personal hub.' : ' Log in to check in and build a streak.'}
        </Typography>

        <Grid container spacing={1.5} sx={{ mt: 1.75 }}>
          {[
            { label: 'Top riders listed', value: leaderboard.length },
            { label: 'Approved check-ins shown', value: totalCheckIns },
            { label: 'Open check-in windows', value: openWindows },
            { label: 'Events on the board', value: eventsOnBoard },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {isLoggedIn && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to="/attendance/me"
              endIcon={<ArrowForwardIcon />}
            >
              Open my hub
            </Button>
          }
        >
          Your streak, milestones, and powerups live on <strong>Attendance & rewards</strong> — not on this public leaderboard.
        </Alert>
      )}

      {!isLoggedIn && (
        <Paper sx={{ p: 2.5, mb: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography fontWeight={700}>Want to build a streak?</Typography>
              <Typography variant="body2" color="text.secondary">
                Log in to mark event attendance, earn milestone rewards, and manage powerups.
              </Typography>
            </Box>
            <Button variant="contained" component={RouterLink} to="/login">
              Log in
            </Button>
          </Stack>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <EmojiEventsIcon color="warning" />
                <Typography variant="h6" fontWeight={700}>Top attendees</Typography>
              </Stack>
              {!leaderboard.length ? (
                <Typography color="text.secondary">No approved attendance yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Rider</TableCell>
                      <TableCell align="right">Events</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.slice(0, 10).map((member, index) => (
                      <TableRow key={member._id || member.username || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{member.username || member.name || '—'}</TableCell>
                        <TableCell align="right">
                          <Chip size="small" label={member.totalEventsAttended || 0} color={index < 3 ? 'warning' : 'default'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <EventIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Open check-in windows</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Events accepting attendance right now. Submit yours from your personal hub.
              </Typography>
              {!activeWindows.length ? (
                <Typography color="text.secondary">No open windows at the moment.</Typography>
              ) : (
                <Stack spacing={1.25}>
                  {activeWindows.slice(0, 6).map((event) => (
                    <Paper key={event._id} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography fontWeight={700}>{event.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.eventDate)}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
              {isLoggedIn && activeWindows.length > 0 && (
                <Button sx={{ mt: 2 }} component={RouterLink} to="/attendance/me" variant="outlined" size="small">
                  Mark my attendance
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PeopleIcon color="primary" />
            <Box>
              <Typography variant="h6">Event attendance history</Typography>
              <Typography variant="caption" color="text.secondary">
                Approved check-ins only — community view
              </Typography>
            </Box>
          </Stack>
          <TextField
            size="small"
            placeholder="Search events"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
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
            filteredEvents.map((event) => {
              const eventMeta = getEventStatusMeta(event.status);
              return (
                <Paper
                  key={event._id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
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
                        <Chip label={eventMeta.label} size="small" color={eventMeta.color} />
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${event.attendees?.length || 0} approved`}
                          size="small"
                          color="primary"
                          variant="outlined"
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
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {event.attendees.slice(0, 6).map((attendee) => (
                          <Chip
                            key={attendee._id}
                            label={`${attendee.username} · ${attendee.totalEventsAttended || 0} total`}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              );
            })
          )}
        </Stack>
      </Card>
    </Container>
  );
};

export default PublicAttendance;
