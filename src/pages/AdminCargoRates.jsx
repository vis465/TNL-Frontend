import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import axiosInstance from '../utils/axios';

const CLASSES = ['default', 'general', 'heavy', 'liquid', 'food', 'fragile', 'hazardous'];

const emptyPricing = {
  cargoId: '',
  cargoName: '',
  cargoClass: 'general',
  pricePerKm: '22',
  minPrice: '1200',
  active: true,
};

export default function AdminCargoRates() {
  const [rates, setRates] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // create | edit
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [form, setForm] = useState(emptyPricing);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [r, c, cat] = await Promise.all([
        axiosInstance.get('/admin/cargo-rates/rates'),
        axiosInstance.get('/admin/cargo-rates/revenue-config'),
        axiosInstance.get('/admin/cargo-rates/cargo-catalog', { params: { limit: 500 } }),
      ]);
      setRates(r.data.rates || []);
      setConfig(c.data);
      setCatalog(cat.data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveConfig = async () => {
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', config);
      setConfig(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    }
  };

  const openCreate = () => {
    setDialogMode('create');
    setSelectedCargo(null);
    setForm(emptyPricing);
    setDialogOpen(true);
  };

  const openEdit = (rate) => {
    setDialogMode('edit');
    setSelectedCargo(null);
    setForm({
      cargoId: rate.cargoId || '',
      cargoName: rate.cargoName || '',
      cargoClass: rate.cargoClass || 'general',
      pricePerKm: String(rate.pricePerKm ?? ''),
      minPrice: String(rate.minPrice ?? ''),
      active: rate.active !== false,
      _id: rate._id,
    });
    setDialogOpen(true);
  };

  const onCatalogPick = (val) => {
    setSelectedCargo(val || null);
    if (!val) return;
    setForm((p) => ({
      ...p,
      cargoId: val.cargoId || '',
      cargoName: val.cargoName || '',
      cargoClass: val.cargoClass || p.cargoClass || 'general',
      pricePerKm: val.pricePerKm != null ? String(val.pricePerKm) : p.pricePerKm,
      minPrice: val.minPrice != null ? String(val.minPrice) : p.minPrice,
      active: val.active !== false,
      _id: val.rateId || undefined,
    }));
    if (val.hasRate) setDialogMode('edit');
  };

  const saveDialog = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (dialogMode === 'edit' && form._id) {
        await axiosInstance.patch(`/admin/cargo-rates/rates/${form._id}`, {
          cargoId: form.cargoId.trim(),
          cargoName: form.cargoName.trim(),
          cargoClass: form.cargoClass,
          pricePerKm: Number(form.pricePerKm) || 0,
          minPrice: Number(form.minPrice) || 0,
          active: !!form.active,
        });
      } else {
        await axiosInstance.post('/admin/cargo-rates/rates/upsert', {
          cargoId: form.cargoId.trim(),
          cargoName: form.cargoName.trim(),
          cargoClass: form.cargoClass,
          pricePerKm: Number(form.pricePerKm) || 0,
          minPrice: Number(form.minPrice) || 0,
          active: !!form.active,
        });
      }
      setDialogOpen(false);
      setForm(emptyPricing);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeRate = async (id) => {
    if (!window.confirm('Delete this rate?')) return;
    try {
      await axiosInstance.delete(`/admin/cargo-rates/rates/${id}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  };

  const unpricedCatalog = useMemo(() => catalog.filter((c) => !c.hasRate), [catalog]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Cargo market rates</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure per-cargo pricing used by the revenue normalization engine. Rates marked as default/general apply when no specific rate matches.
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {config && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography fontWeight={700} sx={{ mb: 2 }}>Revenue & division policy</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
              <TextField size="small" label="Default €/km" type="number" value={config.defaultPricePerKm ?? ''} onChange={(e) => setConfig((p) => ({ ...p, defaultPricePerKm: Number(e.target.value) }))} />
              <TextField size="small" label="Default min price" type="number" value={config.defaultMinPrice ?? ''} onChange={(e) => setConfig((p) => ({ ...p, defaultMinPrice: Number(e.target.value) }))} />
              <TextField size="small" label="Auto-park penalty (0-1)" type="number" value={config.autoParkPenalty ?? ''} onChange={(e) => setConfig((p) => ({ ...p, autoParkPenalty: Number(e.target.value) }))} />
              <TextField size="small" label="Max division tax %" type="number" value={config.maxDivisionTaxPercent ?? ''} onChange={(e) => setConfig((p) => ({ ...p, maxDivisionTaxPercent: Number(e.target.value) }))} />
              <TextField size="small" label="Exit cooldown (days)" type="number" value={config.exitCooldownDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, exitCooldownDays: Number(e.target.value) }))} />
              <TextField size="small" label="Invite expiry (days)" type="number" value={config.inviteExpiryDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, inviteExpiryDays: Number(e.target.value) }))} />
              <TextField size="small" label="Inactivity threshold (days)" type="number" value={config.inactivityDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, inactivityDays: Number(e.target.value) }))} />
              <Button variant="contained" onClick={saveConfig}>Save policy</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography fontWeight={700}>Price a cargo</Typography>
              <Typography variant="caption" color="text.secondary">
                Pick from cargos observed in recent jobs or enter a custom one. Unpriced cargos: {unpricedCatalog.length}
              </Typography>
            </Box>
            <Button variant="contained" onClick={openCreate}>Add / edit rate</Button>
          </Stack>
          {!!unpricedCatalog.length && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {unpricedCatalog.slice(0, 15).map((c) => (
                <Chip
                  key={`${c.cargoId}|${c.cargoName}`}
                  size="small"
                  label={`${c.cargoName || c.cargoId || '?'} · ${c.count} jobs`}
                  onClick={() => {
                    setDialogMode('create');
                    setSelectedCargo(c);
                    setForm({
                      cargoId: c.cargoId || '',
                      cargoName: c.cargoName || '',
                      cargoClass: c.cargoClass || 'general',
                      pricePerKm: String(config?.defaultPricePerKm ?? 20),
                      minPrice: String(config?.defaultMinPrice ?? 1000),
                      active: true,
                    });
                    setDialogOpen(true);
                  }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Configured rates ({rates.length})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cargo</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="right">€/km</TableCell>
                <TableCell align="right">Min price</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rates.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{r.cargoName || '(any)'}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.cargoId || '—'}</Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={r.cargoClass} /></TableCell>
                  <TableCell align="right">{r.pricePerKm}</TableCell>
                  <TableCell align="right">{r.minPrice}</TableCell>
                  <TableCell>{r.active ? <Chip size="small" color="success" label="Yes" /> : <Chip size="small" label="No" />}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(r)}><EditOutlined fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => removeRate(r._id)}><DeleteOutline fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!rates.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No rates yet. Use “Add / edit rate” or pick a cargo from above.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'edit' ? 'Edit rate' : 'Add / update rate'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={catalog}
              value={selectedCargo}
              getOptionLabel={(o) => o ? `${o.cargoName || o.cargoId || '?'}${o.count ? ` · ${o.count} jobs` : ''}` : ''}
              isOptionEqualToValue={(a, b) => a?.cargoId === b?.cargoId && a?.cargoName === b?.cargoName}
              onChange={(_, v) => onCatalogPick(v)}
              renderOption={(props, o) => (
                <li {...props}>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {o.cargoName || '(unknown)'} {o.hasRate && <Chip size="small" color="success" label="priced" sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.cargoId || 'no id'} · {o.count} jobs{o.pricePerKm ? ` · €${o.pricePerKm}/km` : ''}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Pick cargo from jobs catalog" helperText="Select to auto-fill name/id, or type below to create a custom entry" />}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Cargo ID" value={form.cargoId} onChange={(e) => setForm((p) => ({ ...p, cargoId: e.target.value }))} fullWidth />
              <TextField label="Cargo name" value={form.cargoName} onChange={(e) => setForm((p) => ({ ...p, cargoName: e.target.value }))} fullWidth />
            </Stack>
            <TextField select label="Class" value={form.cargoClass} onChange={(e) => setForm((p) => ({ ...p, cargoClass: e.target.value }))} fullWidth>
              {CLASSES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Price per km" type="number" value={form.pricePerKm} onChange={(e) => setForm((p) => ({ ...p, pricePerKm: e.target.value }))} fullWidth required />
              <TextField label="Min price" type="number" value={form.minPrice} onChange={(e) => setForm((p) => ({ ...p, minPrice: e.target.value }))} fullWidth required />
            </Stack>
            <TextField select label="Active" value={form.active ? 'yes' : 'no'} onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === 'yes' }))} fullWidth>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={saveDialog} disabled={submitting || (!form.cargoId.trim() && !form.cargoName.trim()) || !(Number(form.pricePerKm) >= 0)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
