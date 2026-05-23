import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { getLot, placeBid, getMySummary } from '../services/cargoBidsService';
import CargoBidCountdown from '../components/cargoBids/CargoBidCountdown';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { canPlaceBid, isBiddingClosed, getSessionPhaseLabel } from '../utils/cargoBidUi';

export default function CargoBidLotDetail() {
  const { lotId } = useParams();
  const [detail, setDetail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [bidOpen, setBidOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const [d, s] = await Promise.all([getLot(lotId), getMySummary().catch(() => null)]);
      setDetail(d);
      setSummary(s);
      if (d?.lot?.minNextBid) setAmount(String(d.lot.minNextBid));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }, [lotId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  const phase = detail?.phase;
  const lot = detail?.lot;
  const session = detail?.session;
  const biddingOpen = canPlaceBid(phase) && lot?.status === 'open';
  const biddingClosed = isBiddingClosed(phase);

  const minBid = Number(lot?.minNextBid) || 1;

  const handleBid = async () => {
    const tokens = Math.floor(Number(amount));
    if (!Number.isFinite(tokens) || tokens < minBid) {
      setError(`Bid must be at least ${minBid} tokens`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await placeBid(lotId, tokens);
      setBidOpen(false);
      await load();
    } catch (e) {
      const data = e.response?.data;
      const hint = data?.minNextBid != null ? ` (minimum ${data.minNextBid} tokens)` : '';
      setError((data?.message || e.message) + hint);
      if (data?.minNextBid != null) setAmount(String(data.minNextBid));
    } finally {
      setSubmitting(false);
    }
  };

  const openBidDialog = () => {
    setAmount(String(lot?.minNextBid ?? 1));
    setBidOpen(true);
  };

  if (!lot) {
    return (
      <Container sx={{ py: 4 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/cargo-bids" size="small" sx={{ mb: 2 }}>
        ← Back to auctions
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {biddingClosed && (
        <Alert severity="warning" icon={<LockOutlined />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Bidding closed — {getSessionPhaseLabel(phase)}
          </Typography>
          <Typography variant="body2">
            This lot is no longer accepting bids. Final results are shown below.
            {phase === 'fulfillment' && ' Winners may still deliver in-game for the multiplier.'}
          </Typography>
        </Alert>
      )}

      <Card
        sx={{
          mb: 3,
          border: biddingClosed ? 2 : 0,
          borderColor: biddingClosed ? 'warning.dark' : 'transparent',
          opacity: biddingClosed ? 0.95 : 1,
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h4">{lot.cargoName}</Typography>
            {biddingClosed && (
              <Chip icon={<LockOutlined />} label="Closed" color="warning" size="small" />
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip label={`${lot.revenueMultiplier}× on delivery`} color="success" />
            <Chip label={`Reference ~€${lot.basePriceEur}`} variant="outlined" />
            <Chip label={`${lot.winnersCount} winner slot(s)`} />
          </Stack>

          {phase === 'preview' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">Planning phase — bidding not open yet.</Alert>
              <CargoBidCountdown
                targetDate={session?.biddingStartsAt}
                prefix="Bidding opens in "
              />
            </Box>
          )}

          {biddingOpen && (
            <Box sx={{ mt: 2 }}>
              <CargoBidCountdown targetDate={session?.biddingEndsAt} prefix="Closes in " />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Min next bid: <strong>{lot.minNextBid}</strong> tokens · High:{' '}
                <strong>{lot.currentHighBid || 0}</strong>
                {lot.myRank ? ` · Your rank #${lot.myRank}` : ''}
              </Typography>
              {summary && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Balance: {summary.balance} · Escrow held: {summary.escrowHeld}
                </Typography>
              )}
              <Button variant="contained" sx={{ mt: 2 }} onClick={openBidDialog}>
                {lot.myBid ? 'Raise bid' : 'Place bid'}
              </Button>
            </Box>
          )}

          {biddingClosed && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Final high bid: <strong>{lot.currentHighBid || 0}</strong> tokens ·{' '}
                {lot.bidderCount || 0} bidder(s)
                {lot.myBid ? ` · Your bid: ${lot.myBid.amountTokens} (${lot.myBid.status})` : ''}
              </Typography>
              {phase === 'fulfillment' && session?.fulfillmentEndsAt && (
                <CargoBidCountdown
                  targetDate={session.fulfillmentEndsAt}
                  prefix="Fulfillment ends in "
                />
              )}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            If you win, your <strong>first</strong> matching delivery earns multiplied revenue (before
            standard deductions). One delivery per win — then the slot is released.
          </Typography>
        </CardContent>
      </Card>

      {detail.leaderboard?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {biddingClosed ? 'Final leaderboard' : 'Leaderboard'}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Rider</TableCell>
                  <TableCell align="right">Bid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail.leaderboard.map((row) => (
                  <TableRow key={row.rank} selected={row.isYou}>
                    <TableCell>{row.rank}</TableCell>
                    <TableCell>{row.isYou ? 'You' : row.riderLabel}</TableCell>
                    <TableCell align="right">{row.amountTokens}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={bidOpen} onClose={() => setBidOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Place bid — {lot.cargoName}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Tokens"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: minBid, step: 1 }}
            helperText={`Minimum ${minBid} tokens (held in escrow while you lead)`}
            error={amount !== '' && Number(amount) < minBid}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBidOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={submitting || amount === '' || Number(amount) < minBid}
            onClick={handleBid}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
