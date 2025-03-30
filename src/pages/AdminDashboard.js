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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Link,
  Stack,
  Snackbar,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';
import ManageSlotsDialog from '../components/ManageSlotsDialog';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manageSlotsOpen, setManageSlotsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSlots, setEventSlots] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch both events and bookings
      const [eventsResponse, slotsResponse] = await Promise.all([
        axiosInstance.get('/events'),
        axiosInstance.get('/slots/bookings')
      ]);

      setEvents(eventsResponse.data.response || []);
      setBookings(slotsResponse.data.bookings || []);
      
      console.log('Events:', eventsResponse.data);
      console.log('Bookings:', slotsResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleManageSlots = async (event) => {
    setSelectedEvent(event);
    try {
      const response = await axiosInstance.get(`/slots/event/${event.truckersmpId}`);
      setEventSlots(response.data.slots || []);
      setManageSlotsOpen(true);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Error fetching slots');
    }
  };

  const handleStatusUpdate = async (slotId, slotNumber, status) => {
    if (!slotId || !slotNumber) {
      console.error('Missing slotId or slotNumber:', { slotId, slotNumber });
      setError('Invalid booking data');
      return;
    }

    try {
      setActionLoading(slotNumber);
      console.log('Updating booking status:', { slotId, slotNumber, status });

      const response = await axiosInstance.patch(`/slots/${slotId}/bookings/${slotNumber}`, {
        status
      });

      console.log('Status update response:', response.data);
      await fetchData(); // Refresh the bookings data
    } catch (error) {
      console.error('Error updating status:', error);
      setError(`Failed to ${status} booking: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <IconButton 
          onClick={handleRefresh} 
          disabled={loading}
          color="primary"
          size="large"
          sx={{ mr: 2,color:'red' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 2
            }}
          >
            <Tab label="Events Management" />
            <Tab label="Booking Requests" />
          </Tabs>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Events Tab */}
      {activeTab === 0 && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Alert severity="info">No events found.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.truckersmpId}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>
                        {format(new Date(event.startDate), 'PPp')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status} 
                          color={event.status === 'upcoming' ? 'primary' : 'default'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleManageSlots(event)}
                          >
                            Manage Slots
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            href={`/events/${event.truckersmpId}`}
                            target="_blank"
                          >
                            View Event
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Bookings Tab */}
      {activeTab === 1 && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Slot Number</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>VTC Details</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Alert severity="info">No booking requests found.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow 
                      key={booking._id}
                      sx={{
                        bgcolor: 
                          booking.status === 'approved' ? 'success.lighter' :
                          booking.status === 'rejected' ? 'error.lighter' :
                          'inherit'
                      }}
                    >
                      <TableCell>{booking.eventTitle}</TableCell>
                      <TableCell>
                        {booking.imageUrl && (
                          <Box
                            component="img"
                            src={booking.imageUrl}
                            alt="Slot"
                            sx={{
                              width: 100,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              boxShadow: 1
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          #{booking.slotNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{booking.name}</TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          <Typography><strong>VTC:</strong> {booking.vtcName}</Typography>
                          {booking.vtcRole && (
                            <Typography><strong>Role:</strong> {booking.vtcRole}</Typography>
                          )}
                          {booking.vtcLink && (
                            <Link href={booking.vtcLink} target="_blank" rel="noopener noreferrer">
                              View VTC Profile
                            </Link>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status}
                          color={
                            booking.status === 'approved' ? 'success' :
                            booking.status === 'rejected' ? 'error' :
                            'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {booking.status === 'pending' && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              disabled={actionLoading === booking.slotNumber}
                              onClick={() => handleStatusUpdate(booking.slotId, booking.slotNumber, 'approved')}
                            >
                              {actionLoading === booking.slotNumber ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              disabled={actionLoading === booking.slotNumber}
                              onClick={() => handleStatusUpdate(booking.slotId, booking.slotNumber, 'rejected')}
                            >
                              {actionLoading === booking.slotNumber ? 'Processing...' : 'Reject'}
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Manage Slots Dialog */}
      <ManageSlotsDialog
        open={manageSlotsOpen}
        onClose={() => setManageSlotsOpen(false)}
        event={selectedEvent}
        slots={eventSlots}
        onSlotsUpdated={fetchData}
      />
    </Container>
  );
};

export default AdminDashboard; 