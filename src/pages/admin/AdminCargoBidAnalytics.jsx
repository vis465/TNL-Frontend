import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { adminSessionAnalytics } from '../../services/cargoBidsService';
import { getSessionPhaseLabel } from '../../utils/cargoBidUi';

export default function AdminCargoBidAnalytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminSessionAnalytics(id)
      .then(setData)
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, [id]);

  if (!data && !error) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Loading…</Typography>
      </Container>
    );
  }

  const { session, kpis, perLot, bidsTimeline, recentEvents } = data || {};

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={RouterLink} to={`/admin/cargo-bids/sessions/${id}`} size="small" sx={{ mb: 2 }}>
        ← Session
      </Button>
      <Typography variant="h5" gutterBottom>
        Analytics — {session?.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Phase: {getSessionPhaseLabel(session?.phase)} · Status: {session?.status}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
        {[
          ['Lots', kpis?.lotCount],
          ['Bidders', kpis?.uniqueBidders],
          ['Total bids', kpis?.totalBids],
          ['Escrow held', kpis?.escrowHeld],
          ['Awards', kpis?.awardsCreated],
          ['Fulfilled', kpis?.awardsFulfilled],
          ['Pending delivery', kpis?.awardsPending],
        ].map(([label, val]) => (
          <Grid item xs={6} sm={4} md={3} key={label}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h5">{val ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Per cargo
      </Typography>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cargo</TableCell>
              <TableCell>Bidders</TableCell>
              <TableCell>Bids</TableCell>
              <TableCell>High</TableCell>
              <TableCell>Fulfilled</TableCell>
              <TableCell>Pending</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(perLot || []).map((row) => (
              <TableRow key={row.lot._id}>
                <TableCell>{row.lot.cargoName}</TableCell>
                <TableCell>{row.bidderCount}</TableCell>
                <TableCell>{row.bidCount}</TableCell>
                <TableCell>{row.highBid}</TableCell>
                <TableCell>{row.fulfilled}</TableCell>
                <TableCell>{row.pending}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {bidsTimeline?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bids over time
          </Typography>
          <Paper sx={{ p: 2 }}>
            {bidsTimeline.map((b) => (
              <Typography key={b.hour} variant="body2">
                {b.hour}: {b.count} bid(s)
              </Typography>
            ))}
          </Paper>
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Recent activity
      </Typography>
      <Paper variant="outlined">
        {(recentEvents || []).slice(0, 20).map((ev) => (
          <Box key={ev._id} sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2">
              {ev.type} · {new Date(ev.createdAt).toLocaleString()}
            </Typography>
          </Box>
        ))}
        {!recentEvents?.length && (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No events yet.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
