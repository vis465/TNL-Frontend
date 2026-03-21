import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
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
  Paper,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Event as EventIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  Analytics as AnalyticsIcon,
  EmojiEvents as EmojiEventsIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarTodayIcon,
  List as ListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import ridersService from '../services/ridersService';

const HRDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(3);
  const [events, setEvents] = useState([]);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Create event dialog state
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventId, setEventId] = useState('');
  
  // Add members dialog state
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  
  // Edit event dialog state
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventData, setEditEventData] = useState({
    title: '',
    description: '',
    eventDate: '',
    status: 'active'
  });
  
  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  // Remove member dialog state
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  // Event details dialog state
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  
  // Manual attendance management state
  const [riders, setRiders] = useState([]);
  const [addRiderOpen, setAddRiderOpen] = useState(false);
  const [confirmAddRiderOpen, setConfirmAddRiderOpen] = useState(false);
  const [removeAttendanceOpen, setRemoveAttendanceOpen] = useState(false);
  const [selectedRiderIds, setSelectedRiderIds] = useState([]);
  const [riderToRemove, setRiderToRemove] = useState(null);

  useEffect(() => {
    if (user?.role === 'hrteam' || user?.role === 'admin') {
      fetchEvents();
      fetchAttendanceEvents();
      fetchAttendanceStats();
      fetchMembers();
    }
  }, [user, isAuthenticated]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hr-events');
      setEvents(response.data);
    } catch (error) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceEvents = async () => {
    try {
      const response = await axiosInstance.get('/attendance-events');
      setAttendanceEvents(response.data);
    } catch (error) {
      console.error('Error fetching attendance events:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await axiosInstance.get('/attendance-events/stats');
      setAttendanceStats(response.data.riderStats || []);
      setRecentAttendances(response.data.recentAttendances || []);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axiosInstance.get('/hr-events/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (tabValue === 3) {
      // For attendance events, we need title and eventDate
      if (!eventId.trim()) {
        setError('Please enter an event title');
        return;
      }
      
      try {
        setLoading(true);
        await axiosInstance.post('/attendance-events', {
          title: eventId.trim(),
          description: 'HR Event',
          eventDate: new Date().toISOString(),
          isAttendanceOpen: true
        });
        
        setSuccess('Attendance event created successfully');
        setCreateEventOpen(false);
        setEventId('');
        fetchEvents();
        fetchAttendanceEvents();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to create attendance event');
      } finally {
        setLoading(false);
      }
    } else {
      // For regular HR events
      if (!eventId.trim()) {
        setError('Please enter a TruckersMP Event ID');
        return;
      }

      try {
        setLoading(true);
        await axiosInstance.post('/hr-events/create', {
          truckersmpEventId: eventId.trim()
        });
        
        setSuccess('Event created successfully');
        setCreateEventOpen(false);
        setEventId('');
        fetchEvents();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to create event');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    const memberIdsArray = selectedMembers.map(member => member.truckersmpUserId);
    
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/hr-events/${selectedEvent._id}/add-members`, {
        memberIds: memberIdsArray
      });
      
      setSuccess(`Successfully added ${response.data.addedCount} members`);
      setAddMembersOpen(false);
      setSelectedMembers([]);
      setSelectedEvent(null);
      fetchEvents();
      fetchAttendanceStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMembers = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/hr-events/sync-members');
      setSuccess('Members synced successfully');
      fetchMembers();
      fetchAttendanceStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to sync members');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m._id === member._id);
      if (isSelected) {
        return prev.filter(m => m._id !== member._id);
      } else {
        return [...prev, member];
      }
    });
  };

  const isMemberSelected = (member) => {
    return selectedMembers.some(m => m._id === member._id);
  };

  const handleSelectAll = () => {
    setSelectedMembers(filteredMembers);
  };

  const handleClearAll = () => {
    setSelectedMembers([]);
  };

  // Edit event functions
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEditEventData({
      title: event.title,
      description: event.description || '',
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      status: event.status
    });
    setEditEventOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editEventData.title.trim()) {
      setError('Event title is required');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.patch(`/hr-events/${editingEvent._id}`, editEventData);
      setSuccess('Event updated successfully');
      setEditEventOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  // Delete event functions
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEvent = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/hr-events/${eventToDelete._id}`);
      setSuccess('Event deleted successfully');
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // Remove member functions
  const handleRemoveMember = (event, member) => {
    setSelectedEvent(event);
    setMemberToRemove(member);
    setRemoveMemberOpen(true);
  };

  const confirmRemoveMember = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/hr-events/${selectedEvent._id}/remove-member/${memberToRemove._id}`);
      setSuccess('Member removed from event successfully');
      setRemoveMemberOpen(false);
      setSelectedEvent(null);
      setMemberToRemove(null);
      fetchEvents();
      fetchAttendanceStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.truckersmpUserId.toString().includes(searchTerm)
  );

  // Categorize members as active/inactive
  const activeMembers = attendanceStats.filter(member => 
    member.totalEventsAttended > 0 && 
    (member.username.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
     member.truckersmpUserId.toString().includes(attendanceSearchTerm))
  );
  const inactiveMembers = attendanceStats.filter(member => 
    member.totalEventsAttended === 0 && 
    (member.username.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
     member.truckersmpUserId.toString().includes(attendanceSearchTerm))
  );

  // Data insights
  const totalMembers = attendanceStats.length;
  const activeCount = attendanceStats.filter(member => member.totalEventsAttended > 0).length;
  const inactiveCount = attendanceStats.filter(member => member.totalEventsAttended === 0).length;
  const activePercentage = totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0;
  const totalEvents = attendanceEvents.length;
  const averageAttendance = totalMembers > 0 ? Math.round(attendanceStats.reduce((sum, member) => sum + member.totalEventsAttended, 0) / totalMembers) : 0;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewEventDetails = async (event) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/attendance-events/${event._id}`);
      setSelectedEventDetails(response.data);
      setEventDetailsOpen(true);
    } catch (error) {
      setError('Failed to fetch event details');
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const list = await ridersService.list();
      setRiders(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching riders:', error);
      setError('Failed to fetch riders list');
    }
  };

  const openAddRiderDialog = async () => {
    setSelectedRiderIds([]);
    await fetchRiders();
    setAddRiderOpen(true);
  };

  const existingRiderIds = new Set(
    (selectedEventDetails?.attendanceEntries || [])
      .map((entry) => entry?.riderId?._id)
      .filter(Boolean)
  );
  const availableRiders = riders.filter((rider) => !existingRiderIds.has(rider._id));
  const selectedRiders = availableRiders.filter((rider) => selectedRiderIds.includes(rider._id));

  const handleManualAddRider = async () => {
    if (!selectedEventDetails?._id || selectedRiderIds.length === 0) {
      setError('Please select at least one rider to add');
      return;
    }

    try {
      setLoading(true);
      const results = await Promise.allSettled(
        selectedRiderIds.map((riderId) =>
          axiosInstance.post(`/attendance-events/${selectedEventDetails._id}/attendance/manual`, {
            riderId,
            status: 'approved',
            notes: 'Added manually by HR'
          })
        )
      );

      const addedCount = results.filter((r) => r.status === 'fulfilled').length;
      const failedCount = results.length - addedCount;

      const response = await axiosInstance.get(`/attendance-events/${selectedEventDetails._id}`);
      setSelectedEventDetails(response.data);
      fetchAttendanceEvents();
      fetchAttendanceStats();
      if (failedCount > 0) {
        setSuccess(`${addedCount} rider(s) added, ${failedCount} failed`);
      } else {
        setSuccess(`${addedCount} rider(s) added to attendance list`);
      }
      setConfirmAddRiderOpen(false);
      setAddRiderOpen(false);
      setSelectedRiderIds([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add riders');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttendanceEntry = (entry) => {
    setRiderToRemove(entry);
    setRemoveAttendanceOpen(true);
  };

  const confirmRemoveAttendanceEntry = async () => {
    if (!selectedEventDetails?._id || !riderToRemove?._id) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/attendance-events/${selectedEventDetails._id}/attendance/${riderToRemove._id}`);
      const response = await axiosInstance.get(`/attendance-events/${selectedEventDetails._id}`);
      setSelectedEventDetails(response.data);
      fetchAttendanceEvents();
      fetchAttendanceStats();
      setSuccess(`${riderToRemove?.riderId?.name || 'Rider'} removed from attendance list`);
      setRemoveAttendanceOpen(false);
      setRiderToRemove(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove rider');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAttendance = async (eventId, entryId) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/attendance-events/${eventId}/attendance/${entryId}`, {
        status: 'approved'
      });
      setSuccess('Attendance approved successfully');
      // Refresh event details
      const response = await axiosInstance.get(`/attendance-events/${eventId}`);
      setSelectedEventDetails(response.data);
      fetchAttendanceEvents();
    } catch (error) {
      setError('Failed to approve attendance');
      console.error('Error approving attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAttendance = async (eventId, entryId) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/attendance-events/${eventId}/attendance/${entryId}`, {
        status: 'rejected'
      });
      setSuccess('Attendance rejected successfully');
      // Refresh event details
      const response = await axiosInstance.get(`/attendance-events/${eventId}`);
      setSelectedEventDetails(response.data);
      fetchAttendanceEvents();
    } catch (error) {
      setError('Failed to reject attendance');
      console.error('Error rejecting attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (eventId, isAttendanceOpen) => {
    try {
      setLoading(true);
      setError('');
      
      await axiosInstance.patch(`/attendance-events/${eventId}/toggle-attendance`, {
        isAttendanceOpen
      });
      
      setSuccess(`Attendance ${isAttendanceOpen ? 'opened' : 'closed'} successfully`);
      fetchAttendanceEvents();
    } catch (error) {
      console.error('Error toggling attendance:', error);
      setError('Failed to toggle attendance status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  // Show loading state while user is being loaded
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading...</Typography>
        </Box>
      </Container>
    );
  }
  
  if (user?.role !== 'hrteam' && user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. HR team access required. Current role: {user?.role || 'none'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          HR Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage events and track member attendance
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateEventOpen(true)}
          sx={{ mr: 2 }}
        >
          Create Event
        </Button>
        <Button
          variant="outlined"
          startIcon={<SyncIcon />}
          onClick={handleSyncMembers}
          disabled={loading}
        >
          Sync Members
        </Button>
      </Box>


     

      {tabValue === 3 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Events Management ({attendanceEvents.length})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
                onChange={(e) => {
                  const selected = e.target.value ? new Date(e.target.value) : null;
                  if (!selected) {
                    fetchAttendanceEvents();
                    return;
                  }
                  const start = new Date(selected);
                  start.setHours(0,0,0,0);
                  const end = new Date(selected);
                  end.setHours(23,59,59,999);
                  const filtered = attendanceEvents.filter(ev => {
                    const d = new Date(ev.eventDate);
                    return d >= start && d <= end;
                  });
                  setAttendanceEvents(filtered);
                }}
                placeholder="Filter by date"
                InputProps={{ startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateEventOpen(true)}
              >
                Create Attendance Event
              </Button>
            </Box>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : attendanceEvents.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Attendance Events Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first attendance event to start tracking rider attendance
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Event Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Attendance Open</TableCell>
                    <TableCell>Attendance Entries</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.description || 'No description'}</TableCell>
                      <TableCell>{formatDate(event.eventDate)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status} 
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.isAttendanceOpen ? 'Open' : 'Closed'} 
                          color={event.isAttendanceOpen ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${event.attendanceEntries?.length || 0} entries`}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={event.isAttendanceOpen ? 'Close Attendance' : 'Open Attendance'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleAttendance(event._id, !event.isAttendanceOpen)}
                              color={event.isAttendanceOpen ? 'warning' : 'success'}
                            >
                              {event.isAttendanceOpen ? <LockIcon /> : <LockOpenIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewEventDetails(event)}
                            >
                              <EventIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createEventOpen} onClose={() => setCreateEventOpen(false)}>
        <DialogTitle>
          {tabValue === 3 ? 'Create Attendance Event' : 'Create HR Event'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={tabValue === 3 ? 'Event Title' : 'TruckersMP Event ID'}
            fullWidth
            variant="outlined"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder={tabValue === 3 ? 'Enter event title' : 'Enter the TruckersMP event ID'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEventOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateEvent} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editEventOpen} onClose={() => setEditEventOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            variant="outlined"
            value={editEventData.title}
            onChange={(e) => setEditEventData({...editEventData, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editEventData.description}
            onChange={(e) => setEditEventData({...editEventData, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Event Date"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={editEventData.eventDate}
            onChange={(e) => setEditEventData({...editEventData, eventDate: e.target.value})}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Status"
            select
            fullWidth
            variant="outlined"
            value={editEventData.status}
            onChange={(e) => setEditEventData({...editEventData, status: e.target.value})}
            SelectProps={{ native: true }}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEventOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateEvent} 
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {loading ? <CircularProgress size={20} /> : 'Update Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={addMembersOpen} onClose={() => setAddMembersOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Members to Event</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Event: {selectedEvent?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selected: {selectedMembers.length} member(s)
          </Typography>
          
          {members.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search members by username or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAll}
                  disabled={selectedMembers.length === filteredMembers.length}
                >
                  Select All ({filteredMembers.length})
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleClearAll}
                  disabled={selectedMembers.length === 0}
                >
                  Clear All
                </Button>
              </Box>
            </Box>
          )}
          
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {members.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No members found. Click "Sync Members" to fetch members from TruckersMP.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Select</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>TruckersMP ID</TableCell>
                      <TableCell>Events Attended</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow 
                        key={member._id}
                        hover
                        onClick={() => handleMemberSelect(member)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <IconButton
                            size="small"
                            color={isMemberSelected(member) ? 'primary' : 'default'}
                          >
                            {isMemberSelected(member) ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>{member.truckersmpUserId}</TableCell>
                        <TableCell>
                          <Chip 
                            label={member.totalEventsAttended || 0}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddMembersOpen(false);
            setSelectedMembers([]);
            setSearchTerm('');
          }}>Cancel</Button>
          <Button 
            onClick={handleAddMembers} 
            variant="contained"
            disabled={loading || selectedMembers.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : `Add ${selectedMembers.length} Member(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this event?
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {eventToDelete?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All attendance records for this event will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteEvent} 
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={<DeleteIcon />}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={removeMemberOpen} onClose={() => setRemoveMemberOpen(false)}>
        <DialogTitle>Remove Member from Event</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to remove this member from the event?
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {memberToRemove?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Event: {selectedEvent?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will update their attendance records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveMemberOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmRemoveMember} 
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={<RemoveIcon />}
          >
            {loading ? <CircularProgress size={20} /> : 'Remove Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={eventDetailsOpen} onClose={() => setEventDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Event Details: {selectedEventDetails?.title}
        </DialogTitle>
        <DialogContent>
          {selectedEventDetails && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Event Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Description:</Typography>
                    <Typography variant="body1">{selectedEventDetails.description || 'No description'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Event Date:</Typography>
                    <Typography variant="body1">{formatDate(selectedEventDetails.eventDate)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Chip 
                      label={selectedEventDetails.status} 
                      color={getStatusColor(selectedEventDetails.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Attendance Open:</Typography>
                    <Chip 
                      label={selectedEventDetails.isAttendanceOpen ? 'Yes' : 'No'} 
                      color={selectedEventDetails.isAttendanceOpen ? 'success' : 'error'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Attendance Entries ({selectedEventDetails.attendanceEntries?.length || 0})
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={openAddRiderDialog}
                  disabled={loading}
                >
                  Add Rider Manually
                </Button>
              </Box>
              
              {selectedEventDetails.attendanceEntries && selectedEventDetails.attendanceEntries.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rider Name</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Submitted At</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedEventDetails.attendanceEntries.map((entry) => (
                        <TableRow key={entry._id}>
                          <TableCell>{entry.riderId?.name || 'Unknown'}</TableCell>
                          <TableCell>{entry.riderId?.username || 'Unknown'}</TableCell>
                          <TableCell>{entry.riderId?.employeeID || 'N/A'}</TableCell>
                          <TableCell>{formatDate(entry.markedAt)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={entry.status} 
                              color={
                                entry.status === 'approved' ? 'success' : 
                                entry.status === 'rejected' ? 'error' : 
                                'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{entry.notes || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                              {entry.status === 'pending' && (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleApproveAttendance(selectedEventDetails._id, entry._id)}
                                    disabled={loading}
                                    startIcon={<CheckCircleIcon />}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleRejectAttendance(selectedEventDetails._id, entry._id)}
                                    disabled={loading}
                                    startIcon={<CancelIcon />}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {entry.status !== 'pending' && (
                                <Typography variant="body2" color="text.secondary">
                                  {entry.status === 'approved' ? 'Approved' : 'Rejected'}
                                </Typography>
                              )}
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleRemoveAttendanceEntry(entry)}
                                disabled={loading}
                                startIcon={<RemoveIcon />}
                              >
                                Remove
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No attendance entries yet
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Rider Dialog */}
      <Dialog open={addRiderOpen} onClose={() => setAddRiderOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Rider to Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Event: {selectedEventDetails?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Selected: {selectedRiderIds.length} rider(s)
          </Typography>
          {selectedRiders.length > 0 && (
            <Box
              sx={{
                mb: 2,
                maxHeight: 140,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1
              }}
            >
              {selectedRiders.map((rider) => (
                <Typography key={rider._id} variant="body2">
                  - {rider.name || rider.username} 
                </Typography>
              ))}
            </Box>
          )}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="add-rider-select-label">Select riders</InputLabel>
            <Select
              labelId="add-rider-select-label"
              multiple
              value={selectedRiderIds}
              label="Select riders"
              onChange={(e) => setSelectedRiderIds(e.target.value)}
              renderValue={(selected) => `${selected.length} selected`}
            >
              {availableRiders.map((rider) => (
                <MenuItem key={rider._id} value={rider._id}>
                  <Checkbox checked={selectedRiderIds.includes(rider._id)} />
                  <ListItemText
                    primary={rider.name || rider.username}
                    secondary={`${rider.username || '-'} (${rider.employeeID || 'No ID'})`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {availableRiders.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" onClick={() => setSelectedRiderIds(availableRiders.map((r) => r._id))}>
                Select All
              </Button>
              <Button size="small" onClick={() => setSelectedRiderIds([])}>
                Clear
              </Button>
            </Box>
          )}
          {availableRiders.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              All riders are already in this attendance list.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRiderOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={selectedRiderIds.length === 0 || loading}
            onClick={() => setConfirmAddRiderOpen(true)}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Add Rider Dialog */}
      <Dialog open={confirmAddRiderOpen} onClose={() => setConfirmAddRiderOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Riders Addition</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please confirm the selected riders below will be added to this attendance list:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Event:</strong> {selectedEventDetails?.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
            <strong>Total to add:</strong> {selectedRiders.length}
          </Typography>
          <Box sx={{ maxHeight: 220, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
            {selectedRiders.map((rider) => (
              <Typography key={rider._id} variant="body2">
                - {rider.name || rider.username} ({rider.employeeID || 'No ID'})
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAddRiderOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleManualAddRider}
            disabled={loading || selectedRiderIds.length === 0}
            startIcon={<PersonAddIcon />}
          >
            {loading ? <CircularProgress size={20} /> : `Confirm Add ${selectedRiderIds.length} Rider(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Remove Rider Dialog */}
      <Dialog open={removeAttendanceOpen} onClose={() => setRemoveAttendanceOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Remove Rider from Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to remove this rider from the attendance list?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Event:</strong> {selectedEventDetails?.title}
          </Typography>
          <Typography variant="body2">
            <strong>Name:</strong> {riderToRemove?.riderId?.name || riderToRemove?.riderId?.username || '-'}
          </Typography>
          <Typography variant="body2">
            <strong>Employee ID:</strong> {riderToRemove?.riderId?.employeeID || '-'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveAttendanceOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmRemoveAttendanceEntry}
            disabled={loading || !riderToRemove}
            startIcon={<RemoveIcon />}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HRDashboard;