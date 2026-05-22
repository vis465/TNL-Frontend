import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Link,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import axiosInstance from '../../utils/axios';
import MagicPageShell from '../../components/magicui/MagicPageShell';

const MODE_OPTIONS = [
  {
    value: 'ledger',
    label: 'Ledger totals',
    help: 'Best when FleetTruckDeliveryLedger already has delivery rows. Sets counters from ledger sums.',
  },
  {
    value: 'replay',
    label: 'Job replay',
    help: 'Replays delivered jobs after truck purchase using the same matching rules as live fleet odometer.',
  },
  {
    value: 'purchase-age',
    label: 'Purchase age estimate',
    help: 'Sets km from days since purchase × km/day. Use when job history is missing.',
  },
];

function buildPayload({ mode, division, merge, kmPerDay }) {
  return {
    mode,
    divisionId: division?._id || undefined,
    merge,
    kmPerDay: Number(kmPerDay) || 400,
  };
}

export default function FleetOdometerBackfill() {
  const [searchParams] = useSearchParams();
  const prefillDivisionId = searchParams.get('divisionId') || '';

  const [divisions, setDivisions] = useState([]);
  const [division, setDivision] = useState(null);
  const [mode, setMode] = useState('replay');
  const [merge, setMerge] = useState(true);
  const [kmPerDay, setKmPerDay] = useState('400');
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const modeMeta = MODE_OPTIONS.find((m) => m.value === mode) || MODE_OPTIONS[1];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingDivisions(true);
      try {
        const { data } = await axiosInstance.get('/divisions');
        const list = data.divisions || [];
        if (!cancelled) {
          setDivisions(list);
          if (prefillDivisionId) {
            const hit = list.find((d) => String(d._id) === prefillDivisionId);
            if (hit) setDivision(hit);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load divisions');
      } finally {
        if (!cancelled) setLoadingDivisions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefillDivisionId]);

  const runPreview = useCallback(async () => {
    setPreviewing(true);
    setError('');
    try {
      const { data } = await axiosInstance.post(
        '/admin/fleet-odometer-backfill/preview',
        buildPayload({ mode, division, merge, kmPerDay })
      );
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e?.response?.data?.message || 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  }, [mode, division, merge, kmPerDay]);

  const runApply = async () => {
    setApplying(true);
    setError('');
    try {
      const { data } = await axiosInstance.post(
        '/admin/fleet-odometer-backfill/apply',
        buildPayload({ mode, division, merge, kmPerDay })
      );
      setResult(data);
      setApplyOpen(false);
    } catch (e) {
      setError(e?.response?.data?.message || 'Apply failed');
    } finally {
      setApplying(false);
    }
  };

  const rows = result?.rows || [];
  const canApply = rows.length > 0 && !previewing && !applying;

  const summaryChips = useMemo(() => {
    if (!result) return null;
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={`Scanned ${result.scannedTrucks} trucks`} />
        <Chip
          size="small"
          color={result.plannedChanges > 0 ? 'warning' : 'default'}
          label={`${result.plannedChanges} planned change${result.plannedChanges === 1 ? '' : 's'}`}
        />
        {result.apply && (
          <Chip size="small" color="success" label={`Applied ${result.appliedChanges}`} />
        )}
      </Stack>
    );
  }, [result]);

  return (
    <MagicPageShell
      title="Fleet odometer backfill"
      subtitle="Preview counter updates, then apply when the table looks correct."
    >
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          Maintenance
        </Link>
        <Typography color="text.primary">Fleet odometer</Typography>
      </Breadcrumbs>

      <Button
        component={RouterLink}
        to="/admin/operations"
        startIcon={<ArrowBackOutlined />}
        size="small"
        sx={{ mb: 2 }}
      >
        All tools
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              options={divisions}
              loading={loadingDivisions}
              value={division}
              onChange={(_, v) => setDivision(v)}
              getOptionLabel={(d) => d?.name || d?.slug || 'Division'}
              isOptionEqualToValue={(a, b) => String(a?._id) === String(b?._id)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Division (recommended)"
                  placeholder="All divisions if empty"
                  helperText="Scope to one division to keep preview fast and safer."
                />
              )}
            />

            <TextField
              select
              label="Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              helperText={modeMeta.help}
              fullWidth
            >
              {MODE_OPTIONS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>

            {mode === 'purchase-age' && (
              <TextField
                type="number"
                label="Km per day"
                value={kmPerDay}
                onChange={(e) => setKmPerDay(e.target.value)}
                inputProps={{ min: 0, step: 10 }}
                fullWidth
              />
            )}

            {mode !== 'ledger' && (
              <FormControlLabel
                control={<Switch checked={merge} onChange={(e) => setMerge(e.target.checked)} />}
                label="Merge with existing (use higher odometer / delivery counts)"
              />
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={previewing ? <CircularProgress size={18} color="inherit" /> : <PlayArrowOutlined />}
                onClick={runPreview}
                disabled={previewing || applying}
              >
                Preview changes
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<SaveOutlined />}
                disabled={!canApply}
                onClick={() => setApplyOpen(true)}
              >
                Apply {rows.length ? `(${rows.length})` : ''}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {(previewing || applying) && <LinearProgress sx={{ mb: 2 }} />}

      {result && (
        <Box>
          {summaryChips}
          {result.modeDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {result.modeDescription}
            </Typography>
          )}
          {result.hint && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {result.hint}
            </Alert>
          )}

          <TableContainer component={Card} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Division</TableCell>
                  <TableCell>Truck</TableCell>
                  <TableCell align="right">Odometer km</TableCell>
                  <TableCell align="right">Deliveries</TableCell>
                  <TableCell>Blocked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.divisionTruckId} hover>
                    <TableCell>{row.divisionName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.truckLabel}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.truckItemId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {row.curOdometerKm} → <strong>{row.nextOdometerKm}</strong>
                    </TableCell>
                    <TableCell align="right">
                      {row.curDeliveries} → <strong>{row.nextDeliveries}</strong>
                    </TableCell>
                    <TableCell>
                      {row.curBlocked ? 'yes' : 'no'} → <strong>{row.nextBlocked ? 'yes' : 'no'}</strong>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No changes needed for this scope and mode.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={applyOpen} onClose={() => !applying && setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply fleet odometer backfill?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            This will update <strong>{rows.length}</strong> division truck record
            {rows.length === 1 ? '' : 's'} ({modeMeta.label}
            {division ? ` · ${division.name}` : ' · all divisions'}).
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Changes are logged in audit logs. You can run preview again after apply to verify.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)} disabled={applying}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={runApply} disabled={applying}>
            {applying ? 'Applying…' : 'Apply now'}
          </Button>
        </DialogActions>
      </Dialog>
    </MagicPageShell>
  );
}
