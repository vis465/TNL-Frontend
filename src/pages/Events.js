import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data.response || []);
    } catch (error) {
      setError('Error fetching events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return 'success'; // upcoming
    if (now >= startDate && now <= endDate) return 'primary'; // ongoing
    if (now > endDate) return 'default'; // completed
    return 'default';
  };

  const getStatusLabel = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    // {format(new Date(event.startDate).getTime() + (5.5 * 60 * 60 * 1000), 'PPp')} IST
    const endDate = new Date(event.endDate);

    if (now < startDate) return 'Upcoming';
    if (now >= startDate && now <= endDate) return 'Ongoing';
    if (now > endDate) return 'Completed';
    return 'Completed';
  };

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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Events
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.truckersmpId}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={event.banner || 'https://via.placeholder.com/300x140'}
                alt={event.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {event.description.substring(0, 150)}...
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Route:</strong> {event.route}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Server:</strong> {event.server}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Meetup:</strong>{' '}
                    {format(new Date(event.startDate), 'PPp')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Start:</strong>{' '}
                    {format(new Date(event.startDate), 'PPp')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Attendees:</strong> {event.attendances?.confirmed || 0}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={getStatusLabel(event)}
                    color={getStatusColor(event)}
                    size="small"
                  />
                  <Box>
                    {event.voiceLink && (
                      <Link
                        href={event.voiceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mr: 1 }}
                      >
                        <Button variant="outlined" color="secondary" size="small">
                          Discord
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/events/${event.truckersmpId}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Events; 