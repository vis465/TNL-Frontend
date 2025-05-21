import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../utils/axios';

// List of available DLCs
const AVAILABLE_DLCS = [
  'Going East!',
  'Scandinavia',
  'Vive la France!',
  'Italia',
  'Beyond the Baltic Sea',
  'Road to the Black Sea',
  'Iberia',
  'Heart of Russia',
  'West Balkans',
  'Promods',
  'Oregon',
  'Washington',
  'Utah',
  'Idaho',
  'Colorado',
  'Wyoming',
  'Montana',
  'Texas',
  'Oklahoma',
  'Kansas',
  'Nebraska',
  'Missouri',
  'Arkansas',
  'Louisiana',
  'Mississippi',
  'Alabama',
  'Georgia',
  'Florida',
  'South Carolina',
  'North Carolina',
  'Tennessee',
  'Kentucky',
  'Indiana',
  'Ohio',
  'Michigan',
  'Wisconsin',
  'Minnesota',
  'Iowa',
  'Illinois',
  'Missouri',
  'Arkansas',
  'Louisiana',
];

const InviteForm = ({ open, onClose, onInviteSubmitted }) => {
  const [formData, setFormData] = useState({
    eventTitle: '',
    invite_text: '',
    vtcName: '',
    eventLink: '',
    game: '',
    dlcs: [],
    Meetuptime: new Date(),
    departureTime: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    setError('');

    try {
      // Ensure all required fields are included in the request
      const submitData = {
        eventTitle: formData.eventTitle.trim(),
        invite_text: formData.invite_text.trim(),
        vtcName: formData.vtcName.trim(),
        eventLink: formData.eventLink.trim(),
        game: formData.game,
        dlcs: formData.dlcs,
        Meetuptime: formData.Meetuptime.toISOString(),
        departureTime: formData.departureTime.toISOString(),
      };

      console.log('Submitting invite with data:', submitData); // Debug log

      const response = await axiosInstance.post('/invites/submit', submitData);

      if (onInviteSubmitted) {
        onInviteSubmitted();
      }
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        // Reset form with all fields
        setFormData({
          eventTitle: '',
          invite_text: '',
          vtcName: '',
          eventLink: '',
          game: '',
          dlcs: [],
          Meetuptime: new Date(),
          departureTime: new Date(),
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting invite:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to submit invitation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.eventTitle.trim()) {
      errors.push('Event title is required');
    }
    if (!formData.invite_text.trim()) {
      errors.push('Invite text is required');
    }
    if (!formData.vtcName.trim()) {
      errors.push('VTC name is required');
    }
    if (!formData.eventLink.trim()) {
      errors.push('Event link is required');
    }
    if (!formData.game) {
      errors.push('Game selection is required');
    }
    if (!formData.Meetuptime || !formData.departureTime) {
      errors.push('Both meetup and departure times are required');
    }
    if (formData.Meetuptime >= formData.departureTime) {
      errors.push('Departure time must be after meetup time');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Submit VTC Invitation</Typography>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {showSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Invitation submitted successfully! Please wait for admin approval.
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Event Title"
              required
              value={formData.eventTitle}
              onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              disabled={loading}
              error={!formData.eventTitle.trim() && error.includes('Event title')}
            />

            <TextField
              fullWidth
              label="VTC Name"
              required
              value={formData.vtcName}
              onChange={(e) => setFormData({ ...formData, vtcName: e.target.value })}
              disabled={loading}
              error={!formData.vtcName.trim() && error.includes('VTC name')}
            />

            <TextField
              fullWidth
              label="Event Link"
              required
              value={formData.eventLink}
              onChange={(e) => setFormData({ ...formData, eventLink: e.target.value })}
              disabled={loading}
              error={!formData.eventLink.trim() && error.includes('Event link')}
              helperText="Link to the event on TruckersMP or other platform"
            />

            <FormControl fullWidth required error={!formData.game && error.includes('Game')}>
              <InputLabel>Game</InputLabel>
              <Select
                value={formData.game}
                label="Game"
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                disabled={loading}
              >
                <MenuItem value="ETS2">Euro Truck Simulator 2</MenuItem>
                <MenuItem value="ATS">American Truck Simulator</MenuItem>
              </Select>
              {!formData.game && error.includes('Game') && (
                <Typography color="error" variant="caption">
                  Game selection is required
                </Typography>
              )}
            </FormControl>

            <Autocomplete
              multiple
              options={AVAILABLE_DLCS}
              value={formData.dlcs}
              onChange={(event, newValue) => {
                setFormData({ ...formData, dlcs: newValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Required DLCs"
                  placeholder="Select DLCs"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    disabled={loading}
                  />
                ))
              }
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Invitation Text"
              required
              multiline
              rows={4}
              value={formData.invite_text}
              onChange={(e) => setFormData({ ...formData, invite_text: e.target.value })}
              disabled={loading}
              error={!formData.invite_text.trim() && error.includes('Invite text')}
              helperText="Describe your event and any specific requirements"
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Meetup Time"
                value={formData.Meetuptime}
                onChange={(newValue) => setFormData({ ...formData, Meetuptime: newValue })}
                disabled={loading}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    required 
                    error={(!formData.Meetuptime || formData.Meetuptime >= formData.departureTime) && 
                           error.includes('meetup')}
                  />
                )}
              />

              <DateTimePicker
                label="Departure Time"
                value={formData.departureTime}
                onChange={(newValue) => setFormData({ ...formData, departureTime: newValue })}
                disabled={loading}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    required 
                    error={(!formData.departureTime || formData.Meetuptime >= formData.departureTime) && 
                           error.includes('departure')}
                  />
                )}
              />
            </LocalizationProvider>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose()} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteForm; 