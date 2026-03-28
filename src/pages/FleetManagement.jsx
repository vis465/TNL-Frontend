import React, { useCallback, useEffect, useState } from 'react';
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
  Button
} from '@mui/material';
import GarageOutlinedIcon from '@mui/icons-material/GarageOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link as RouterLink } from 'react-router-dom';
import TruckThumbAvatar from '../components/TruckThumbAvatar';
import { getOwnedTrucksFleet, getFleetDeliveries } from '../services/fleetService';

const T = {
  // bg: '#0A0A0B',
  surface: '#111113',
  border: '#27272A',
  text: '#FAFAFA',
  textMuted: '#71717A',
  textFaint: '#52525B',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.08)',
  success: '#22C55E',
  info: '#38BDF8'
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '8px',
  boxShadow: 'none'
};

const sxLabel = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.textMuted
};

export default function FleetManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesNote, setDeliveriesNote] = useState('');

  const loadTrucks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOwnedTrucksFleet();
      const list = Array.isArray(data?.ownedTrucks) ? data.ownedTrucks : [];
      setTrucks(list);
      setSelectedId((prev) => {
        if (prev) return prev;
        const firstId = list[0]?.truckItemId || list[0]?.truckItemID;
        return firstId ? String(firstId) : null;
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load your fleet.');
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrucks();
  }, [loadTrucks]);

  const loadDeliveries = useCallback(async (truckItemId) => {
    if (!truckItemId) {
      setDeliveries([]);
      return;
    }
    setDeliveriesLoading(true);
    setDeliveriesNote('');
    try {
      const data = await getFleetDeliveries(truckItemId, 40);
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

  const selected = trucks.find((t) => t && String(t.truckItemId || t.truckItemID) === String(selectedId));
  const totalOdo = trucks.reduce((sum, t) => sum + (Number(t.odometerKm) || 0), 0);
  const totalDeliveries = trucks.reduce((sum, t) => sum + (Number(t.deliveriesCount) || 0), 0);

  return (
    <Box sx={{ minHeight: '100%', py: 3 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
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
                  color: T.accent
                }}
              >
                <GarageOutlinedIcon />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
                Fleet
              </Typography>
            </Stack>
            <Typography sx={{ color: T.textMuted, maxWidth: 560, fontSize: '0.95rem' }}>
              Owned trucks, odometer since purchase, and deliveries that matched your marketplace truck after Hub
              webhooks ran.
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

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !trucks.length && !error && (
          <Alert
            severity="info"
            sx={{ mb: 2, bgcolor: T.surface, border: `1px solid ${T.border}`, color: T.text }}
            action={
              <Button color="inherit" size="small" variant="outlined" component={RouterLink} to="/trucks/marketplace">
                Truck marketplace
              </Button>
            }
          >
            You do not own any marketplace trucks yet. Buy a model in the truck marketplace; deliveries completed
            in-game with that truck will add to its odometer here.
          </Alert>
        )}

        {trucks.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Trucks owned</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: T.text }}>
                    {trucks.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Fleet odometer</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: T.text }}>
                    {Math.round(totalOdo).toLocaleString()} km
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={sxCard}>
                <CardContent>
                  <Typography sx={sxLabel}>Matched deliveries</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: T.text }}>
                    {totalDeliveries.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {trucks.length > 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Typography sx={{ ...sxLabel, mb: 1.5 }}>Your trucks</Typography>
              <Stack spacing={1.5}>
                {trucks.map((t) => {
                  const id = String(t.truckItemId || t.truckItemID || '');
                  const active = id === String(selectedId);
                  return (
                    <Card
                      key={id || t.displayName}
                      onClick={() => id && setSelectedId(id)}
                      sx={{
                        ...sxCard,
                        cursor: id ? 'pointer' : 'default',
                        outline: active ? `2px solid ${T.accent}` : 'none',
                        '&:hover': id ? { borderColor: T.textMuted } : {}
                      }}
                    >
                      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TruckThumbAvatar
                          key={`${id}-${t.image || ''}-${t.brandLogo || ''}`}
                          image={t.image}
                          brandLogo={t.brandLogo}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, color: T.text }} noWrap>
                            {t.displayName || `${t.brandName || ''} ${t.modelName || ''}`.trim() || 'Truck'}
                          </Typography>
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
                          </Stack>
                          {t.purchasedAt && (
                            <Typography variant="caption" sx={{ color: T.textMuted, display: 'block', mt: 0.75 }}>
                              Purchased {new Date(t.purchasedAt).toLocaleDateString()}
                            </Typography>
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
                      Job IDs listed here were tied to this owned truck when the delivery webhook ran. Odometer only
                      increases after your purchase date.
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
                          <TableCell colSpan={4} sx={{ color: T.textMuted, border: 0 }}>
                            No matched deliveries yet for this truck. Complete a job in the owned model after purchase.
                          </TableCell>
                        </TableRow>
                      )}
                      {deliveries.map((row) => (
                        <TableRow key={row.jobID} hover>
                          <TableCell sx={{ color: T.text, fontWeight: 600 }}>#{row.jobID}</TableCell>
                          <TableCell sx={{ color: T.textMuted }}>
                            {row.route?.from || '—'} → {row.route?.to || '—'}
                            {row.cargo ? (
                              <Typography component="span" variant="caption" display="block" sx={{ color: T.textFaint }}>
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
    </Box>
  );
}
