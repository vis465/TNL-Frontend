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
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';
import ManageSlotsDialog from '../components/ManageSlotsDialog';
import AnalyticsDashboard from './AnalyticsDashboard';
import AdminInvites from '../components/AdminInvites';

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
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState({});
  const [user, setUser] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
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
      console.log('Updating booking status:', { slotId, slotNumber, status, user: localStorage.getItem('user') });
      
      // Find the booking to get the discordUsername
      const booking = bookings.find(b => b.slotId === slotId && b.slotNumber === slotNumber);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const response = await axiosInstance.patch(`/slots/${slotId}/bookings/${slotNumber}`, {
        status,
        discordUsername: booking.discordUsername // Include the discordUsername in the update
      });

      console.log('Status update response:', response.data);
      if (response.data.approvedBy) {
        console.log('Booking approved by:', response.data.approvedBy);
      }
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

  const handleBulkDeleteBookings = async () => {
    if (!eventToDelete) return;
    
    try {
      setBulkDeleteLoading(true);
      console.log('Bulk deleting bookings for event:', eventToDelete);
      
      // Get all bookings for this event
      const eventBookings = bookings.filter(booking => booking.eventTitle === eventToDelete);
      
      // Delete each booking
      for (const booking of eventBookings) {
        await axiosInstance.delete(`/slots/${booking.slotId}/bookings/${booking.slotNumber}`);
      }
      
      console.log('All bookings deleted successfully');
      await fetchData(); // Refresh the bookings data
      setBulkDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error bulk deleting bookings:', error);
      setError(`Failed to delete bookings: ${error.message}`);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const openDeleteDialog = (booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = (eventTitle) => {
    setEventToDelete(eventTitle);
    setBulkDeleteDialogOpen(true);
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

  const tableStyles = {
    '& .MuiTableCell-root': {
      [theme.breakpoints.down('sm')]: {
        padding: '8px',
        '&:not(:first-of-type)': {
          display: 'none'
        }
      }
    }
  };

  const mobileTableCell = {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      '& > *': {
        margin: '4px 0'
      }
    }
  };

  const renderMobileNav = () => (
    <SwipeableDrawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      onOpen={() => setDrawerOpen(true)}
      sx={{
        '& .MuiDrawer-paper': {
          top: '64px', // Height of the navbar
          height: 'calc(100% - 64px)', // Adjust height to account for navbar
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <List sx={{ width: 250 }}>
        {['Events Management', 'Booking Requests', 'VTC Invites'].map((text, index) => (
          <ListItem 
            button 
            key={text}
            selected={activeTab === index}
            onClick={() => {
              setActiveTab(index);
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary={text} />
          </ListItem>
        ))}
        {user?.role === 'admin' && (
          <ListItem 
            button 
            selected={activeTab === 3}
            onClick={() => {
              setActiveTab(3);
              setDrawerOpen(false);
            }}
          >
            <ListItemText primary="Analytics" />
          </ListItem>
        )}
      </List>
    </SwipeableDrawer>
  );

  const toggleEventExpansion = (eventTitle) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventTitle]: !prev[eventTitle]
    }));
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom={!isMobile}
          >
          Admin Dashboard
        </Typography>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          disabled={loading}
          color="primary"
          size={isMobile ? "medium" : "large"}
          sx={{ color: 'red' }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {!isMobile ? (
      <Box sx={{ width: '100%', mb: 3 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
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
            <Tab label="Events Management" />
            <Tab label="Booking Requests" />
            <Tab label="VTC Invites" />
            {user?.role === 'admin' && <Tab label="Analytics" />}
          </Tabs>
        </Paper>
      </Box>
      ) : renderMobileNav()}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Events Tab */}
      {activeTab === 0 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
          <TableContainer>
            <Table sx={tableStyles}>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  {!isMobile && (
                    <>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 1 : 4}>
                      <Alert severity="info">No events found.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.truckersmpId}>
                      <TableCell sx={mobileTableCell}>
                        <Typography variant="subtitle1">{event.title}</Typography>
                        {isMobile && (
                          <>
                            <Typography variant="body2">
                              {format(new Date(event.startDate).getTime() + (5.5 * 60 * 60 * 1000), 'PPp')} IST
                            </Typography>
                            <Chip 
                              label={event.status === "cancelled" ? "Completed" : event.status} 
                              color={event.status === 'upcoming' ? 'primary' : 'secondary'} 
                              size="small"
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleManageSlots(event)}
                              >
                                Manage
                              </Button>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                href={`/events/${event.truckersmpId}`}
                                target="_blank"
                              >
                                View
                              </Button>
                              <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleExportEventSlots(event.truckersmpId)}
                              >
                                Export
                              </Button>
                            </Stack>
                          </>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <>
                      <TableCell>
                            {format(new Date(event.startDate).getTime() + (5.5 * 60 * 60 * 1000), 'PPp')} IST
                      </TableCell>
                      <TableCell>
                        <Chip 
                              label={event.status === "cancelled" ? "Completed" : event.status} 
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
                        </>
                      )}
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
        <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
          <TableContainer>
            <Table sx={tableStyles}>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  {!isMobile && (
                    <>
                  <TableCell>Image</TableCell>
                  <TableCell>Slot Number</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>VTC Details</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 1 : 7}>
                      <Alert severity="info">No booking requests found.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Group bookings by event title
                  Object.entries(
                    bookings.reduce((acc, booking) => {
                      const eventTitle = booking.eventTitle || 'Unknown Event';
                      if (!acc[eventTitle]) {
                        acc[eventTitle] = [];
                      }
                      acc[eventTitle].push(booking);
                      return acc;
                    }, {})
                  ).map(([eventTitle, eventBookings]) => (
                    <React.Fragment key={eventTitle}>
                      {/* Event header row - clickable to expand/collapse */}
                      <TableRow 
                        onClick={() => toggleEventExpansion(eventTitle)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell 
                          colSpan={isMobile ? 1 : 7} 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText',
                            fontWeight: 'bold',
                            py: 1
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' ,color:'black'}}>
                              {expandedEvents[eventTitle] ? 
                                <ExpandLessIcon sx={{ mr: 1 }} /> : 
                                <ExpandMoreIcon sx={{ mr: 1 }} />
                              }
                              <Typography variant="subtitle1">
                                {eventTitle} ({eventBookings.length} bookings)
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip 
                                label={`${eventBookings.filter(b => b.status === 'approved').length} Approved`}
                                color="success"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={`${eventBookings.filter(b => b.status === 'pending').length} Pending`}
                                color="warning"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={`${eventBookings.filter(b => b.status === 'rejected').length} Rejected`}
                                color="error"
                                size="small"
                              />
                              {user?.role === 'admin' && (
                                <Tooltip title="Delete all bookings for this event">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openBulkDeleteDialog(eventTitle);
                                    }}
                                    sx={{ ml: 1 }}
                                  >
                                    <DeleteSweepIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                      
                      {/* Collapsible content for bookings */}
                      <TableRow>
                        <TableCell colSpan={isMobile ? 1 : 7} sx={{ p: 0 }}>
                          <Collapse in={expandedEvents[eventTitle]} timeout="auto" unmountOnExit>
                            <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Event</TableCell>
                                    {!isMobile && (
                                      <>
                                      <TableCell>Image</TableCell>
                                      <TableCell>Slot Number</TableCell>
                                      <TableCell>Requester</TableCell>
                                      <TableCell>VTC Details</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell>Actions</TableCell>
                                        </>
                                    )}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {eventBookings.map((booking) => (
                    <TableRow 
                      key={booking._id}
                      sx={{
                        bgcolor: 
                          booking.status === 'approved' ? 'success.lighter' :
                          booking.status === 'rejected' ? 'error.lighter' :
                          'inherit'
                      }}
                    >
                                      <TableCell sx={mobileTableCell}>
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
                                        {isMobile && (
                                          <>
                                            {booking.imageUrl && (
                                              <Box
                                                component="img"
                                                src={booking.imageUrl}
                                                alt="Slot"
                                                sx={{
                                                  width: '100%',
                                                  height: 120,
                                                  objectFit: 'cover',
                                                  borderRadius: 1,
                                                  boxShadow: 1
                                                }}
                                              />
                                            )}
                                            <Typography variant="body1" fontWeight="medium">
                                              Slot #{booking.slotNumber}
                                            </Typography>
                                            <Typography>{booking.name}</Typography>
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
                                            <Chip 
                                              label={booking.status}
                                              color={
                                                booking.status === 'approved' ? 'success' :
                                                booking.status === 'rejected' ? 'error' :
                                                'warning'
                                              }
                                              size="small"
                                            />
                                            {booking.status === 'pending' && (
                                              <Stack direction="row" spacing={1}>
                                                <Button
                                                  variant="contained"
                                                  color="success"
                                                  size="small"
                                                  disabled={actionLoading === booking.slotNumber}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusUpdate(booking.slotId, booking.slotNumber, 'approved');
                                                  }}
                                                >
                                                  {actionLoading === booking.slotNumber ? 'Processing...' : 'Approve'}
                                                </Button>
                                                <Button
                                                  variant="contained"
                                                  color="error"
                                                  size="small"
                                                  disabled={actionLoading === booking.slotNumber}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusUpdate(booking.slotId, booking.slotNumber, 'rejected');
                                                  }}
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
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openDeleteDialog(booking);
                                                }}
                                              >
                                                {actionLoading === booking.slotNumber ? 'Processing...' : 'Delete'}
                                              </Button>
                                            )}
                                          </>
                                        )}
                                      </TableCell>
                                      {!isMobile && (
                                        <>
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
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusUpdate(booking.slotId, booking.slotNumber, 'approved');
                                                }}
                            >
                              {actionLoading === booking.slotNumber ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              disabled={actionLoading === booking.slotNumber}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusUpdate(booking.slotId, booking.slotNumber, 'rejected');
                                                }}
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
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteDialog(booking);
                                              }}
                                            >
                                              {actionLoading === booking.slotNumber ? 'Processing...' : 'Delete'}
                                            </Button>
                                          )}
                                        </TableCell>
                                        </>
                                      )}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Collapse>
                      </TableCell>
                    </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* VTC Invites Tab */}
      {activeTab === 2 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
          <AdminInvites />
        </Paper>
      )}

      {/* Analytics Tab */}
      {activeTab === 3 && user?.role === 'admin' && (
        <Paper sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          p: { xs: 1, sm: 2, md: 3 }
        }}>
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete All Bookings for Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all bookings for the event "{eventToDelete}"? 
            This action cannot be undone and will make all slots available again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkDeleteBookings} 
            color="error" 
            variant="contained"
            disabled={bulkDeleteLoading}
          >
            {bulkDeleteLoading ? 'Processing...' : 'Delete All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 