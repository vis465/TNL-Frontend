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
  DialogContentText,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';
import ManageSlotsDialog from '../components/ManageSlotsDialog';
import AnalyticsDashboard from './AnalyticsDashboard';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

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
      
      // Process bookings to include event details
      const processedBookings = slotsResponse.data.bookings || [];
      setBookings(processedBookings);
      
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

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      setActionLoading(bookingToDelete.slotNumber);
      console.log('Deleting booking:', bookingToDelete);
      
      await axiosInstance.delete(`/slots/${bookingToDelete.slotId}/bookings/${bookingToDelete.slotNumber}`);
      
      console.log('Booking deleted successfully');
      await fetchData(); // Refresh the bookings data
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError(`Failed to delete booking: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleExportEventSlots = async (eventId) => {
    try {
      const response = await axiosInstance.get(`/analytics/export-event-slots/${eventId}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_slot_bookings.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting event slots:', error);
      setError('Failed to export event slots. Please try again later.');
    }
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
            <Tab label="Analytics" />
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
                        {format(new Date(event.startDate).getTime() + (5.5 * 60 * 60 * 1000), 'PPp')} IST
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status==="cancelled"?"Completed":event.status} 
                          color={event.status === 'upcoming' ? 'primary' : 'secondary'} 
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
                            color="primary"
                            size="small"
                            href={`/events/${event.truckersmpId}`}
                            target="_blank"
                          >
                            View Event
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExportEventSlots(event.truckersmpId)}
                          >
                            Export Slots
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
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {booking.eventTitle || 'Unknown Event'}
                        </Typography>
                        {booking.eventId && (
                          <Link 
                            href={`/events/${booking.eventId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ fontSize: '0.8rem' }}
                          >
                            View Event
                          </Link>
                        )}
                      </TableCell>
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
                        {booking.status === 'approved' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            disabled={actionLoading === booking.slotNumber}
                            onClick={() => openDeleteDialog(booking)}
                          >
                            {actionLoading === booking.slotNumber ? 'Processing...' : 'Delete'}
                          </Button>
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

      {/* Analytics Tab */}
      {activeTab === 2 && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', p: 3 }}>
          <AnalyticsDashboard />
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

      {/* Delete Booking Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Approved Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this approved booking for slot #{bookingToDelete?.slotNumber}? 
            This action cannot be undone and will make the slot available again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteBooking} 
            color="error" 
            variant="contained"
            disabled={actionLoading === bookingToDelete?.slotNumber}
          >
            {actionLoading === bookingToDelete?.slotNumber ? 'Processing...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 