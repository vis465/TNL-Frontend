import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import { Link as RouterLink } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from 'recharts';
import axiosInstance from '../utils/axios';

function defaultFuelMarket() {
  return {
    normal: {
      pricePerLiter: 1,
      coveragePerLiter: 1,
      label: 'Standard',
      description: '',
    },
    premium: {
      pricePerLiter: 3,
      coveragePerLiter: 1.35,
      deliveryGraceBurn: 12,
      label: 'Premium',
      description: '',
    },
  };
}

export default function AdminFuelMarket() {
  const [fuelMarket, setFuelMarket] = useState(defaultFuelMarket);
  const [priceSeries, setPriceSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cfgRes, phRes] = await Promise.all([
        axiosInstance.get('/admin/cargo-rates/revenue-config'),
        axiosInstance.get('/fuel-market/price-history', { params: { limit: 120 } }),
      ]);
      const base = defaultFuelMarket();
      const fm = cfgRes.data?.fuelMarket;
      if (fm && typeof fm === 'object') {
        setFuelMarket({
          normal: { ...base.normal, ...fm.normal },
          premium: { ...base.premium, ...fm.premium },
        });
      } else {
        setFuelMarket(base);
      }
      const items = phRes.data?.items || [];
      setPriceSeries(
        items.map((row) => ({
          ...row,
          label: row.at
            ? new Date(row.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : '',
        }))
      );
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load fuel settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await axiosInstance.patch('/admin/cargo-rates/revenue-config', { fuelMarket });
      setSaved(true);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const setNormal = (patch) => {
    setFuelMarket((p) => ({
      ...p,
      normal: { ...p.normal, ...patch },
    }));
  };

  const setPremium = (patch) => {
    setFuelMarket((p) => ({
      ...p,
      premium: { ...p.premium, ...patch },
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <LocalGasStation color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight={800}>
          Division fuel pricing
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 640 }}>
        Global token prices and coverage for standard and premium fuel. Divisions buy at these rates on the fuel marketplace.
        Saving records a price-history point when values change.
      </Typography>
      <Button component={RouterLink} to="/admin/cargo-rates" variant="text" size="small" sx={{ mb: 2 }}>
        ← Cargo rates & full revenue config
      </Button>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaved(false)}>
          Fuel market saved.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            Standard (normal)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Tokens per liter"
                type="number"
                value={fuelMarket.normal.pricePerLiter ?? ''}
                onChange={(e) => setNormal({ pricePerLiter: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Coverage per liter"
                type="number"
                helperText="Job burn offset per 1 L stored"
                inputProps={{ step: 0.01, min: 0.01 }}
                value={fuelMarket.normal.coveragePerLiter ?? ''}
                onChange={(e) => setNormal({ coveragePerLiter: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Display label"
                value={fuelMarket.normal.label ?? ''}
                onChange={(e) => setNormal({ label: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                multiline
                minRows={2}
                value={fuelMarket.normal.description ?? ''}
                onChange={(e) => setNormal({ description: e.target.value })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            Premium
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Tokens per liter"
                type="number"
                value={fuelMarket.premium.pricePerLiter ?? ''}
                onChange={(e) => setPremium({ pricePerLiter: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Coverage per liter"
                type="number"
                inputProps={{ step: 0.01, min: 0.01 }}
                value={fuelMarket.premium.coveragePerLiter ?? ''}
                onChange={(e) => setPremium({ coveragePerLiter: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Delivery grace (liters)"
                type="number"
                helperText="How many liters of a finished job might not be taken from the tanks if premium is still in stock (0–500)."
                inputProps={{ min: 0, max: 500, step: 1 }}
                value={fuelMarket.premium.deliveryGraceBurn ?? ''}
                onChange={(e) =>
                  setPremium({
                    deliveryGraceBurn: Math.min(500, Math.max(0, Math.floor(Number(e.target.value) || 0))),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Display label"
                value={fuelMarket.premium.label ?? ''}
                onChange={(e) => setPremium({ label: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                multiline
                minRows={2}
                value={fuelMarket.premium.description ?? ''}
                onChange={(e) => setPremium({ description: e.target.value })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={save} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save fuel pricing'}
        </Button>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Reload
        </Button>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Token price history
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Points are added when saved values differ from the previous snapshot. Divisions see the same series on the fuel
            marketplace.
          </Typography>
          {priceSeries.length > 0 ? (
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={priceSeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normalPrice" name="Standard tokens/L" stroke="#1976d2" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="premiumPrice" name="Premium tokens/L" stroke="#9c27b0" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No history yet. Save once to record the first snapshot.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
