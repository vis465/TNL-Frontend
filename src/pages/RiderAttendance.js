import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Event,
  CheckCircle,
  Cancel,
  Pending,
  Search,
  Refresh,
  Add,
  Close,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';

const RiderAttendance = () => {
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [markAttendanceDialog, setMarkAttendanceDialog] = useState({ open: false, event: null });
  const [attendanceNotes, setAttendanceNotes] = useState('');

  useEffect(() => {
    fetchAttendanceEvents();
  }, []);

  const fetchAttendanceEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/attendance-events');
      setAttendanceEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance events:', error);
      setError('Failed to load attendance events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await axiosInstance.post(`/attendance-events/${markAttendanceDialog.event._id}/mark-attendance`, {
        notes: attendanceNotes
      });
      setMarkAttendanceDialog({ open: false, event: null });
      setAttendanceNotes('');
      await fetchAttendanceEvents();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.response?.data?.message || 'Failed to mark attendance. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <Pending />;
      default: return null;
    }
  };

  const filteredEvents = attendanceEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getRiderAttendanceStatus = (event) => {
    const riderEntry = event.attendanceEntries?.find(entry => entry.riderId);
    return riderEntry ? riderEntry.status : null;
  };

  const canMarkAttendance = (event) => {
    return event.status === 'open' && 
           event.isAttendanceOpen && 
           !getRiderAttendanceStatus(event);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
          Attendance Events
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and mark your attendance for events
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status Filter"
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
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchAttendanceEvents}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Your Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event) => {
                const riderStatus = getRiderAttendanceStatus(event);
                const canMark = canMarkAttendance(event);
                
                return (
                  <TableRow key={event._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {event.title}
                        </Typography>
                        {event.description && (
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(event.eventDate), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                      {event.endDate && (
                        <Typography variant="caption" color="text.secondary">
                          to {format(new Date(event.endDate), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        color={event.status === 'open' ? 'success' : event.status === 'closed' ? 'default' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {riderStatus ? (
                        <Chip
                          icon={getStatusIcon(riderStatus)}
                          label={riderStatus}
                          color={getStatusColor(riderStatus)}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not marked
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {canMark ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => setMarkAttendanceDialog({ open: true, event })}
                        >
                          Mark Attendance
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {event.status !== 'open' ? 'Event closed' : 
                           !event.isAttendanceOpen ? 'Attendance closed' : 
                           riderStatus ? 'Already marked' : 'Cannot mark'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm || statusFilter !== 'all' ? 'No events match your search criteria' : 'No attendance events found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Mark Attendance Dialog */}
      <Dialog open={markAttendanceDialog.open} onClose={() => setMarkAttendanceDialog({ open: false, event: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Mark Attendance</Typography>
            <IconButton onClick={() => setMarkAttendanceDialog({ open: false, event: null })}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {markAttendanceDialog.event && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="h6">{markAttendanceDialog.event.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {markAttendanceDialog.event.description}
              </Typography>
              <Typography variant="body2">
                <strong>Event Date:</strong> {format(new Date(markAttendanceDialog.event.eventDate), 'MMM dd, yyyy HH:mm')}
              </Typography>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Add any additional notes about your attendance..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkAttendanceDialog({ open: false, event: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleMarkAttendance}
            variant="contained"
            startIcon={<CheckCircle />}
          >
            Mark Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RiderAttendance;
