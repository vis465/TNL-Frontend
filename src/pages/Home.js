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
  Divider,
} from '@mui/material';
import { format, isPast, isFuture, isWithinInterval, addHours } from 'date-fns';
import axiosInstance from '../utils/axios';
import Marquee from "react-fast-marquee";
import placeholderimage from "../img/placeholder.jpg"
import { styled, keyframes } from '@mui/material/styles';
import RouteIcon from '@mui/icons-material/Route';

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
  const [specialEvents, setSpecialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    fetchEvents();
    fetchSpecialEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      
      const response = await axiosInstance.get('/events');
      const eventsData = response.data.response || response.data;
      console.log("eventsData",eventsData)
      
      
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

  const fetchSpecialEvents = async () => {
    try {
      console.log('Fetching special events from Home page...');
      const response = await axiosInstance.get('/special-events');
      
      
      // Ensure we have an array of events
      const eventsData =  response.data.events
      console.log('Processed special events data:', eventsData);
      setSpecialEvents(eventsData);
    } catch (specialError) {
      console.warn('Failed to fetch special events in Home:', specialError);
      console.warn('Special events error details:', specialError.response?.data);
      setSpecialEvents([]);
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
        {event.banner.length>1 && (
          <StyledCardMedia
            component="img"
            image={event.banner }
            alt={event.title}
          />
        )}
        {event.banner.length<1 && (
          <StyledCardMedia
            component="img"
            image={placeholderimage}
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
        
        {/* Special Events Section */}
        {specialEvents && specialEvents.length > 0 && (
  <>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: '#F57C00', // Deep orange-yellow
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 700,
        textShadow: '0 2px 4px rgba(245, 124, 0, 0.2)'
      }}>
        <RouteIcon sx={{ color: '#FFD700', fontSize: 28 }} />
        Special Events
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ 
        mb: 3, 
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '1.1rem',
        fontWeight: 500
      }}>
        Request-based slot allocation events
      </Typography>
      
      <Stack spacing={3}>
        {specialEvents.map((event) => (
          <StyledCard 
            key={event._id} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              minHeight: 220,
              border: '3px solid',
              borderColor: '#FFD700', // Gold border
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: event.banner && event.banner.length > 1 
                ? `url(${event.banner})` 
                : `url(${placeholderimage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(8px)',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.6)'
                  : 'rgba(255, 255, 255, 0.85)',
                zIndex: 1
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #FFD700 0%, #FFC107 50%, #FF9800 100%)',
                zIndex: 3
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(255, 215, 0, 0.3)',
                borderColor: '#FFC107',
                '&::before': {
                  backdropFilter: 'blur(6px)',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(0, 0, 0, 0.5)'
                    : 'rgba(255, 255, 255, 0.8)',
                }
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            {/* Special Badge Overlay */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(45deg, #FFD700 0%, #FFC107 100%)',
              borderRadius: '20px',
              px: 2,
              py: 0.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 4
            }}>
              <Typography variant="caption" sx={{ 
                color: '#1A1A1A',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ⭐ SPECIAL
              </Typography>
            </Box>

            {/* Content Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              flex: 1,
              p: 3,
              position: 'relative',
              zIndex: 2
            }}>
              {/* Header */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" component="h5" sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? '#FFD700' : '#E65100',
                  mb: 1,
                  fontSize: { xs: '1.3rem', md: '1.5rem' }
                }}>
                  {event.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{
                  lineHeight: 1.6,
                  mb: 2
                }}>
                  {event.description.slice(0, 100)}...
                </Typography>
              </Box>

              {/* Event Details */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 2,
                flex: 1
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ 
                    mb: 0.5,
                    color: theme.palette.mode === 'dark' ? '#FFF8E1' : '#5D4037'
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: '#F57C00' }}>
                      🖥️ Server:
                    </Box> {event.server || 'Not specified'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    mb: 0.5,
                    color: theme.palette.mode === 'dark' ? '#FFF8E1' : '#5D4037'
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: '#F57C00' }}>
                      🕐 Meetup:
                    </Box> {event.startDate ? format(new Date(event.startDate), "dd-MMM-yyyy HH:mm") : 'Not specified'} UTC
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFF8E1' : '#5D4037'
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: '#F57C00' }}>
                      🚚 Departure:
                    </Box> {event.endtime ? format(new Date(event.endtime), "dd-MMM-yyyy HH:mm") : 'Not specified'} UTC
                  </Typography>
                </Box>

                {/* Status & Routes Info */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 120 }}>
                  <Chip
                    label={event.status || 'Unknown'}
                    color={getStatusColor(event.status)}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                  <Chip
                    label={`${event.routes?.length || 0} Routes`}
                    size="small"
                    icon={<RouteIcon sx={{ fontSize: '16px !important' }} />}
                    sx={{ 
                      backgroundColor: '#FFE082',
                      color: '#E65100',
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                mt: 'auto',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  href={`/special-events/${event.truckersmpId}`}
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700 0%, #FFC107 100%)',
                    color: '#1A1A1A',
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFC107 0%, #FF9800 100%)',
                      boxShadow: '0 6px 20px rgba(255, 215, 0, 0.6)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  📋 View Details
                </Button>
                
                {event.externalLink && (
                  <Button
                    variant="outlined"
                    href={`https://www.TruckersMP.com/events/${event.truckersmpId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderColor: '#FFD700',
                      color: theme.palette.mode === 'dark' ? '#FFD700' : '#F57C00',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        borderColor: '#FFC107',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderWidth: 2
                      }
                    }}
                  >
                    🌐 TruckersMP
                  </Button>
                )}
              </Box>
            </Box>
          </StyledCard>
        ))}
      </Stack>
    </Box>
    
    <Divider sx={{ 
      my: 4, 
      borderColor: '#FFD700',
      '&::before, &::after': {
        borderColor: '#FFD700'
      }
    }} />
  </>
)}
        
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