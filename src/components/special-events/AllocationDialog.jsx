import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import SlotCapacityChip from './SlotCapacityChip';

export default function AllocationDialog({
  open,
  onClose,
  request,
  routes,
  routeSlots,
  onApprove,
  onReject,
}) {
  const [tab, setTab] = useState(0);
  const [routeName, setRouteName] = useState('');
  const [slotId, setSlotId] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && request) {
      setTab(0);
      setRouteName(routes[0]?.name || '');
      setSlotId('');
      setAdminComment('');
      setRejectReason('');
      setError('');
    }
  }, [open, request, routes]);

  const availableSlots = (routeSlots?.[routeName] || []).filter(
    (s) => (s.allocatedVtcs || 0) < (s.maxVtc || 1)
  );

  useEffect(() => {
    if (routeName && availableSlots.length > 0 && !availableSlots.find((s) => s._id === slotId)) {
      setSlotId(availableSlots[0]._id);
    } else if (!availableSlots.find((s) => s._id === slotId)) {
      setSlotId('');
    }
  }, [routeName, routeSlots]);

  const handleApprove = async () => {
    if (!slotId) {
      setError('Select a slot with available capacity');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onApprove(request._id, { slotId, admincomment: adminComment });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onReject(request._id, { reason: rejectReason.trim(), admincomment: adminComment });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Allocate request — {request.vtcName}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {request.playercount} players · Discord: {request.discordUsername}
          {request.vtcLink && (
            <>
              {' '}
              ·{' '}
              <a href={request.vtcLink} target="_blank" rel="noreferrer">
                VTC link
              </a>
            </>
          )}
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Approve" />
          <Tab label="Reject" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Route</InputLabel>
              <Select
                value={routeName}
                label="Route"
                onChange={(e) => setRouteName(e.target.value)}
              >
                {routes.map((r) => (
                  <MenuItem key={r.name} value={r.name}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!routeName}>
              <InputLabel>Slot</InputLabel>
              <Select value={slotId} label="Slot" onChange={(e) => setSlotId(e.target.value)}>
                {availableSlots.length === 0 ? (
                  <MenuItem disabled value="">
                    No slots with capacity on this route
                  </MenuItem>
                ) : (
                  availableSlots.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {s.slotName}
                        <SlotCapacityChip allocated={s.allocatedVtcs} max={s.maxVtc} />
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              label="Admin comment (optional)"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
            />
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <TextField
              label="Rejection reason *"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              required
            />
            <TextField
              label="Admin comment (optional)"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {tab === 0 ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={loading || !slotId}
          >
            {loading ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={loading || !rejectReason.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
