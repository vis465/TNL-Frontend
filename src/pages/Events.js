import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const EventCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const EventImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const EventInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Events
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Join us in our upcoming events and be part of our trucking community
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <EventCard>
              <CardActionArea onClick={() => handleEventClick(event._id)}>
                <EventImage
                  image={event.image || '/default-event-image.jpg'}
                  alt={event.title}
                />
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {event.title}
                  </Typography>
                  
                  <EventInfo>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(event.date)}
                    </Typography>
                  </EventInfo>

                  <EventInfo>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </EventInfo>

                  <EventInfo>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {event.duration} hours
                    </Typography>
                  </EventInfo>

                  <EventInfo>
                    <PeopleIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {event.attendees?.length || 0} attendees
                    </Typography>
                  </EventInfo>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<LocalShippingIcon />}
                      label={event.game}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {event.type && (
                      <Chip
                        label={event.type}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event._id);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </CardActionArea>
            </EventCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Events; 