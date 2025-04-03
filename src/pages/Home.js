import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import axiosInstance from '../utils/axios';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const response = await axiosInstance.get('/events');
      console.log('Raw API Response:', response);
      console.log('Response Data:', response.data);
      
      // Check if response.data has a response property
      const eventsData = response.data.response || response.data;
      console.log('Events Data:', eventsData);
      
      if (!Array.isArray(eventsData)) {
        console.error('Events data is not an array:', eventsData);
        setError('Invalid data format received from server');
        return;
      }

      const filteredEvents = eventsData.filter(event => event.status !== 'Completed');
      console.log('Filtered Events:', filteredEvents);
      console.log('Number of events:', filteredEvents.length);
      
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Error fetching events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'success';
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const categorizeEvents = () => {
    const now = new Date();
    console.log('Categorizing events:', events);
  
    const categorized = {
      upcoming: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);
          console.log('Checking upcoming event:', event.title, startDate);
          return startDate > now; // Future start date
        } catch (error) {
          console.error('Error processing upcoming event:', event.title, error);
          return false;
        }
      }),
      live: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);
          
          
        } catch (error) {
          console.error('Error processing live event:', event.title, error);
          return false;
        }
      }),
      past: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);
          console.log('Checking past event:', event.title, startDate);
          return startDate < now; // Past start date
        } catch (error) {
          console.error('Error processing past event:', event.title, error);
          return false;
        }
      })
    };
  
    console.log('Categorized events:', categorized);
    return categorized;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderEventCard = (event) => (
    <Grid item xs={12} sm={6} md={4} key={event._id || event.truckersmpId}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {event.banner && (
          <CardMedia
            component="img"
            height="140"
            image={event.banner}
            alt={event.title}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {event.description ? event.description.substring(0, 150) + '...' : 'No description available'}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Route:</strong> {event.route || 'Not specified'}
            </Typography>
            <Typography variant="body2">
              <strong>Server:</strong> {event.server || 'Not specified'}
            </Typography>
            <Typography variant="body2">
              <strong>Start:</strong>{' '}
              {format(new Date(event.startDate), 'PPp')}
            </Typography>
            
            <Typography variant="body2">
              <strong>Meeting Point:</strong> {event.meetingPoint || 'Not specified'}
            </Typography>
            <Typography variant="body2">
              <strong>Departure:</strong> {event.departurePoint || 'Not specified'}
            </Typography>
            <Typography variant="body2">
              <strong>Arrival:</strong> {event.arrivalPoint || 'Not specified'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={event.status || 'Unknown'}
              color={getStatusColor(event.status)}
              size="small"
            />
            {event.attendances && (
              <Chip
                label={`${event.attendances.confirmed} attending`}
                color="info"
                size="small"
              />
            )}
          </Box>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Stack direction="row" spacing={1} width="100%">
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to={`/events/${event.truckersmpId}`}
              fullWidth
            >
              View Details
            </Button>
            {event.externalLink && (
              <Button
                variant="outlined"
                color="secondary"
                href={event.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                External
              </Button>
            )}
          </Stack>
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  const { upcoming, live, past } = categorizeEvents();
  console.log('Final categorized events:', { upcoming, live, past });

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
        Convoys
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} >
          <Tab label={`Upcoming (${upcoming.length})`} style={{color:'red'}}/>
         
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {activeTab === 0 && upcoming.length > 0 ? (
          upcoming.map(renderEventCard)
        ) : activeTab === 1 && live.length > 0 ? (
          live.map(renderEventCard)
        ) : activeTab === 2 && past.length > 0 ? (
          past.map(renderEventCard)
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">
              No events found in this category
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Home; 