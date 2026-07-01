import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CampaignIcon from '@mui/icons-material/Campaign';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { format } from 'date-fns';
import MagicPageShell from '../../components/magicui/MagicPageShell';
import ConvoyReminderDialog from '../../components/convoy-reminders/ConvoyReminderDialog';
import axiosInstance from '../../utils/axios';

const RANGES = [
  { value: 'today', label: 'Today (IST)' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'all', label: 'All' },
];

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, 'dd MMM yyyy HH:mm');
}

export default function AdminConvoyReminders() {
  const [range, setRange] = useState('today');
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/calendar/reminder-events', {
        params: { range },
      });
      setEvents(Array.isArray(data.events) ? data.events : []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load convoy events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const previewReminder = useCallback(
    (body) =>
      axiosInstance
        .post(`/calendar/reminder-events/${selectedEvent.source}/${selectedEvent.id}/discord-reminder`, {
          ...body,
          dryRun: true,
        })
        .then((res) => res.data),
    [selectedEvent]
  );

  const sendReminder = useCallback(
    (body) =>
      axiosInstance
        .post(`/calendar/reminder-events/${selectedEvent.source}/${selectedEvent.id}/discord-reminder`, body)
        .then((res) => res.data),
    [selectedEvent]
  );

  const openReminder = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  return (
    <MagicPageShell
      title="Convoy reminders"
      subtitle="External convoy attendance and our hosted events — same data as the event calendar"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Send Discord reminder embeds to <code>DISCORD_WEBHOOK_FOR_REMAINDERS</code>. External convoy entries
          come from{' '}
          <Link component={RouterLink} to="/admin/external-attendance">
            External attendance
          </Link>
          ; our events are synced hosted TMP events shown on the calendar.
        </Typography>
        <IconButton onClick={loadEvents} disabled={loading} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Tabs value={range} onChange={(_, v) => setRange(v)} sx={{ mb: 2 }}>
        {RANGES.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Alert severity="info">
          No events in this view. Add external convoy attendance or sync our TMP events, then try another tab.
        </Alert>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Showing {events.length} of {total} total events
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Host VTC</TableCell>
                  <TableCell>Meetup</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Server</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={`${event.source}-${event.id}`} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        label={event.sourceLabel}
                        color={event.source === 'external' ? 'info' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {event.title}
                      </Typography>
                      {event.truckersmpEventId && (
                        <Typography variant="caption" color="text.secondary">
                          TMP {event.truckersmpEventId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{event.hostVtcName || '—'}</TableCell>
                    <TableCell>{formatDateTime(event.meetupAt)}</TableCell>
                    <TableCell>{formatDateTime(event.departureAt)}</TableCell>
                    <TableCell>{event.server || '—'}</TableCell>
                    <TableCell>{event.slotLabel || '—'}</TableCell>
                    <TableCell align="right">
                      {event.eventUrl && (
                        <IconButton
                          component="a"
                          href={event.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          title="Open TMP event"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CampaignIcon />}
                        onClick={() => openReminder(event)}
                        sx={{ ml: 0.5 }}
                      >
                        Remind
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <ConvoyReminderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        event={selectedEvent}
        onPreview={previewReminder}
        onSend={sendReminder}
      />
    </MagicPageShell>
  );
}
