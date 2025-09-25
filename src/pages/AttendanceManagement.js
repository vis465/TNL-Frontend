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
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  People,
  Event,
  AssignmentIcon,
  Analytics,
  Search,
  CloudDownload,
  Refresh,
  ArrowBack,
  MenuIcon,
  CheckCircle,
  Cancel,
  Pending,
  Add,
  Edit,
  Delete,
  Close,
  Check,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState(null);
  
  // Event creation dialog state
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    endDate: '',
    isAttendanceOpen: true
  });
  const [eventFormLoading, setEventFormLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  
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

      // Fetch attendance, events, members, and attendance events data
      const [attendanceResponse, eventsResponse, membersResponse, attendanceEventsResponse] = await Promise.all([
        axiosInstance.get('/attendance'),
        axiosInstance.get('/events'),
        axiosInstance.get('/members'),
        axiosInstance.get('/attendance-events')
      ]);

      setAttendance(attendanceResponse.data.attendance || []);
      setEvents(eventsResponse.data.response || []);
      setMembers(membersResponse.data.members || []);
      setAttendanceEvents(attendanceEventsResponse.data || []);
      
      console.log('Attendance:', attendanceResponse.data);
      console.log('Events:', eventsResponse.data);
      console.log('Members:', membersResponse.data);
      console.log('Attendance Events:', attendanceEventsResponse.data);

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

  const handleRefresh = async () => {
    await fetchData();
  };

  // Event management functions
  const handleCreateEvent = async () => {
    try {
      setEventFormLoading(true);
      await axiosInstance.post('/attendance-events', eventForm);
      setEventDialogOpen(false);
      setEventForm({
        title: '',
        description: '',
        eventDate: '',
        endDate: '',
        isAttendanceOpen: true
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    } finally {
      setEventFormLoading(false);
    }
  };

  const handleUpdateEvent = async (eventId, updates) => {
    try {
      await axiosInstance.put(`/attendance-events/${eventId}`, updates);
      await fetchData();
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
    }
  };

  const handleApproveAttendance = async (eventId, entryId) => {
    try {
      await axiosInstance.put(`/attendance-events/${eventId}/attendance/${entryId}`, {
        status: 'approved'
      });
      await fetchData();
    } catch (error) {
      console.error('Error approving attendance:', error);
      setError('Failed to approve attendance. Please try again.');
    }
  };

  const handleRejectAttendance = async (eventId, entryId) => {
    try {
      await axiosInstance.put(`/attendance-events/${eventId}/attendance/${entryId}`, {
        status: 'rejected'
      });
      await fetchData();
    } catch (error) {
      console.error('Error rejecting attendance:', error);
      setError('Failed to reject attendance. Please try again.');
    }
  };

  const handleExportAttendance = async () => {
    try {
      const response = await axiosInstance.get('/attendance/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting attendance:', error);
      setError('Failed to export attendance data. Please try again later.');
    }
  };

  // Filter attendance based on search and filters
  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = !searchTerm || 
      record.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = eventFilter === 'all' || record.eventId === eventFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesEvent && matchesStatus;
  });

  // Get attendance statistics
  const getAttendanceStats = () => {
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(r => r.status === 'present').length;
    const absentCount = attendance.filter(r => r.status === 'absent').length;
    const pendingCount = attendance.filter(r => r.status === 'pending').length;
    
    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      pending: pendingCount,
      attendanceRate: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0
    };
  };

  const stats = getAttendanceStats();

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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom={!isMobile}
          >
            Attendance Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={handleExportAttendance}
            size="small"
          >
            Export
          </Button>
          <IconButton 
            onClick={handleRefresh} 
            disabled={loading}
            color="primary"
            size={isMobile ? "medium" : "large"}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {stats.present}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Cancel sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="error.main">
                    {stats.absent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Analytics sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {stats.attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
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
            <Tab label="Attendance Records" />
            <Tab label="Event Attendance" />
            <Tab label="Member Attendance" />
            <Tab label="Attendance Events" />
            <Tab label="Reports" />
          </Tabs>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Attendance Records Tab */}
      {activeTab === 0 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by member or event..."
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
                  fullWidth
                  size="small"
                  select
                  label="Event"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="all">All Events</option>
                  {events.map((event) => (
                    <option key={event.truckersmpId} value={event.truckersmpId}>
                      {event.title}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="pending">Pending</option>
                </TextField>
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert severity="info">No attendance records found.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {record.memberName || 'Unknown Member'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {record.memberId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.eventTitle || 'Unknown Event'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(record.date), 'PPp')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            record.status === 'present' ? <CheckCircle /> :
                            record.status === 'absent' ? <Cancel /> :
                            <Pending />
                          }
                          label={record.status}
                          color={
                            record.status === 'present' ? 'success' :
                            record.status === 'absent' ? 'error' :
                            'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.notes || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Event Attendance Tab */}
      {activeTab === 1 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Event Attendance Summary
          </Typography>
          <Grid container spacing={2}>
            {events.map((event) => {
              const eventAttendance = attendance.filter(a => a.eventId === event.truckersmpId);
              const presentCount = eventAttendance.filter(a => a.status === 'present').length;
              const totalCount = eventAttendance.length;
              const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={event.truckersmpId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {format(new Date(event.startDate), 'PPp')}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Present:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {presentCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {totalCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Rate:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="info.main">
                          {attendanceRate}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Member Attendance Tab */}
      {activeTab === 2 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Member Attendance Summary
          </Typography>
          <Grid container spacing={2}>
            {members.map((member) => {
              const memberAttendance = attendance.filter(a => a.memberId === member._id);
              const presentCount = memberAttendance.filter(a => a.status === 'present').length;
              const totalCount = memberAttendance.length;
              const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={member._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {member.name || 'Unknown Member'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {member.email}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Present:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {presentCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Total:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {totalCount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Rate:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="info.main">
                          {attendanceRate}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Attendance Events Tab */}
      {activeTab === 3 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Attendance Events Management</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setEventDialogOpen(true)}
              >
                Create Event
              </Button>
            </Stack>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                  <TableRow>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Event Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Attendance Open</TableCell>
                    <TableCell>Entries</TableCell>
                    <TableCell>Pending Approval</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {attendanceEvents.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {event.title}
                        </Typography>
                        {event.description && (
                          <Typography variant="caption" color="text.secondary">
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
                      <Chip
                        label={event.isAttendanceOpen ? 'Open' : 'Closed'}
                        color={event.isAttendanceOpen ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.attendanceEntries?.length || 0} entries
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="warning.main">
                        {event.attendanceEntries?.filter(entry => entry.status === 'pending').length || 0} pending
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Toggle Attendance">
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateEvent(event._id, { isAttendanceOpen: !event.isAttendanceOpen })}
                          >
                            {event.isAttendanceOpen ? <Close /> : <Check />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedEvent(event);
                              setEventDetailsOpen(true);
                            }}
                          >
                            <Event />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Close Event">
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateEvent(event._id, { status: 'closed' })}
                          >
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Reports Tab */}
      {activeTab === 4 && (
        <Paper sx={{ borderRadius: 2, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Attendance Reports
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overall Statistics
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Records:</Typography>
                      <Typography fontWeight="bold">{stats.total}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Present:</Typography>
                      <Typography fontWeight="bold" color="success.main">{stats.present}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Absent:</Typography>
                      <Typography fontWeight="bold" color="error.main">{stats.absent}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Pending:</Typography>
                      <Typography fontWeight="bold" color="warning.main">{stats.pending}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Attendance Rate:</Typography>
                      <Typography fontWeight="bold" color="info.main">{stats.attendanceRate}%</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<CloudDownload />}
                      onClick={handleExportAttendance}
                      fullWidth
                    >
                      Export All Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handleRefresh}
                      fullWidth
                    >
                      Refresh Data
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Event Creation Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Attendance Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Event Title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Event Date"
              type="datetime-local"
              value={eventForm.eventDate}
              onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date (Optional)"
              type="datetime-local"
              value={eventForm.endDate}
              onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={eventForm.isAttendanceOpen}
                  onChange={(e) => setEventForm({ ...eventForm, isAttendanceOpen: e.target.checked })}
                />
              }
              label="Attendance Open for Marking"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateEvent}
            variant="contained"
            disabled={eventFormLoading || !eventForm.title || !eventForm.eventDate}
          >
            {eventFormLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={eventDetailsOpen} onClose={() => setEventDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {selectedEvent?.title} - Attendance Details
            </Typography>
            <IconButton onClick={() => setEventDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Event Information</Typography>
                  <Typography variant="body2">Date: {format(new Date(selectedEvent.eventDate), 'MMM dd, yyyy HH:mm')}</Typography>
                  {selectedEvent.endDate && (
                    <Typography variant="body2">End: {format(new Date(selectedEvent.endDate), 'MMM dd, yyyy HH:mm')}</Typography>
                  )}
                  <Typography variant="body2">Status: {selectedEvent.status}</Typography>
                  <Typography variant="body2">Attendance Open: {selectedEvent.isAttendanceOpen ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Statistics</Typography>
                  <Typography variant="body2">Total Entries: {selectedEvent.attendanceEntries?.length || 0}</Typography>
                  <Typography variant="body2" color="warning.main">
                    Pending: {selectedEvent.attendanceEntries?.filter(entry => entry.status === 'pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Approved: {selectedEvent.attendanceEntries?.filter(entry => entry.status === 'approved').length || 0}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Rejected: {selectedEvent.attendanceEntries?.filter(entry => entry.status === 'rejected').length || 0}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Attendance Entries</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rider</TableCell>
                      <TableCell>Marked At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEvent.attendanceEntries?.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {entry.riderId?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.riderId?.employeeID || 'No ID'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(entry.markedAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.status}
                            color={entry.status === 'approved' ? 'success' : entry.status === 'rejected' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {entry.status === 'pending' && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleApproveAttendance(selectedEvent._id, entry._id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => handleRejectAttendance(selectedEvent._id, entry._id)}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                          {entry.status !== 'pending' && (
                            <Typography variant="body2" color="text.secondary">
                              {entry.approvedBy?.username} - {format(new Date(entry.approvedAt), 'MMM dd, HH:mm')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceManagement;
