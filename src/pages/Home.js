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
import { format, isPast, isFuture, isWithinInterval, addHours } from 'date-fns';
import axiosInstance from '../utils/axios';
import Marquee from "react-fast-marquee";

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
  background: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
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
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(to bottom, rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.95))' 
      : 'linear-gradient(to bottom, rgba(245, 245, 245, 0.9), rgba(245, 245, 245, 0.95))',
    zIndex: 0,
  },
}));

const SubtleCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.03)',
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
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    width: '40px',
    height: '2px',
    background: theme.palette.primary.main,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'}`,
  marginBottom: theme.spacing(4),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '2px',
  },
  '& .MuiTab-root': {
    color: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.7)' 
      : 'rgba(0, 0, 0, 0.6)',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    fontFamily: "'Montserrat', sans-serif",
    '&.Mui-selected': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
    '&:hover': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.background.paper,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 25px rgba(0, 0, 0, 0.4)'
      : '0 8px 25px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'}`,
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
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
  },
  '& .MuiTypography-body2': {
    color: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.7)' 
      : 'rgba(0, 0, 0, 0.6)',
    marginBottom: theme.spacing(1),
    fontFamily: "'Montserrat', sans-serif",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  fontWeight: 500,
  fontFamily: "'Montserrat', sans-serif",
  '&.MuiChip-colorSuccess': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(76, 175, 80, 0.2)' 
      : 'rgba(76, 175, 80, 0.1)',
    color: theme.palette.mode === 'dark' 
      ? '#81c784' 
      : '#2e7d32',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(76, 175, 80, 0.3)' 
      : 'rgba(76, 175, 80, 0.2)'}`,
  },
  '&.MuiChip-colorWarning': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 152, 0, 0.2)' 
      : 'rgba(255, 152, 0, 0.1)',
    color: theme.palette.mode === 'dark' 
      ? '#ffb74d' 
      : '#ed6c02',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 152, 0, 0.3)' 
      : 'rgba(255, 152, 0, 0.2)'}`,
  },
  '&.MuiChip-colorError': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(244, 67, 54, 0.2)' 
      : 'rgba(244, 67, 54, 0.1)',
    color: theme.palette.mode === 'dark' 
      ? '#e57373' 
      : '#d32f2f',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(244, 67, 54, 0.3)' 
      : 'rgba(244, 67, 54, 0.2)'}`,
  },
  '&.MuiChip-colorInfo': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(33, 150, 243, 0.2)' 
      : 'rgba(33, 150, 243, 0.1)',
    color: theme.palette.mode === 'dark' 
      ? '#64b5f6' 
      : '#0288d1',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(33, 150, 243, 0.3)' 
      : 'rgba(33, 150, 243, 0.2)'}`,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  fontFamily: "'Montserrat', sans-serif",
  color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)',
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const formatDateTime = (date) => {
  const utcDate = new Date(date);                      // Parse the UTC datetime
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000); // Convert to IST (UTC+5:30)

  return {
    utc: format(utcDate, "yyyy-MM-dd HH:mm:ss 'UTC'"),
    ist: format(istDate, "yyyy-MM-dd HH:mm:ss 'IST'")
  };
};
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
      
      const response = await axiosInstance.get('/events');
      const eventsData = response.data.response || response.data;
      console.log(eventsData)
      
      
      if (!Array.isArray(eventsData)) {
        console.error('Events data is not an array:', eventsData);
        setError('Invalid data format received from server');
        return;
      }

      const filteredEvents = eventsData.filter(event => event.status !== 'Completed');
      
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
    
  
    const categorized = {
      upcoming: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);
          // console.log('Checking upcoming event:', event.title, startDate);
          return startDate > now; // Future start date
        } catch (error) {
          // console.error('Error processing upcoming event:', event.title, error);
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
          // console.log('Checking past event:', event.title, startDate);
          return startDate < now; // Past start date
        } catch (error) {
          console.error('Error processing past event:', event.title, error);
          return false;
        }
      })
    };
  
    // console.log('Categorized events:', categorized);
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
              <strong>Meetup Time:</strong> {event.startDate ? format(new Date(event.startDate), "dd-MMM-yyyy HH:mm") : 'Not specified'} UTC
            </Typography>
            <Typography variant="body2">
              <strong>Departure Time:</strong> {event.endtime ? format(new Date(event.endtime), "dd-MMM-yyyy HH:mm") : 'Not specified'} UTC
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
              color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.primary.main,
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
          <Typography color="error" align="center" sx={{ mt: 4, color: theme.palette.mode === 'dark' ? '#ff8a80' : undefined }}>
            {error}
          </Typography>
        </ContentContainer>
      </PageContainer>
    );
  }

  const { upcoming, live, past } = categorizeEvents();
  // console.log('Final categorized events:', { upcoming, live, past });

  return (
    <PageContainer>
      <Marquee
      pauseOnHover="true">
  To know about slot booking informations, please visit the specific event's page by clicking view details
</Marquee>
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
                  background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.05)'}`,
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                }}
              >
                <Typography variant="h6" fontFamily="'Montserrat', sans-serif" sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>
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