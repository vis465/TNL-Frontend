import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Autocomplete,
  Chip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import axiosInstance from '../utils/axios';
import { AVAILABLE_DLCS } from '../constants/dlcs';

function isoToDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function datetimeLocalToIso(local) {
  if (local == null || String(local).trim() === '') return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function formatLocal(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function notesSnippet(text, max = 48) {
  if (!text || !String(text).trim()) return '—';
  const s = String(text).trim();
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

const TMP_CACHE_PREFIX = 'tmpEventPrefill:';

function loadTmpCache(id) {
  try {
    const raw = sessionStorage.getItem(TMP_CACHE_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveTmpCache(id, data) {
  try {
    sessionStorage.setItem(TMP_CACHE_PREFIX + id, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export default function AdminExternalAttendance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [tmpIdInput, setTmpIdInput] = useState('');
  const [fetchingTmp, setFetchingTmp] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [form, setForm] = useState({
    truckersmpEventId: '',
    slotNumber: '',
    slotImageUrl: '',
    slotName: '',
    slotUrl: '',
    title: '',
    hostVtcName: '',
    server: '',
    game: 'ETS2',
    eventUrl: '',
    meetupLocal: '',
    departureLocal: '',
    notes: '',
    dlcs: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadList = useCallback(async () => {
    try {
      setListError('');
      const { data } = await axiosInstance.get('/calendar/external-events');
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(e.response?.data?.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleFetchTmp = async () => {
    const id = tmpIdInput.trim();
    if (!id) return;
    setFetchingTmp(true);
    setFetchError('');
    const cached = loadTmpCache(id);
    if (cached) {
      applyTmpToForm(id, cached);
      setFetchingTmp(false);
      return;
    }
    try {
      const { data } = await axiosInstance.get(`/calendar/tmp-event/${encodeURIComponent(id)}`);
      saveTmpCache(id, data);
      applyTmpToForm(id, data);
    } catch (e) {
      setFetchError(e.response?.data?.message || 'Could not load TruckersMP event');
    } finally {
      setFetchingTmp(false);
    }
  };

  const applyTmpToForm = (id, data) => {
    setForm((prev) => {
      const num = prev.slotNumber === '' || prev.slotNumber === undefined ? NaN : Number(prev.slotNumber);
      const slotNameDefault = Number.isFinite(num) ? `Slot ${num}` : '';
      const meetIso =
        data.tmpMeetupAt ||
        (data.startDate ? new Date(data.startDate).toISOString() : '') ||
        (data.starttime ? new Date(data.starttime).toISOString() : '');
      const depIso =
        data.tmpDepartureAt || (data.endtime ? new Date(data.endtime).toISOString() : '') || '';
      return {
        ...prev,
        truckersmpEventId: data.truckersmpId || id,
        title: data.title || '',
        hostVtcName: data.hostVtcName || '',
        server: data.server || '',
        game: data.game === 'ATS' ? 'ATS' : 'ETS2',
        eventUrl: data.url || '',
        meetupLocal: isoToDatetimeLocal(meetIso),
        departureLocal: isoToDatetimeLocal(depIso),
        dlcs: Array.isArray(data.dlcs) ? data.dlcs : [],
        slotUrl: data.url || prev.slotUrl,
        slotName: slotNameDefault || prev.slotName || '',
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg({ type: '', text: '' });
    const slotNumber = Number(form.slotNumber);
    if (!form.truckersmpEventId.trim() || !form.slotImageUrl.trim() || !Number.isFinite(slotNumber) || slotNumber < 0) {
      setSubmitMsg({ type: 'error', text: 'TMP event ID, non-negative slot number, and slot image URL are required.' });
      return;
    }
    setSubmitting(true);
    try {
      const meetupAt = datetimeLocalToIso(form.meetupLocal);
      const departureAt = datetimeLocalToIso(form.departureLocal);
      await axiosInstance.post('/calendar/external-events', {
        truckersmpEventId: form.truckersmpEventId.trim(),
        slotNumber,
        slotImageUrl: form.slotImageUrl.trim(),
        slotName: form.slotName.trim() || undefined,
        slotUrl: form.slotUrl.trim() || undefined,
        game: form.game,
        dlcs: Array.isArray(form.dlcs) ? form.dlcs : [],
        notes: form.notes.trim() || undefined,
        meetupAt: meetupAt || undefined,
        departureAt: departureAt || undefined,
      });
      setSubmitMsg({ type: 'success', text: 'Entry created and linked to attendance event.' });
      setForm((f) => ({
        ...f,
        slotNumber: '',
        slotImageUrl: '',
        slotName: '',
        notes: '',
      }));
      loadList();
    } catch (err) {
      setSubmitMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create entry',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (row) => {
    setEditing(row);
    setEditForm({
      slotNumber: row.slotNumber,
      slotImageUrl: row.slotImageUrl,
      slotName: row.slotName,
      slotUrl: row.slotUrl,
      title: row.title,
      hostVtcName: row.hostVtcName,
      server: row.server,
      meetupLocal: isoToDatetimeLocal(row.meetupAt || row.startUtc),
      departureLocal: isoToDatetimeLocal(row.departureAt || row.endUtc),
      notes: row.notes || '',
      eventUrl: row.eventUrl,
      game: row.game || 'ETS2',
      dlcs: Array.isArray(row.dlcs) ? row.dlcs : [],
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await axiosInstance.put(`/calendar/external-events/${editing._id}`, {
        slotNumber: editForm.slotNumber,
        slotImageUrl: editForm.slotImageUrl,
        slotName: editForm.slotName,
        slotUrl: editForm.slotUrl,
        title: editForm.title,
        hostVtcName: editForm.hostVtcName,
        server: editForm.server,
        eventUrl: editForm.eventUrl,
        game: editForm.game,
        dlcs: Array.isArray(editForm.dlcs) ? editForm.dlcs : [],
        meetupAt:
          editForm.meetupLocal && String(editForm.meetupLocal).trim()
            ? datetimeLocalToIso(editForm.meetupLocal)
            : undefined,
        departureAt:
          editForm.departureLocal && String(editForm.departureLocal).trim()
            ? datetimeLocalToIso(editForm.departureLocal)
            : null,
        notes: editForm.notes,
      });
      setSubmitMsg({ type: 'success', text: 'Entry updated and attendance link synced.' });
      setEditOpen(false);
      loadList();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  const removeRow = async (id) => {
    if (!window.confirm('Delete this external attendance entry?')) return;
    try {
      await axiosInstance.delete(`/calendar/external-events/${id}`);
      loadList();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        External convoy attendance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Log events hosted by other VTCs where we have an assigned slot. TMP data is loaded by event ID; you add our slot number and slot image URL.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Load TruckersMP event
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="TMP event ID"
            value={tmpIdInput}
            onChange={(e) => setTmpIdInput(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button variant="outlined" onClick={handleFetchTmp} disabled={fetchingTmp} startIcon={fetchingTmp ? <CircularProgress size={16} /> : <RefreshIcon />}>
            Fetch &amp; prefill
          </Button>
        </Stack>
        {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                required
                label="TMP event ID"
                value={form.truckersmpEventId}
                onChange={(e) => setForm({ ...form, truckersmpEventId: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                required
                label="Our slot number"
                type="number"
                value={form.slotNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({
                    ...f,
                    slotNumber: v,
                    slotName: v !== '' && Number.isFinite(Number(v)) ? `Slot ${v}` : f.slotName,
                  }));
                }}
                size="small"
                sx={{ maxWidth: 160 }}
              />
              <TextField
                select
                label="Game"
                value={form.game}
                onChange={(e) => setForm({ ...form, game: e.target.value })}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="ETS2">ETS2</MenuItem>
                <MenuItem value="ATS">ATS</MenuItem>
              </TextField>
            </Stack>
            <TextField
              required
              label="Slot image URL"
              value={form.slotImageUrl}
              onChange={(e) => setForm({ ...form, slotImageUrl: e.target.value })}
              fullWidth
              size="small"
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Slot name" value={form.slotName} onChange={(e) => setForm({ ...form, slotName: e.target.value })} fullWidth size="small" />
             
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth size="small" />
              <TextField label="Host VTC" value={form.hostVtcName} onChange={(e) => setForm({ ...form, hostVtcName: e.target.value })} fullWidth size="small" />
              <TextField label="Server" value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} fullWidth size="small" />
            </Stack>
            <Autocomplete
              multiple
              freeSolo
              options={AVAILABLE_DLCS}
              value={form.dlcs}
              onChange={(_, v) => setForm({ ...form, dlcs: v })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} size="small" />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="DLCs required" placeholder="Select DLCs" size="small" />
              )}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Meetup and departure use your browser&apos;s local timezone. Leave blank to use TruckersMP times from the event.
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Meetup"
                type="datetime-local"
                value={form.meetupLocal}
                onChange={(e) => setForm({ ...form, meetupLocal: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Departure"
                type="datetime-local"
                value={form.departureLocal}
                onChange={(e) => setForm({ ...form, departureLocal: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              label="Special notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              fullWidth
              size="small"
              multiline
              minRows={2}
              inputProps={{ maxLength: 8000 }}
            />
            {submitMsg.text && (
              <Alert severity={submitMsg.type === 'success' ? 'success' : 'error'}>{submitMsg.text}</Alert>
            )}
            <Button type="submit" variant="contained" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
              {submitting ? <CircularProgress size={22} /> : 'Save attendance entry'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Entries
      </Typography>
      {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>TMP ID</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Linked attendance</TableCell>
                <TableCell>Slot image</TableCell>
                <TableCell>Meetup (local)</TableCell>
                <TableCell>Departure (local)</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Created by</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.truckersmpEventId}</TableCell>
                  <TableCell>{r.slotNumber}</TableCell>
                  <TableCell>
                    {r.linkedAttendanceEventId ? (
                      <Chip size="small" color="success" label="Linked" />
                    ) : (
                      <Chip size="small" label="Pending" />
                    )}
                  </TableCell>
                  <a href={r.slotImageUrl} target="_blank" rel="noopener noreferrer">
                    <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.slotImageUrl}</TableCell>
                  </a>
                  <TableCell>{formatLocal(r.meetupAt || r.startUtc)}</TableCell>
                  <TableCell>{formatLocal(r.departureAt || r.endUtc)}</TableCell>
                  <TableCell sx={{ maxWidth: 140 }}>{notesSnippet(r.notes)}</TableCell>
                  <TableCell>{r.createdByUsername || '—'}</TableCell>
                  <TableCell>{formatLocal(r.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)} aria-label="edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => removeRow(r._id)} aria-label="delete">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11}>No entries yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} fullWidth size="small" />
            <TextField label="Slot number" type="number" value={editForm.slotNumber ?? ''} onChange={(e) => setEditForm({ ...editForm, slotNumber: Number(e.target.value) })} fullWidth size="small" />
            <TextField label="Slot image URL" value={editForm.slotImageUrl || ''} onChange={(e) => setEditForm({ ...editForm, slotImageUrl: e.target.value })} fullWidth size="small" />
            <TextField label="Slot name" value={editForm.slotName || ''} onChange={(e) => setEditForm({ ...editForm, slotName: e.target.value })} fullWidth size="small" />
            <TextField label="Slot URL" value={editForm.slotUrl || ''} onChange={(e) => setEditForm({ ...editForm, slotUrl: e.target.value })} fullWidth size="small" />
            <TextField label="Host VTC" value={editForm.hostVtcName || ''} onChange={(e) => setEditForm({ ...editForm, hostVtcName: e.target.value })} fullWidth size="small" />
            <TextField label="Server" value={editForm.server || ''} onChange={(e) => setEditForm({ ...editForm, server: e.target.value })} fullWidth size="small" />
            <TextField label="Event URL" value={editForm.eventUrl || ''} onChange={(e) => setEditForm({ ...editForm, eventUrl: e.target.value })} fullWidth size="small" />
            <Typography variant="caption" color="text.secondary">
              Times are in your local timezone.
            </Typography>
            <TextField label="Meetup" type="datetime-local" value={editForm.meetupLocal || ''} onChange={(e) => setEditForm({ ...editForm, meetupLocal: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Departure" type="datetime-local" value={editForm.departureLocal || ''} onChange={(e) => setEditForm({ ...editForm, departureLocal: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Special notes" value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} fullWidth size="small" multiline minRows={2} inputProps={{ maxLength: 8000 }} />
            <TextField select label="Game" value={editForm.game || 'ETS2'} onChange={(e) => setEditForm({ ...editForm, game: e.target.value })} fullWidth size="small">
              <MenuItem value="ETS2">ETS2</MenuItem>
              <MenuItem value="ATS">ATS</MenuItem>
            </TextField>
            <Autocomplete
              multiple
              freeSolo
              options={AVAILABLE_DLCS}
              value={Array.isArray(editForm.dlcs) ? editForm.dlcs : []}
              onChange={(_, v) => setEditForm({ ...editForm, dlcs: v })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} size="small" />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="DLCs" placeholder="Select DLCs" size="small" />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
