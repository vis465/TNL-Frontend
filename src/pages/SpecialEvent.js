import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Link,
  Paper,
  List,
  Avatar,
  AvatarGroup,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  CardActions,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  LinearProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Route as RouteIcon,
  RequestPage as RequestIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  LocalShipping as TruckIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Whatshot as FireIcon,
  EmojiEvents as TrophyIcon,
  FlashOn as FlashIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { format, addHours } from 'date-fns';
import axiosInstance from '../utils/axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const SpecialEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [routeSlots, setRouteSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [requestForm, setRequestForm] = useState({
    vtcName: '',
    vtcRole: '',
    vtcLink: '',
    playercount: '',
    discordUsername: '',
    truck: '',
    trailer: '',
    notes: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState({});

  const theme = useTheme();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');

        const response = await axiosInstance.get(`/special-events/${id}`);
        setEvent(response.data.event);
        setRouteSlots(response.data.routeSlots);
        
        if (response.data.event.routes.length > 0) {
          setSelectedRoute(0);
        }
      } catch (error) {
        console.error('Error fetching special event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRequestSlot = (slot) => {
    setSelectedSlot(slot);
    setRequestForm({
      vtcName: '',
      vtcRole: '',
      vtcLink: '',
      playercount: '',
      discordUsername: '',
      truck: '',
      trailer: '',
      notes: ''
    });
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.vtcName || !requestForm.playercount || !requestForm.discordUsername) {
      return;
    }

    try {
      setRequestLoading(true);
      
      const response = await axiosInstance.post(
        `/special-events/${id}/slots/${selectedSlot._id}/request`,
        requestForm
      );

      setRequestSuccess(true);
      setRequestDialogOpen(false);
      
      const eventResponse = await axiosInstance.get(`/special-events/${id}`);
      setEvent(eventResponse.data.event);
      setRouteSlots(eventResponse.data.routeSlots);
      
      setRequestForm({
        vtcName: '',
        vtcRole: '',
        vtcLink: '',
        playercount: '',
        discordUsername: '',
        truck: '',
        trailer: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestLoading(false);
    }
  };

  const getSlotStatusColor = (slot) => {
    if (slot.status === 'assigned') return 'success';
    if (slot.status === 'requested') return 'warning';
    if (slot.status === 'closed') return 'error';
    return 'default';
  };

  const getSlotStatusText = (slot) => {
    if (slot.status === 'assigned') return 'Assigned';
    if (slot.status === 'requested') return 'Requested';
    if (slot.status === 'closed') return 'Closed';
    return 'Available';
  };

  const getRequestStatusIcon = (request) => {
    switch (request.status) {
      case 'approved':
        return <CheckIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'pending':
        return <PendingIcon sx={{ color: '#FF9800' }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getRequestStatusColor = (request) => {
    switch (request.status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const toggleSlotExpansion = (slotId) => {
    setExpandedSlots(prev => ({
      ...prev,
      [slotId]: !prev[slotId]
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 6
        }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#FFD700',
              mb: 3
            }} 
          />
          <Typography variant="h5" sx={{ 
            color: '#F57C00',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600
          }}>
            🌟 Loading Special Event...
          </Typography>
          <LinearProgress 
            sx={{ 
              width: '100%', 
              maxWidth: 400, 
              mt: 2,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FFD700'
              }
            }} 
          />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderLeft: '4px solid #f44336',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)'
          }}
        >
          {error || 'Event not found'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.history.back()}
          sx={{
            background: 'linear-gradient(45deg, #FFD700 0%, #FFC107 100%)',
            color: '#1A1A1A',
            fontWeight: 600
          }}
        >
          🔙 Go Back
        </Button>
      </Container>
    );
  }

  const currentRoute = event.routes[selectedRoute];
  const currentRouteSlots = routeSlots[currentRoute?.name] || [];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      <Container 
  maxWidth={false} 
  sx={{ pt: 4, pb: 8, position: 'relative', zIndex: 1 }}
>
        
        {/* Floating Specialty Badges */}
        <Box sx={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
                 </Box>

        {/* Enhanced Event Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 6,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(45deg, #FFD700, #FF9800, #FFD700) 1',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #FFD700 0%, #FF6B35 25%, #F7931E 50%, #FFD700 75%, #FF9800 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' }
              }
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, p: 5 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                
                {/* Event Type Badge */}
                
                
                {/* Enhanced Title */}
                <Typography 
                  variant="h2" 
                  gutterBottom 
                  sx={{
                    fontFamily: "'Montserrat', 'Roboto', sans-serif",
                    fontWeight: 900,
                    background: 'linear-gradient(45deg, #FFD700 0%, #FF9800 50%, #FFD700 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                    mb: 3,
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                  }}
                >
                  {event.title}
                </Typography>
                
                {/* Enhanced Description */}
                <Typography 
                  variant="h6" 
                  color="rgba(255,255,255,0.9)" 
                  paragraph
                  sx={{ 
                    lineHeight: 1.8,
                    fontSize: '1.3rem',
                    fontWeight: 300,
                    mb: 4,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {event.description.slice(0, 100)}...
                </Typography>

                {/* Premium Info Cards Grid */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)',
                      border: '2px solid rgba(255, 215, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(255, 215, 0, 0.2)'
                      }
                    }}>
                      <EventIcon sx={{ color: '#FFD700', fontSize: 36 }} />
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          📅 EVENT DATE
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 800 }}>
                          August 25, 2025
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)',
                      border: '2px solid rgba(255, 193, 7, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(255, 193, 7, 0.2)'
                      }
                    }}>
                      <ScheduleIcon sx={{ color: '#FFC107', fontSize: 36 }} />
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          ⏰ DURATION
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFC107', fontWeight: 800 }}>
                          2:00 PM - 6:00 PM
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%)',
                      border: '2px solid rgba(255, 152, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(255, 152, 0, 0.2)'
                      }
                    }}>
                      <LocationIcon sx={{ color: '#FF9800', fontSize: 36 }} />
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          🎯 MEETING POINT
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 800 }}>
                          {event.meetingPoint}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.15) 0%, rgba(255, 107, 53, 0.1) 100%)',
                      border: '2px solid rgba(245, 124, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(245, 124, 0, 0.2)'
                      }
                    }}>
                      <TruckIcon sx={{ color: '#F57C00', fontSize: 36 }} />
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          🛣️ ROUTE
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#F57C00', fontWeight: 800 }}>
                          {event.departurePoint} → {event.arrivalPoint}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {event.banner && (
                <Grid item xs={12} md={4}>
                  <Box sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '3px solid',
                    borderImage: 'linear-gradient(45deg, #FFD700, #FF9800) 1',
                    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      background: 'linear-gradient(45deg, #FFD700, #FF9800, #FFD700)',
                      borderRadius: 4,
                      zIndex: -1,
                      animation: 'borderRotate 3s linear infinite',
                      '@keyframes borderRotate': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }
                  }}>
                    <CardMedia
                      component="img"
                      image={event.banner}
                      alt={event.title}
                      sx={{ 
                        height: 320,
                        objectFit: 'cover',
                        filter: 'brightness(0.9) contrast(1.1)'
                      }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      p: 2
                    }}>
                      
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Enhanced Rules Section */}
           
          </Box>
        </Paper>

        {/* Enhanced Route Tabs */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.8) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Tabs
            value={selectedRoute}
            onChange={(e, newValue) => setSelectedRoute(newValue)}
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                minHeight: 80,
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': {
                  color: '#FFD700',
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)'
                },
                '&:hover': {
                  color: '#FFC107',
                  background: 'rgba(255, 215, 0, 0.05)'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
                height: 6,
                borderRadius: 3
              }
            }}
          >
            {event.routes.map((route, index) => (
              <Tab
                key={route.name}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <RouteIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {route.name}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={routeSlots[route.name]?.length || 0}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#FFD700',
                          color: '#000',
                          fontWeight: 800,
                          fontSize: '0.8rem'
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {routeSlots[route.name]?.length || 0} slots available
                      </Typography>
                    </Badge>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* Enhanced Route Description */}
        {currentRoute && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 152, 0, 0.05) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.25)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                color: '#FFD700',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              🛣️ {currentRoute.name}
            </Typography>
            {currentRoute.description && (
              <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
                {currentRoute.description}
              </Typography>
            )}
          </Paper>
        )}

        {/* Enhanced Slots Grid */}
        <Grid container spacing={4}>
          {currentRouteSlots.map((slot) => (
            <Grid item xs={12} sm={6} md={4} key={slot._id}>
              <Card 
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(26,26,46,0.85) 100%)',
                  border: slot.status === 'assigned' ? '3px solid #4CAF50' : 
                          slot.status === 'requested' ? '3px solid #FF9800' : 
                          '3px solid rgba(255, 215, 0, 0.4)',
                  position: 'relative',
                  backdropFilter: 'blur(10px)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: slot.status === 'assigned' ? 'linear-gradient(90deg, #4CAF50, #66BB6A)' :
                               slot.status === 'requested' ? 'linear-gradient(90deg, #FF9800, #FFB74D)' :
                               'linear-gradient(90deg, #FFD700, #FF9800, #FFD700)',
                    zIndex: 1
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)',
                    border: slot.status === 'assigned' ? '3px solid #4CAF50' : 
                            slot.status === 'requested' ? '3px solid #FF9800' : 
                            '3px solid #FFD700'
                  },
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography 
                      variant="h5" 
                      component="div"
                      sx={{ 
                        fontWeight: 800,
                        color: '#FFD700',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      🎯 {slot.slotName || `Slot ${slot.slotNumber}`}
                    </Typography>
                    <Chip
                      label={getSlotStatusText(slot)}
                      color={getSlotStatusColor(slot)}
                      size="small"
                      sx={{ 
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    />
                  </Box>

                  {slot.description && (
                    <Typography 
                      variant="body1" 
                      color="rgba(255,255,255,0.8)" 
                      sx={{ mb: 3, lineHeight: 1.7, fontSize: '1rem' }}
                    >
                      {slot.description}
                    </Typography>
                  )}

                  <Stack spacing={3} sx={{ mb: 3 }}>
                    {/* Enhanced Stats Cards */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}>
                      <GroupsIcon sx={{ color: '#FFD700', fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          MIN PLAYERS
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 800 }}>
                          {slot.minPlayers}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)',
                      border: '1px solid rgba(255, 193, 7, 0.3)'
                    }}>
                      <StarIcon sx={{ color: '#FFC107', fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          MAX VTCs
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#FFC107', fontWeight: 800 }}>
                          {slot.maxVtc}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Enhanced Progress Bar */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ fontWeight: 700 }}>
                          📋 REQUEST PROGRESS
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 800 }}>
                          {slot.requests.length} / {slot.maxVtc * 2}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(slot.requests.length / (slot.maxVtc * 2)) * 100}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: slot.requests.length >= slot.maxVtc * 2 ? '#f44336' : 
                                           slot.requests.length > slot.maxVtc ? '#FF9800' : '#4CAF50',
                            borderRadius: 5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }
                        }}
                      />
                    </Box>
                  </Stack>

                  {/* Enhanced Requirements */}
                  {slot.specialRequirements && slot.specialRequirements.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="body1" 
                        color="rgba(255,255,255,0.8)" 
                        gutterBottom
                        sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        ⚠️ SPECIAL REQUIREMENTS:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                        {slot.specialRequirements.map((req, index) => (
                          <Chip
                            key={index}
                            label={req}
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
                              border: '1px solid rgba(255, 215, 0, 0.4)',
                              color: '#FFD700',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Enhanced Requests Preview */}
                  {slot.requests.length > 0 && (
                    <Box>
                      <Button
                        size="medium"
                        onClick={() => toggleSlotExpansion(slot._id)}
                        endIcon={<ExpandMoreIcon sx={{ 
                          transform: expandedSlots[slot._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s'
                        }} />}
                        sx={{ 
                          mb: 2,
                          color: '#FFD700',
                          fontWeight: 700,
                          fontSize: '1rem',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                            transform: 'translateX(4px)'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        👥 VIEW REQUESTS ({slot.requests.length})
                      </Button>
                      
                      <Collapse in={expandedSlots[slot._id]}>
                        <List dense sx={{ 
                          backgroundColor: 'rgba(255, 215, 0, 0.08)',
                          borderRadius: 3,
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          {slot.requests.map((request) => (
                            <ListItem 
                              key={request._id} 
                              sx={{ 
                                pl: 3,
                                py: 2,
                                '&:not(:last-child)': {
                                  borderBottom: '1px solid rgba(255, 215, 0, 0.15)'
                                }
                              }}
                            >
                              <ListItemIcon>
                                {getRequestStatusIcon(request)}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 700, color: '#FFD700', fontSize: '1rem' }}>
                                    🏢 {request.vtcName}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" display="block" color="rgba(255,255,255,0.8)">
                                      👥 {request.playercount} players • 💬 {request.discordUsername}
                                    </Typography>
                                    {request.status === 'rejected' && request.rejectionReason && (
                                      <Typography variant="body2" color="#f44336" display="block" sx={{ fontWeight: 700, mt: 1 }}>
                                        ❌ Reason: {request.rejectionReason}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  )}
                </CardContent>

                {/* Enhanced Action Buttons */}
                <CardActions sx={{ p: 4, pt: 0 }}>
                  {slot.status === 'available' && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<RequestIcon />}
                      onClick={() => handleRequestSlot(slot)}
                      disabled={slot.requests.length >= slot.maxVtc * 2}
                      sx={{
                        background: 'linear-gradient(45deg, #FFD700 0%, #FF9800 100%)',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '1rem',
                        py: 2,
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(255, 215, 0, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
                          boxShadow: '0 12px 32px rgba(255, 215, 0, 0.6)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      🚀 REQUEST SLOT
                    </Button>
                  )}
                  
                  {slot.status === 'requested' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PendingIcon />}
                      onClick={() => toggleSlotExpansion(slot._id)}
                      sx={{
                        borderColor: '#FF9800',
                        color: '#FF9800',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 2,
                        borderRadius: 3,
                        borderWidth: 2,
                        textTransform: 'uppercase',
                        '&:hover': {
                          borderColor: '#F57C00',
                          backgroundColor: 'rgba(255, 152, 0, 0.15)',
                          borderWidth: 2,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      ⏳ PENDING REVIEW
                    </Button>
                  )}
                  
                  {slot.status === 'assigned' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CheckIcon />}
                      onClick={() => toggleSlotExpansion(slot._id)}
                      sx={{
                        borderColor: '#4CAF50',
                        color: '#4CAF50',
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 2,
                        borderRadius: 3,
                        borderWidth: 2,
                        textTransform: 'uppercase',
                        '&:hover': {
                          borderColor: '#388E3C',
                          backgroundColor: 'rgba(76, 175, 80, 0.15)',
                          borderWidth: 2,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      ✅ ASSIGNED
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced No Slots Message */}
        {currentRouteSlots.length === 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 8, 
              textAlign: 'center',
              borderRadius: 6,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.8) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              backdropFilter: 'blur(15px)'
            }}
          >
            <RouteIcon sx={{ 
              fontSize: 120, 
              color: '#FFD700', 
              mb: 4,
              filter: 'drop-shadow(0 8px 16px rgba(255, 215, 0, 0.3))'
            }} />
            <Typography 
              variant="h3" 
              color="#FFD700" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 3,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🚫 NO SLOTS AVAILABLE
            </Typography>
            <Typography 
              variant="h6" 
              color="rgba(255,255,255,0.8)"
              sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              No slots are currently available for the <strong style={{ color: '#FFD700' }}>{currentRoute?.name}</strong> route.
              <br />
              Check back later or contact an administrator for more information.
            </Typography>
          </Paper>
        )}

        {/* Enhanced Request Dialog */}
        <Dialog
          open={requestDialogOpen}
          onClose={() => setRequestDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(45deg, #FFD700 0%, #FF9800 100%)',
            color: '#000',
            fontWeight: 800,
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            🎯 REQUEST SLOT: {selectedSlot?.slotName || `SLOT ${selectedSlot?.slotNumber}`}
          </DialogTitle>
          
          <DialogContent sx={{ pt: 4, pb: 2 }}>
            {requestSuccess ? (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(102, 187, 106, 0.1) 100%)',
                  border: '2px solid rgba(76, 175, 80, 0.3)',
                  color: '#4CAF50',
                  '& .MuiAlert-icon': {
                    fontSize: '2rem'
                  }
                }}
                icon={<CheckIcon fontSize="inherit" />}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  🎉 REQUEST SUBMITTED SUCCESSFULLY!
                </Typography>
                <Typography variant="body1">
                  Your slot request has been submitted and an administrator will review it shortly. 
                  You'll be notified via Discord once a decision is made.
                </Typography>
              </Alert>
            ) : (
              <Stack spacing={4} sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="🏢 VTC Name"
                      value={requestForm.vtcName}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, vtcName: e.target.value }))}
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="👤 Your Role in VTC"
                      value={requestForm.vtcRole}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, vtcRole: e.target.value }))}
                      fullWidth
                      placeholder="e.g., Owner, Manager, Member"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="🌐 VTC Link"
                      value={requestForm.vtcLink}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, vtcLink: e.target.value }))}
                      fullWidth
                      placeholder="TruckersMP VTC page or website"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="👥 Number of Players"
                      value={requestForm.playercount}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, playercount: e.target.value }))}
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: selectedSlot?.minPlayers || 1 }}
                      helperText={`Minimum required: ${selectedSlot?.minPlayers || 1} players`}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' },
                        '& .MuiFormHelperText-root': {
                          color: '#FFD700',
                          fontWeight: 600
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="💬 Discord Username"
                      value={requestForm.discordUsername}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, discordUsername: e.target.value }))}
                      fullWidth
                      required
                      placeholder="Your Discord username for notifications"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="🚛 Truck Type"
                      value={requestForm.truck}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, truck: e.target.value }))}
                      fullWidth
                      placeholder="e.g., Scania R, Volvo FH16"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="🚚 Trailer Type"
                      value={requestForm.trailer}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, trailer: e.target.value }))}
                      fullWidth
                      placeholder="e.g., Dry Van, Refrigerated, Flatbed"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="📝 Additional Notes"
                      value={requestForm.notes}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Any special requirements or additional information"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FFD700',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.8)',
                          '&.Mui-focused': { color: '#FFD700' }
                        },
                        '& .MuiInputBase-input': { color: 'white' }
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 4, pt: 2 }}>
            {!requestSuccess && (
              <>
                <Button 
                  onClick={() => setRequestDialogOpen(false)}
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  ❌ CANCEL
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  variant="contained"
                  disabled={requestLoading || !requestForm.vtcName || !requestForm.playercount || !requestForm.discordUsername}
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700 0%, #FF9800 100%)',
                    color: '#000',
                    fontWeight: 800,
                    px: 6,
                    py: 2,
                    fontSize: '1rem',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(255, 215, 0, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
                      boxShadow: '0 12px 32px rgba(255, 215, 0, 0.6)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  {requestLoading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : '🚀 SUBMIT REQUEST'}
                </Button>
              </>
            )}
            
            {requestSuccess && (
              <Button 
                onClick={() => setRequestDialogOpen(false)} 
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 0%, #66BB6A 100%)',
                  color: 'white',
                  fontWeight: 800,
                  px: 6,
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #66BB6A 0%, #4CAF50 100%)',
                    boxShadow: '0 12px 32px rgba(76, 175, 80, 0.6)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                🎉 CLOSE
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SpecialEvent;