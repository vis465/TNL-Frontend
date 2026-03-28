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
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,

} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
      case 'external':
        backgroundColor = theme.palette.info.main;
        borderColor = theme.palette.info.dark;
        break;
      case 'upcoming':
        backgroundColor = theme.palette.success.main;
        borderColor = theme.palette.success.dark;
        break;
      case 'ongoing':
        backgroundColor = theme.palette.warning.main;
        borderColor = theme.palette.warning.dark;
        break;
      case 'completed':
        backgroundColor = theme.palette.grey[600];
        borderColor = theme.palette.grey[800];
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
      const response = await axiosInstance.get('/calendar/feed');
      const data = Array.isArray(response.data) ? response.data : [];

      const formattedEvents = data.map((event) => ({
        id: event._id,
        title: event.eventTitle || event.title,
        start: new Date(event.Meetuptime || event.start),
        end: new Date(event.departureTime || event.end),
        description: event.invite_text || event.banner || '',
        descriptionText: typeof event.description === 'string' ? event.description : '',
        status: event.status || 'upcoming',
        source: event.source,
        game: event.game,
        vtcName: event.vtcName,
        eventLink: event.eventLink,
        approvedByUsername: event.approvedByUsername,
        slotNumber: event.slotNumber,
        slotName: event.slotName,
        slotImageUrl: event.slotImageUrl,
        banner: event.banner,
        dlcs: Array.isArray(event.dlcs) ? event.dlcs : [],
        truckersmpEventId: event.truckersmpEventId,
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

  const isLikelyImageUrl = (url) =>
    typeof url === 'string' && /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(url.trim());

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
            <Typography variant="h6" component="span" sx={{ pr: 1 }}>
              {selectedEvent?.title}
            </Typography>
            <IconButton onClick={handleClose} size="small" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {(() => {
              const nameStr =
                selectedEvent?.slotName != null ? String(selectedEvent.slotName).trim() : '';
              const num = selectedEvent?.slotNumber;
              const hasNum = num != null && num !== '';
              if (!nameStr && !hasNum) return null;
              const label =
                nameStr && hasNum ? `${nameStr} (#${num})` : nameStr || (hasNum ? `Slot ${num}` : '');
              return (
                <Typography variant="subtitle1" fontWeight={600}>
                  {label}
                </Typography>
              );
            })()}
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <AccessTimeIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Meetup
                  </Typography>
                  <Typography variant="body2">{selectedEvent?.start?.toLocaleString()}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <AccessTimeIcon fontSize="small" color="action" sx={{ mt: 0.25, visibility: 'hidden' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Departure
                  </Typography>
                  <Typography variant="body2">{selectedEvent?.end?.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Times are shown in your local timezone.
            </Typography>
            {(() => {
              const imgSrc =
                selectedEvent?.slotImageUrl ||
                selectedEvent?.banner ||
                (isLikelyImageUrl(selectedEvent?.description) ? selectedEvent.description : null);
              if (!imgSrc) return null;
              return isLikelyImageUrl(imgSrc) ? (
                <Box
                  component="img"
                  src={imgSrc}
                  alt={selectedEvent?.slotName || selectedEvent?.title || 'Slot'}
                  sx={{ width: '100%', borderRadius: 1, maxHeight: 320, objectFit: 'contain' }}
                />
              ) : (
                <Typography
                  component="a"
                  href={imgSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: theme.palette.primary.main }}
                >
                  Open slot image
                </Typography>
              );
            })()}
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
