import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { getMyAwards } from '../services/cargoBidsService';
import CargoBidCountdown from '../components/cargoBids/CargoBidCountdown';
import { isAwardConsumable } from '../utils/cargoBidUi';

export default function CargoBidMyAwards() {
  const [awards, setAwards] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyAwards()
      .then(setAwards)
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);

  const active = awards.filter((a) => isAwardConsumable(a));
  const done = awards.filter((a) => !isAwardConsumable(a));

  const renderCard = (a) => (
    <Grid item xs={12} md={6} key={a._id}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h6">{a.lot?.cargoName || a.cargoName}</Typography>
            <Chip
              size="small"
              label={a.status}
              color={a.status === 'fulfilled' ? 'success' : a.status === 'active' ? 'primary' : 'default'}
            />
          </Stack>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {a.revenueMultiplier}× revenue on <strong>one</strong> matching delivery
          </Typography>
          {a.status === 'active' && (
            <Box sx={{ mt: 2 }}>
              <CargoBidCountdown targetDate={a.fulfillmentEndsAt} prefix="Deliver within " />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Progress: {a.deliveriesUsed || 0}/1
              </Typography>
            </Box>
          )}
          {a.status === 'fulfilled' && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Slot released — repeat hauls pay normal rates.
              {a.fulfilledJobId ? ` Job #${a.fulfilledJobId}` : ''}
            </Typography>
          )}
          <Button component={RouterLink} to="/jobs" size="small" sx={{ mt: 2 }}>
            View jobs
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/cargo-bids" size="small" sx={{ mb: 2 }}>
        ← Auctions
      </Button>
      <Typography variant="h5" gutterBottom>
        My awards
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Active — deliver once
      </Typography>
      {!active.length && <Alert severity="info">No active awards.</Alert>}
      <Grid container spacing={2}>
        {active.map(renderCard)}
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
        Completed / expired
      </Typography>
      <Grid container spacing={2}>
        {done.map(renderCard)}
      </Grid>
    </Container>
  );
}
