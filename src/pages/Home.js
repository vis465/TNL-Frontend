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
  Fade,
  Zoom,
  Badge,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format, isPast, isFuture, isWithinInterval, addHours } from 'date-fns';
import axiosInstance from '../utils/axios';
import Marquee from "react-fast-marquee";
import placeholderimage from "../img/placeholder.jpg"
import { styled, keyframes } from '@mui/material/styles';
import RouteIcon from '@mui/icons-material/Route';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Enhanced Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const subtleFloat = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Enhanced Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f1f3f4 100%)',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '80px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark' 
      ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)'
      : 'radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(76, 175, 80, 0.05) 0%, transparent 50%)',
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    animation: `${subtleFloat} 20s ease-in-out infinite`,
    zIndex: 0,
  },
}));

const SubtleCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: theme.palette.mode === 'dark' 
    ? 'radial-gradient(circle, rgba(120, 119, 198, 0.1) 0%, transparent 70%)' 
    : 'radial-gradient(circle, rgba(33, 150, 243, 0.08) 0%, transparent 70%)',
  zIndex: 0,
  '&:nth-of-type(1)': {
    width: '400px',
    height: '400px',
    top: '5%',
    left: '3%',
    animation: `${subtleFloat} 25s ease-in-out infinite`,
  },
  '&:nth-of-type(2)': {
    width: '300px',
    height: '300px',
    top: '50%',
    right: '3%',
    animation: `${subtleFloat} 30s ease-in-out infinite 3s`,
  },
  '&:nth-of-type(3)': {
    width: '200px',
    height: '200px',
    top: '70%',
    left: '60%',
    animation: `${subtleFloat} 20s ease-in-out infinite 1s`,
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
  marginBottom: theme.spacing(4),
  position: 'relative',
  textShadow: theme.palette.mode === 'dark' 
    ? '0 2px 4px rgba(0,0,0,0.3)' 
    : '0 2px 4px rgba(0,0,0,0.1)',
  animation: `${fadeIn} 0.8s ease-out`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-15px',
    left: 0,
    width: '60px',
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    borderRadius: '2px',
    animation: `${slideInFromLeft} 1s ease-out 0.5s both`,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `2px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'}`,
  marginBottom: theme.spacing(4),
  borderRadius: '12px 12px 0 0',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(0, 0, 0, 0.02)',
  padding: theme.spacing(1),
  '& .MuiTabs-indicator': {
    backgroundColor: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    height: '3px',
    borderRadius: '2px',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '& .MuiTab-root': {
    color: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.7)' 
      : 'rgba(0, 0, 0, 0.6)',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Montserrat', sans-serif",
    borderRadius: '8px',
    margin: theme.spacing(0.5),
    minHeight: '48px',
    '&.Mui-selected': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
      background: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
    },
    '&:hover': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
      background: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.03)' 
        : 'rgba(0, 0, 0, 0.03)',
      transform: 'translateY(-2px)',
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '16px',
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(0, 0, 0, 0.15)'}`,
    '&::before': {
      opacity: 1,
    },
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.4s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'scale(1.05)',
    '&::after': {
      background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
    },
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
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
}));

// New styled components for enhanced design
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(8, 0),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    animation: `${subtleFloat} 20s ease-in-out infinite`,
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
    : '0 8px 32px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 16px 40px rgba(0, 0, 0, 0.5)'
      : '0 16px 40px rgba(0, 0, 0, 0.2)',
  },
}));

const SpecialEventCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 280,
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: `3px solid #FFD700`,
  boxShadow: '0 12px 40px rgba(255, 215, 0, 0.3)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.4)',
    borderColor: '#FFC107',
  },
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

  // Helper functions for statistics
  const getTotalEvents = () => events.length;
  const getTotalSpecialEvents = () => specialEvents.length;
  const getTotalAttendees = () => {
    return events.reduce((total, event) => total + (event.attendances?.confirmed || 0), 0);
  };
  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => {
      try {
        const startDate = new Date(event.startDate);
        return startDate > now;
      } catch (error) {
        return false;
      }
    });
  };

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
      const eventsData =  response.data
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

  const renderEventCard = (event, index) => (
    <Grid item xs={12} sm={6} md={4} key={event._id || event.truckersmpId}>
      <Fade in timeout={300 + index * 100}>
        <StyledCard>
          <Box sx={{ position: 'relative' }}>
            {event.banner && event.banner.length > 1 ? (
              <StyledCardMedia
                component="img"
                image={event.banner}
                alt={event.title}
              />
            ) : (
              <StyledCardMedia
                component="img"
                image={placeholderimage}
                alt={event.title}
              />
            )}
            
            {/* Status Badge */}
            <Chip
              label={event.status || 'Unknown'}
              color={getStatusColor(event.status)}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.9)',
                '& .MuiChip-label': {
                  fontSize: '0.75rem',
                }
              }}
            />
          </Box>
          
          <StyledCardContent>
            <Typography gutterBottom variant="h5" component="h2" sx={{ 
              fontWeight: 600, 
              mb: 2,
              fontFamily: "'Montserrat', sans-serif"
            }}>
              {event.title}
            </Typography>
            
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RouteIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Route:</strong> {event.route || 'Not specified'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Server:</strong> {event.server || 'Not specified'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Meetup:</strong> {event.startDate ? format(new Date(event.startDate), "dd-MMM HH:mm") : 'Not specified'} UTC
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Departure:</strong> {event.endtime ? format(new Date(event.endtime), "dd-MMM HH:mm") : 'Not specified'} UTC
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {event.attendances && (
                <Chip
                  icon={<PeopleIcon />}
                  label={`${event.attendances.confirmed} attending`}
                  color="info"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
              
            </Box>
          </StyledCardContent>
          
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Stack direction="row" spacing={1} width="100%">
              <Button
                variant="outlined"
                color="primary"
                href={`/events/${event.truckersmpId}`}
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                 
                }}
              >
                View Details
              </Button>
             
            </Stack>
          </CardActions>
        </StyledCard>
      </Fade>
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
      
      <SubtleCircle />
      <SubtleCircle />
      <SubtleCircle />
      
      <ContentContainer>
        {/* Hero Section */}
      
        {/* Statistics Dashboard */}
      
        
        {/* Special Events Section */}
        {specialEvents?.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#F57C00',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(245, 124, 0, 0.2)',
                animation: `${fadeIn} 0.8s ease-out`
              }}>
                <StarIcon sx={{ color: '#FFD700', fontSize: 32 }} />
                Special Events
                <Chip 
                  label={`${specialEvents.length} events`} 
                  color="warning" 
                  variant="outlined" 
                  size="small"
                  sx={{ ml: 2, fontWeight: 600 }}
                />
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 3, 
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 500
              }}>
                Request-based slot allocation events with premium features
              </Typography>
            </Box>
      
            <Stack spacing={3}>
              {specialEvents.map((event, index) => (
                <Fade in timeout={300 + index * 100} key={event._id}>
                  <SpecialEventCard
                    sx={{
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
                        '&::before': {
                          backdropFilter: 'blur(6px)',
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(0, 0, 0, 0.5)'
                            : 'rgba(255, 255, 255, 0.8)',
                        }
                      }
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
                          {event.description?.slice(0, 100)}...
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
                  </SpecialEventCard>
                </Fade>
              ))}
            </Stack>
            
            <Divider sx={{ 
              my: 4, 
              borderColor: '#FFD700',
              '&::before, &::after': {
                borderColor: '#FFD700'
              }
            }} />
          </Box>
        )}
        
        {/* Main Events Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 3,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            animation: `${fadeIn} 0.8s ease-out`
          }}>
            <EventIcon color="primary" sx={{ fontSize: 32 }} />
            Regular Events
          </Typography>
        </Box>

        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ fontSize: 18 }} />
                Upcoming ({upcoming.length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 18 }} />
                Live ({live.length})
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                Past ({past.length})
              </Box>
            } 
          />
        </StyledTabs>

        <Grid container spacing={4}>
          {activeTab === 0 && upcoming.length > 0 ? (
            upcoming.map((event, index) => renderEventCard(event, index))
          ) : activeTab === 1 && live.length > 0 ? (
            live.map((event, index) => renderEventCard(event, index))
          ) : activeTab === 2 && past.length > 0 ? (
            past.map((event, index) => renderEventCard(event, index))
          ) : (
            <Grid item xs={12}>
              <Fade in timeout={500}>
                <Paper 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
                      : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    border: `1px solid ${theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.08)'}`,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No events found in this category
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Check back later for new events or try a different category
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          )}
        </Grid>
      </ContentContainer>
    </PageContainer>
  );
};

export default Home; 