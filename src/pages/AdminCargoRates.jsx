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
  Divider,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
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
  Switch,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const CLASSES = ['default', 'general', 'heavy', 'liquid', 'food', 'fragile', 'hazardous'];
const RATES_PAGE_SIZE = 25;
const CATALOG_PAGE_SIZE = 50;

const emptyPricing = {
  cargoId: '',
  cargoName: '',
  cargoClass: 'general',
  pricePerKm: '',
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
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [clearingBroadcast, setClearingBroadcast] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [rateExtremes, setRateExtremes] = useState({ highest: null, lowest: null });

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

  const loadRateExtremes = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/cargo-rates/rates/extremes');
      setRateExtremes({ highest: data.highest || null, lowest: data.lowest || null });
    } catch (_) {
      setRateExtremes({ highest: null, lowest: null });
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
      await Promise.all([loadConfig(), loadRates(), loadCatalog(), loadRateExtremes()]);
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
    setSavingConfig(true);
    setConfigSaved(false);
    setError('');
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', config);
      setConfig(data);
      setConfigSaved(true);
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSavingConfig(false);
    }
  };

  const saveGlobalBannerOnly = async () => {
    setSavingBanner(true);
    setConfigSaved(false);
    setError('');
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', {
        globalMemberAnnouncement: config.globalMemberAnnouncement ?? '',
      });
      setConfig(data);
      setConfigSaved(true);
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSavingBanner(false);
    }
  };

  const dismissCargoBroadcast = async () => {
    setClearingBroadcast(true);
    setError('');
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', {
        clearCargoRatesRefreshBroadcast: true,
      });
      setConfig(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Dismiss failed');
    } finally {
      setClearingBroadcast(false);
    }
  };

  const refreshAll = () => {
    setConfigSaved(false);
    initialLoad();
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
          active: !!form.active,
        });
      } else {
        await axiosInstance.post('/admin/cargo-rates/rates/upsert', {
          cargoId: form.cargoId.trim(),
          cargoName: form.cargoName.trim(),
          cargoClass: form.cargoClass,
          pricePerKm: Number(form.pricePerKm) || 0,
          active: !!form.active,
        });
      }
      setDialogOpen(false);
      setForm(emptyPricing);
      loadRates();
      loadCatalog();
      loadRateExtremes();
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
      loadRateExtremes();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  };

  const unpricedCatalog = useMemo(() => catalog.filter((c) => !c.hasRate), [catalog]);

  const ratesPageCount = Math.max(1, Math.ceil(ratesTotal / RATES_PAGE_SIZE));
  const catalogPageCount = Math.max(1, Math.ceil(catalogTotal / CATALOG_PAGE_SIZE));

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Cargo rates</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            Rates are <strong>€ per tonne·km</strong> (global default plus per-cargo/class overrides), then platform-wide volume pricing.
            Normalized revenue is <code style={{ margin: '0 4px' }}>distance × tonnes × effective €/(t·km)</code>
            (tonnes from cargo mass when present, otherwise 1 for legacy jobs). Token deductions apply afterward.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={refreshAll} disabled={loading}>
          Refresh data
        </Button>
      </Stack>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {configSaved && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setConfigSaved(false)}>
          Revenue settings saved.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 1.5 }}>Active rate range</Typography>
          {!rateExtremes.highest && !rateExtremes.lowest ? (
            <Typography variant="body2" color="text.secondary">No active cargo rate rows yet.</Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Highest €/(t·km) (active)</Typography>
                    {rateExtremes.highest ? (
                      <>
                        <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }}>
                          {Number(rateExtremes.highest.pricePerKm).toLocaleString()} €/(t·km)
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>{rateExtremes.highest.cargoName || rateExtremes.highest.cargoId || '—'}</Typography>
                        <Chip size="small" label={rateExtremes.highest.cargoClass} sx={{ mt: 1 }} />
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No data</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Lowest €/(t·km) (active)</Typography>
                    {rateExtremes.lowest ? (
                      <>
                        <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }}>
                          {Number(rateExtremes.lowest.pricePerKm).toLocaleString()} €/(t·km)
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>{rateExtremes.lowest.cargoName || rateExtremes.lowest.cargoId || '—'}</Typography>
                        <Chip size="small" label={rateExtremes.lowest.cargoClass} sx={{ mt: 1 }} />
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No data</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
              {rateExtremes.highest &&
                rateExtremes.lowest &&
                String(rateExtremes.highest._id) === String(rateExtremes.lowest._id) && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                    Only one active rate row — highest and lowest are the same.
                  </Typography>
                )}
            </>
          )}
        </CardContent>
      </Card>

      {config && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Site-wide division banner</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                One message for every division’s public page and for My division. The volume snapshot scheduler also writes a short notice here after each run (dismissible below).
              </Typography>
              <TextField
                multiline
                minRows={2}
                fullWidth
                label="Announcement"
                placeholder="e.g. Convoy Sunday 20:00 CET — see Discord."
                value={config.globalMemberAnnouncement ?? ''}
                onChange={(e) => setConfig((p) => ({ ...p, globalMemberAnnouncement: e.target.value }))}
                inputProps={{ maxLength: 4000 }}
              />
              {config.globalMemberAnnouncementUpdatedAt && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Last saved {new Date(config.globalMemberAnnouncementUpdatedAt).toLocaleString()}
                </Typography>
              )}
              <Button
                variant="outlined"
                sx={{ mt: 1.5 }}
                onClick={saveGlobalBannerOnly}
                disabled={savingBanner}
              >
                {savingBanner ? 'Saving…' : 'Save announcement'}
              </Button>
              {config.cargoRatesRefreshBroadcast?.trim() && (
                <Alert
                  severity="info"
                  sx={{ mt: 2 }}
                  action={(
                    <Button color="inherit" size="small" onClick={dismissCargoBroadcast} disabled={clearingBroadcast}>
                      {clearingBroadcast ? '…' : 'Dismiss'}
                    </Button>
                  )}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {config.cargoRatesRefreshBroadcast}
                  </Typography>
                  {config.cargoRatesRefreshBroadcastAt && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.9 }}>
                      {new Date(config.cargoRatesRefreshBroadcastAt).toLocaleString()}
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Global defaults & division policy</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Fallback €/(t·km) when no rate row matches the job; other fields are used by divisions and member flows.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
                <TextField size="small" label="Default €/(t·km)" type="number" value={config.defaultPricePerKm ?? ''} onChange={(e) => setConfig((p) => ({ ...p, defaultPricePerKm: Number(e.target.value) }))} />
                <TextField size="small" label="Max division tax %" type="number" value={config.maxDivisionTaxPercent ?? ''} onChange={(e) => setConfig((p) => ({ ...p, maxDivisionTaxPercent: Number(e.target.value) }))} />
                <TextField
                  size="small"
                  label="Min rider share of job tokens (%)"
                  type="number"
                  helperText="After penalties & platform fee, before division levy & truck rent. E.g. 85 ⇒ division takes ≤15%. Leave empty for no extra cap."
                  value={config.minRiderShareOfPreDivisionTokensPercent ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setConfig((p) => ({
                      ...p,
                      minRiderShareOfPreDivisionTokensPercent: raw === '' ? null : Number(raw),
                    }));
                  }}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
                <TextField size="small" label="Exit cooldown (days)" type="number" value={config.exitCooldownDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, exitCooldownDays: Number(e.target.value) }))} />
                <TextField size="small" label="Invite expiry (days)" type="number" value={config.inviteExpiryDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, inviteExpiryDays: Number(e.target.value) }))} />
                <TextField size="small" label="Inactivity (days)" type="number" value={config.inactivityDays ?? ''} onChange={(e) => setConfig((p) => ({ ...p, inactivityDays: Number(e.target.value) }))} />
                <Button variant="contained" onClick={saveConfig} disabled={savingConfig}>
                  {savingConfig ? 'Saving…' : 'Save'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Division fuel market</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
                Standard and premium token prices, coverage, delivery grace, and price history are managed on a dedicated page so cargo rates stay focused on €/(t·km) and catalog.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/admin/fuel-market">
                Open division fuel pricing
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Platform volume pricing (fleet-wide)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 720 }}>
                Uses <strong>platform-wide</strong> completed deliveries in a rolling window ending when each job completes (not per driver).
                Higher fleet-wide activity lowers €/(t·km) for that normalization. Same controls as above—save with the main Save button.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap alignItems={{ sm: 'center' }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={config.volumePricingEnabled !== false}
                      onChange={(_, c) => setConfig((p) => ({ ...p, volumePricingEnabled: c }))}
                    />
                  )}
                  label="Enable platform volume pricing"
                />
                <TextField
                  size="small"
                  label="Lookback window (days)"
                  type="number"
                  value={config.volumePricingWindowDays ?? 7}
                  onChange={(e) => setConfig((p) => ({ ...p, volumePricingWindowDays: Number(e.target.value) }))}
                  inputProps={{ min: 0.1, step: 0.1 }}
                />
                <TextField
                  size="small"
                  label="Min multiplier (floor)"
                  type="number"
                  value={config.volumePricingMinMultiplier ?? 0.75}
                  onChange={(e) => setConfig((p) => ({ ...p, volumePricingMinMultiplier: Number(e.target.value) }))}
                  inputProps={{ min: 0.01, max: 1, step: 0.01 }}
                />
                <TextField
                  size="small"
                  label="Reference job count (global)"
                  type="number"
                  value={config.volumePricingReferenceJobs ?? 1000}
                  onChange={(e) => setConfig((p) => ({ ...p, volumePricingReferenceJobs: Math.max(1, Math.floor(Number(e.target.value) || 1)) }))}
                  inputProps={{ min: 1, step: 1 }}
                />
                <TextField
                  select
                  size="small"
                  label="Fleet job count for multiplier"
                  value={config.volumePricingJobCountMode || 'live'}
                  onChange={(e) => setConfig((p) => ({ ...p, volumePricingJobCountMode: e.target.value }))}
                  sx={{ minWidth: 260 }}
                >
                  <MenuItem value="live">Live (recount each job)</MenuItem>
                  <MenuItem value="weekly_snapshot">Weekly snapshot (scheduler / cron)</MenuItem>
                </TextField>
                <Button variant="outlined" onClick={saveConfig} disabled={savingConfig}>
                  {savingConfig ? 'Saving…' : 'Save volume settings'}
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                {config.volumePricingJobCountMode === 'weekly_snapshot' ? (
                  <>
                    Uses the last platform job count written by the in-process scheduler (same pattern as the loan scheduler:
                    runs once at startup, then every <code>CARGO_RATE_SNAPSHOT_INTERVAL_HOURS</code> hours, default 168). You can
                    also run <code>npm run cargo-rates:weekly-snapshot</code> manually or from system cron. If the snapshot is
                    older than ~9 days, payouts fall back to live counts until the next run.
                    {config.volumePricingWeeklySnapshotAt
                      ? ` Last snapshot: ${new Date(config.volumePricingWeeklySnapshotAt).toLocaleString()} · ${config.volumePricingWeeklySnapshotCount ?? 0} jobs.`
                      : ' No snapshot yet — run the script once or wait for the scheduler.'}
                  </>
                ) : (
                  <>
                    Optional: switch to weekly snapshot to avoid counting delivered jobs on every payout. Enable weekly mode here, then keep the
                    scheduler or external cron running.
                  </>
                )}
              </Typography>
            </CardContent>
          </Card>
        </>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Per-cargo price history</Typography>
        <Typography variant="body2" component="div">
          The app only stores the <strong>current</strong> values on each <code>CargoMarketRate</code> row.
          A full <strong>audit history</strong> (who changed which cargo to which €/(t·km), and when) is not onerous to add: append-only collection or
          versioned documents plus a small hook on create/update, plus a read API and this page could show a timeline. Expect ongoing storage growth
          and a bit of admin UI work; it is a moderate feature, not a rewrite.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
            <Box>
              <Typography fontWeight={700}>Override rates ({ratesTotal})</Typography>
              {unpricedCatalog.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {unpricedCatalog.length} catalog cargo{unpricedCatalog.length === 1 ? '' : 's'} without a row yet—add one below.
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button size="small" variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
                Add rate
              </Button>
              <TextField
                size="small"
                placeholder="Search rates…"
                value={ratesSearch}
                onChange={(e) => setRatesSearch(e.target.value)}
              />
            </Stack>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          {ratesLoading && <LinearProgress sx={{ mb: 1 }} />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cargo</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="right">€/(t·km)</TableCell>
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
                  <TableCell align="right">{r.pricePerKm != null ? Number(r.pricePerKm).toLocaleString() : '—'}</TableCell>
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
                      No rates match. Add a row or clear search.
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
                      {o.cargoId || 'no id'}{o.count ? ` · ${o.count} jobs` : ''}{o.pricePerKm != null ? ` · €${o.pricePerKm}/(t·km)` : ''}
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
              label="Price per tonne·km (€)"
              type="number"
              value={form.pricePerKm}
              onChange={(e) => setForm((p) => ({ ...p, pricePerKm: e.target.value }))}
              fullWidth
              required
              helperText="Revenue uses distance × cargo tonnes × this rate (tonnes default to 1 if mass missing). Volume pricing multiplies this rate when enabled."
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
