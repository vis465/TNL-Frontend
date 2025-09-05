import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarTodayIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const PublicAttendance = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hr-events/public/attendance');
      setEvents(response.data);
      console.log(response.data);
    } catch (error) {
      setError('Failed to load attendance data');
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Calculate statistics
  const totalEvents = events.length;
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
  const activeEvents = events.filter(event => event.status === 'active').length;
  const completedEvents = events.filter(event => event.status === 'completed').length;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>Loading attendance data...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Event Attendance Records
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Track participation across all TNL events
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <EventIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {totalEvents}
            </Typography>
            <Typography variant="body2">Total Events</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
            <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {totalAttendees}
            </Typography>
            <Typography variant="body2">Total Attendances</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
            <EmojiEventsIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {activeEvents}
            </Typography>
            <Typography variant="body2">Active Events</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
            <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {completedEvents}
            </Typography>
            <Typography variant="body2">Completed Events</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search events by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600, mx: 'auto', display: 'block' }}
        />
      </Box>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50',color:'black' }}>
          <EventIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom color='black'>
            {searchTerm ? 'No events found matching your search' : 'No events available'}
          </Typography>
          <Typography variant="body2" color='black'>
            {searchTerm ? 'Try adjusting your search terms' : 'Check back later for upcoming events'}
          </Typography>
        </Paper>
      ) : (
        <Box>
          {filteredEvents.map((event) => (
            <Accordion key={event._id} sx={{ mb: 2, boxShadow: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: 'primary.light',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <EventIcon sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold',color:'black' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9,color:'black' }}>
                      {formatDate(event.eventDate)} • {event.attendees?.length || 0} attendees
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5,color:'black' }}>
                        {event.description.length > 100 
                          ? `${event.description.substring(0, 100)}...` 
                          : event.description
                        }
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={event.status} 
                      color={getStatusColor(event.status)}
                      size="small"
                      sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                    <Chip 
                      icon={<PeopleIcon />}
                      label={`${event.attendees?.length || 0} Members`}
                      size="small"
                      sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {event.attendees && event.attendees.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>TruckersMP ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total Events</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Last Updated</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {event.attendees
                          .sort((a, b) => b.totalEventsAttended - a.totalEventsAttended)
                          .map((member) => (
                          <TableRow key={member._id} hover>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                {member.username}
                              </Box>
                            </TableCell>
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
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 6, py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          TNL Event Attendance System • Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default PublicAttendance;
