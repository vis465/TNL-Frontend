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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '../utils/axios';

const ManageSlotsDialog = ({ open, onClose, event, slots: existingSlots, onSlotsUpdated }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize slots when dialog opens or existingSlots change
  useEffect(() => {
    if (open && existingSlots) {
      const formattedSlots = existingSlots.map(slot => ({
        imageUrl: slot.imageUrl,
        slotNumbers: slot.slots.map(s => s.number),
        numberOfSlots: slot.slots.length
      }));
      setSlots(formattedSlots);
      
      // Calculate next starting slot number for new slots
      const maxSlotNumber = existingSlots.reduce((max, slot) => {
        const slotNumbers = slot.slots.map(s => s.number);
        return Math.max(max, ...slotNumbers);
      }, 0);
      
      setNewSlot({
        imageUrl: '',
        startingSlotNumber: maxSlotNumber + 1,
        numberOfSlots: 1
      });
    }
  }, [open, existingSlots]);

  const [newSlot, setNewSlot] = useState({
    imageUrl: '',
    startingSlotNumber: 1,
    numberOfSlots: 1
  });

  const handleAddSlot = () => {
    if (!newSlot.imageUrl.includes('imgur.com')) {
      setError('Please provide a valid Imgur URL');
      return;
    }

    const numberOfSlots = parseInt(newSlot.numberOfSlots);
    const startingSlotNumber = parseInt(newSlot.startingSlotNumber);

    if (isNaN(numberOfSlots) || numberOfSlots < 1) {
      setError('Please provide a valid number of slots');
      return;
    }

    if (isNaN(startingSlotNumber)) {
      setError('Please provide a valid starting slot number');
      return;
    }

    // Generate array of sequential slot numbers
    const slotNumbers = Array.from(
      { length: numberOfSlots },
      (_, i) => startingSlotNumber + i
    );

    // Check for duplicates with existing slots
    const existingSlotNumbers = slots.reduce((acc, slot) => {
      return [...acc, ...(slot.slotNumbers || [])];
    }, []);

    const duplicates = slotNumbers.filter(num => existingSlotNumbers.includes(num));
    if (duplicates.length > 0) {
      setError(`Duplicate slot numbers found: ${duplicates.join(', ')}`);
      return;
    }

    setSlots([...slots, {
      imageUrl: newSlot.imageUrl,
      slotNumbers,
      numberOfSlots
    }]);

    // Reset form and update next starting slot number
    setNewSlot({
      imageUrl: '',
      startingSlotNumber: startingSlotNumber + numberOfSlots,
      numberOfSlots: 1
    });
    setError('');
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Transform the slots data to match the backend expectation
      const slotsData = slots.map(slot => ({
        imageUrl: slot.imageUrl,
        slots: slot.slotNumbers.map(number => ({
          number,
          isAvailable: true
        }))
      }));

      console.log('Submitting slots:', slotsData);

      const response = await axiosInstance.post(`/slots/event/${event.truckersmpId}`, {
        slots: slotsData
      });

      console.log('Slots created:', response.data);
      onSlotsUpdated();
      onClose();
    } catch (error) {
      console.error('Error creating slots:', error);
      setError(error.response?.data?.message || 'Error creating slots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Manage Slots for {event?.title}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {slots.length} slot images, {slots.reduce((sum, slot) => sum + (slot.slotNumbers?.length || 0), 0)} total slots
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Add New Slot Image</Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL (Imgur)"
                value={newSlot.imageUrl}
                onChange={(e) => setNewSlot({ ...newSlot, imageUrl: e.target.value })}
                placeholder="https://imgur.com/..."
                helperText="Only Imgur URLs are accepted"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Starting Slot Number"
                value={newSlot.startingSlotNumber}
                onChange={(e) => setNewSlot({ ...newSlot, startingSlotNumber: e.target.value })}
                helperText="First slot number in sequence"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Number of Slots"
                value={newSlot.numberOfSlots}
                onChange={(e) => setNewSlot({ ...newSlot, numberOfSlots: e.target.value })}
                inputProps={{ min: 1 }}
                helperText="How many sequential slots to create"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSlot}
                fullWidth
              >
                Add Slot Image
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Current Slots</Typography>
        {slots.length === 0 ? (
          <Alert severity="info">No slots added yet. Add your first slot above.</Alert>
        ) : (
          slots.map((slot, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <img
                    src={slot.imageUrl}
                    alt={`Slot ${index + 1}`}
                    style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Slot Numbers: {slot.slotNumbers.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Slots: {slot.numberOfSlots}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={() => handleRemoveSlot(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || slots.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Slots'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageSlotsDialog; 