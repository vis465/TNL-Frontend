import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import MagicPageShell from '../../components/magicui/MagicPageShell';
import { useSpecialEventsList } from '../../hooks/useSpecialEvent';

export default function SpecialEventsListPage() {
  const navigate = useNavigate();
  const { events, loading, error, fetchEvents, deleteEvent, setError } = useSpecialEventsList();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.truckersmpId);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MagicPageShell title="Special events" subtitle="Route-based slot requests and admin allocation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
          Manage special events with per-route slots. VTCs submit requests; you allocate them to any route and slot with capacity.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <IconButton onClick={fetchEvents} disabled={loading} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/admin/special-events/new"
          >
            Create special event
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Alert severity="info">
          No special events yet.{' '}
          <Button size="small" onClick={() => navigate('/admin/special-events/new')}>
            Create one
          </Button>
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>TMP ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Routes</TableCell>
                <TableCell align="center">Slots</TableCell>
                <TableCell align="center">Pending</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.truckersmpId} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{event.title}</Typography>
                  </TableCell>
                  <TableCell>{event.truckersmpId}</TableCell>
                  <TableCell>
                    {event.startDate
                      ? format(new Date(event.startDate), 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell align="center">{event.routeCount ?? event.routes?.length ?? 0}</TableCell>
                  <TableCell align="center">{event.slotCount ?? 0}</TableCell>
                  <TableCell align="center">
                    {(event.pendingRequestCount ?? 0) > 0 ? (
                      <Chip label={event.pendingRequestCount} color="error" size="small" />
                    ) : (
                      <Chip label="0" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={RouterLink}
                      to={`/admin/special-events/${event.truckersmpId}`}
                      title="Open workspace"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteTarget(event)}
                      title="Delete event"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete special event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete &quot;{deleteTarget?.title}&quot; and all its slots and requests? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </MagicPageShell>
  );
}
