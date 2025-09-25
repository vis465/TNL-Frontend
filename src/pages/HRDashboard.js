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
  AccordionDetails
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const HRDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
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

  useEffect(() => {
    if (user?.role === 'hrteam' || user?.role === 'admin') {
      fetchEvents();
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

  const fetchAttendanceStats = async () => {
    try {
      const response = await axiosInstance.get('/hr-events/attendance-stats');
      setAttendanceStats(response.data);
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
  const activeCount = activeMembers.length;
  const inactiveCount = inactiveMembers.length;
  const activePercentage = totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0;
  const totalEvents = events.length;
  const averageAttendance = totalEvents > 0 ? Math.round(attendanceStats.reduce((sum, member) => sum + member.totalEventsAttended, 0) / totalMembers) : 0;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

      {/* Data Insights Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {totalMembers}
            </Typography>
            <Typography variant="body2">Total Members</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
            <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {activeCount}
            </Typography>
            <Typography variant="body2">Active Members ({activePercentage}%)</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
            <PersonOffIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {inactiveCount}
            </Typography>
            <Typography variant="body2">Inactive Members</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
            <EmojiEventsIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {averageAttendance}
            </Typography>
            <Typography variant="body2">Avg Events/Member</Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<EventIcon />} label="Events" />
          <Tab icon={<PeopleIcon />} label="Attendance Stats" />
          <Tab icon={<ListIcon />} label="Event-wise Attendance" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            HR Events ({events.length})
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Event Date</TableCell>
                    <TableCell>Attendees</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{formatDate(event.eventDate)}</TableCell>
                      <TableCell>{event.attendees?.length || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status} 
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{event.createdBy?.username}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Add Members">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedEvent(event);
                                setAddMembersOpen(true);
                              }}
                            >
                              <PeopleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Event">
                            <IconButton
                              size="small"
                              onClick={() => handleEditEvent(event)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Event">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteEvent(event)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
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

      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Member Attendance Statistics
            </Typography>
            <TextField
              size="small"
              placeholder="Search members..."
              value={attendanceSearchTerm}
              onChange={(e) => setAttendanceSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: <AnalyticsIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
          
          {/* Active Members Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                Active Members ({activeCount})
              </Typography>
            </Box>
            
            {activeMembers.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'success.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Username</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>TruckersMP ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Events Attended</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Last Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeMembers
                      .sort((a, b) => b.totalEventsAttended - a.totalEventsAttended)
                      .map((member) => (
                      <TableRow key={member._id} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{member.username}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{member.truckersmpUserId}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            icon={<TrendingUpIcon />}
                            label={member.totalEventsAttended}
                            color="success"
                            size="medium"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              minWidth: '60px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{formatDate(member.lastUpdated)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  No active members found
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Inactive Members Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonOffIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                Inactive Members ({inactiveCount})
              </Typography>
            </Box>
            
            {inactiveMembers.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: 'warning.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Username</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>TruckersMP ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Events Attended</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Last Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inactiveMembers
                      .sort((a, b) => a.username.localeCompare(b.username))
                      .map((member) => (
                      <TableRow key={member._id} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{member.username}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{member.truckersmpUserId}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip 
                            label="0"
                            color="default"
                            size="medium"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              minWidth: '60px',
                              opacity: 0.7
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{formatDate(member.lastUpdated)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                <PersonOffIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  All members are active! 🎉
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event-wise Attendance
            </Typography>
            <TextField
              size="small"
              placeholder="Search events..."
              value={attendanceSearchTerm}
              onChange={(e) => setAttendanceSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          {events.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <EventIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Events Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first HR event to start tracking attendance
              </Typography>
            </Paper>
          ) : (
            <Box>
              {events
                .filter(event => 
                  event.title.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
                  event.description?.toLowerCase().includes(attendanceSearchTerm.toLowerCase())
                )
                .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
                .map((event) => (
                <Accordion key={event._id} sx={{ mb: 2, boxShadow: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: 'primary.light',
                      color: 'black',
                      '&:hover': { bgcolor: 'primary.main' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%',color:'black' }}>
                      <EventIcon sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold',color:'black' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9,color:'black' }}>
                          {formatDate(event.eventDate)} • {event.attendees?.length || 0} attendees
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={event.status} 
                          color={getStatusColor(event.status)}
                          size="small"
                          sx={{ color: 'black', bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                        <Chip 
                          icon={<PeopleIcon />}
                          label={`${event.attendees?.length || 0} Members`}
                          size="small"
                          sx={{ color: 'black', bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    {event.attendees && event.attendees.length > 0 ? (
                      <TableContainer>
                        <Table>
                                                      <TableHead sx={{ bgcolor: 'grey.100',color:'black' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold',color:'black' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 'bold',color:'black' }}>TruckersMP ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center',color:'black' }}>Total Events</TableCell>
                                <TableCell sx={{ fontWeight: 'bold',color:'black' }}>Last Updated</TableCell>
                                <TableCell sx={{ fontWeight: 'bold',color:'black', textAlign: 'center' }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                          <TableBody>
                            {event.attendees
                              .sort((a, b) => a.username.localeCompare(b.username))
                              .map((member) => (
                              <TableRow key={member._id} hover>
                                <TableCell sx={{ fontWeight: 'medium' }}>{member.username}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{member.truckersmpUserId}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                  <Chip 
                                    icon={<TrendingUpIcon />}
                                    label={member.totalEventsAttended || 0}
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>
                                  {formatDate(member.lastUpdated)}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                  <Tooltip title="Remove from Event">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveMember(event, member)}
                                      sx={{ color: 'error.main' }}
                                    >
                                      <RemoveIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <PeopleIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          No attendees for this event
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Click the "Add Members" button to add attendees
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createEventOpen} onClose={() => setCreateEventOpen(false)}>
        <DialogTitle>Create HR Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="TruckersMP Event ID"
            fullWidth
            variant="outlined"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter the TruckersMP event ID"
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
    </Container>
  );
};

export default HRDashboard;