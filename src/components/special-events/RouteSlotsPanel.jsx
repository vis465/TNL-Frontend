import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SlotCapacityChip from './SlotCapacityChip';

const emptyRow = () => ({
  slotName: '',
  imageUrl: '',
  maxVtc: 1,
});

export default function RouteSlotsPanel({
  routes,
  routeSlots,
  onUpsertSlots,
  onDeleteSlot,
  disabled,
}) {
  const [localSlots, setLocalSlots] = useState({});
  const [newRows, setNewRows] = useState({});
  const [savingRoute, setSavingRoute] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const next = {};
    routes.forEach((route) => {
      next[route.name] = (routeSlots?.[route.name] || []).map((s) => ({ ...s }));
    });
    setLocalSlots(next);
  }, [routes, routeSlots]);

  const updateSlotField = (routeName, index, field, value) => {
    setLocalSlots((prev) => {
      const list = [...(prev[routeName] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [routeName]: list };
    });
  };

  const addNewRow = (routeName) => {
    setNewRows((prev) => ({
      ...prev,
      [routeName]: [...(prev[routeName] || []), emptyRow()],
    }));
  };

  const updateNewRow = (routeName, index, field, value) => {
    setNewRows((prev) => {
      const list = [...(prev[routeName] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [routeName]: list };
    });
  };

  const removeNewRow = (routeName, index) => {
    setNewRows((prev) => ({
      ...prev,
      [routeName]: (prev[routeName] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveRoute = async (routeName) => {
    const existing = (localSlots[routeName] || []).map((s) => ({
      _id: s._id,
      slotNumber: s.slotNumber,
      slotName: s.slotName,
      imageUrl: s.imageUrl || '',
      maxVtc: Number(s.maxVtc) || 1,
    }));
    const added = (newRows[routeName] || [])
      .filter((r) => r.slotName.trim())
      .map((r) => ({
        slotName: r.slotName.trim(),
        imageUrl: r.imageUrl || '',
        maxVtc: Number(r.maxVtc) || 1,
      }));

    if (existing.length === 0 && added.length === 0) {
      setError('Add at least one slot before saving');
      return;
    }

    setSavingRoute(routeName);
    setError('');
    try {
      await onUpsertSlots(routeName, [...existing, ...added]);
      setNewRows((prev) => ({ ...prev, [routeName]: [] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save slots');
    } finally {
      setSavingRoute(null);
    }
  };

  const handleDeleteSlot = async () => {
    if (!deleteTarget) return;
    setSavingRoute(deleteTarget.routeName);
    setError('');
    try {
      await onDeleteSlot(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete slot');
    } finally {
      setSavingRoute(null);
    }
  };

  if (disabled) {
    return (
      <Alert severity="info">Add and save at least one route before configuring slots.</Alert>
    );
  }

  if (routes.length === 0) {
    return (
      <Alert severity="warning">Add at least one route before configuring slots.</Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {routes.map((route) => {
        const slots = localSlots[route.name] || [];
        const pending = newRows[route.name] || [];
        const totalCapacity = slots.reduce((sum, s) => sum + (Number(s.maxVtc) || 0), 0);
        const totalUsed = slots.reduce((sum, s) => sum + (s.allocatedVtcs || 0), 0);

        return (
          <Accordion key={route.name} defaultExpanded={routes.length === 1}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  width: 8,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: route.color || '#1976d2',
                  mr: 2,
                }}
              />
              <Typography sx={{ flex: 1, fontWeight: 600 }}>
                {route.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {slots.length} slot{slots.length !== 1 ? 's' : ''} · {totalUsed}/{totalCapacity} capacity
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {slots.map((slot, idx) => (
                  <Box
                    key={slot._id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '80px 1fr 1fr 100px auto auto' },
                      gap: 1,
                      alignItems: 'center',
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    {slot.imageUrl ? (
                      <Box
                        component="img"
                        src={slot.imageUrl}
                        alt={slot.slotName}
                        sx={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 72,
                          height: 48,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: 'text.secondary',
                        }}
                      >
                        No image
                      </Box>
                    )}
                    <TextField
                      label="Slot name"
                      size="small"
                      value={slot.slotName}
                      onChange={(e) => updateSlotField(route.name, idx, 'slotName', e.target.value)}
                    />
                    <TextField
                      label="Image URL"
                      size="small"
                      value={slot.imageUrl || ''}
                      onChange={(e) => updateSlotField(route.name, idx, 'imageUrl', e.target.value)}
                    />
                    <TextField
                      label="Max bookings"
                      size="small"
                      type="number"
                      inputProps={{ min: slot.allocatedVtcs || 0 }}
                      value={slot.maxVtc}
                      onChange={(e) => updateSlotField(route.name, idx, 'maxVtc', e.target.value)}
                    />
                    <SlotCapacityChip allocated={slot.allocatedVtcs} max={slot.maxVtc} />
                    <IconButton
                      color="error"
                      disabled={(slot.allocatedVtcs || 0) > 0}
                      title={
                        (slot.allocatedVtcs || 0) > 0
                          ? 'Cannot delete slot with allocations'
                          : 'Delete slot'
                      }
                      onClick={() => setDeleteTarget({ ...slot, routeName: route.name })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                {pending.map((row, idx) => (
                  <Box
                    key={`new-${idx}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 100px auto' },
                      gap: 1,
                      alignItems: 'center',
                      p: 1,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <TextField
                      label="Slot name *"
                      size="small"
                      value={row.slotName}
                      onChange={(e) => updateNewRow(route.name, idx, 'slotName', e.target.value)}
                    />
                    <TextField
                      label="Image URL"
                      size="small"
                      value={row.imageUrl}
                      onChange={(e) => updateNewRow(route.name, idx, 'imageUrl', e.target.value)}
                    />
                    <TextField
                      label="Max bookings"
                      size="small"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={row.maxVtc}
                      onChange={(e) => updateNewRow(route.name, idx, 'maxVtc', e.target.value)}
                    />
                    <IconButton onClick={() => removeNewRow(route.name, idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => addNewRow(route.name)}>
                    Add slot row
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      savingRoute === route.name ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={() => handleSaveRoute(route.name)}
                    disabled={savingRoute === route.name}
                  >
                    Save all slots for this route
                  </Button>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete slot?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete slot &quot;{deleteTarget?.slotName}&quot;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteSlot} disabled={Boolean(savingRoute)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
