import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Link,
  Chip,
  Stack,
  CardMedia
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';

const AttendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/events/attending");
      console.log('Fetched events:', response.data); // Ensure data is an array
      setEvents(response.data); // Assuming API response is an array
      setError(null);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to fetch attending events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Events We're Attending
      </Typography>
      
      <Grid container spacing={3}>
        {events.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No events currently being attended.
            </Alert>
          </Grid>
        ) : (
          events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {event.banner && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.banner}
                    alt={event.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {event.name}
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Start: {format(new Date(event.start_at), 'PPP p')}
                    </Typography>
                    
                    {event.server && (
                      <Typography variant="body2" color="text.secondary">
                        Server: {event.server.name}
                      </Typography>
                    )}
                    
                    {event.departure && (
                      <Typography variant="body2" color="text.secondary">
<p>Departure: {event.departure.city} - {event.departure.location}</p>
</Typography>
                    )}
                    
                    {event.arrival && (
                      <Typography variant="body2" color="text.secondary">
                        Arrival: {event.arrival}
                      </Typography>
                    )}
                    
                   
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={event.game === 'ets2' ? 'ETS2' : 'ATS'} 
                        size="small" 
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={event.status} 
                        size="small"
                        color={event.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                    
                    {event.url && (
                      <Link 
                        href={`/External/${event.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ mt: 2 }}
                      >
                        View on TruckersMP
                      </Link>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default AttendingEvents; 