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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
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
import { getCatalogMeta, listCatalog, syncCatalog } from '../services/cargoService';
import {
  AdminEmptyState,
  AdminFilterBar,
  AdminPageHeader,
  AdminRangeSlider,
  AdminSyncBanner,
  useAdminFeedback,
} from '../components/admin/primitives';

const CLASSES = ['default', 'general', 'heavy', 'liquid', 'food', 'fragile', 'hazardous'];
const RATES_PAGE_SIZE = 25;
const CATALOG_PAGE_SIZE = 50;
const TABS = [
  { id: 0, label: 'Catalog & rates' },
  { id: 1, label: 'Platform settings' },
  { id: 2, label: 'Announcements' },
];

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

function cargoWeightTonnes(row) {
  if (row?.weightTonnes != null && Number.isFinite(row.weightTonnes)) return row.weightTonnes;
  if (row?.weight != null && Number.isFinite(row.weight)) return row.weight;
  return null;
}

export default function AdminCargoRates() {
  const { showSuccess, showError, Feedback } = useAdminFeedback();
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalogMeta, setCatalogMeta] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [rates, setRates] = useState([]);
  const [ratesTotal, setRatesTotal] = useState(0);
  const [ratesPage, setRatesPage] = useState(1);
  const [ratesSearch, setRatesSearch] = useState('');
  const debouncedRatesSearch = useDebounced(ratesSearch, 300);
  const [ratesLoading, setRatesLoading] = useState(false);

  const [catalog, setCatalog] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogSearch, setCatalogSearch] = useState('');
  const debouncedCatalogSearch = useDebounced(catalogSearch, 300);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [gameType, setGameType] = useState('');
  const [division, setDivision] = useState('');
  const [hasRate, setHasRate] = useState('');
  const [catalogSort, setCatalogSort] = useState('');
  const [weightRange, setWeightRange] = useState([0, 100]);
  const [weightBounds, setWeightBounds] = useState({ min: 0, max: 100 });
  const debouncedWeightRange = useDebounced(weightRange, 400);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [dialogCatalogSearch, setDialogCatalogSearch] = useState('');
  const [form, setForm] = useState(emptyPricing);
  const [submitting, setSubmitting] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [clearingBroadcast, setClearingBroadcast] = useState(false);
  const [rateExtremes, setRateExtremes] = useState({ highest: null, lowest: null });

  const reqRef = useRef({ rates: 0, catalog: 0 });
  const metaLoadedRef = useRef(false);

  const loadConfig = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/cargo-rates/revenue-config');
      setConfig(data);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load config');
    }
  };

  const loadCatalogMeta = async () => {
    try {
      const data = await getCatalogMeta();
      setCatalogMeta(data);
      if (!metaLoadedRef.current && data?.weightRange) {
        const min = data.weightRange.min ?? 0;
        const max = data.weightRange.max ?? 100;
        setWeightBounds({ min, max });
        setWeightRange([min, max]);
        metaLoadedRef.current = true;
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load catalog metadata');
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
          weightMin: debouncedWeightRange[0] !== weightBounds.min ? debouncedWeightRange[0] : undefined,
          weightMax: debouncedWeightRange[1] !== weightBounds.max ? debouncedWeightRange[1] : undefined,
        },
      });
      if (seq !== reqRef.current.rates) return;
      setRates(data.items || data.rates || []);
      setRatesTotal(data.total ?? (data.items?.length || 0));
    } catch (e) {
      if (seq !== reqRef.current.rates) return;
      showError(e?.response?.data?.message || 'Failed to load rates');
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
      const [wMin, wMax] = debouncedWeightRange;
      const data = await listCatalog({
        page: catalogPage,
        limit: CATALOG_PAGE_SIZE,
        q: debouncedCatalogSearch || undefined,
        weightMin: wMin !== weightBounds.min ? wMin : undefined,
        weightMax: wMax !== weightBounds.max ? wMax : undefined,
        gameType: gameType || undefined,
        division: division.trim() || undefined,
        hasRate: hasRate || undefined,
        sort: catalogSort || undefined,
      });
      if (seq !== reqRef.current.catalog) return;
      setCatalog(data.items || []);
      setCatalogTotal(data.total ?? (data.items?.length || 0));
    } catch (e) {
      if (seq !== reqRef.current.catalog) return;
      showError(e?.response?.data?.message || 'Failed to load catalog');
    } finally {
      if (seq === reqRef.current.catalog) setCatalogLoading(false);
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    try {
      await Promise.all([loadConfig(), loadCatalogMeta(), loadRates(), loadCatalog(), loadRateExtremes()]);
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
  }, [ratesPage, debouncedRatesSearch, debouncedWeightRange]);

  useEffect(() => {
    if (debouncedRatesSearch) setRatesPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRatesSearch]);

  useEffect(() => {
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogPage, debouncedCatalogSearch, debouncedWeightRange, gameType, division, hasRate, catalogSort]);

  useEffect(() => {
    if (debouncedCatalogSearch || gameType || division || hasRate) setCatalogPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCatalogSearch, gameType, division, hasRate, debouncedWeightRange]);

  const handleSyncCatalog = async () => {
    setSyncing(true);
    try {
      const result = await syncCatalog();
      showSuccess(
        `Catalog synced — ${result?.total ?? result?.inserted ?? 0} cargos`
        + (result?.inserted != null ? ` (${result.inserted} new, ${result.updated ?? 0} updated)` : ''),
      );
      await loadCatalogMeta();
      await Promise.all([loadCatalog(), loadRates(), loadRateExtremes()]);
    } catch (e) {
      showError(e?.response?.data?.message || 'Catalog sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const resetCatalogFilters = () => {
    setCatalogSearch('');
    setGameType('');
    setDivision('');
    setHasRate('');
    setCatalogSort('');
    setWeightRange([weightBounds.min, weightBounds.max]);
    setCatalogPage(1);
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', config);
      setConfig(data);
      showSuccess('Revenue settings saved.');
    } catch (e) {
      showError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSavingConfig(false);
    }
  };

  const saveGlobalBannerOnly = async () => {
    setSavingBanner(true);
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', {
        globalMemberAnnouncement: config.globalMemberAnnouncement ?? '',
      });
      setConfig(data);
      showSuccess('Announcement saved.');
    } catch (e) {
      showError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSavingBanner(false);
    }
  };

  const dismissCargoBroadcast = async () => {
    setClearingBroadcast(true);
    try {
      const { data } = await axiosInstance.patch('/admin/cargo-rates/revenue-config', {
        clearCargoRatesRefreshBroadcast: true,
      });
      setConfig(data);
      showSuccess('Broadcast dismissed.');
    } catch (e) {
      showError(e?.response?.data?.message || 'Dismiss failed');
    } finally {
      setClearingBroadcast(false);
    }
  };

  const refreshAll = () => {
    initialLoad();
  };

  const openCreate = () => {
    setDialogMode('create');
    setSelectedCargo(null);
    setDialogCatalogSearch('');
    setForm(emptyPricing);
    setDialogOpen(true);
  };

  const openEdit = (rate) => {
    setDialogMode('edit');
    setSelectedCargo(null);
    setDialogCatalogSearch(rate.cargoName || '');
    setForm({
      cargoId: rate.cargoId || '',
      cargoName: rate.cargoName || '',
      cargoClass: rate.cargoClass || 'general',
      pricePerKm: String(rate.pricePerKm ?? ''),
      active: rate.active !== false,
      _id: rate._id,
      weightTonnes: cargoWeightTonnes(rate),
    });
    setDialogOpen(true);
  };

  const openSetPriceFromCatalog = (row) => {
    setDialogMode(row.hasRate ? 'edit' : 'create');
    setSelectedCargo(row);
    setDialogCatalogSearch(row.cargoName || row.cargoId || '');
    setForm({
      cargoId: row.cargoId || row.externalId || '',
      cargoName: row.cargoName || '',
      cargoClass: row.cargoClass || 'general',
      pricePerKm: row.pricePerKm != null ? String(row.pricePerKm) : '',
      active: row.active !== false,
      _id: row.rateId || undefined,
      weightTonnes: cargoWeightTonnes(row),
    });
    setDialogOpen(true);
  };

  const onCatalogPick = (val) => {
    setSelectedCargo(val || null);
    if (!val) return;
    setForm((p) => ({
      ...p,
      cargoId: val.cargoId || val.externalId || '',
      cargoName: val.cargoName || '',
      cargoClass: val.cargoClass || p.cargoClass || 'general',
      pricePerKm: val.pricePerKm != null ? String(val.pricePerKm) : p.pricePerKm,
      active: val.active !== false,
      _id: val.rateId || undefined,
      weightTonnes: cargoWeightTonnes(val),
    }));
    if (val.hasRate) setDialogMode('edit');
  };

  const saveDialog = async () => {
    setSubmitting(true);
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
      showSuccess('Rate saved.');
      loadRates();
      loadCatalog();
      loadRateExtremes();
    } catch (e) {
      showError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeRate = async (id) => {
    if (!window.confirm('Delete this rate?')) return;
    try {
      await axiosInstance.delete(`/admin/cargo-rates/rates/${id}`);
      showSuccess('Rate deleted.');
      loadRates();
      loadCatalog();
      loadRateExtremes();
    } catch (e) {
      showError(e?.response?.data?.message || 'Delete failed');
    }
  };

  const unpricedOnPage = useMemo(() => catalog.filter((c) => !c.hasRate), [catalog]);
  const ratesPageCount = Math.max(1, Math.ceil(ratesTotal / RATES_PAGE_SIZE));
  const catalogPageCount = Math.max(1, Math.ceil(catalogTotal / CATALOG_PAGE_SIZE));

  const description = (
    <>
      Rates are <strong>€ per tonne·km</strong> (global default plus per-cargo/class overrides), then platform-wide volume pricing.
      Normalized revenue is <code style={{ margin: '0 4px' }}>distance × tonnes × effective €/(t·km)</code>
      {' '}(tonnes from cargo mass when present, otherwise 1 for legacy jobs). Token deductions apply afterward.
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>
      <AdminPageHeader
        description={description}
        actions={(
          <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={refreshAll} disabled={loading}>
            Refresh data
          </Button>
        )}
      />

      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.id} value={t.id} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {activeTab === 0 && (
        <>
          <AdminSyncBanner
            lastSyncedAt={catalogMeta?.lastSyncedAt}
            count={catalogMeta?.count}
            weightRange={catalogMeta?.weightRange}
            onSync={handleSyncCatalog}
            syncing={syncing}
          />

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1.5 }}>Active rate range</Typography>
              {!rateExtremes.highest && !rateExtremes.lowest ? (
                <Typography variant="body2" color="text.secondary">No active cargo rate rows yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
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
                    <Box sx={{ p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
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
              )}
            </CardContent>
          </Card>

          <AdminFilterBar
            search={{
              value: catalogSearch,
              onChange: setCatalogSearch,
              placeholder: 'Search catalog…',
            }}
            onReset={resetCatalogFilters}
          >
            <AdminRangeSlider
              label="Weight (tonnes)"
              min={weightBounds.min}
              max={weightBounds.max}
              value={weightRange}
              onChange={setWeightRange}
              step={1}
            />
            <TextField
              select
              size="small"
              label="Game"
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              sx={{ minWidth: 110 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ETS2">ETS2</MenuItem>
              <MenuItem value="ATS">ATS</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Division"
              placeholder="e.g. Heavy Haul"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              sx={{ minWidth: 140 }}
            />
            <TextField
              select
              size="small"
              label="Priced"
              value={hasRate}
              onChange={(e) => setHasRate(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Has rate</MenuItem>
              <MenuItem value="false">Unpriced</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Sort"
              value={catalogSort}
              onChange={(e) => setCatalogSort(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">Name</MenuItem>
              <MenuItem value="weight">Weight</MenuItem>
              <MenuItem value="pricePerKm">Your €/(t·km)</MenuItem>
              <MenuItem value="jobCount">Fleet jobs</MenuItem>
            </TextField>
          </AdminFilterBar>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
                <Box>
                  <Typography fontWeight={700}>catalog ({catalogTotal.toLocaleString()})</Typography>
                  {unpricedOnPage.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {unpricedOnPage.length} on this page without a rate row yet.
                    </Typography>
                  )}
                </Box>
                <Button size="small" variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
                  Add rate
                </Button>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              {catalogLoading && <LinearProgress sx={{ mb: 1 }} />}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Game</TableCell>
                    <TableCell>Division</TableCell>
                    <TableCell align="right">Weight (t)</TableCell>
                    {/* <TableCell align="right">Nexon €/km</TableCell> */}
                    <TableCell align="right">Fleet jobs</TableCell>
                    <TableCell align="right">Your €/(t·km)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {catalog.map((row) => {
                    const wt = cargoWeightTonnes(row);
                    const jobCount = row.jobCount ?? row.count ?? 0;
                    const nexonRef = row.finalPrice ?? row.basePrice;
                    return (
                      <TableRow key={row.externalId || row.cargoId || row.cargoName} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{row.cargoName || '(unknown)'}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.cargoId || row.externalId || '—'}</Typography>
                        </TableCell>
                        <TableCell>{row.gameType || '—'}</TableCell>
                        <TableCell>{row.division || '—'}</TableCell>
                        <TableCell align="right">{wt != null ? wt.toLocaleString() : '—'}</TableCell>
                        {/* <TableCell align="right">{nexonRef != null ? Number(nexonRef).toLocaleString() : '—'}</TableCell> */}
                        <TableCell align="right">{jobCount ? jobCount.toLocaleString() : '—'}</TableCell>
                        <TableCell align="right">
                          {row.pricePerKm != null ? Number(row.pricePerKm).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          {row.hasRate ? (
                            <Chip size="small" color={row.active !== false ? 'success' : 'default'} label={row.active !== false ? 'Priced' : 'Inactive'} />
                          ) : (
                            <Chip size="small" variant="outlined" label="Unpriced" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" onClick={() => openSetPriceFromCatalog(row)}>
                            {row.hasRate ? 'Edit price' : 'Set price'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!catalog.length && !catalogLoading && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ border: 0 }}>
                        <AdminEmptyState
                          title="No catalog cargos match"
                          description="Sync from Nexon or adjust filters."
                          action={(
                            <Button variant="contained" onClick={handleSyncCatalog} disabled={syncing}>
                              Sync from Nexon
                            </Button>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {catalogPageCount > 1 && (
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Pagination
                    size="small"
                    count={catalogPageCount}
                    page={catalogPage}
                    onChange={(_, p) => setCatalogPage(p)}
                    color="primary"
                  />
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
                <Typography fontWeight={700}>Override rates ({ratesTotal})</Typography>
                <TextField
                  size="small"
                  placeholder="Search rates…"
                  value={ratesSearch}
                  onChange={(e) => setRatesSearch(e.target.value)}
                />
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
                      <TableCell colSpan={5} sx={{ border: 0 }}>
                        <AdminEmptyState title="No rates match" description="Add a row or clear search." />
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

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Per-cargo price history</Typography>
            <Typography variant="body2" component="div">
              The app only stores the <strong>current</strong> values on each <code>CargoMarketRate</code> row.
              A full audit history is a moderate follow-up feature.
            </Typography>
          </Alert>
        </>
      )}

      {activeTab === 1 && config && (
        <>
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
                  helperText="Cap on division levy after platform fee (e.g. 85 ⇒ rider keeps ≥85%). Empty = no cap."
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
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Platform volume pricing (fleet-wide)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 720 }}>
                Uses <strong>platform-wide</strong> completed deliveries in a rolling window. Higher fleet activity lowers €/(t·km).
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
                <TextField size="small" label="Lookback window (days)" type="number" value={config.volumePricingWindowDays ?? 7} onChange={(e) => setConfig((p) => ({ ...p, volumePricingWindowDays: Number(e.target.value) }))} inputProps={{ min: 0.1, step: 0.1 }} />
                <TextField size="small" label="Min multiplier (floor)" type="number" value={config.volumePricingMinMultiplier ?? 0.75} onChange={(e) => setConfig((p) => ({ ...p, volumePricingMinMultiplier: Number(e.target.value) }))} inputProps={{ min: 0.01, max: 1, step: 0.01 }} />
                <TextField size="small" label="Reference job count (global)" type="number" value={config.volumePricingReferenceJobs ?? 1000} onChange={(e) => setConfig((p) => ({ ...p, volumePricingReferenceJobs: Math.max(1, Math.floor(Number(e.target.value) || 1)) }))} inputProps={{ min: 1, step: 1 }} />
                <TextField select size="small" label="Fleet job count for multiplier" value={config.volumePricingJobCountMode || 'live'} onChange={(e) => setConfig((p) => ({ ...p, volumePricingJobCountMode: e.target.value }))} sx={{ minWidth: 260 }}>
                  <MenuItem value="live">Live (recount each job)</MenuItem>
                  <MenuItem value="weekly_snapshot">Weekly snapshot (scheduler / cron)</MenuItem>
                </TextField>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                {config.volumePricingJobCountMode === 'weekly_snapshot' ? (
                  <>
                    Uses the last platform job count from the scheduler (default every 168h).
                    {config.volumePricingWeeklySnapshotAt
                      ? ` Last snapshot: ${new Date(config.volumePricingWeeklySnapshotAt).toLocaleString()} · ${config.volumePricingWeeklySnapshotCount ?? 0} jobs.`
                      : ' No snapshot yet — run cargo-rates:weekly-snapshot or wait for the scheduler.'}
                  </>
                ) : (
                  <>Optional: switch to weekly snapshot to avoid counting delivered jobs on every payout.</>
                )}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>Division fuel market</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
                Standard and premium token prices, coverage, delivery grace, and price history are managed on a dedicated page.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/admin/fuel-market">
                Open division fuel pricing
              </Button>
            </CardContent>
          </Card>

          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" onClick={saveConfig} disabled={savingConfig}>
              {savingConfig ? 'Saving…' : 'Save platform settings'}
            </Button>
          </Stack>
        </>
      )}

      {activeTab === 2 && config && (
        <Card>
          <CardContent>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>Site-wide division banner</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              One message for every division’s public page and for My division. The volume snapshot scheduler also writes a short notice here after each run.
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
            <Button variant="outlined" sx={{ mt: 1.5 }} onClick={saveGlobalBannerOnly} disabled={savingBanner}>
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
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'edit' ? 'Edit rate' : 'Add / update rate'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={catalog}
              value={selectedCargo}
              inputValue={dialogCatalogSearch}
              getOptionLabel={(o) => (o ? `${o.cargoName || o.cargoId || '?'}${(o.jobCount ?? o.count) ? ` · ${o.jobCount ?? o.count} jobs` : ''}` : '')}
              isOptionEqualToValue={(a, b) => (a?.cargoId || a?.externalId) === (b?.cargoId || b?.externalId) && a?.cargoName === b?.cargoName}
              onChange={(_, v) => onCatalogPick(v)}
              onInputChange={(_, v, reason) => {
                if (reason === 'input' || reason === 'clear') {
                  setDialogCatalogSearch(v);
                }
              }}
              filterOptions={(x) => x}
              renderOption={(props, o) => (
                <li {...props}>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {o.cargoName || '(unknown)'} {o.hasRate && <Chip size="small" color="success" label="priced" sx={{ ml: 1 }} />}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.cargoId || o.externalId || 'no id'}
                      {(o.jobCount ?? o.count) ? ` · ${o.jobCount ?? o.count} jobs` : ''}
                      {cargoWeightTonnes(o) != null ? ` · ${cargoWeightTonnes(o)} t` : ''}
                      {o.pricePerKm != null ? ` · €${o.pricePerKm}/(t·km)` : ''}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pick cargo from catalog"
                  helperText="Type to search; auto-fills name/id/class. You can still enter a custom cargo below."
                />
              )}
            />
            {form.weightTonnes != null && (
              <TextField
                label="Catalog weight (tonnes)"
                value={form.weightTonnes}
                fullWidth
                InputProps={{ readOnly: true }}
                helperText="Display only — pricing still uses job mass at payout."
              />
            )}
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
              helperText="Revenue uses distance × cargo tonnes × this rate."
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

      <Feedback />
    </Container>
  );
}
