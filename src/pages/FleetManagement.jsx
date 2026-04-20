import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import GarageOutlinedIcon from '@mui/icons-material/GarageOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import BuildIcon from '@mui/icons-material/Build';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link as RouterLink } from 'react-router-dom';
import TruckThumbAvatar from '../components/TruckThumbAvatar';
import {
  getOwnedTrucksFleet,
  getFleetDeliveries,
  payTruckMaintenance,
} from '../services/fleetService';
import { getItemWithExpiry } from '../localStorageWithExpiry';

const T = {
  surface: '#111113',
  border: '#27272A',
  text: '#FAFAFA',
  textMuted: '#71717A',
  textFaint: '#52525B',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.08)',
  success: '#22C55E',
  info: '#38BDF8',
  danger: '#ef4444',
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '8px',
  boxShadow: 'none',
};

const sxLabel = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.textMuted,
};

export default function FleetManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [divisionId, setDivisionId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesNote, setDeliveriesNote] = useState('');
  const [maintainTarget, setMaintainTarget] = useState(null);
  const [maintainBusy, setMaintainBusy] = useState(false);
  const [maintainError, setMaintainError] = useState('');
  const [feedback, setFeedback] = useState('');

  const user = useMemo(() => getItemWithExpiry('user') || {}, []);
  const secondaryRoles = Array.isArray(user?.secondaryRoles) ? user.secondaryRoles : [];
  const leadsDivisionId = user?.leadsDivision?._id || null;
  const isLeaderOfThis =
    !!divisionId && leadsDivisionId && String(leadsDivisionId) === String(divisionId);

  const loadTrucks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOwnedTrucksFleet();
      const list = Array.isArray(data?.ownedTrucks) ? data.ownedTrucks : [];
      setTrucks(list);
      setDivisionId(data?.divisionId || null);
      setSelectedId((prev) => {
        if (prev && list.some((t) => String(t._id || t.divisionTruckId) === String(prev))) {
          return prev;
        }
        return list[0]?._id || list[0]?.divisionTruckId || null;
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load your division fleet.');
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrucks();
  }, [loadTrucks]);

  const loadDeliveries = useCallback(async (divisionTruckId) => {
    if (!divisionTruckId) {
      setDeliveries([]);
      return;
    }
    setDeliveriesLoading(true);
    setDeliveriesNote('');
    try {
      const data = await getFleetDeliveries(divisionTruckId, 40);
      if (data?.message) setDeliveriesNote(data.message);
      setDeliveries(Array.isArray(data?.deliveries) ? data.deliveries : []);
    } catch (e) {
      setDeliveries([]);
      setDeliveriesNote(e.response?.data?.message || 'Could not load deliveries for this truck.');
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadDeliveries(selectedId);
  }, [selectedId, loadDeliveries]);

  const selected = trucks.find(
    (t) => t && String(t._id || t.divisionTruckId) === String(selectedId)
  );
  const totalOdo = trucks.reduce((sum, t) => sum + (Number(t.odometerKm) || 0), 0);
  const totalDeliveries = trucks.reduce((sum, t) => sum + (Number(t.deliveriesCount) || 0), 0);
  const blockedCount = trucks.filter((t) => t.blocked).length;

  const handleConfirmMaintain = async () => {
    if (!maintainTarget || !divisionId) return;
    setMaintainBusy(true);
    setMaintainError('');
    try {
      const truckId = maintainTarget._id || maintainTarget.divisionTruckId;
      const data = await payTruckMaintenance(divisionId, truckId);
      setFeedback(
        data?.message ||
          `Truck serviced. Division wallet debited ${Number(data?.amount || 0).toLocaleString()} tokens.`
      );
      setMaintainTarget(null);
      await loadTrucks();
    } catch (e) {
      setMaintainError(e?.response?.data?.message || 'Maintenance failed.');
    } finally {
      setMaintainBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', py: 3 }}>
      <Container maxWidth="lg">
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: T.accentDim,
                  color: T.accent,
                }}
              >
                <GarageOutlinedIcon />
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}
              >
                Division fleet
              </Typography>
              {isLeaderOfThis && (
                <Chip size="small" color="warning" label="You lead this division" />
              )}
            </Stack>
            <Typography sx={{ color: T.textMuted, maxWidth: 620, fontSize: '0.95rem' }}>
              Trucks are owned by your division. Every member can drive them and their deliveries
              add to the fleet odometer. Wear accumulates with kilometers driven and triggers
              maintenance, which the division leader pays from the division wallet.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => loadTrucks()}
            sx={{ borderColor: T.border, color: T.text }}
          >
            Refresh
          </Button>
        </Stack>

        {feedback && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setFeedback('')}>
            {feedback}
          </Alert>
        )}
        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !divisionId && !error && (
          <Alert
            severity="info"
            sx={{ mb: 2, bgcolor: T.surface, border: `1px solid ${T.border}`, color: T.text }}
            action={
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/divisions"
              >
                Browse divisions
              </Button>
            }
          >
            You are not part of a division yet. Trucks are now owned at the division level — join
            one to share its fleet.
          </Alert>
        )}

        {!loading && divisionId && !trucks.length && !error && (
          <Alert
            severity="info"
            sx={{ mb: 2, bgcolor: T.surface, border: `1px solid ${T.border}`, color: T.text }}
            action={
              isLeaderOfThis ? (
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  component={RouterLink}
                  to="/trucks/marketplace"
                >
                  Truck marketplace
                </Button>
              ) : null
            }
          >
            Your division does not own any trucks yet.
            {isLeaderOfThis
              ? ' As the leader, you can purchase trucks from the marketplace using the division wallet.'
              : ' Your leader can purchase trucks from the marketplace using the division wallet.'}
          </Alert>
        )}

        {trucks.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Trucks in fleet</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: T.text }}>
                    {trucks.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Fleet odometer</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: T.text }}>
                    {Math.round(totalOdo).toLocaleString()} km
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Matched deliveries</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: T.text }}>
                    {totalDeliveries.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Blocked for maintenance</Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: blockedCount ? T.danger : T.success,
                    }}
                  >
                    {blockedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {trucks.length > 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Typography sx={{ ...sxLabel, mb: 1.5 }}>Fleet</Typography>
              <Stack spacing={1.5}>
                {trucks.map((t) => {
                  const id = String(t._id || t.divisionTruckId || '');
                  const active = id === String(selectedId);
                  const wearPercent = Math.min(
                    100,
                    Math.round((Number(t.wearKm || 0) / Number(t.wearThresholdKm || 1)) * 100)
                  );
                  return (
                    <Card
                      key={id || t.displayName}
                      onClick={() => id && setSelectedId(id)}
                      sx={{
                        ...sxCard,
                        cursor: id ? 'pointer' : 'default',
                        outline: active ? `2px solid ${T.accent}` : 'none',
                        '&:hover': id ? { borderColor: T.textMuted } : {},
                      }}
                    >
                      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TruckThumbAvatar
                          key={`${id}-${t.image || ''}-${t.brandLogo || ''}`}
                          image={t.image}
                          brandLogo={t.brandLogo}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography sx={{ fontWeight: 700, color: T.text }} noWrap>
                              {t.displayName ||
                                `${t.brandName || ''} ${t.modelName || ''}`.trim() ||
                                'Truck'}
                            </Typography>
                            {t.blocked ? (
                              <Chip
                                size="small"
                                color="error"
                                icon={<BlockIcon sx={{ fontSize: '16px !important' }} />}
                                label="Maintenance required"
                              />
                            ) : wearPercent >= 70 ? (
                              <Chip
                                size="small"
                                color="warning"
                                label={`Wear ${wearPercent}%`}
                              />
                            ) : (
                              <Chip
                                size="small"
                                color="success"
                                icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                                label="Operational"
                              />
                            )}
                          </Stack>
                          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              icon={<StraightenIcon sx={{ fontSize: '16px !important' }} />}
                              label={`${Math.round(Number(t.odometerKm) || 0).toLocaleString()} km`}
                              sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: T.text }}
                            />
                            <Chip
                              size="small"
                              icon={<LocalShippingIcon sx={{ fontSize: '16px !important' }} />}
                              label={`${Number(t.deliveriesCount) || 0} jobs`}
                              sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: T.text }}
                            />
                            <Tooltip
                              title={`Wear ${Number(t.wearKm || 0).toLocaleString()} / ${Number(
                                t.wearThresholdKm || 0
                              ).toLocaleString()} km`}
                            >
                              <Chip
                                size="small"
                                label={`Wear ${wearPercent}%`}
                                sx={{
                                  bgcolor:
                                    wearPercent >= 100
                                      ? 'rgba(239,68,68,0.15)'
                                      : wearPercent >= 70
                                      ? 'rgba(234,179,8,0.15)'
                                      : 'rgba(34,197,94,0.15)',
                                  color: T.text,
                                }}
                              />
                            </Tooltip>
                          </Stack>
                          {t.purchasedAt && (
                            <Typography
                              variant="caption"
                              sx={{ color: T.textMuted, display: 'block', mt: 0.75 }}
                            >
                              Purchased {new Date(t.purchasedAt).toLocaleDateString()}
                            </Typography>
                          )}
                          {isLeaderOfThis && t.blocked && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<BuildIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setMaintainTarget(t);
                              }}
                              sx={{ mt: 1 }}
                            >
                              Pay maintenance
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Grid>

            <Grid item xs={12} md={7}>
              <Typography sx={{ ...sxLabel, mb: 1.5 }}>Delivery log (matched)</Typography>
              <Paper sx={{ ...sxCard, overflow: 'hidden' }}>
                {selected && (
                  <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${T.border}` }}>
                    <Typography sx={{ fontWeight: 700, color: T.text }}>
                      {selected.displayName || selected.brandName || 'Truck'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: T.textMuted }}>
                      Jobs listed here were attributed to this division truck when the delivery
                      webhook ran. Odometer increases only after the truck was purchased.
                    </Typography>
                  </Box>
                )}
                {deliveriesNote && (
                  <Alert severity="info" sx={{ m: 2, bgcolor: 'transparent', color: T.text }}>
                    {deliveriesNote}
                  </Alert>
                )}
                {deliveriesLoading && <LinearProgress />}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: T.textMuted, fontWeight: 700 }}>Job</TableCell>
                        <TableCell sx={{ color: T.textMuted, fontWeight: 700 }}>Rider</TableCell>
                        <TableCell sx={{ color: T.textMuted, fontWeight: 700 }}>Route</TableCell>
                        <TableCell align="right" sx={{ color: T.textMuted, fontWeight: 700 }}>
                          km
                        </TableCell>
                        <TableCell sx={{ color: T.textMuted, fontWeight: 700 }}>When</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!deliveries.length && !deliveriesLoading && (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ color: T.textMuted, border: 0 }}>
                            No matched deliveries yet for this truck. Any member's delivery on this
                            model will be attributed here once processed.
                          </TableCell>
                        </TableRow>
                      )}
                      {deliveries.map((row) => (
                        <TableRow key={row.jobID} hover>
                          <TableCell sx={{ color: T.text, fontWeight: 600 }}>
                            #{row.jobID}
                          </TableCell>
                          <TableCell sx={{ color: T.textMuted }}>
                            {row.riderName || '—'}
                          </TableCell>
                          <TableCell sx={{ color: T.textMuted }}>
                            {row.route?.from || '—'} → {row.route?.to || '—'}
                            {row.cargo ? (
                              <Typography
                                component="span"
                                variant="caption"
                                display="block"
                                sx={{ color: T.textFaint }}
                              >
                                {row.cargo}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell align="right" sx={{ color: T.info, fontWeight: 600 }}>
                            {Math.round(Number(row.distanceKm) || 0).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: T.textMuted }}>
                            {row.completedAt ? new Date(row.completedAt).toLocaleString() : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      <Dialog
        open={Boolean(maintainTarget)}
        onClose={() => !maintainBusy && setMaintainTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Pay for maintenance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Service <strong>{maintainTarget?.displayName || maintainTarget?.modelName}</strong>?
            The division wallet will be debited for the maintenance cost and the truck will be
            cleared for duty. Division tax will resume collecting from matching jobs.
          </DialogContentText>
          {maintainError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {maintainError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintainTarget(null)} disabled={maintainBusy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmMaintain}
            disabled={maintainBusy}
            startIcon={<BuildIcon />}
          >
            {maintainBusy ? 'Paying…' : 'Confirm payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
