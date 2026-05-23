import React, { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  adminGetSession,
  adminCreateSession,
  adminUpdateSession,
  adminAddLot,
  adminDeleteLot,
  adminPublishSession,
  adminCloseSession,
  adminCargoCatalog,
  adminSuggestBasePrice,
} from '../../services/cargoBidsService';

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resolveSessionIdFromResponse(s) {
  if (!s) return null;
  return String(s._id || s.id || '');
}

export default function AdminCargoBidSessionEdit() {
  const { id: routeId } = useParams();
  const isNewRoute = routeId === 'new';
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(() =>
    routeId && routeId !== 'new' ? routeId : null
  );

  const [form, setForm] = useState({
    title: '',
    description: '',
    listVisibleAt: '',
    biddingStartsAt: '',
    biddingEndsAt: '',
  });
  const [lots, setLots] = useState([]);
  const [status, setStatus] = useState('draft');
  const [catalog, setCatalog] = useState([]);
  const [lotForm, setLotForm] = useState({
    cargoName: '',
    cargoId: '',
    cargoClass: 'general',
    basePriceEur: 100,
    pricePerKm: null,
    rateMatchedBy: '',
    revenueMultiplier: 2,
    winnersCount: 1,
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminCargoCatalog({ limit: 200 })
      .then((data) => setCatalog(data.items || data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessionId || sessionId === 'new') return;
    adminGetSession(sessionId)
      .then((data) => {
        const s = data.session;
        setForm({
          title: s.title,
          description: s.description || '',
          listVisibleAt: toLocalInput(s.listVisibleAt),
          biddingStartsAt: toLocalInput(s.biddingStartsAt),
          biddingEndsAt: toLocalInput(s.biddingEndsAt),
        });
        setLots(data.lots || []);
        setStatus(s.status);
      })
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, [sessionId]);

  const buildSessionBody = () => ({
    title: form.title,
    description: form.description,
    listVisibleAt: form.listVisibleAt ? new Date(form.listVisibleAt).toISOString() : undefined,
    biddingStartsAt: new Date(form.biddingStartsAt).toISOString(),
    biddingEndsAt: new Date(form.biddingEndsAt).toISOString(),
  });

  const ensureSessionSaved = useCallback(async () => {
    if (!form.title?.trim()) throw new Error('Session title is required');
    if (!form.biddingStartsAt || !form.biddingEndsAt) {
      throw new Error('Bidding start and end times are required');
    }

    if (sessionId) {
      await adminUpdateSession(sessionId, buildSessionBody());
      return sessionId;
    }

    const s = await adminCreateSession(buildSessionBody());
    const newId = resolveSessionIdFromResponse(s);
    if (!newId) throw new Error('Server did not return a session id');
    setSessionId(newId);
    setStatus('draft');
    if (isNewRoute) {
      navigate(`/admin/cargo-bids/sessions/${newId}`, { replace: true });
    }
    return newId;
  }, [sessionId, form, isNewRoute, navigate]);

  const saveSession = async () => {
    setSaving(true);
    setError('');
    try {
      await ensureSessionSaved();
      setMsg('Session saved');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const addLot = async () => {
    if (!lotForm.cargoName?.trim()) {
      setError('Select a cargo from the catalog');
      return;
    }
    setError('');
    try {
      const sid = await ensureSessionSaved();
      const lot = await adminAddLot(sid, lotForm);
      setLots((prev) => [...prev, lot]);
      setMsg('Lot added');
      setLotForm({
        cargoName: '',
        cargoId: '',
        cargoClass: 'general',
        basePriceEur: 100,
        pricePerKm: null,
        rateMatchedBy: '',
        revenueMultiplier: 2,
        winnersCount: 1,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const pickCargo = async (_e, item) => {
    if (!item) return;
    const hint = await adminSuggestBasePrice(item.cargoId, item.cargoName).catch(() => ({
      basePriceEur: 100,
      pricePerKm: item.pricePerKm ?? null,
      cargoClass: item.cargoClass || 'general',
    }));
    setLotForm({
      ...lotForm,
      cargoId: item.cargoId || hint.cargoId || '',
      cargoName: item.cargoName,
      cargoClass: hint.cargoClass || item.cargoClass || 'general',
      basePriceEur: hint.basePriceEur ?? 100,
      pricePerKm: hint.pricePerKm ?? item.pricePerKm ?? null,
      rateMatchedBy: hint.matchedBy || (item.hasRate ? 'cargo-catalog' : ''),
    });
  };

  const canAddLots = Boolean(sessionId) && status === 'draft';
  const showLotForm = status === 'draft';

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={RouterLink} to="/admin/cargo-bids" size="small" sx={{ mb: 2 }}>
        ← Sessions
      </Button>
      <Typography variant="h5" gutterBottom>
        {isNewRoute && !sessionId ? 'New auction session' : 'Edit session'}
      </Typography>
      {sessionId && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Session ID: {sessionId}
        </Typography>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="List visible (preview)"
              InputLabelProps={{ shrink: true }}
              value={form.listVisibleAt}
              onChange={(e) => setForm({ ...form, listVisibleAt: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Bidding starts"
              InputLabelProps={{ shrink: true }}
              value={form.biddingStartsAt}
              onChange={(e) => setForm({ ...form, biddingStartsAt: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Bidding ends"
              InputLabelProps={{ shrink: true }}
              value={form.biddingEndsAt}
              onChange={(e) => setForm({ ...form, biddingEndsAt: e.target.value })}
            />
          </Grid>
        </Grid>
        <Button variant="contained" sx={{ mt: 2 }} onClick={saveSession} disabled={saving}>
          {saving ? 'Saving…' : sessionId ? 'Save session' : 'Create session'}
        </Button>
      </Paper>

      {showLotForm && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add cargo lot
          </Typography>
          {!sessionId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Fill session details above, then click &quot;Create session&quot; or add a cargo — the
              session will be saved automatically.
            </Alert>
          )}
          <Autocomplete
            options={catalog}
            getOptionLabel={(o) =>
              o.cargoName
                ? `${o.cargoName}${o.pricePerKm != null ? ` (€${o.pricePerKm}/t·km)` : ''}`
                : ''
            }
            onChange={pickCargo}
            renderInput={(params) => <TextField {...params} label="Search cargo" />}
            sx={{ mb: 2 }}
          />
          {lotForm.pricePerKm != null && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Market rate: <strong>€{lotForm.pricePerKm}</strong> per tonne·km
              {lotForm.rateMatchedBy ? ` (${lotForm.rateMatchedBy})` : ''}
              {lotForm.cargoClass ? ` · class: ${lotForm.cargoClass}` : ''}
            </Typography>
          )}
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="€/t·km"
                type="number"
                value={lotForm.pricePerKm ?? ''}
                InputProps={{ readOnly: true }}
                helperText="From cargo rates DB"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Base price EUR"
                type="number"
                value={lotForm.basePriceEur}
                onChange={(e) => setLotForm({ ...lotForm, basePriceEur: Number(e.target.value) })}
                helperText="Typical haul ref."
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Multiplier"
                type="number"
                value={lotForm.revenueMultiplier}
                onChange={(e) => setLotForm({ ...lotForm, revenueMultiplier: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Winners"
                type="number"
                value={lotForm.winnersCount}
                onChange={(e) => setLotForm({ ...lotForm, winnersCount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ height: '56px' }}
                onClick={addLot}
                disabled={!lotForm.cargoName}
              >
                Add lot
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {sessionId && (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {status === 'draft' && canAddLots && (
              <Button
                color="primary"
                variant="contained"
                onClick={async () => {
                  try {
                    await adminPublishSession(sessionId, {
                      listVisibleAt: form.listVisibleAt
                        ? new Date(form.listVisibleAt).toISOString()
                        : undefined,
                    });
                    setStatus('listed');
                    setMsg('Published');
                  } catch (e) {
                    setError(e.response?.data?.message || e.message);
                  }
                }}
              >
                Publish
              </Button>
            )}
            {['listed', 'bidding_open'].includes(status) && (
              <Button
                color="warning"
                variant="outlined"
                onClick={async () => {
                  try {
                    await adminCloseSession(sessionId);
                    setMsg('Session closed');
                  } catch (e) {
                    setError(e.response?.data?.message || e.message);
                  }
                }}
              >
                Force close
              </Button>
            )}
            <Button component={RouterLink} to={`/admin/cargo-bids/sessions/${sessionId}/analytics`}>
              Analytics
            </Button>
          </Stack>

          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cargo</TableCell>
                  <TableCell>€/t·km</TableCell>
                  <TableCell>Base €</TableCell>
                  <TableCell>×</TableCell>
                  <TableCell>Winners</TableCell>
                  <TableCell>High bid</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {lots.map((l) => (
                  <TableRow key={l._id}>
                    <TableCell>{l.cargoName}</TableCell>
                    <TableCell>{l.pricePerKm != null ? l.pricePerKm : '—'}</TableCell>
                    <TableCell>{l.basePriceEur}</TableCell>
                    <TableCell>{l.revenueMultiplier}</TableCell>
                    <TableCell>{l.winnersCount}</TableCell>
                    <TableCell>{l.currentHighBid || 0}</TableCell>
                    <TableCell>
                      {status === 'draft' && (
                        <IconButton
                          size="small"
                          onClick={async () => {
                            await adminDeleteLot(l._id);
                            setLots((prev) => prev.filter((x) => x._id !== l._id));
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Container>
  );
}
