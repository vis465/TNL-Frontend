import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  Route as RouteIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';

const ManageSpecialEventsDialog = ({ open, onClose, onEventUpdated }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fetchingTmpEvent, setFetchingTmpEvent] = useState(false);
  const [eventSlots, setEventSlots] = useState({});
  
  // Form states
  const [eventForm, setEventForm] = useState({
    truckersmpId: '',
    title: '',
    description: '',
    startDate: '',
    endtime: '',
    server: '',
    meetingPoint: '',
    departurePoint: '',
    arrivalPoint: '',
    banner: '',
    map: '',
    voiceLink: '',
    externalLink: '',
    rule: '',
    dlcs: [],
    url: '',
    maxVtcPerSlot: 1,
    approvalRequired: true,
    routes: []
  });

  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    color: '#1976d2'
  });

  const [slotsForm, setSlotsForm] = useState({
    routeName: '',
    slots: []
  });

  const [newSlot, setNewSlot] = useState({
    slotNumber: 1,
    slotName: '',
    description: '',
    minPlayers: 1,
    maxVtc: 1,
    imageUrl: '',
    specialRequirements: []
  });

  const [newRequirement, setNewRequirement] = useState('');

  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching special events...');
      const response = await axiosInstance.get('/special-events');
      console.log('Special events response:', response.data);
      // Handle both response.data.events and response.data directly
      const eventsData = response.data.events || response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Error fetching special events:', error);
      setError('Failed to fetch special events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventSlots = async (eventId) => {
    try {
      console.log('Fetching slots for event:', eventId);
      const response = await axiosInstance.get(`/special-events/${eventId}`);
      console.log('Event slots response:', response.data);
      if (response.data.routeSlots && typeof response.data.routeSlots === 'object') {
        setEventSlots(response.data.routeSlots);
      } else {
        setEventSlots({});
      }
    } catch (error) {
      console.error('Error fetching event slots:', error);
      setEventSlots({});
    }
  };

  const handleCreateEvent = () => {
    setEditMode(true);
    setSelectedEvent(null);
    setEventForm({
      truckersmpId: '',
      title: '',
      description: '',
      startDate: '',
      endtime: '',
      server: '',
      meetingPoint: '',
      departurePoint: '',
      arrivalPoint: '',
      banner: '',
      map: '',
      voiceLink: '',
      externalLink: '',
      rule: '',
      dlcs: [],
      url: '',
      maxVtcPerSlot: 1,
      approvalRequired: true,
      routes: []
    });
    setError('');
    setSuccess('');
    setActiveTab(0);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setEditMode(true);
    setEventForm({
      truckersmpId: event.truckersmpId,
      title: event.title,
      description: event.description,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endtime: event.endtime ? new Date(event.endtime).toISOString().split('T')[0] : '',
      server: event.server,
      meetingPoint: event.meetingPoint,
      departurePoint: event.departurePoint,
      arrivalPoint: event.arrivalPoint,
      banner: event.banner,
      map: event.map,
      voiceLink: event.voiceLink,
      externalLink: event.externalLink,
      rule: event.rule,
      dlcs: Array.isArray(event.dlcs) ? event.dlcs : [],
      url: event.url,
      maxVtcPerSlot: event.maxVtcPerSlot || 1,
      approvalRequired: event.approvalRequired !== false,
      routes: Array.isArray(event.routes) ? event.routes : []
    });
    setError('');
    setSuccess('');
    setActiveTab(0);
    
    // Fetch slots for this event
    fetchEventSlots(event.truckersmpId);
  };

  const setSuccessWithTimeout = (message, timeout = 3000) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), timeout);
  };

  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Saving event:', eventForm);
      
      if (selectedEvent) {
        const response = await axiosInstance.put(`/special-events/${selectedEvent.truckersmpId}`, eventForm);
        console.log('Event updated successfully:', response.data);
      } else {
        const response = await axiosInstance.post('/special-events', eventForm);
        console.log('Event created successfully:', response.data);
      }
      
      setEditMode(false);
      setSelectedEvent(null);
      console.log('Refreshing events list...');
      await fetchEvents();
      if (onEventUpdated) onEventUpdated();
      setSuccessWithTimeout('Event saved successfully!');
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError('');
      setSuccess('');
      
      await axiosInstance.delete(`/special-events/${event.truckersmpId}`);
      fetchEvents();
      if (onEventUpdated) onEventUpdated();
      setSuccessWithTimeout('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddRoute = () => {
    if (!routeForm.name.trim()) return;
    
    setEventForm(prev => ({
      ...prev,
      routes: [...prev.routes, { ...routeForm }]
    }));
    
    setRouteForm({
      name: '',
      description: '',
      color: '#1976d2'
    });
  };

  const handleRemoveRoute = (routeIndex) => {
    setEventForm(prev => ({
      ...prev,
      routes: prev.routes.filter((_, index) => index !== routeIndex)
    }));
  };

  const handleAddSlot = () => {
    if (!newSlot.slotName.trim()) return;
    
    setSlotsForm(prev => ({
      ...prev,
      slots: [...prev.slots, { ...newSlot }]
    }));
    
    // Reset newSlot form and increment slot number
    setNewSlot({
      slotNumber: (newSlot.slotNumber || 0) + 1,
      slotName: '',
      description: '',
      minPlayers: 1,
      maxVtc: 1,
      imageUrl: '',
      specialRequirements: []
    });
  };

  const handleRemoveSlot = (slotIndex) => {
    setSlotsForm(prev => ({
      ...prev,
      slots: prev.slots.filter((_, index) => index !== slotIndex)
    }));
  };

  const handleAddRequirement = () => {
    if (!newRequirement.trim()) return;
    
    setNewSlot(prev => ({
      ...prev,
      specialRequirements: [...prev.specialRequirements, newRequirement.trim()]
    }));
    
    setNewRequirement('');
  };

  const handleRemoveRequirement = (reqIndex) => {
    setNewSlot(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.filter((_, index) => index !== reqIndex)
    }));
  };

  const handleUploadSlots = async () => {
    if (!slotsForm.routeName || slotsForm.slots.length === 0) {
      setError('Please select a route and add slots before uploading');
      return;
    }

    try {
      setUploadLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Uploading slots:', {
        eventId: selectedEvent.truckersmpId,
        routeName: slotsForm.routeName,
        slots: slotsForm.slots
      });
      
      await axiosInstance.post(
        `/special-events/${selectedEvent.truckersmpId}/routes/${slotsForm.routeName}/slots`,
        { slots: slotsForm.slots }
      );
      
      // Clear the form after successful upload
      setSlotsForm({
        routeName: '',
        slots: []
      });
      
      // Reset newSlot form
      setNewSlot({
        slotNumber: 1,
        slotName: '',
        description: '',
        minPlayers: 1,
        maxVtc: 1,
        imageUrl: '',
        specialRequirements: []
      });
      
      // Refresh the events list and slots
      await fetchEvents();
      if (selectedEvent) {
        await fetchEventSlots(selectedEvent.truckersmpId);
      }
      
      if (onEventUpdated) onEventUpdated();
      
      // Show success message
      setSuccessWithTimeout('Slots uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading slots:', error);
      setError(error.response?.data?.message || 'Failed to upload slots');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClose = () => {
    setEditMode(false);
    setSelectedEvent(null);
    setEventForm({
      truckersmpId: '',
      title: '',
      description: '',
      startDate: '',
      endtime: '',
      server: '',
      meetingPoint: '',
      departurePoint: '',
      arrivalPoint: '',
      banner: '',
      map: '',
      voiceLink: '',
      externalLink: '',
      rule: '',
      dlcs: [],
      url: '',
      maxVtcPerSlot: 1,
      approvalRequired: true,
      routes: []
    });
    setSlotsForm({
      routeName: '',
      slots: []
    });
    setError('');
    setSuccess('');
    onClose();
  };

  const fetchTruckersMPEvent = async (eventId) => {
    if (!eventId.trim()) return;
    
    try {
      setFetchingTmpEvent(true);
      setError('');
      setSuccess('');
      
      const response = await axiosInstance.get(`/events/${eventId}`);
      const eventData = response.data;
      
      // Convert TruckersMP date format to local date format
      const startDate = eventData.starttime ? new Date(eventData.starttime).toISOString().split('T')[0] : '';
      const endDate = eventData.endtime ? new Date(eventData.endtime).toISOString().split('T')[0] : '';
      
      setEventForm(prev => ({
        ...prev,
        truckersmpId: eventData.truckersmpId,
        title: eventData.title,
        description: eventData.description,
        startDate: startDate,
        endtime: endDate,
        server: eventData.server,
        meetingPoint: eventData.meetingPoint,
        departurePoint: eventData.departurePoint,
        arrivalPoint: eventData.arrivalPoint,
        banner: eventData.banner,
        map: eventData.map,
        voiceLink: eventData.voiceLink,
        externalLink: eventData.externalLink,
        rule: eventData.rule,
        dlcs: eventData.dlcs || [],
        url: eventData.url
      }));
      
    } catch (error) {
      console.error('Error fetching TruckersMP event:', error);
      setError('Failed to fetch event from TruckersMP. Please check the ID and try again.');
    } finally {
      setFetchingTmpEvent(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading special events...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {editMode ? (selectedEvent ? 'Edit Special Event' : 'Create Special Event') : 'Manage Special Events'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {editMode ? (
          // Edit/Create Event Form
          <Box>
            <Tabs value={activeTab} onChange={(e, newValue) => {
              setActiveTab(newValue);
              setError('');
              setSuccess('');
            }} sx={{ mb: 3 }}>
              <Tab label="Event Details" />
              <Tab label="Routes" />
              <Tab label="Upload Slots" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="TruckersMP ID *"
                      value={eventForm.truckersmpId}
                      onChange={(e) => setEventForm(prev => ({ ...prev, truckersmpId: e.target.value }))}
                      fullWidth
                      required
                      disabled={!!selectedEvent}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => fetchTruckersMPEvent(eventForm.truckersmpId)}
                      disabled={!eventForm.truckersmpId.trim() || fetchingTmpEvent}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {fetchingTmpEvent ? <CircularProgress size={20} /> : <SearchIcon />}
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Title *"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Description *"
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    fullWidth
                    required
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date *"
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Time"
                    type="datetime-local"
                    value={eventForm.endtime}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endtime: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Server *"
                    value={eventForm.server}
                    onChange={(e) => setEventForm(prev => ({ ...prev, server: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Meeting Point *"
                    value={eventForm.meetingPoint}
                    onChange={(e) => setEventForm(prev => ({ ...prev, meetingPoint: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Departure Point *"
                    value={eventForm.departurePoint}
                    onChange={(e) => setEventForm(prev => ({ ...prev, departurePoint: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Arrival Point *"
                    value={eventForm.arrivalPoint}
                    onChange={(e) => setEventForm(prev => ({ ...prev, arrivalPoint: e.target.value }))}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Banner URL"
                    value={eventForm.banner}
                    onChange={(e) => setEventForm(prev => ({ ...prev, banner: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Map URL"
                    value={eventForm.map}
                    onChange={(e) => setEventForm(prev => ({ ...prev, map: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Voice Link"
                    value={eventForm.voiceLink}
                    onChange={(e) => setEventForm(prev => ({ ...prev, voiceLink: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="External Link"
                    value={eventForm.externalLink}
                    onChange={(e) => setEventForm(prev => ({ ...prev, externalLink: e.target.value }))}
                    fullWidth
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Rules"
                    value={eventForm.rule}
                    onChange={(e) => setEventForm(prev => ({ ...prev, rule: e.target.value }))}
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max VTCs per Slot"
                    type="number"
                    value={eventForm.maxVtcPerSlot}
                    onChange={(e) => setEventForm(prev => ({ ...prev, maxVtcPerSlot: parseInt(e.target.value) || 1 }))}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Approval Required</InputLabel>
                    <Select
                      value={eventForm.approvalRequired}
                      onChange={(e) => setEventForm(prev => ({ ...prev, approvalRequired: e.target.value }))}
                      label="Approval Required"
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Event Routes
                </Typography>
                
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Route Name *"
                        value={routeForm.name}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Description"
                        value={routeForm.description}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, description: e.target.value }))}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Color"
                        type="color"
                        value={routeForm.color}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, color: e.target.value }))}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRoute}
                    sx={{ mt: 2 }}
                    disabled={!routeForm.name.trim()}
                  >
                    Add Route
                  </Button>
                </Paper>

                <Grid container spacing={2}>
                  {eventForm.routes && eventForm.routes.length > 0 ? eventForm.routes.map((route, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={route.name}
                              sx={{ backgroundColor: route.color, color: 'white' }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveRoute(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          
                          {route.description && (
                            <Typography variant="body2" color="text.secondary">
                              {route.description}
                            </Typography>
                          )}
                          
                          {/* Display existing slots for this route */}
                          {selectedEvent && eventSlots[route.name] && eventSlots[route.name].length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Existing Slots ({eventSlots[route.name].length}):
                              </Typography>
                              <Stack spacing={1}>
                                {eventSlots[route.name].map((slot, slotIndex) => (
                                  <Chip
                                    key={slotIndex}
                                    label={`${slot.slotName} (${slot.slotNumber})`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No routes added yet. Add a route above to get started.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && selectedEvent && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Upload Slots for Route
                </Typography>
                
                <Paper sx={{ p: 2, mb: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Route</InputLabel>
                    <Select
                      value={slotsForm.routeName}
                      onChange={(e) => setSlotsForm(prev => ({ ...prev, routeName: e.target.value }))}
                      label="Select Route"
                    >
                      {selectedEvent.routes && selectedEvent.routes.length > 0 ? selectedEvent.routes.map((route) => (
                        <MenuItem key={route.name} value={route.name}>
                          {route.name}
                        </MenuItem>
                      )) : (
                        <MenuItem disabled>No routes available</MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Add Slots
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Slot #"
                        type="number"
                        value={newSlot.slotNumber}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, slotNumber: parseInt(e.target.value) || 1 }))}
                        fullWidth
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Slot Name *"
                        value={newSlot.slotName}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, slotName: e.target.value }))}
                        fullWidth
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Min Players"
                        type="number"
                        value={newSlot.minPlayers}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, minPlayers: parseInt(e.target.value) || 1 }))}
                        fullWidth
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Max VTCs"
                        type="number"
                        value={newSlot.maxVtc}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, maxVtc: parseInt(e.target.value) || 1 }))}
                        fullWidth
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddSlot}
                        disabled={!newSlot.slotName.trim()}
                        fullWidth
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Description"
                        value={newSlot.description}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, description: e.target.value }))}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Image URL"
                        value={newSlot.imageUrl}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, imageUrl: e.target.value }))}
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Special Requirements
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Add requirement"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddRequirement}
                        disabled={!newRequirement.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {newSlot.specialRequirements && newSlot.specialRequirements.length > 0 ? newSlot.specialRequirements.map((req, index) => (
                        <Chip
                          key={index}
                          label={req}
                          onDelete={() => handleRemoveRequirement(index)}
                          size="small"
                        />
                      )) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No special requirements added
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Paper>

                {slotsForm.slots.length > 0 && (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Slots to Upload ({slotsForm.slots.length})
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {slotsForm.slots && slotsForm.slots.length > 0 ? slotsForm.slots.map((slot, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined">
                            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2">
                                  {slot.slotName}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveSlot(index)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Slot #{slot.slotNumber} • Min: {slot.minPlayers} • Max: {slot.maxVtc}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )) : (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            No slots added yet. Add slots above to get started.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={handleUploadSlots}
                      disabled={uploadLoading || !slotsForm.routeName}
                      sx={{ mt: 2 }}
                    >
                      {uploadLoading ? <CircularProgress size={20} /> : 'Upload Slots'}
                    </Button>
                  </Paper>
                )}
              </Box>
            )}
          </Box>
        ) : (
          // Events List
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {/* Special Events ({events.length}) */}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchEvents}
                  title="Refresh Events"
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateEvent}
                >
                  Create Special Event
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {events && events.length > 0 ? events.map((event) => (
                <Grid item xs={12} key={event._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {event.description}
                          </Typography>
                          
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Chip
                              label={event.server}
                              size="small"
                              color="primary"
                            />
                            <Chip
                              label={(new Date(event.startDate), 'PPP')}
                              size="small"
                              color="secondary"
                            />
                            <Chip
                            //   label={`${event.routes?.length || 0} Routes`}
                              size="small"
                              icon={<RouteIcon />}
                            />
                            <Chip
                              label={event.status}
                              size="small"
                              color={event.status === 'upcoming' ? 'success' : 'default'}
                            />
                          </Stack>
                        </Box>
                        
                        <Box>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditEvent(event)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={() => {
                              setSelectedEvent(event);
                              setActiveTab(2);
                            }}
                            sx={{ mr: 1 }}
                          >
                            Upload Slots
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteEvent(event)}
                            disabled={deleteLoading}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <RouteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No special events found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first special event to get started.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {editMode ? (
          <>
            <Button onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEvent}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading || !eventForm.title || !eventForm.truckersmpId}
            >
              {loading ? <CircularProgress size={20} /> : 'Save Event'}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ManageSpecialEventsDialog;
