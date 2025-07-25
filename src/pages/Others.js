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
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import RequestSlotDialog from '../components/RequestSlotDialog';
import BookedSlots from '../components/BookedSlots';

const Others = () => {
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
    window.location.reload();
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
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
                    <CalendarTodayIcon />
                    <Typography variant="body1">
                      {format(new Date(event.startDate), 'PPp')}
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
                          primary="Start Time"
                          secondary={format(new Date(event.startDate), 'PPp')}
                          primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                          secondaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
                        />
                       
                      </ListItem>
                      {event.endDate && (
                        <ListItem>
                          <ListItemText
                            primary="End Time"
                            secondary={format(new Date(event.endDate), 'PPp')}
                            primaryTypographyProps={{ fontFamily: 'Montserrat, sans-serif' }}
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
                          primary="Meeting Point"
                          secondary={event.meetingPoint}
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
              
            </Card>

            
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
                      }}
                    >
                      View Route Map
                    </Button>
                  )}
                  
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
                sx={{ mb: 2 }}
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
          <Button onClick={() => setOpenSlotDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddSlots}
            variant="contained"
            disabled={slotImages.length === 0}
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
          <Button onClick={() => setOpenBookingDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            disabled={
              !bookingForm.vtcName ||
              !bookingForm.contactPerson.name ||
              !bookingForm.contactPerson.email ||
              !bookingForm.contactPerson.discord
            }
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

export default Others; 