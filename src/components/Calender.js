import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Chip,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  useTheme
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import InviteForm from './InviteForm';
import axiosInstance from '../utils/axios';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Localizer
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendercomponent = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Custom event styling
  const eventStyleGetter = (event) => {
    let backgroundColor = theme.palette.primary.main;
    let borderColor = theme.palette.primary.dark;

    switch (event.status) {
      case 'approved':
        backgroundColor = theme.palette.success.main;
        borderColor = theme.palette.success.dark;
        break;
      case 'pending':
        backgroundColor = theme.palette.warning.main;
        borderColor = theme.palette.warning.dark;
        break;
      case 'rejected':
        backgroundColor = theme.palette.error.main;
        borderColor = theme.palette.error.dark;
        break;
      case 'cancelled':
        backgroundColor = theme.palette.grey[500];
        borderColor = theme.palette.grey[700];
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
        padding: '2px 5px',
      },
    };
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/invites/attending');
      const data = response.data;
      
      const formattedEvents = data.map((event) => ({
        id: event._id,
        title: event.eventTitle || event.title,
        start: new Date(event.Meetuptime || event.start),
        end: new Date(event.departureTime || event.end),
        description: event.invite_text || event.description,
        status: event.status,
        game: event.game,
        vtcName: event.vtcName,
        eventLink: event.eventLink,
        approvedByUsername: event.approvedByUsername,
        slotNumber: event.slotNumber,
        slotImageUrl: event.slotImageUrl
      }));
      
      setEvents(formattedEvents);
      setError('');
    } catch (error) {
      console.error("Error fetching events:", error);
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleClose = () => {
    setSelectedEvent(null);
  };

  const handleInviteSubmitted = () => {
    fetchEvents();
    setShowInviteForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // Add custom toolbar with navigation
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.date.setMonth(toolbar.date.getMonth() - 1);
      toolbar.onNavigate('prev');
    };

    const goToNext = () => {
      toolbar.date.setMonth(toolbar.date.getMonth() + 1);
      toolbar.onNavigate('next');
    };

    const goToCurrent = () => {
      const now = new Date();
      toolbar.date.setMonth(now.getMonth());
      toolbar.date.setYear(now.getFullYear());
      toolbar.onNavigate('current');
    };

    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        px: 1,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={goToBack}
            startIcon={<NavigateBeforeIcon />}
            size="small"
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={goToNext}
            endIcon={<NavigateNextIcon />}
            size="small"
          >
            Next
          </Button>
          <Button
            variant="outlined"
            onClick={goToCurrent}
            size="small"
          >
            Today
          </Button>
        </Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {toolbar.label}
        </Typography>
        <Box>
          {toolbar.views.map((view) => (
            <Button
              key={view}
              variant={toolbar.view === view ? "contained" : "outlined"}
              onClick={() => toolbar.onView(view)}
              size="small"
              sx={{ mx: 0.5 }}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </Box>
      </Box>
    );
  };

  // Custom styles for the calendar
  const calendarStyles = {
    '.rbc-calendar': {
      backgroundColor: theme.palette.background.paper,
      borderRadius: '8px',
      padding: '8px',
    },
    '.rbc-header': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      padding: '10px 3px',
      fontWeight: 'bold',
      border: 'none',
    },
    '.rbc-today': {
      backgroundColor: theme.palette.primary.light + '20',
    },
    '.rbc-off-range-bg': {
      backgroundColor: theme.palette.grey[100],
    },
    '.rbc-date-cell': {
      color: theme.palette.text.primary,
      padding: '4px',
    },
    '.rbc-event': {
      backgroundColor: theme.palette.primary.main,
      borderRadius: '4px',
      padding: '2px 5px',
      color: theme.palette.primary.contrastText,
    },
    '.rbc-toolbar': {
      marginBottom: '20px',
    },
    '.rbc-toolbar button': {
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      '&:hover': {
        backgroundColor: theme.palette.primary.light + '20',
      },
      '&.rbc-active': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
    },
    '.rbc-toolbar-label': {
      color: theme.palette.text.primary,
      fontWeight: 'bold',
    },
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        height: "85vh", 
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        ...calendarStyles
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            style={{ height: "calc(100% - 60px)" }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            popup
            selectable
            components={{
              toolbar: CustomToolbar
            }}
          />
          
          {/* Bottom Centered Invite Us Button */}
          <Box
            sx={{
              position: 'absolute',
               bottom: '5', // Position from bottom
              left: '50%',
              transform: 'translateX(-50%)',
              
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              pointerEvents: 'none',
              width: '100%',
              padding: '0 20px',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowInviteForm(true)}
              startIcon={<AddCircleIcon />}
              sx={{
                padding: '16px 32px',
                borderRadius: '32px',
                boxShadow: theme.shadows[8],
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textTransform: 'none',
                pointerEvents: 'auto',
                '&:hover': {
                  boxShadow: theme.shadows[12],
                  transform: 'translateY(-2px) scale(1.05)',
                  transition: 'all 0.3s ease-in-out',
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.8rem',
                },
                minWidth: '200px',
                backdropFilter: 'blur(4px)',
                border: `2px solid ${theme.palette.primary.light}`,
              }}
            >
              Invite Us
            </Button>
           
          </Box>
        </Box>
      )}

      <Dialog 
        open={!!selectedEvent} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6">{selectedEvent?.title}</Typography>
              {selectedEvent?.status && (
                <Chip
                  label={selectedEvent.status}
                  color={getStatusColor(selectedEvent.status)}
                  size="small"
                />
              )}
              {selectedEvent?.game && (
                <Chip
                  label={selectedEvent.game}
                  color={selectedEvent.game === 'ETS2' ? 'primary' : 'secondary'}
                  size="small"
                />
              )}
            </Stack>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {selectedEvent?.vtcName && (
              <Typography>
                <strong>VTC:</strong> {selectedEvent.vtcName}
              </Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography>
                {selectedEvent?.start.toLocaleString()} - {selectedEvent?.end.toLocaleString()}
              </Typography>
            </Stack>
            {selectedEvent?.eventLink && (
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon fontSize="small" color="action" />
                <Typography
                  component="a"
                  href={selectedEvent.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                >
                  Event Link
                </Typography>
              </Stack>
            )}
            {selectedEvent?.approvedByUsername && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" color="action" />
                <Typography>
                  Approved by: {selectedEvent.approvedByUsername}
                </Typography>
              </Stack>
            )}
            {selectedEvent?.slotNumber && (
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon fontSize="small" color="action" />
                <Typography>
                  Slot Number: {selectedEvent.slotNumber}
                </Typography>
              </Stack>
            )}
            {selectedEvent?.description && (
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">Description:</Typography>
                </Stack>
                <img src={selectedEvent.description} style={{width:"100%"}}/>
              </Box>
            )}
            
          </Stack>
        </DialogContent>
      </Dialog>

      <InviteForm 
        open={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        onInviteSubmitted={handleInviteSubmitted}
      />
    </Paper>
  );
};

export default Calendercomponent;
