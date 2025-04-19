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
  useTheme,
  Paper,
  alpha,
} from '@mui/material';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import axiosInstance from '../utils/axios';
import { styled, keyframes } from '@mui/material/styles';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const subtleFloat = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#121212',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '80px', // Space for fixed navbar
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.95))',
    zIndex: 0,
  },
}));

const SubtleCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.03)',
  zIndex: 0,
  '&:nth-of-type(1)': {
    width: '300px',
    height: '300px',
    top: '10%',
    left: '5%',
    animation: `${subtleFloat} 20s ease-in-out infinite`,
  },
  '&:nth-of-type(2)': {
    width: '200px',
    height: '200px',
    top: '60%',
    right: '5%',
    animation: `${subtleFloat} 25s ease-in-out infinite 2s`,
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 600,
  letterSpacing: '0.02em',
  color: '#ffffff',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    width: '40px',
    height: '2px',
    background: '#ffffff',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(4),
  '& .MuiTabs-indicator': {
    backgroundColor: '#ffffff',
    height: '2px',
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    fontFamily: "'Montserrat', sans-serif",
    '&.Mui-selected': {
      color: '#ffffff',
    },
    '&:hover': {
      color: '#ffffff',
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: '#1e1e1e',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 180,
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  '& .MuiTypography-h5': {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: '#ffffff',
  },
  '& .MuiTypography-body2': {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: theme.spacing(1),
    fontFamily: "'Montserrat', sans-serif",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  fontWeight: 500,
  fontFamily: "'Montserrat', sans-serif",
  '&.MuiChip-colorSuccess': {
    background: 'rgba(76, 175, 80, 0.1)',
    color: '#4caf50',
    border: '1px solid rgba(76, 175, 80, 0.2)',
  },
  '&.MuiChip-colorWarning': {
    background: 'rgba(255, 152, 0, 0.1)',
    color: '#ff9800',
    border: '1px solid rgba(255, 152, 0, 0.2)',
  },
  '&.MuiChip-colorError': {
    background: 'rgba(244, 67, 54, 0.1)',
    color: '#f44336',
    border: '1px solid rgba(244, 67, 54, 0.2)',
  },
  '&.MuiChip-colorInfo': {
    background: 'rgba(33, 150, 243, 0.1)',
    color: '#2196f3',
    border: '1px solid rgba(33, 150, 243, 0.2)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  fontFamily: "'Montserrat', sans-serif",
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

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
        return 'secondary';
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
      <StyledCard>
        {event.banner && (
          <StyledCardMedia
            component="img"
            image={event.banner}
            alt={event.title}
          />
        )}
        <StyledCardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {event.title}
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
            <StyledChip
              label={event.status || 'Unknown'}
              color={getStatusColor(event.status)}
              size="small"
            />
            {event.attendances && (
              <StyledChip
                label={`${event.attendances.confirmed} attending`}
                color="info"
                size="small"
              />
            )}
          </Box>
        </StyledCardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Stack direction="row" spacing={1} width="100%">
            <StyledButton
              variant="contained"
              color="primary"
              href={`/events/${event.truckersmpId}`}
              fullWidth
            >
              View Details
            </StyledButton>
            {event.externalLink && (
              <StyledButton
                variant="outlined"
                color="secondary"
                href={`https://www.TruckersMP.com/events/${event.truckersmpId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                TruckersMP
              </StyledButton>
            )}
          </Stack>
        </CardActions>
      </StyledCard>
    </Grid>
  );

  if (loading) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
          position="relative"
          zIndex={1}
        >
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{ 
              color: '#ffffff',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ContentContainer>
          <Typography color="error" align="center" sx={{ mt: 4 }}>
            {error}
          </Typography>
        </ContentContainer>
      </PageContainer>
    );
  }

  const { upcoming, live, past } = categorizeEvents();
  console.log('Final categorized events:', { upcoming, live, past });

  return (
    <PageContainer>
      <SubtleCircle />
      <SubtleCircle />
      
      <ContentContainer>
        <PageTitle variant="h3" component="h1" gutterBottom>
          Convoys
        </PageTitle>
        
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Upcoming (${upcoming.length})`} />
          <Tab label={`Live (${live.length})`} />
          <Tab label={`Past (${past.length})`} />
        </StyledTabs>

        <Grid container spacing={3}>
          {activeTab === 0 && upcoming.length > 0 ? (
            upcoming.map(renderEventCard)
          ) : activeTab === 1 && live.length > 0 ? (
            live.map(renderEventCard)
          ) : activeTab === 2 && past.length > 0 ? (
            past.map(renderEventCard)
          ) : (
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: '#1e1e1e',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <Typography variant="h6" fontFamily="'Montserrat', sans-serif">
                  No events found in this category
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </ContentContainer>
    </PageContainer>
  );
};

export default Home; 