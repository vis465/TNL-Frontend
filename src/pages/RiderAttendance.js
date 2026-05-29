import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search, Refresh, Add, CheckCircle } from '@mui/icons-material';
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
  activatePowerup
} from '../services/rewardsService';

function EventTable({ events, onMark }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return (events || []).filter((event) => {
      const matchesSearch =
        !search ||
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const riderStatus = (event) => {
    const entry = event.attendanceEntries?.find((e) => e.riderId);
    return entry?.status || null;
  };

  const canMark = (event) => event.status === 'open' && event.isAttendanceOpen && !riderStatus(event);

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="all">All Events</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Your Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((event) => (
              <TableRow key={event._id} hover>
                <TableCell>
                  <Typography fontWeight={700}>{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                </TableCell>
                <TableCell>{format(new Date(event.eventDate), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={event.status}
                    color={event.status === 'open' ? 'success' : event.status === 'closed' ? 'default' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  {riderStatus(event) ? (
                    <Chip size="small" label={riderStatus(event)} color={riderStatus(event) === 'approved' ? 'success' : riderStatus(event) === 'rejected' ? 'error' : 'warning'} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">Not marked</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {canMark(event) ? (
                    <Button variant="contained" size="small" startIcon={<Add />} onClick={() => onMark(event)}>
                      Mark Attendance
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Not available</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No events found</Typography>
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
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [events, setEvents] = useState([]);
  const [streak, setStreak] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [inventory, setInventory] = useState({ available: [], active: [], used: [], expired: [] });

  const [markDialog, setMarkDialog] = useState({ open: false, event: null });
  const [notes, setNotes] = useState('');

  const loadAttendance = async () => {
    const response = await axiosInstance.get('/attendance-events');
    setEvents(response.data || []);
  };

  const loadRewards = async () => {
    const [streakData, milestonesData, inventoryData] = await Promise.all([
      getStreakInfo(),
      getMilestones(),
      getPowerupInventory()
    ]);
    setStreak(streakData);
    setMilestones(milestonesData);
    setInventory(inventoryData || {});
  };

  const refreshAll = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadAttendance(), loadRewards()]);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load attendance/rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const onMarkAttendance = async () => {
    try {
      await axiosInstance.post(`/attendance-events/${markDialog.event._id}/mark-attendance`, { notes });
      setMarkDialog({ open: false, event: null });
      setNotes('');
      setInfo('Attendance marked successfully');
      await refreshAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const onClaimMilestone = async (milestone) => {
    try {
      await claimMilestone(milestone._id);
      setInfo(`Claimed milestone ${milestone.streakCount}`);
      await loadRewards();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to claim milestone');
    }
  };

  const onUsePowerup = async (powerup) => {
    try {
      await activatePowerup(powerup._id, { type: powerup.type });
      setInfo(`${formatPowerupLabel(powerup.type)} used`);
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Attendance & Rewards</Typography>
          <Typography color="text.secondary">Attendance, streak progress, milestones and powerups</Typography>
        </Box>
        <Button startIcon={<Refresh />} variant="outlined" onClick={refreshAll}>Refresh</Button>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" onClose={() => setInfo('')} sx={{ mb: 2 }}>{info}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Attendance" />
        <Tab label="Streak & Milestones" />
        <Tab label="Powerups" />
      </Tabs>

      {tab === 0 && (
        <EventTable events={events} onMark={(event) => setMarkDialog({ open: true, event })} />
      )}

      {tab === 1 && (
        <StreakCard 
          streakData={streak} 
          milestones={milestones}
          onClaimClick={() => setTab(1)}
          onClaimReward={onClaimMilestone}
        />
      )}

      {tab === 2 && <PowerupInventory inventory={inventory} onUse={onUsePowerup} />}

      <Dialog open={markDialog.open} onClose={() => setMarkDialog({ open: false, event: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography fontWeight={700}>{markDialog.event?.title}</Typography>
            <Typography variant="body2" color="text.secondary">{markDialog.event?.description}</Typography>
            <Typography variant="body2">
              Event Date: {markDialog.event ? format(new Date(markDialog.event.eventDate), 'MMM dd, yyyy HH:mm') : '-'}
            </Typography>
            <TextField
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              label="Notes (Optional)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkDialog({ open: false, event: null })}>Cancel</Button>
          <Button variant="contained" startIcon={<CheckCircle />} onClick={onMarkAttendance}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
