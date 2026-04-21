import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Pagination,
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
const RATES_PAGE_SIZE = 25;
const CATALOG_PAGE_SIZE = 50;

const emptyPricing = {
  cargoId: '',
  cargoName: '',
  cargoClass: 'general',
  pricePerKm: '',
  minPrice: '0',
  active: true,
};

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

export default function AdminCargoRates() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rates pagination & search
  const [rates, setRates] = useState([]);
  const [ratesTotal, setRatesTotal] = useState(0);
  const [ratesPage, setRatesPage] = useState(1);
  const [ratesSearch, setRatesSearch] = useState('');
  const debouncedRatesSearch = useDebounced(ratesSearch, 300);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Catalog pagination & search
  const [catalog, setCatalog] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogSearch, setCatalogSearch] = useState('');
  const debouncedCatalogSearch = useDebounced(catalogSearch, 300);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // create | edit
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [form, setForm] = useState(emptyPricing);
  const [submitting, setSubmitting] = useState(false);

  const reqRef = useRef({ rates: 0, catalog: 0 });

  const loadConfig = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/cargo-rates/revenue-config');
      setConfig(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load config');
    }
  };

  const loadRates = async () => {
    const seq = ++reqRef.current.rates;
    setRatesLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/cargo-rates/rates', {
        params: {
          page: ratesPage,
          limit: RATES_PAGE_SIZE,
          q: debouncedRatesSearch || undefined,
        },
      });
      if (seq !== reqRef.current.rates) return; // stale
      setRates(data.items || data.rates || []);
      setRatesTotal(data.total ?? (data.items?.length || 0));
    } catch (e) {
      if (seq !== reqRef.current.rates) return;
      setError(e?.response?.data?.message || 'Failed to load rates');
    } finally {
      if (seq === reqRef.current.rates) setRatesLoading(false);
    }
  };

  const loadCatalog = async () => {
    const seq = ++reqRef.current.catalog;
    setCatalogLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/cargo-rates/cargo-catalog', {
        params: {
          page: catalogPage,
          limit: CATALOG_PAGE_SIZE,
          q: debouncedCatalogSearch || undefined,
        },
      });
      if (seq !== reqRef.current.catalog) return;
      setCatalog(data.items || []);
      setCatalogTotal(data.total ?? (data.items?.length || 0));
    } catch (e) {
      if (seq !== reqRef.current.catalog) return;
      setError(e?.response?.data?.message || 'Failed to load catalog');
    } finally {
      if (seq === reqRef.current.catalog) setCatalogLoading(false);
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    try {
      await Promise.all([loadConfig(), loadRates(), loadCatalog()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratesPage, debouncedRatesSearch]);

  useEffect(() => {
    if (debouncedRatesSearch) setRatesPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRatesSearch]);

  useEffect(() => {
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogPage, debouncedCatalogSearch]);

  useEffect(() => {
    if (debouncedCatalogSearch) setCatalogPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCatalogSearch]);

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
      minPrice: String(rate.minPrice ?? '0'),
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
      pricePerKm:
        val.pricePerKm != null
          ? String(val.pricePerKm)
          : val.nexon?.price != null
          ? String(val.nexon.price)
          : p.pricePerKm,
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
      loadRates();
      loadCatalog();
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
      loadRates();
      loadCatalog();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  };

  const unpricedCatalog = useMemo(() => catalog.filter((c) => !c.hasRate), [catalog]);

  const ratesPageCount = Math.max(1, Math.ceil(ratesTotal / RATES_PAGE_SIZE));
  const catalogPageCount = Math.max(1, Math.ceil(catalogTotal / CATALOG_PAGE_SIZE));

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Cargo market rates</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure per-cargo pricing used by the revenue normalization engine. Revenue is computed as
        <code style={{ margin: '0 4px' }}>distanceKm × pricePerKm</code>
        (no min-price floor or damage/auto-park penalty is applied).
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {config && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography fontWeight={700} sx={{ mb: 2 }}>Revenue & division policy</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
              <TextField size="small" label="Default €/km" type="number" value={config.defaultPricePerKm ?? ''} onChange={(e) => setConfig((p) => ({ ...p, defaultPricePerKm: Number(e.target.value) }))} />
              <TextField size="small" label="Max division tax %" type="number" value={config.maxDivisionTaxPercent ?? ''} onChange={(e) => setConfig((p) => ({ ...p, maxDivisionTaxPercent: Number(e.target.value) }))} />
              <TextField size="small" label="Exit cooldown (days)" type="number" value={config.exitCooldownDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, exitCooldownDays: Number(e.target.value) }))} />
              <TextField size="small" label="Invite expiry (days)" type="number" value={config.inviteExpiryDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, inviteExpiryDays: Number(e.target.value) }))} />
              <TextField size="small" label="Inactivity threshold (days)" type="number" value={config.inactivityDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, inactivityDays: Number(e.target.value) }))} />
              <Button variant="contained" onClick={saveConfig}>Save policy</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
            <Typography fontWeight={700}>Configured rates ({ratesTotal})</Typography>
            <TextField
              size="small"
              placeholder="Search rates…"
              value={ratesSearch}
              onChange={(e) => setRatesSearch(e.target.value)}
            />
          </Stack>
          {ratesLoading && <LinearProgress sx={{ mb: 1 }} />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cargo</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="right">€/km</TableCell>
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
              {!rates.length && !ratesLoading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No rates match. Use “Add / edit rate” or pick a cargo from above.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {ratesPageCount > 1 && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Pagination
                size="small"
                count={ratesPageCount}
                page={ratesPage}
                onChange={(_, p) => setRatesPage(p)}
                color="primary"
              />
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'edit' ? 'Edit rate' : 'Add / update rate'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={catalog}
              value={selectedCargo}
              getOptionLabel={(o) => (o ? `${o.cargoName || o.cargoId || '?'}${o.count ? ` · ${o.count} jobs` : ''}` : '')}
              isOptionEqualToValue={(a, b) => a?.cargoId === b?.cargoId && a?.cargoName === b?.cargoName}
              onChange={(_, v) => onCatalogPick(v)}
              onInputChange={(_, v) => setCatalogSearch(v)}
              filterOptions={(x) => x}
              renderOption={(props, o) => (
                <li {...props}>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {o.cargoName || '(unknown)'} {o.hasRate && <Chip size="small" color="success" label="priced" sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.cargoId || 'no id'}{o.count ? ` · ${o.count} jobs` : ''}{o.pricePerKm ? ` · €${o.pricePerKm}/km` : o.nexon?.price ? ` · €${o.nexon.price}/km (nexon)` : ''}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Pick cargo from catalog" helperText="Type to search; auto-fills name/id/class. You can still enter a custom cargo below." />}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Cargo ID" value={form.cargoId} onChange={(e) => setForm((p) => ({ ...p, cargoId: e.target.value }))} fullWidth />
              <TextField label="Cargo name" value={form.cargoName} onChange={(e) => setForm((p) => ({ ...p, cargoName: e.target.value }))} fullWidth />
            </Stack>
            <TextField select label="Class" value={form.cargoClass} onChange={(e) => setForm((p) => ({ ...p, cargoClass: e.target.value }))} fullWidth>
              {CLASSES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField
              label="Price per km (€)"
              type="number"
              value={form.pricePerKm}
              onChange={(e) => setForm((p) => ({ ...p, pricePerKm: e.target.value }))}
              fullWidth
              required
              helperText="Revenue = distanceKm × pricePerKm"
            />
            <TextField select label="Active" value={form.active ? 'yes' : 'no'} onChange={(e) => setForm((p) => ({ ...p, active: e.target.value === 'yes' }))} fullWidth>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveDialog}
            disabled={submitting || (!form.cargoId.trim() && !form.cargoName.trim()) || !(Number(form.pricePerKm) >= 0)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
