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
  const [fetchingTmpEvent, setFetchingTmpEvent] = useState(false);
  const [eventSlots, setEventSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState({});
  const [allocationSelections, setAllocationSelections] = useState({});

  const getAllocationSelection = (requestId) => allocationSelections[requestId] || {};
  const updateAllocationSelection = (requestId, updates) => {
    setAllocationSelections(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        ...updates
      }
    }));
  };
  const clearAllocationSelection = (requestId) => {
    setAllocationSelections(prev => {
      const newState = { ...prev };
      delete newState[requestId];
      return newState;
    });
  };

  // Force refresh all slots for all events from backend
  const forceRefreshAllSlots = async () => {
    try {
      const promises = events.map(event => fetchEventSlots(event.truckersmpId));
      await Promise.all(promises);
      alert('All slots refreshed from backend');
    } catch (error) {
      console.error('Error refreshing all slots:', error);
      alert('Error refreshing slots: ' + error.message);
    }
  };
  
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

  const [adminComments, setAdminComments] = useState({});

  useEffect(() => {
    if (open) {
      fetchEvents();
    }
  }, [open]);

  useEffect(() => {
    console.log('eventSlots state changed:', eventSlots);
  }, [eventSlots]);

  useEffect(() => {
    if (selectedEvent) {
      console.log('Selected event changed:', selectedEvent);
      console.log('Current eventSlots for this event:', eventSlots[selectedEvent.truckersmpId]);
    }
  }, [selectedEvent, eventSlots]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching special events...');
      const response = await axiosInstance.get('/special-events');
      console.log('Special events response:', response.data);
      // Handle both response.data.events and response.data directly
      const eventsData = response.data.events || response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      
      // CRITICAL: Never clear eventSlots - preserve all existing slot data
      console.log('Events loaded, preserving ALL existing slots data. Current eventSlots:', eventSlots);
      console.log('eventSlots state preserved - no reset performed');
    } catch (error) {
      console.error('Error fetching special events:', error);
      setError('Failed to fetch special events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventSlots = async (eventId) => {
    try {
      setLoadingSlots(prev => ({ ...prev, [eventId]: true }));
      console.log('Fetching slots for event:', eventId);
      const response = await axiosInstance.get(`/special-events/${eventId}`);
      console.log('Event slots response:', response.data);
      console.log('Response structure:', {
        hasEvent: !!response.data.event,
        hasRouteSlots: !!response.data.routeSlots,
        routeSlotsType: typeof response.data.routeSlots,
        routeSlotsKeys: response.data.routeSlots ? Object.keys(response.data.routeSlots) : 'none'
      });
      
      const eventData = response.data.routeSlots && typeof response.data.routeSlots === 'object'
        ? response.data.routeSlots
        : {};

      if (response.data.routeSlots && typeof response.data.routeSlots === 'object') {
        console.log('Setting route slots:', response.data.routeSlots);
      } else {
        console.log('No route slots found, initializing empty object for this event');
      }

      setEventSlots(prev => ({
        ...prev,
        [eventId]: {
          ...eventData,
          routeRequests: response.data.routeRequests || {}
        }
      }));
    } catch (error) {
      console.error('Error fetching event slots:', error);
      setEventSlots(prev => ({
        ...prev,
        [eventId]: {}
      }));
    } finally {
      setLoadingSlots(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const getEventSlotCount = (eventId) => {
    console.log('Getting slot count for event:', eventId, 'Current eventSlots:', eventSlots);
    const slotsData = eventSlots[eventId];
    if (!slotsData) return 0;
    const count = Object.keys(slotsData)
      .filter(key => key !== 'routeRequests' && key !== 'unassigned')
      .reduce((total, key) => total + (slotsData[key]?.length || 0), 0);
    console.log('Slot count for event', eventId, ':', count);
    return count;
  };

  const ensureEventSlotsLoaded = async (eventId) => {
    if (!eventSlots[eventId]) {
      await fetchEventSlots(eventId);
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
    console.log('Editing event:', event);
    setSelectedEvent(event);
    setEditMode(true);
    setEventForm(mapEventToForm(event));
    setError('');
    setSuccess('');
    setActiveTab(0);

    console.log('Fetching slots for event:', event.truckersmpId);
    fetchEventSlots(event.truckersmpId);
  };

  const setSuccessWithTimeout = (message, timeout = 3000) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), timeout);
  };

  const mapEventToForm = (event) => ({
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
    routes: Array.isArray(event.routes)
      ? event.routes.map((route) => ({
          ...route,
          slotImages: route.slotImages || [],
          slotCount: route.slotCount || 0,
        }))
      : [],
  });

  const stripRoutesForPayload = (routes = []) =>
    routes.map(({ slotImages, slotCount, ...route }) => route);

  const updateEventFormRoute = (routeName, updater) => {
    setEventForm((prev) => ({
      ...prev,
      routes: prev.routes.map((r) =>
        r.name === routeName
          ? typeof updater === 'function'
            ? updater(r)
            : { ...r, ...updater }
          : r
      ),
    }));
  };

  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        ...eventForm,
        routes: stripRoutesForPayload(eventForm.routes),
      };

      if (selectedEvent) {
        const response = await axiosInstance.put(`/special-events/${selectedEvent.truckersmpId}`, payload);
        const updated = response.data?.event || response.data;
        if (updated) {
          setSelectedEvent(updated);
          setEventForm(mapEventToForm(updated));
          setEditMode(true);
        }
        await fetchEvents();
        setSuccessWithTimeout('Event saved successfully!');
      } else {
        await axiosInstance.post('/special-events', payload);
        setEditMode(false);
        setSelectedEvent(null);
        await fetchEvents();
        setSuccessWithTimeout('Event saved successfully!');
      }

      if (onEventUpdated) onEventUpdated();
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
      
      // Remove the deleted event from the events list and clear its slots
      setEvents(prev => prev.filter(e => e.truckersmpId !== event.truckersmpId));
      setEventSlots(prev => {
        const newState = { ...prev };
        delete newState[event.truckersmpId];
        return newState;
      });
      
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
      routes: [...prev.routes, { 
        ...routeForm, 
        slotImages: [], // Initialize empty slotImages array
        slotCount: 0 // Initialize slotCount
      }]
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

  const handleApproveRequest = async (requestId) => {
    const selection = allocationSelections[requestId] || {};
    const slotId = selection.slotId;

    if (!slotId) {
      setError('Please select a slot to allocate before approving');
      return;
    }

    if (!window.confirm('Are you sure you want to approve this request and allocate it to the selected slot?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const adminComment = adminComments[requestId] || '';

      const response = await axiosInstance.patch(
        `/special-events/${selectedEvent.truckersmpId}/requests/${requestId}/approve`,
        { slotId, admincomment: adminComment }
      );

      console.log('Request approved:', response.data);
      setSuccessWithTimeout('Request approved and slot allocated successfully!');
      
      // Clear the admin comment and allocation selection for this request
      setAdminComments(prev => {
        const newComments = { ...prev };
        delete newComments[requestId];
        return newComments;
      });
      clearAllocationSelection(requestId);
      
      fetchEventSlots(selectedEvent.truckersmpId); // Refresh slots to update request count
    } catch (error) {
      console.error('Error approving request:', error);
      setError(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) {
        setError('Rejection reason is required');
        return;
      }

      const adminComment = adminComments[requestId] || '';

      const response = await axiosInstance.patch(
        `/special-events/${selectedEvent.truckersmpId}/requests/${requestId}/reject`,
        { reason, admincomment: adminComment }
      );

      console.log('Request rejected:', response.data);
      setSuccessWithTimeout('Request rejected successfully!');
      
      // Clear the admin comment and allocation selection for this request
      setAdminComments(prev => {
        const newComments = { ...prev };
        delete newComments[requestId];
        return newComments;
      });
      clearAllocationSelection(requestId);
      
      fetchEventSlots(selectedEvent.truckersmpId); // Refresh slots to update request count
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleSetSlotsCount = async (route) => {
    // Ensure route has proper structure
    if (!route.slotImages) {
      route.slotImages = [];
    }
    if (!route.slotCount) {
      route.slotCount = 0;
    }
    
    if (!route.slotCount || route.slotCount < 1) {
      setError('Slot count must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Setting slots count with data:', {
        eventId: selectedEvent.truckersmpId,
        routeName: route.name,
        slotCount: route.slotCount
      });

      const response = await axiosInstance.post(
        `/special-events/${selectedEvent.truckersmpId}/routes/${encodeURIComponent(route.name)}/slots-count`,
        { slotCount: route.slotCount }
      );

      console.log('Slot count set:', response.data);
      setSuccessWithTimeout(`Slot count for route ${route.name} set to ${route.slotCount}!`);
      fetchEventSlots(selectedEvent.truckersmpId); // Refresh slots to update slot count
    } catch (error) {
      console.error('Error setting slot count:', error);
      setError(error.response?.data?.message || 'Failed to set slot count');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlots = async (route) => {
    console.log('handleCreateSlots called with route:', route);
    console.log('Route slotCount:', route.slotCount);
    console.log('Route slotImages:', route.slotImages);
    
    // Ensure route has proper structure
    if (!route.slotImages) {
      route.slotImages = [];
    }
    if (!route.slotCount) {
      route.slotCount = 0;
    }
    
    if (!route.slotCount || route.slotCount < 1) {
      setError('Slot count must be at least 1');
      return;
    }

    if (route.slotImages && route.slotImages.length !== route.slotCount) {
      setError('Please provide data for each slot');
      return;
    }

    if (route.slotImages.some(slot => !slot || !slot.url)) {
      setError('All slots must have an image URL');
      return;
    }

    if (route.slotImages.some(slot => !slot.maxVtc || slot.maxVtc < 1)) {
      setError('All slots must have a valid max VTC count (minimum 1)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Creating slots with data:', {
        eventId: selectedEvent.truckersmpId,
        routeName: route.name,
        slotCount: route.slotCount,
        slotImages: route.slotImages
      });

      const response = await axiosInstance.post(
        `/special-events/${selectedEvent.truckersmpId}/routes/${encodeURIComponent(route.name)}/slots-count`,
        { slotCount: route.slotCount, slotImages: route.slotImages }
      );

      console.log('Slots created:', response.data);
      setSuccessWithTimeout(`Successfully created ${response.data.slots} slots for route ${route.name}!`);
      fetchEventSlots(selectedEvent.truckersmpId); // Refresh slots to show new slots
    } catch (error) {
      console.error('Error creating slots:', error);
      setError(error.response?.data?.message || 'Failed to create slots');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Delete a slot
  const handleDeleteSlot = async (slotId, eventId) => {
    if (!window.confirm('Are you sure you want to delete this slot? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/special-events/${eventId}/slots/${slotId}`);
      console.log('Slot deleted:', response.data);
      
      // Refresh slots for this event
      await fetchEventSlots(eventId);
      
      // Show success message
      setSuccessWithTimeout('Slot deleted successfully!');
    } catch (error) {
      console.error('Error deleting slot:', error);
      setError('Failed to delete slot');
    }
  };

  // NEW: Delete an approved request
  const handleDeleteApprovedRequest = async (requestId, eventId) => {
    if (!window.confirm('Are you sure you want to delete this approved request? This will free up the allocated slot.')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/special-events/${eventId}/requests/${requestId}`);
      console.log('Approved request deleted:', response.data);
      
      // Refresh slots for this event
      await fetchEventSlots(eventId);
      
      // Show success message
      setSuccessWithTimeout('Approved request deleted successfully!');
    } catch (error) {
      console.error('Error deleting approved request:', error);
      setError('Failed to delete approved request');
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
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editMode ? (selectedEvent ? '✏️ Edit Special Event' : '➕ Create Special Event') : '🎉 Manage Special Events'}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
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
              console.log('Tab changed from', activeTab, 'to', newValue);
              setActiveTab(newValue);
              setError('');
              setSuccess('');
            }} sx={{ mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1 }}>
              <Tab label="📋 Event Details" sx={{ fontWeight: 600 }} />
              <Tab label="🛣️ Routes" sx={{ fontWeight: 600 }} />
              <Tab label="🎯 Manage Slots for Routes" sx={{ fontWeight: 600 }} />
              <Tab label="📝 Manage Requests" sx={{ fontWeight: 600 }} />
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
                          {selectedEvent && eventSlots[selectedEvent.truckersmpId] && eventSlots[selectedEvent.truckersmpId][route.name] && eventSlots[selectedEvent.truckersmpId][route.name].length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Existing Slots ({eventSlots[selectedEvent.truckersmpId][route.name].length}):
                              </Typography>
                              <Stack spacing={1}>
                                {eventSlots[selectedEvent.truckersmpId][route.name].map((slot, slotIndex) => (
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
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                      🎯 Manage Slots for Routes
                    </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => fetchEventSlots(selectedEvent.truckersmpId)}
                      size="small"
                    >
                      Refresh Slots
                    </Button>
                  </Box>
                </Box>
                
                {/* Route Slots Management */}
                {eventForm.routes && eventForm.routes.length > 0 ? (
                  <Grid container spacing={3}>
                    {eventForm.routes.map((route) => (
                      <Grid item xs={12} md={6} key={route.name}>
                        <Paper sx={{ p: 3, border: '2px solid', borderColor: 'primary.main' }}>
                          <Typography variant="h6" gutterBottom color="primary">
                            Route: {route.name}
                          </Typography>
                          
                                                      {/* Current Slots Display */}
                            {eventSlots[selectedEvent.truckersmpId] && 
                             eventSlots[selectedEvent.truckersmpId][route.name] && 
                             eventSlots[selectedEvent.truckersmpId][route.name].length > 0 ? (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                                  📊 Current Slots: {eventSlots[selectedEvent.truckersmpId][route.name].length}
                                </Typography>
                                                              <Grid container spacing={1}>
                                  {eventSlots[selectedEvent.truckersmpId][route.name].map((slot, idx) => (
                                    <Grid item xs={6} key={slot._id || idx}>
                                      <Card variant="outlined" sx={{ p: 1, position: 'relative' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                          {slot.imageUrl && (
                                            <img 
                                              src={slot.imageUrl} 
                                              alt={`Slot ${slot.slotNumber}`}
                                              style={{ 
                                                width: '100%', 
                                                height: '80px', 
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                              }}
                                            />
                                          )}
                                                                                     <Typography variant="caption" display="block" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                             {slot.slotName}
                                           </Typography>
                                           <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                             👥 {slot.maxVtc - (slot.allocatedVtcs || 0)}/{slot.maxVtc} available
                                           </Typography>
                                           <Chip 
                                             label={slot.status === 'full' ? 'FULL' : slot.status === 'assigned' ? 'PARTIAL' : 'AVAILABLE'} 
                                             size="small" 
                                             color={slot.status === 'available' ? 'success' : slot.status === 'assigned' ? 'warning' : 'error'}
                                             sx={{ mb: 1 }}
                                           />
                                          <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteSlot(slot._id, selectedEvent.truckersmpId)}
                                            sx={{ 
                                              fontSize: '0.7rem',
                                              py: 0.5,
                                              px: 1,
                                              minWidth: 'auto'
                                            }}
                                          >
                                            Delete
                                          </Button>
                                        </Box>
                                      </Card>
                                    </Grid>
                                  ))}
                                </Grid>
                            </Box>
                                                      ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                                📭 No slots configured for this route
                              </Typography>
                            )}
                          
                                                      {/* Set Slots Count Form */}
                            <Box sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                                ⚙️ Configure Slots
                              </Typography>
                            
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={4}>
                                <TextField
                                  label="Number of Slots"
                                  type="number"
                                  value={route.slotCount || ''}
                                  onChange={(e) => {
                                    updateEventFormRoute(route.name, {
                                      slotCount: parseInt(e.target.value, 10) || 0,
                                    });
                                  }}
                                  fullWidth
                                  size="small"
                                  inputProps={{ min: 1, max: 20 }}
                                />
                              </Grid>
                              <Grid item xs={8}>
                                <Button
                                  variant="contained"
                                  onClick={() => handleSetSlotsCount(route)}
                                  disabled={!route.slotCount || route.slotCount < 1}
                                  fullWidth
                                  size="small"
                                >
                                  Set Slots Count
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                          
                                                      {/* Add Slot Images Form */}
                            {route.slotCount && route.slotCount > 0 && (
                              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.08)', borderRadius: 2, border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                                                                 <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                                   🖼️ Configure Slots ({route.slotImages ? route.slotImages.length : 0}/{route.slotCount})
                                 </Typography>
                              
                                                             <Grid container spacing={2}>
                                 {Array.from({ length: route.slotCount }, (_, i) => (
                                   <Grid item xs={12} key={i}>
                                     <Box sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                       <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                                         🎯 Slot {i + 1}
                                       </Typography>
                                       <Grid container spacing={2}>
                                         <Grid item xs={8}>
                                           <TextField
                                             label="Image URL"
                                             value={route.slotImages ? route.slotImages[i]?.url || '' : ''}
                                             onChange={(e) => {
                                               updateEventFormRoute(route.name, (current) => {
                                                 const slotImages = [...(current.slotImages || [])];
                                                 if (!slotImages[i]) slotImages[i] = {};
                                                 slotImages[i] = { ...slotImages[i], url: e.target.value };
                                                 return { slotImages };
                                               });
                                             }}
                                             fullWidth
                                             size="small"
                                             placeholder="https://example.com/slot-image.jpg"
                                           />
                                         </Grid>
                                         <Grid item xs={4}>
                                           <TextField
                                             label="Max VTCs"
                                             type="number"
                                             value={route.slotImages ? route.slotImages[i]?.maxVtc || 1 : 1}
                                             onChange={(e) => {
                                               updateEventFormRoute(route.name, (current) => {
                                                 const slotImages = [...(current.slotImages || [])];
                                                 if (!slotImages[i]) slotImages[i] = {};
                                                 slotImages[i] = {
                                                   ...slotImages[i],
                                                   maxVtc: parseInt(e.target.value, 10) || 1,
                                                 };
                                                 return { slotImages };
                                               });
                                             }}
                                             fullWidth
                                             size="small"
                                             inputProps={{ min: 1, max: 20 }}
                                             helperText="Capacity per slot"
                                           />
                                         </Grid>
                                       </Grid>
                                     </Box>
                                   </Grid>
                                 ))}
                               </Grid>
                              
                                                             <Button
                                 variant="contained"
                                 onClick={() => handleCreateSlots(route)}
                                 disabled={!route.slotImages || route.slotImages.length !== route.slotCount || route.slotImages.some(slot => !slot || !slot.url || !slot.maxVtc)}
                                 sx={{ mt: 2 }}
                                 fullWidth
                                 startIcon={<UploadIcon />}
                               >
                                 Create {route.slotCount} Slots
                               </Button>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.05)' }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        🛣️ No routes configured
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Add routes in the Routes tab first, then come back to configure slots.
                      </Typography>
                    </Paper>
                  )}
              </Box>
            )}

            {activeTab === 3 && selectedEvent && (
              <Box>
                {console.log('Rendering Manage Requests tab for event:', selectedEvent.truckersmpId)}
                {console.log('Current eventSlots state:', eventSlots)}
                {console.log('Event slots for this event:', eventSlots[selectedEvent.truckersmpId])}
                
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                     📝 Manage Slot Requests & Allocations
                   </Typography>
                   
                   <Box sx={{ display: 'flex', gap: 1 }}>
                                         <Button
                       variant="outlined"
                       startIcon={<CloseIcon />}
                       onClick={() => {
                         setEditMode(false);
                         setSelectedEvent(null);
                         setActiveTab(0);
                       }}
                       size="small"
                     >
                       Back to Events
                     </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => fetchEventSlots(selectedEvent.truckersmpId)}
                      size="small"
                    >
                      Refresh
                    </Button>
                  </Box>
                                 </Box>
                 
                 {/* Allocation Summary */}
                 {(() => {
                   const allRequests = eventSlots[selectedEvent.truckersmpId]?.routeRequests ? 
                     Object.values(eventSlots[selectedEvent.truckersmpId].routeRequests).flat() : [];
                   const totalRequests = allRequests.length;
                   const unassignedRequests = allRequests.filter(req => !req.routeName || req.routeName === 'unassigned' || req.status === 'pending');
                   const approvedRequests = allRequests.filter(req => req.status === 'approved');
                   const totalSlots = Object.values(eventSlots[selectedEvent.truckersmpId] || {})
                     .filter(key => key !== 'routeRequests' && key !== 'unassigned')
                     .reduce((total, routeSlots) => total + routeSlots.length, 0);
                   
                   return (
                     <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', border: '2px solid', borderColor: 'primary.main' }}>
                       <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                         📊 Allocation Summary
                       </Typography>
                       <Grid container spacing={3}>
                         <Grid item xs={12} sm={3}>
                           <Box sx={{ textAlign: 'center' }}>
                             <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{totalRequests}</Typography>
                             <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Total Requests</Typography>
                           </Box>
                         </Grid>
                         <Grid item xs={12} sm={3}>
                           <Box sx={{ textAlign: 'center' }}>
                             <Typography variant="h4" color="warning" sx={{ fontWeight: 700 }}>{unassignedRequests.length}</Typography>
                             <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Unassigned</Typography>
                           </Box>
                         </Grid>
                         <Grid item xs={12} sm={3}>
                           <Box sx={{ textAlign: 'center' }}>
                             <Typography variant="h4" color="success" sx={{ fontWeight: 700 }}>{approvedRequests.length}</Typography>
                             <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Approved</Typography>
                           </Box>
                         </Grid>
                         <Grid item xs={12} sm={3}>
                           <Box sx={{ textAlign: 'center' }}>
                             <Typography variant="h4" color="info" sx={{ fontWeight: 700 }}>{totalSlots}</Typography>
                             <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Total Slots</Typography>
                           </Box>
                         </Grid>
                       </Grid>
                     </Paper>
                   );
                 })()}
                 
                 {/* Check if we have any slots data */}
                {(!eventSlots[selectedEvent.truckersmpId] || Object.keys(eventSlots[selectedEvent.truckersmpId]).length === 0) ? (
                  <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(255, 193, 7, 0.08)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                    <Typography variant="h6" color="warning.main" gutterBottom sx={{ fontWeight: 700 }}>
                      {loadingSlots[selectedEvent.truckersmpId] ? '⏳ Loading Slots...' : '📊 No Slots Data Found'}
                    </Typography>
                    {loadingSlots[selectedEvent.truckersmpId] ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress size={40} />
                      </Box>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 2, fontWeight: 500 }}>
                          The slots data is empty. This could mean:
                        </Typography>
                        <Box component="ul" sx={{ textAlign: 'left', maxWidth: '600px', mx: 'auto', color: 'text.primary' }}>
                          <li>No slots have been created for this event yet</li>
                          <li>The slots data failed to load from the backend</li>
                          <li>There's a data structure issue</li>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => fetchEventSlots(selectedEvent.truckersmpId)}
                          sx={{ mt: 2 }}
                        >
                          🔄 Try Loading Slots Again
                        </Button>
                      </>
                    )}
                  </Paper>
                ) : (
                  <>
                                         {/* Display unassigned requests first */}
                     {(() => {
                       const allRequests = eventSlots[selectedEvent.truckersmpId]?.routeRequests ? 
                         Object.values(eventSlots[selectedEvent.truckersmpId].routeRequests).flat() : [];
                       const unassignedRequests = allRequests.filter(req => !req.routeName || req.routeName === 'unassigned' || req.status === 'pending');
                      
                      if (unassignedRequests.length > 0) {
                        return (
                          <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 152, 0, 0.05)', border: '2px solid', borderColor: 'warning.main' }}>
                            <Typography variant="h5" gutterBottom sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                              ⏳ Unassigned Requests ({unassignedRequests.length})
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 2, fontWeight: 500 }}>
                              These requests need to be allocated to a route and slot by an admin.
                            </Typography>
                            
                            <Grid container spacing={2}>
                              {unassignedRequests.map((request, reqIndex) => (
                                <Grid item xs={12} md={6} key={request._id || reqIndex}>
                                  <Paper variant="outlined" sx={{ p: 2, borderColor: 'warning.main', backgroundColor: 'rgba(255, 152, 0, 0.05)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                                          🏢 {request.vtcName}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" gutterBottom sx={{ fontWeight: 500 }}>
                                          👤 Role: {request.vtcRole || 'N/A'} • 👥 Players: {request.playercount}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" gutterBottom>
                                          💬 Discord: {request.discordUsername}
                                        </Typography>
                                        {request.vtcLink && (
                                          <Typography variant="body2" color="text.primary" gutterBottom>
                                            🔗 VTC: {request.vtcLink}
                                          </Typography>
                                        )}
                                        {request.notes && (
                                          <Typography variant="body2" color="text.primary" gutterBottom>
                                            📝 Notes: {request.notes}
                                          </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                                          ⏰ Requested: {new Date(request.requestedAt).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Chip 
                                          label="UNASSIGNED" 
                                          size="small" 
                                          color="warning"
                                        />
                                        
                                        {/* Route Allocation Dropdown */}
                                        <FormControl size="small" sx={{ minWidth: 160 }}>
                                          <InputLabel>Route</InputLabel>
                                          <Select
                                            value={getAllocationSelection(request._id).routeName || ''}
                                            onChange={(e) => {
                                              updateAllocationSelection(request._id, {
                                                routeName: e.target.value,
                                                slotId: ''
                                              });
                                            }}
                                            label="Route"
                                          >
                                            {(editMode ? eventForm.routes : selectedEvent?.routes || []).map((route) => (
                                              <MenuItem key={route.name} value={route.name}>
                                                {route.name}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 160 }}>
                                          <InputLabel>Slot</InputLabel>
                                          <Select
                                            value={getAllocationSelection(request._id).slotId || ''}
                                            onChange={(e) => {
                                              updateAllocationSelection(request._id, { slotId: e.target.value });
                                            }}
                                            label="Slot"
                                            disabled={!getAllocationSelection(request._id).routeName}
                                          >
                                            {(eventSlots[selectedEvent.truckersmpId]?.[getAllocationSelection(request._id).routeName] || [])
                                              .filter(s => s.status !== 'full' && (s.allocatedVtcs || 0) < s.maxVtc)
                                              .map((slot) => (
                                                <MenuItem key={slot._id} value={slot._id}>
                                                  {slot.slotName || `Slot ${slot.slotNumber}`} ({slot.maxVtc - (slot.allocatedVtcs || 0)} available)
                                                </MenuItem>
                                              ))}
                                          </Select>
                                        </FormControl>

                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <Button
                                            variant="outlined"
                                            color="success"
                                            size="small"
                                            onClick={() => handleApproveRequest(request._id)}
                                            disabled={!getAllocationSelection(request._id).slotId}
                                            title={!getAllocationSelection(request._id).slotId ? "Please select a slot first" : "Approve request"}
                                          >
                                            Approve
                                          </Button>
                                        </Stack>
                                      </Box>
                                    </Box>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Paper>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Display all routes with their slots and requests */}
                                         {Object.keys(eventSlots[selectedEvent.truckersmpId] || {}).map(routeName => {
                       // Skip routeRequests key and unassigned requests as they're not route names
                       if (routeName === 'routeRequests' || routeName === 'unassigned') return null;
                      
                      const routeSlots = eventSlots[selectedEvent.truckersmpId][routeName] || [];
                      const routeRequests = eventSlots[selectedEvent.truckersmpId].routeRequests ? 
                        eventSlots[selectedEvent.truckersmpId].routeRequests[routeName] || [] : [];
                      
                      console.log(`Processing route: ${routeName}`);
                      console.log(`Route slots:`, routeSlots);
                      console.log(`Route requests:`, routeRequests);
                      
                      return (
                        <Paper key={routeName} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.02)', border: '2px solid', borderColor: 'primary.main' }}>
                          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            🛣️ Route: {routeName}
                          </Typography>
                          
                          {/* Route Summary */}
                          <Box sx={{ display: 'flex', gap: 4, mb: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{routeSlots.length}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Total Slots</Typography>
                            </Box>
                                                         <Box sx={{ textAlign: 'center' }}>
                               <Typography variant="h4" color="success" sx={{ fontWeight: 700 }}>
                                 {routeSlots.reduce((total, slot) => total + (slot.maxVtc - (slot.allocatedVtcs || 0)), 0)}
                               </Typography>
                               <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Available Spots</Typography>
                             </Box>
                                                         <Box sx={{ textAlign: 'center' }}>
                               <Typography variant="h4" color="warning" sx={{ fontWeight: 700 }}>
                                 {routeSlots.filter(s => s.status === 'assigned' || s.status === 'full').length}
                               </Typography>
                               <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Used Slots</Typography>
                             </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="info" sx={{ fontWeight: 700 }}>{routeRequests.length}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Total Requests</Typography>
                            </Box>
                          </Box>
                          
                          {/* Slots Grid with Assignments */}
                          <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'text.primary', fontWeight: 700 }}>
                            🎯 Route Slots & Assignments
                          </Typography>
                          <Grid container spacing={2} sx={{ mb: 3 }}>
                            {routeSlots.map((slot, slotIndex) => (
                              <Grid item xs={12} sm={6} md={4} key={slot._id || slotIndex}>
                                <Card 
                                  variant="outlined" 
                                  sx={{ 
                                    borderColor: slot.status === 'available' ? 'success.main' : 'warning.main',
                                    borderWidth: 2,
                                    height: '100%',
                                    backgroundColor: slot.status === 'available' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 152, 0, 0.05)'
                                  }}
                                >
                                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                    {/* Slot Image */}
                                    {slot.imageUrl && (
                                      <Box sx={{ mb: 2 }}>
                                        <img 
                                          src={slot.imageUrl} 
                                          alt={`Slot ${slot.slotNumber}`}
                                          style={{ 
                                            width: '100%', 
                                            height: '120px', 
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0'
                                          }}
                                        />
                                      </Box>
                                    )}
                                    
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
                                      🎯 {slot.slotName || `Slot ${slot.slotNumber}`}
                                    </Typography>
                                    
                                                                         <Chip 
                                       label={slot.status === 'full' ? 'FULL' : slot.status === 'assigned' ? 'PARTIAL' : 'AVAILABLE'} 
                                       size="small" 
                                       color={slot.status === 'available' ? 'success' : slot.status === 'assigned' ? 'warning' : 'error'}
                                       sx={{ mb: 1, fontWeight: 600 }}
                                     />
                                    
                                                                         <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                                       👥 Max VTCs: {slot.maxVtc} • Available: {slot.maxVtc - (slot.allocatedVtcs || 0)}
                                     </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                          
                          {/* Current Slot Assignments */}
                          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 700 }}>
                              ✅ Current Slot Assignments
                            </Typography>
                            <Grid container spacing={2}>
                              {routeSlots.map((slot, slotIndex) => {
                                const slotRequests = routeRequests.filter(req => 
                                  req.allocatedSlotId === slot._id && req.status === 'approved'
                                );
                                
                                return (
                                  <Grid item xs={12} sm={6} md={4} key={slot._id || slotIndex}>
                                    <Paper variant="outlined" sx={{ p: 2, borderColor: 'success.main' }}>
                                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'success.main' }}>
                                        🎯 {slot.slotName || `Slot ${slot.slotNumber}`}
                                      </Typography>
                                      
                                      <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                                        👥 Capacity: {slot.allocatedVtcs || 0}/{slot.maxVtc} VTCs
                                      </Typography>
                                      
                                      {slotRequests.length > 0 ? (
                                        <Box>
                                          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                                            🏢 Assigned VTCs:
                                          </Typography>
                                          {slotRequests.map((req, reqIdx) => (
                                            <Chip
                                              key={reqIdx}
                                              label={`${req.vtcName} (${req.playercount} players)`}
                                              size="small"
                                              color="success"
                                              sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                          ))}
                                        </Box>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                          No VTCs assigned to this slot
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                          
                          {/* Requests Section */}
                          <Typography variant="h6" gutterBottom sx={{ mt: 3, color: 'text.primary', fontWeight: 700 }}>
                            ⏳ Pending Requests ({routeRequests.filter(r => r.status === 'pending').length})
                          </Typography>
                          
                          {routeRequests.filter(r => r.status === 'pending').length > 0 ? (
                            <Grid container spacing={2}>
                              {routeRequests.filter(r => r.status === 'pending').map((request, reqIndex) => (
                                <Grid item xs={12} md={6} key={request._id || reqIndex}>
                                  <Paper variant="outlined" sx={{ p: 2, borderColor: 'warning.main', backgroundColor: 'rgba(255, 152, 0, 0.05)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                                          🏢 {request.vtcName}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" gutterBottom sx={{ fontWeight: 500 }}>
                                          👤 Role: {request.vtcRole || 'N/A'} • 👥 Players: {request.playercount}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" gutterBottom>
                                          💬 Discord: {request.discordUsername}
                                        </Typography>
                                        {request.vtcLink && (
                                          <Typography variant="body2" color="text.primary" gutterBottom>
                                            🔗 VTC: {request.vtcLink}
                                          </Typography>
                                        )}
                                        {request.notes && (
                                          <Typography variant="body2" color="text.primary" gutterBottom>
                                            📝 Notes: {request.notes}
                                          </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                                          ⏰ Requested: {new Date(request.requestedAt).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Chip 
                                          label="PENDING" 
                                          size="small" 
                                          color="warning"
                                        />
                                        
                                        {/* Slot Allocation Dropdown */}
                                        <FormControl size="small" sx={{ minWidth: 160 }}>
                                          <InputLabel>Slot</InputLabel>
                                          <Select
                                            value={getAllocationSelection(request._id).slotId || ''}
                                            onChange={(e) => {
                                              updateAllocationSelection(request._id, { slotId: e.target.value });
                                            }}
                                            label="Slot"
                                          >
                                            {routeSlots
                                              .filter(s => s.status !== 'full' && (s.allocatedVtcs || 0) < s.maxVtc)
                                              .map((slot) => (
                                                <MenuItem key={slot._id} value={slot._id}>
                                                  {slot.slotName || `Slot ${slot.slotNumber}`} ({slot.maxVtc - (slot.allocatedVtcs || 0)} available)
                                                </MenuItem>
                                              ))}
                                          </Select>
                                        </FormControl>
                                        
                                        {/* Action Buttons */}
                                        <Stack direction="row" spacing={0.5}>
                                          <Button
                                            variant="outlined"
                                            color="success"
                                            size="small"
                                            onClick={() => handleApproveRequest(request._id)}
                                            disabled={!getAllocationSelection(request._id).slotId}
                                            title={!getAllocationSelection(request._id).slotId ? "Please select a slot first" : "Approve request"}
                                          >
                                            Approve
                                          </Button>
                                          <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleRejectRequest(request._id)}
                                          >
                                            Reject
                                          </Button>
                                          <TextField
                                            size="small"
                                            placeholder="Admin comment (optional)"
                                            value={adminComments[request._id] || ''}
                                            onChange={(e) => setAdminComments(prev => ({
                                              ...prev,
                                              [request._id]: e.target.value
                                            }))}
                                            sx={{ minWidth: '200px' }}
                                          />
                                        </Stack>
                                      </Box>
                                    </Box>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(255, 152, 0, 0.05)' }}>
                              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                📭 No pending requests for this route
                              </Typography>
                            </Paper>
                          )}
                          
                          {/* Approved/Rejected Requests */}
                          {(routeRequests.filter(r => r.status === 'approved' || r.status === 'rejected').length > 0) && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 700 }}>
                                📋 Processed Requests
                              </Typography>
                              <Grid container spacing={2}>
                                {routeRequests.filter(r => r.status === 'approved' || r.status === 'rejected').map((request, reqIndex) => (
                                  <Grid item xs={12} md={6} key={request._id || reqIndex}>
                                    <Paper 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderColor: request.status === 'approved' ? 'success.main' : 'error.main',
                                        backgroundColor: request.status === 'approved' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="h6" fontWeight="bold" 
                                            color={request.status === 'approved' ? 'success.main' : 'error.main'}>
                                            🏢 {request.vtcName}
                                          </Typography>
                                          <Typography variant="body2" color="text.primary" gutterBottom sx={{ fontWeight: 500 }}>
                                            👤 Role: {request.vtcRole || 'N/A'} • 👥 Players: {request.playercount}
                                          </Typography>
                                          <Typography variant="body2" color="text.primary" gutterBottom>
                                            💬 Discord: {request.discordUsername}
                                          </Typography>
                                          {request.status === 'approved' && request.allocatedSlotName && (
                                            <Typography variant="body2" color="success.main" fontWeight="bold" gutterBottom>
                                              ✅ Allocated to: {request.allocatedSlotName} (#{request.allocatedSlotNumber})
                                            </Typography>
                                          )}
                                          {request.status === 'rejected' && request.rejectionReason && (
                                            <Typography variant="body2" color="error.main" fontWeight="bold" gutterBottom>
                                              ❌ Reason: {request.rejectionReason}
                                            </Typography>
                                          )}
                                          {request.admincomment && (
                                            <Typography variant="body2" color="info.main" fontWeight="bold" gutterBottom>
                                              💬 Admin Comment: {request.admincomment}
                                            </Typography>
                                          )}
                                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                                            {request.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(request.status === 'approved' ? request.approvedAt : request.rejectedAt).toLocaleDateString()}
                                          </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                                          <Chip 
                                            label={request.status.toUpperCase()} 
                                            size="small" 
                                            color={request.status === 'approved' ? 'success' : 'error'}
                                            sx={{ fontWeight: 600 }}
                                          />
                                          
                                          {/* Delete button for approved requests */}
                                          {request.status === 'approved' && (
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              size="small"
                                              onClick={() => handleDeleteApprovedRequest(request._id, selectedEvent.truckersmpId)}
                                              sx={{ 
                                                fontSize: '0.7rem',
                                                py: 0.5,
                                                px: 1,
                                                minWidth: 'auto'
                                              }}
                                            >
                                              Delete
                                            </Button>
                                          )}
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                  </>
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
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={forceRefreshAllSlots}
                  title="Refresh All Slots"
                  color="warning"
                >
                  Refresh Slots
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
                              label={event.status}
                              size="small"
                              color={event.status === 'upcoming' ? 'success' : 'default'}
                            />
                            {event.routes && event.routes.length > 0 && (
                              <Chip
                                label={`${event.routes.length} Routes`}
                                size="small"
                                icon={<RouteIcon />}
                                color="info"
                              />
                            )}
                            <Chip
                              label={loadingSlots[event.truckersmpId] ? 'Loading...' : `${getEventSlotCount(event.truckersmpId)} Total Slots`}
                              size="small"
                              color="secondary"
                              onClick={() => ensureEventSlotsLoaded(event.truckersmpId)}
                              sx={{ cursor: 'pointer' }}
                              icon={loadingSlots[event.truckersmpId] ? <CircularProgress size={16} /> : undefined}
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
                               handleEditEvent(event);
                               setActiveTab(2);
                             }}
                             sx={{ mr: 1 }}
                           >
                             Upload Slots
                           </Button>
                           <Button
                             variant="outlined"
                             startIcon={<CheckIcon />}
                             onClick={() => {
                               setSelectedEvent(event);
                               setEditMode(true);
                               setActiveTab(3);
                               // Fetch slots for this event to show requests
                               fetchEventSlots(event.truckersmpId);
                             }}
                             sx={{ mr: 1 }}
                             color="info"
                           >
                             Manage Requests
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
