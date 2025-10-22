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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Fade,
  Zoom,
  Divider,
  Badge,
  Avatar,
  Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import placeholderimage from "../img/placeholder.jpg"
// Hero Section Styling
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(8, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    animation: 'float 20s ease-in-out infinite',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' },
  },
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
}));

// Enhanced Event Card Styling
const EventCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
    '& .event-image': {
      transform: 'scale(1.1)',
    },
    '& .event-overlay': {
      opacity: 1,
    },
  },
}));

const EventImage = styled(CardMedia)(({ theme }) => ({
  height: 240,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  transition: 'transform 0.4s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
}));

const EventOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 1,
}));

const EventInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: '1.1rem',
  },
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsResponse = await axios.get(`${API_BASE_URL}/events`);
        setEvents(eventsResponse.data);
        setFilteredEvents(eventsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.game.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(event => event.type === filterBy);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'attendees':
          return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, sortBy, filterBy]);

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

  const formatShortDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const getEventTypes = () => {
    const types = [...new Set(events.map(event => event.type).filter(Boolean))];
    return types;
  };

  const getTotalAttendees = () => {
    return events.reduce((total, event) => total + (event.attendees?.length || 0), 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading amazing events...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="h6">Oops! Something went wrong</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 2
              }}
            >
              🚛 Discover Events
            </Typography>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.5rem' }
              }}
            >
              Join our trucking community and participate in exciting events
            </Typography>

            {/* Search and Filter Container */}
            <SearchContainer>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search events, locations, or games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort by"
                      startAdornment={<SortIcon sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="attendees">Most Popular</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by type</InputLabel>
                    <Select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      label="Filter by type"
                      startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="all">All Events</MenuItem>
                      {getEventTypes().map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </SearchContainer>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={4}>
            <StatsCard>
              <EventIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary" fontWeight="bold">
                {events.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Events
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatsCard>
              <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="secondary" fontWeight="bold">
                {getTotalAttendees()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Attendees
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatsCard>
              <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {Math.round((getTotalAttendees() / events.length) || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. per Event
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Events Grid */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <EventIcon color="primary" />
            Upcoming Events
            <Chip 
              label={`${filteredEvents.length} events`} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          </Typography>
        </Box>

        {filteredEvents.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {filteredEvents.map((event, index) => (
              <Grid item xs={12} sm={6} lg={4} key={event._id}>
                <Fade in timeout={300 + index * 100}>
                  <EventCard>
                    <Box sx={{ position: 'relative' }}>
                      <EventImage
                        className="event-image"
                        image={event.image || placeholderimage}
                        alt={event.title}
                      />
                      <EventOverlay className="event-overlay">
                        <Button
                          variant="contained"
                          size="large"
                          sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2
                          }}
                          onClick={() => handleEventClick(event._id)}
                        >
                          View Details
                        </Button>
                      </EventOverlay>
                      
                      {/* Event Date Badge */}
                      <Chip
                        label={formatShortDate(event.date)}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontWeight: 'bold',
                          background: 'rgba(255,255,255,0.9)',
                          color: 'primary.main'
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        {event.title}
                      </Typography>
                      
                      <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
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
                      </Stack>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                        {event.attendees?.length > 10 && (
                          <Chip
                            icon={<StarIcon />}
                            label="Popular"
                            size="small"
                            color="warning"
                            variant="filled"
                          />
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleEventClick(event._id)}
                        sx={{ 
                          mt: 'auto',
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        Join Event
                      </Button>
                    </CardContent>
                  </EventCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Events; 