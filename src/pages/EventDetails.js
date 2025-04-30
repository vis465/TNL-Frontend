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
  
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import StorageIcon from '@mui/icons-material/Storage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import { format, addHours } from 'date-fns';
import axiosInstance from '../utils/axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import RequestSlotDialog from '../components/RequestSlotDialog';
import BookedSlots from '../components/BookedSlots';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    vtcName: '',
    contactPerson: {
      name: '',
      email: '',
      discord: ''
    }
  });
  const [openSlotDialog, setOpenSlotDialog] = useState(false);
  const [slotImages, setSlotImages] = useState([]);
  const [slotDescriptions, setSlotDescriptions] = useState(['']);
  const [requestSlotOpen, setRequestSlotOpen] = useState(false);

  console.log('EventDetails component mounted');
  console.log('Current route params:', useParams());

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');
        
        // Fetch event details and slots using TruckersMP ID
        const [eventResponse, slotsResponse] = await Promise.all([
          axiosInstance.get(`/events/${id}`),
          axiosInstance.get(`/slots/event/${id}`)
        ]);

        console.log('Event response:', eventResponse.data);
        console.log('Slots response:', slotsResponse.data);

        if (!eventResponse.data) {
          throw new Error('Event not found');
        }

        // Process slots to ensure bookings are properly structured
        const processedSlots = Array.isArray(slotsResponse.data.slots) 
          ? slotsResponse.data.slots.map(slot => ({
              ...slot,
              slots: Array.isArray(slot.slots) ? slot.slots.map(s => ({ ...s, isAvailable: s.isAvailable })) : []
            }))
          : [];

        setEvent(eventResponse.data);
        setSlots(processedSlots);
      } catch (error) {
        console.error('Error details:', error);
        setError(error.response?.data?.message || 'Error fetching event details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSlotImageChange = (event) => {
    const files = Array.from(event.target.files);
    setSlotImages(files);
    setSlotDescriptions(new Array(files.length).fill(''));
  };

  const handleDescriptionChange = (index, value) => {
    const newDescriptions = [...slotDescriptions];
    newDescriptions[index] = value;
    setSlotDescriptions(newDescriptions);
  };

  const handleAddSlots = async () => {
    try {
      const formData = new FormData();
      slotImages.forEach((file, index) => {
        formData.append('images', file);
      });
      formData.append('descriptions', JSON.stringify(slotDescriptions));

      await axiosInstance.post(`/events/${id}/slots`, formData, {  // Using TruckersMP ID
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const response = await axiosInstance.get(`/slots/event/${id}`);
      setSlots(response.data.slots || []);
      
      setOpenSlotDialog(false);
      setSlotImages([]);
      setSlotDescriptions(['']);
    } catch (error) {
      console.error('Error adding slots:', error);
      setError('Error adding slots. Please try again.');
    }
  };

  const handleBookingSubmit = async () => {
    try {
      await axiosInstance.post('/bookings', {
        eventId: id,
        slotId: selectedSlot._id,
        vtcName: bookingForm.vtcName,
        contactPerson: bookingForm.contactPerson
      });

      setOpenBookingDialog(false);
      refreshBookedSlots();
      setBookingForm({
        vtcName: '',
        contactPerson: {
          name: '',
          email: '',
          discord: ''
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Error creating booking. Please try again.');
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

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleRequestSlot = (slot) => {
    setSelectedSlot(slot);
    setRequestSlotOpen(true);
  };

  const refreshBookedSlots = async () => {
    try {
      const response = await axiosInstance.get(`/slots/event/${id}`);
      const processedSlots = Array.isArray(response.data.slots) 
        ? response.data.slots.map(slot => ({
            ...slot,
            slots: Array.isArray(slot.slots) ? slot.slots.map(s => ({ ...s, isAvailable: s.isAvailable })) : []
          }))
        : [];
      setSlots(processedSlots);
    } catch (error) {
      console.error('Error refreshing slots:', error);
    }
  };

  const handleRequestSubmitted = () => {
    refreshBookedSlots();
  };

  const formatDateTime = (date) => {
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
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

  if (!event) {
    return (
      <Container>
        <Typography align="center" sx={{ mt: 4 }}>
          Event not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', mb: 6 }}>
        {event.banner && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '300px', md: '500px' },
              overflow: 'hidden',
              borderRadius: 0,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <CardMedia
              component="img"
              image={event.banner}
              alt={event.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 6,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: 'white',
              }}
            >
              <Container maxWidth="lg">
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '2rem', md: '3.5rem' },
                  }}
                >
                  {event.title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="large"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '1rem',
                      height: '32px',
                    }}
                  />
                  {event.attendances && (
                    <Chip
                      icon={<GroupsIcon />}
                      label={`${event.attendances.confirmed} attending`}
                      size="large"
                      sx={{ 
                        bgcolor: 'rgb(0, 255, 85)',
                        fontSize: '1rem',
                        height: '32px',
                      }}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body1">
                      {formatDateTime(event.startDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon />
                    <Typography variant="body1">
                      {event.route}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon />
                    <Typography variant="body1">
                      {event.server}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    const slotsSection = document.getElementById('slots-section');
                    if (slotsSection) {
                      slotsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      color: 'white',
                    },
                    '&:disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  Book Slot
                </Button>
              </Container>
            </Box>
          </Box>
        )}
      </Box>

      <Container maxWidth="xxl">
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                  }}
                >
                  {/* <ReactMarkdown>{event.description}</ReactMarkdown> */}
                </Typography>

                <Divider sx={{ my: 4 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AccessTimeIcon color="primary" />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                      >
                        Event Schedule
                      </Typography>
                    </Box>
                    <List>
                    <ListItem>
                        <ListItemText
                          primary="Start Time (UTC)"
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondary={formatDateTime(new Date(new Date(event.meetingPoint).getTime() + 60 * 60 * 1000))+" UTC"}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          
                        />
                        <ListItemText
                          primary="Start Time (IST)"
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondary={formatDateTime(new Date(new Date(event.meetingPoint).getTime() + 60 * 60 * 1000 + 5.5 * 60 * 60 * 1000 ))+" IST"}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          
                        />
                      </ListItem>
                      {event.endDate && (
                        <ListItem>
                        <ListItemText
                          primary="Start Time (UTC)"
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondary={formatDateTime(new Date(new Date(event.endDate).getTime() + 60 * 60 * 1000))+" UTC"}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          
                        />
                        <ListItemText
                          primary="Start Time (IST)"
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondary={formatDateTime(new Date(new Date(event.endDate).getTime() + 60 * 60 * 1000 + 5.5 * 60 * 60 * 1000 ))+" IST"}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          
                        />
                      </ListItem>
                        
                      )}
                    </List>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOnIcon color="primary" />
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                      >
                        Route Details
                      </Typography>
                    </Box>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Meeting Time"
                          secondary={formatDateTime(event.meetingPoint)}
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Departure"
                          secondary={event.departurePoint}
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Arrival"
                          secondary={event.arrivalPoint}
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                {event.rule && (
                  <Accordion
                    sx={{
                      mt: 4,
                      borderRadius: 2,
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.02)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                      >
                        Event Rules
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        sx={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '1rem',
                          lineHeight: 1.8,
                        }}
                      >
                        <ReactMarkdown>{event.rule}</ReactMarkdown>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Slots Section */}
            <Card 
              id="slots-section"
              sx={{ 
                mt: 4, 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                scrollMarginTop: '100px'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Event Slots
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : slots.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No slots available for this event yet.
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {slots.map((slot) => (
                      <Grid item xs={12} sm={6} md={4} key={slot._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={slot.imageUrl}
                            alt={`Slot ${slot.imageNumber}`}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="h2">
                              Slot Image #{slot.imageNumber}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                label={`${slot.slots.filter(s => s.isAvailable).length} slots available`}
                                color={slot.slots.some(s => s.isAvailable) ? 'success' : 'error'}
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={`${slot.slots.length} total slots`}
                                variant="outlined"
                              />
                            </Box>
                            {slot.slots && slot.slots.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Slot Numbers:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {slot.slots.map((slotItem) => (
                                    <Chip
                                      key={slotItem.number}
                                      label={`#${slotItem.number}`}
                                      color={
                                        slotItem.booking?.status === 'approved' ? 'success' :
                                        slotItem.booking?.status === 'pending' ? 'warning' :
                                        slotItem.isAvailable ? 'primary' : 'default'
                                      }
                                      variant={slotItem.isAvailable ? 'filled' : 'outlined'}
                                      size="small"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                            {slot.slots.some(s => s.booking) && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Bookings:
                                </Typography>
                                <List dense>
                                  {slot.slots
                                    .filter(s => s.booking)
                                    .map((slotItem) => (
                                      <ListItem key={slotItem.number}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="body2">
                                              <strong>#{slotItem.number}:</strong> {slotItem.booking.vtcName} 
                                            </Typography>
                                          }
                                          secondary={
                                            <Chip
                                              size="small"
                                              label={slotItem.booking.status}
                                              color={
                                                slotItem.booking.status === 'approved' ? 'success' :
                                                slotItem.booking.status === 'rejected' ? 'error' :
                                                'warning'
                                              }
                                              sx={{ mt: 0.5 }}
                                            />
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                </List>
                              </Box>
                            )}
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              disabled={!slot.slots.some(s => s.isAvailable)}
                              onClick={() => handleRequestSlot(slot)}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: 'primary.dark',
                                  color: 'white',
                                },
                                '&:disabled': {
                                  bgcolor: 'action.disabledBackground',
                                  color: 'action.disabled',
                                },
                              }}
                            >
                              Request Slot
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* Booked Slots Overview Section */}
            <Box id="booked-slots-section" sx={{ scrollMarginTop: '100px' }}>
              <BookedSlots slots={slots} />
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  {event.voiceLink && (
                    <Button
                      variant="contained"
                      color="primary"
                      href={event.voiceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontFamily: 'Montserrat, sans-serif',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Join Voice Chat
                    </Button>
                  )}
                  {event.externalLink && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      href={`https://truckersmp.com/events/${event.truckersmpId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontFamily: 'Montserrat, sans-serif',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Visit Event Website
                    </Button>
                  )}
                   <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const bookedSlotsSection = document.getElementById('slots-section');
                      if (bookedSlotsSection) {
                        bookedSlotsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontFamily: 'Montserrat, sans-serif',
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Click here to book slots
                  </Button>
                  {event.map && (
                    <Button
                      variant="outlined"
                      color="info"
                      href={event.map}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontFamily: 'Montserrat, sans-serif',
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: 'info.main',
                        color: 'info.main',
                        '&:hover': {
                          borderColor: 'info.dark',
                          bgcolor: 'info.light',
                          color: 'info.dark',
                        },
                      }}
                    >
                      View Route Map
                    </Button>
                  )}
                 
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const bookedSlotsSection = document.getElementById('booked-slots-section');
                      if (bookedSlotsSection) {
                        bookedSlotsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontFamily: 'Montserrat, sans-serif',
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                      },
                    }}
                  >
                    View Booked Slots
                  </Button>
                </Stack>

                {event.attendances && (
                  <>
                    <Divider sx={{ my: 4 }} />
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                    >
                      Event Statistics
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Confirmed Attendees"
                          secondary={event.attendances.confirmed}
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="VTCs Participating"
                          secondary={event.attendances.vtcs}
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                    </List>

                    {event.attendances.confirmed_vtcs && event.attendances.confirmed_vtcs.length > 0 && (
                      <>
                        <Divider sx={{ my: 4 }} />
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                        >
                          Participating VTCs
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {event.attendances.confirmed_vtcs.map((vtc) => (
                            <Chip
                              key={vtc.id}
                              label={vtc.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontFamily: 'Montserrat, sans-serif' }}
                            />
                          ))}
                        </Box>
                      </>
                    )}

                    {event.attendances.confirmed_users && event.attendances.confirmed_users.length > 0 && (
                      <>
                        <Divider sx={{ my: 4 }} />
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                        >
                          Confirmed Attendees
                        </Typography>
                        <AvatarGroup max={10}>
                          {event.attendances.confirmed_users.map((user) => (
                            <Tooltip key={user.id} title={user.username}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  fontFamily: 'Montserrat, sans-serif',
                                  fontWeight: 500,
                                }}
                              >
                                {user.username.charAt(0)}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Add Slots Dialog */}
      <Dialog
        open={openSlotDialog}
        onClose={() => setOpenSlotDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Slots</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleSlotImageChange}
              style={{ display: 'none' }}
              id="slot-images"
            />
            <label htmlFor="slot-images">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{
                  mb: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                  },
                }}
              >
                Select Images
              </Button>
            </label>
            {slotImages.map((file, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Slot {index + 1}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={slotDescriptions[index]}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  sx={{ mb: 1 }}
                />
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  style={{ width: '20%', height: '200px', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSlotDialog(false)} sx={{ color: 'text.primary' }}>Cancel</Button>
          <Button
            onClick={handleAddSlots}
            variant="contained"
            disabled={slotImages.length === 0}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                color: 'white',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            Add Slots
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog
        open={openBookingDialog}
        onClose={() => setOpenBookingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book Slot {selectedSlot?.slotNumber}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="VTC Name"
              value={bookingForm.vtcName}
              onChange={(e) => setBookingForm({ ...bookingForm, vtcName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Contact Person Name"
              value={bookingForm.contactPerson.name}
              onChange={(e) => setBookingForm({
                ...bookingForm,
                contactPerson: { ...bookingForm.contactPerson, name: e.target.value }
              })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={bookingForm.contactPerson.email}
              onChange={(e) => setBookingForm({
                ...bookingForm,
                contactPerson: { ...bookingForm.contactPerson, email: e.target.value }
              })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Discord Username"
              value={bookingForm.contactPerson.discord}
              onChange={(e) => setBookingForm({
                ...bookingForm,
                contactPerson: { ...bookingForm.contactPerson, discord: e.target.value }
              })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)} sx={{ color: 'text.primary' }}>Cancel</Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            disabled={
              !bookingForm.vtcName ||
              !bookingForm.contactPerson.name ||
              !bookingForm.contactPerson.email ||
              !bookingForm.contactPerson.discord
            }
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                color: 'white',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            Submit Booking
          </Button>
        </DialogActions>
      </Dialog>

      <RequestSlotDialog
        open={requestSlotOpen}
        onClose={(success) => {
          setRequestSlotOpen(false);
          if (success) {
            // Refresh slots data
            window.location.reload();
          }
        }}
        slot={selectedSlot}
        onRequestSubmitted={() => {
          // Refresh slots data after successful submission
          window.location.reload();
        }}
      />
    </Box>
  );
};

export default EventDetails; 