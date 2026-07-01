import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import { fetchTruckersMPEvent } from '../../hooks/useSpecialEvent';

export default function EventDetailsForm({
  form,
  onChange,
  onSave,
  saving,
  isNew,
  saved,
  error,
  success,
}) {
  const [fetching, setFetching] = useState(false);
  const [importError, setImportError] = useState('');

  const handleImport = async () => {
    if (!form.truckersmpId?.trim()) return;
    setFetching(true);
    setImportError('');
    try {
      const imported = await fetchTruckersMPEvent(form.truckersmpId.trim());
      onChange({ ...form, ...imported });
    } catch {
      setImportError('Failed to fetch event from TruckersMP. Check the ID and try again.');
    } finally {
      setFetching(false);
    }
  };

  const set = (field) => (e) => onChange({ ...form, [field]: e.target.value });

  const canSave =
    form.truckersmpId?.trim() &&
    form.title?.trim() &&
    form.description?.trim() &&
    form.startDate &&
    form.server?.trim() &&
    form.meetingPoint?.trim() &&
    form.departurePoint?.trim() &&
    form.arrivalPoint?.trim();

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {importError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {importError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="TruckersMP Event ID *"
              value={form.truckersmpId}
              onChange={set('truckersmpId')}
              fullWidth
              required
              
              helperText={!isNew && saved ? 'Event ID cannot be changed after save' : 'Import TMP data first, then save'}
            />
            <Button
              variant="outlined"
              onClick={handleImport}
              disabled={!form.truckersmpId?.trim() || fetching}
              sx={{ minWidth: 48, px: 1 }}
            >
              {fetching ? <CircularProgress size={22} /> : <SearchIcon />}
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Title *" value={form.title} onChange={set('title')} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description *"
            value={form.description}
            onChange={set('description')}
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
            value={form.startDate}
            onChange={set('startDate')}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            value={form.endtime || ''}
            onChange={set('endtime')}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Server *" value={form.server} onChange={set('server')} fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Banner URL" value={form.banner || ''} onChange={set('banner')} fullWidth />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Meeting Point *" value={form.meetingPoint} onChange={set('meetingPoint')} fullWidth required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Departure Point *" value={form.departurePoint} onChange={set('departurePoint')} fullWidth required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField label="Arrival Point *" value={form.arrivalPoint} onChange={set('arrivalPoint')} fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Voice Link" value={form.voiceLink || ''} onChange={set('voiceLink')} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="External Link" value={form.externalLink || ''} onChange={set('externalLink')} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Rules" value={form.rule || ''} onChange={set('rule')} fullWidth multiline rows={2} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={onSave}
          disabled={!canSave || saving}
        >
          {isNew ? 'Create event' : 'Save details'}
        </Button>
      </Box>
    </Box>
  );
}
