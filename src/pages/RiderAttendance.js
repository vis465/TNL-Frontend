import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  CheckCircle,
  EmojiEvents,
  LocalFireDepartment,
  FlashOnOutlined,
  LeaderboardOutlined,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';
import StreakCard from '../components/StreakCard';
import PowerupInventory from '../components/PowerupInventory';
import { formatPowerupLabel } from '../components/PowerupDisplay';
import {
  claimMilestone,
  getMilestones,
  getPowerupInventory,
  getStreakInfo,
  activatePowerup,
} from '../services/rewardsService';
import {
  describeMarkingAvailability,
  getEntryStatusMeta,
  getEventStatusMeta,
  getMyAttendanceEntry,
} from '../utils/attendanceUi';

const TAB_CONFIG = [
  { key: 'attendance', label: 'My check-ins', icon: CheckCircle },
  { key: 'streak', label: 'Streak & milestones', icon: LocalFireDepartment },
  { key: 'powerups', label: 'Powerups', icon: FlashOnOutlined },
];

function mergeRiderEvents(historyEvents = [], openEvents = []) {
  const byId = new Map();

  for (const event of historyEvents) {
    byId.set(String(event._id), event);
  }

  for (const event of openEvents) {
    const id = String(event._id);
    if (!byId.has(id)) {
      byId.set(id, { ...event, attendanceEntries: [] });
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );
}

function EventTable({ events, onMark }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return (events || []).filter((event) => {
      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase());

      const entry = getMyAttendanceEntry(event);
      const myStatus = entry?.status || 'none';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'none' ? !entry : myStatus === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const canMark = (event) => {
    const entry = getMyAttendanceEntry(event);
    return !entry && event.isAttendanceOpen && event.status === 'open';
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                placeholder="Search your events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Your status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="all">All statuses</option>
                <option value="none">Not submitted</option>
                <option value="pending">Awaiting HR review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Not counted</option>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Event status</TableCell>
              <TableCell>Check-in window</TableCell>
              <TableCell>Your status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((event) => {
              const entry = getMyAttendanceEntry(event);
              const entryMeta = getEntryStatusMeta(entry?.status);
              const eventMeta = getEventStatusMeta(event.status);
              const markable = canMark(event);

              return (
                <TableRow key={event._id} hover>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography fontWeight={700}>{event.title}</Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {event.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {format(new Date(event.eventDate), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={eventMeta.label} color={eventMeta.color} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={event.isAttendanceOpen ? 'Open' : 'Closed'}
                      color={event.isAttendanceOpen ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {entryMeta ? (
                      <Stack spacing={0.25}>
                        <Chip size="small" label={entryMeta.label} color={entryMeta.color} />
                        <Typography variant="caption" color="text.secondary">
                          {entryMeta.description}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not submitted
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {markable ? (
                      <Button variant="contained" size="small" startIcon={<Add />} onClick={() => onMark(event)}>
                        Check in
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-block', maxWidth: 180 }}>
                        {describeMarkingAvailability(event)}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No events match your filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}

export default function RiderAttendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromQuery = useMemo(() => {
    const key = String(searchParams.get('tab') || 'attendance').toLowerCase();
    const idx = TAB_CONFIG.findIndex((t) => t.key === key || (key === 'milestones' && t.key === 'streak') || (key === 'powerup' && t.key === 'powerups'));
    return idx >= 0 ? idx : 0;
  }, [searchParams]);

  const [tab, setTab] = useState(tabFromQuery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [events, setEvents] = useState([]);
  const [streak, setStreak] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [inventory, setInventory] = useState({ available: [], active: [], used: [], expired: [] });

  const [markDialog, setMarkDialog] = useState({ open: false, event: null });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setTab(tabFromQuery);
  }, [tabFromQuery]);

  const onTabChange = (_, value) => {
    setTab(value);
    const next = new URLSearchParams(searchParams);
    const key = TAB_CONFIG[value]?.key;
    if (!key || key === 'attendance') next.delete('tab');
    else next.set('tab', key);
    setSearchParams(next, { replace: true });
  };

  const loadAttendance = async () => {
    const [historyRes, openRes] = await Promise.all([
      axiosInstance.get('/attendance-events/rider/history'),
      axiosInstance.get('/attendance-events/active/me'),
    ]);
    setEvents(mergeRiderEvents(historyRes.data || [], openRes.data || []));
  };

  const loadRewards = async () => {
    const [streakData, milestonesData, inventoryData] = await Promise.all([
      getStreakInfo(),
      getMilestones(),
      getPowerupInventory(),
    ]);
    setStreak(streakData);
    setMilestones(Array.isArray(milestonesData) ? milestonesData : []);
    setInventory(inventoryData || { available: [], active: [], used: [], expired: [] });
  };

  const refreshAll = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadAttendance(), loadRewards()]);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load your attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const summary = useMemo(() => {
    const pending = events.filter((e) => getMyAttendanceEntry(e)?.status === 'pending').length;
    const approved = events.filter((e) => getMyAttendanceEntry(e)?.status === 'approved').length;
    const openToMark = events.filter((e) => !getMyAttendanceEntry(e) && e.isAttendanceOpen && e.status === 'open').length;
    const powerupCount =
      (inventory.available?.length || 0) +
      (inventory.active?.length || 0);
    return { pending, approved, openToMark, powerupCount, unclaimed: streak?.unclaimedMilestones || 0 };
  }, [events, inventory, streak]);

  const onMarkAttendance = async () => {
    try {
      await axiosInstance.post(`/attendance-events/${markDialog.event._id}/mark-attendance`, { notes });
      setMarkDialog({ open: false, event: null });
      setNotes('');
      setInfo('Check-in submitted. HR will review it before it counts toward your streak.');
      await refreshAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to submit check-in');
    }
  };

  const onClaimMilestone = async (milestone) => {
    try {
      await claimMilestone(milestone._id);
      setInfo(`Milestone reward claimed for day ${milestone.streakCount}.`);
      await loadRewards();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to claim milestone');
    }
  };

  const onUsePowerup = async (powerup) => {
    try {
      await activatePowerup(powerup._id, { type: powerup.type });
      setInfo(`${formatPowerupLabel(powerup.type)} activated.`);
      await loadRewards();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to use powerup');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Attendance & rewards</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
            Your personal hub — check in to events, track streak progress, claim milestones, and manage powerups.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button component={RouterLink} to="/attendance" variant="text" startIcon={<LeaderboardOutlined />}>
            Public leaderboard
          </Button>
          <Button startIcon={<Refresh />} variant="outlined" onClick={refreshAll}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" onClose={() => setInfo('')} sx={{ mb: 2 }}>{info}</Alert>}

      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          { label: 'Current streak', value: `${streak?.currentStreak || 0} days`, accent: true },
          { label: 'Ready to check in', value: summary.openToMark },
          { label: 'Awaiting HR review', value: summary.pending },
          { label: 'Rewards to claim', value: summary.unclaimed },
        ].map(({ label, value, accent }) => (
          <Grid item xs={6} md={3} key={label}>
            <Paper variant="outlined" sx={{ p: 1.75, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="h5" fontWeight={800} color={accent ? 'warning.main' : 'text.primary'}>
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={onTabChange} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TAB_CONFIG.map(({ label, icon: Icon }, index) => (
          <Tab
            key={label}
            icon={<Icon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={label}
            sx={{ minHeight: 48 }}
          />
        ))}
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <Alert severity="info" icon={<EmojiEvents />}>
            Submit check-ins here. Only <strong>approved</strong> attendance increases your streak. Rejected check-ins do not count.
          </Alert>
          <EventTable events={events} onMark={(event) => setMarkDialog({ open: true, event })} />
        </Stack>
      )}

      {tab === 1 && (
        <StreakCard
          streakData={streak}
          milestones={milestones}
          onViewPowerups={() => onTabChange(null, 2)}
          onClaimReward={onClaimMilestone}
        />
      )}

      {tab === 2 && <PowerupInventory inventory={inventory} onUse={onUsePowerup} />}

      <Dialog open={markDialog.open} onClose={() => setMarkDialog({ open: false, event: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Submit event check-in</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography fontWeight={700}>{markDialog.event?.title}</Typography>
            <Typography variant="body2" color="text.secondary">{markDialog.event?.description}</Typography>
            <Typography variant="body2">
              Event date: {markDialog.event ? format(new Date(markDialog.event.eventDate), 'MMM dd, yyyy HH:mm') : '—'}
            </Typography>
            <Alert severity="info" sx={{ py: 0.5 }}>
              HR must approve your check-in before it counts toward streak and leaderboard stats.
            </Alert>
            <TextField
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              label="Notes for HR (optional)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkDialog({ open: false, event: null })}>Cancel</Button>
          <Button variant="contained" startIcon={<CheckCircle />} onClick={onMarkAttendance}>
            Submit check-in
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
