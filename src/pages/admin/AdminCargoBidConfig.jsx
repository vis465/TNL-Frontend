import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { adminGetConfig, adminPatchConfig } from '../../services/cargoBidsService';

export default function AdminCargoBidConfig() {
  const [config, setConfig] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetConfig().then(setConfig).catch((e) => setError(e.message));
  }, []);

  const save = async () => {
    try {
      const data = await adminPatchConfig(config);
      setConfig(data);
      setMsg('Saved');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  if (!config) {
    return (
      <Container sx={{ py: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Container>
    );
  }

  const field = (key, label, type = 'number') => (
    <Grid item xs={12} sm={6} md={4} key={key}>
      <TextField
        fullWidth
        type={type}
        label={label}
        value={config[key] ?? ''}
        onChange={(e) =>
          setConfig({
            ...config,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          })
        }
      />
    </Grid>
  );

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Button component={RouterLink} to="/admin/cargo-bids" size="small" sx={{ mb: 2 }}>
        ← Sessions
      </Button>
      <Typography variant="h5" gutterBottom>
        Cargo auction settings
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {field('maxLotsPerSession', 'Max lots per session')}
          {field('defaultWinnersPerLot', 'Default winners per lot')}
          {field('maxWinnersPerLot', 'Max winners per lot')}
          {field('minBidIncrementTokens', 'Min bid increment')}
          {field('defaultRevenueMultiplier', 'Default multiplier')}
          {field('minRevenueMultiplier', 'Min multiplier')}
          {field('maxRevenueMultiplier', 'Max multiplier')}
          {field('fulfillmentWindowHours', 'Fulfillment window (hours)')}
          {field('antiSnipeExtensionMinutes', 'Anti-snipe (minutes)')}
          {field('minPreviewHours', 'Min preview (hours)')}
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
