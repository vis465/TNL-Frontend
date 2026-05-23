import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import { getActiveSession, getMySummary } from '../services/cargoBidsService';
import CargoBidCountdown from '../components/cargoBids/CargoBidCountdown';
import CargoBidLotCard from '../components/cargoBids/CargoBidLotCard';
import {
  getSessionPhaseLabel,
  getPhaseDescription,
  getPhaseColor,
  canPlaceBid,
  isBiddingClosed,
} from '../utils/cargoBidUi';

const SORT_OPTIONS = [
  { value: 'multiplier', label: 'Highest multiplier' },
  { value: 'payout', label: 'Highest illustrative payout' },
  { value: 'competition', label: 'Most bidders' },
  { value: 'name', label: 'Cargo name (A–Z)' },
];

function StatTile({ icon, label, value, sub }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
        {icon}
        <Typography variant="caption" textTransform="uppercase" letterSpacing={0.6}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

export default function CargoBidHub() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('multiplier');

  const load = useCallback(async () => {
    try {
      setError('');
      const [sessionData, summaryData] = await Promise.all([
        getActiveSession(),
        getMySummary().catch(() => null),
      ]);
      setData(sessionData);
      setSummary(summaryData);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const session = data?.session;
  const phase = data?.phase || session?.phase;
  const lots = data?.lots || [];

  const sortedLots = useMemo(() => {
    const copy = [...lots];
    switch (sortBy) {
      case 'payout':
        copy.sort(
          (a, b) =>
            (Number(b.basePriceEur) || 0) * (Number(b.revenueMultiplier) || 1) -
            (Number(a.basePriceEur) || 0) * (Number(a.revenueMultiplier) || 1)
        );
        break;
      case 'competition':
        copy.sort((a, b) => (Number(b.bidderCount) || 0) - (Number(a.bidderCount) || 0));
        break;
      case 'name':
        copy.sort((a, b) => String(a.cargoName).localeCompare(String(b.cargoName)));
        break;
      default:
        copy.sort((a, b) => (Number(b.revenueMultiplier) || 0) - (Number(a.revenueMultiplier) || 0));
    }
    return copy;
  }, [lots, sortBy]);

  const myActiveBids = lots.filter((l) => l.myBid?.status === 'active').length;
  const myLeading = lots.filter(
    (l) => l.myRank === 1 && l.myBid?.status === 'active' && canPlaceBid(phase)
  ).length;

  const countdownTarget =
    phase === 'preview'
      ? session?.biddingStartsAt
      : phase === 'bidding'
        ? session?.biddingEndsAt
        : phase === 'fulfillment'
          ? session?.fulfillmentEndsAt
          : null;

  const countdownPrefix =
    phase === 'preview'
      ? 'Bidding opens in '
      : phase === 'bidding'
        ? 'Bidding closes in '
        : phase === 'fulfillment'
          ? 'Deliver within '
          : '';

  const biddingClosed = isBiddingClosed(phase);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header band */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.background.paper, 1)} 60%)`,
          borderBottom: 1,
          borderColor: 'divider',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                  }}
                >
                  <GavelIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800}>
                    Cargo auctions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bid on premium cargos · Win multiplied revenue on your first delivery
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                component={RouterLink}
                to="/cargo-bids/my-bids"
                variant="outlined"
                startIcon={<GavelIcon />}
              >
                My bids
              </Button>
              <Button
                component={RouterLink}
                to="/cargo-bids/my-awards"
                variant="outlined"
                startIcon={<EmojiEventsOutlined />}
              >
                My awards
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={load} aria-label="Refresh">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && !session && !error && (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Inventory2Outlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No active auction
            </Typography>
            <Typography color="text.secondary" maxWidth={480} mx="auto">
              There is no cargo auction in preview or bidding right now. Check back when admins
              publish the next session.
            </Typography>
          </Paper>
        )}

        {session && !loading && (
          <>
            {biddingClosed && (
              <Alert
                severity="warning"
                icon={<LockOutlined />}
                sx={{ mb: 2, border: 1, borderColor: 'warning.main' }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Bidding is closed
                </Typography>
                <Typography variant="body2">
                  {phase === 'fulfillment'
                    ? 'Winners can still complete deliveries. New bids are not accepted.'
                    : 'This auction is no longer accepting bids. View results below or check My awards.'}
                </Typography>
              </Alert>
            )}

            {/* Session hero */}
            <Card
              sx={{
                mb: 3,
                background: biddingClosed
                  ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
                  : `linear-gradient(120deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
                color: 'common.white',
                opacity: biddingClosed ? 0.92 : 1,
                border: biddingClosed ? `2px solid ${theme.palette.warning.dark}` : 'none',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                  >
                    <Box>
                      <Chip
                        label={getSessionPhaseLabel(phase)}
                        color={getPhaseColor(phase)}
                        size="small"
                        sx={{ mb: 1, fontWeight: 600 }}
                      />
                      <Typography variant="h5" fontWeight={700}>
                        {session.title}
                      </Typography>
                      {session.description && (
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.85, maxWidth: 560 }}>
                          {session.description}
                        </Typography>
                      )}
                    </Box>
                    {(countdownTarget || biddingClosed) && (
                      <Box textAlign={{ xs: 'left', sm: 'right' }}>
                        {biddingClosed && phase === 'closed' ? (
                          <Chip
                            icon={<LockOutlined />}
                            label="Bidding closed"
                            color="warning"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <>
                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
                              {countdownPrefix.trim()}
                            </Typography>
                            <CargoBidCountdown
                              targetDate={countdownTarget}
                              prefix=""
                              variant="hero"
                              expiredLabel={phase === 'preview' ? 'Opening…' : 'Ended'}
                            />
                          </>
                        )}
                      </Box>
                    )}
                  </Stack>

                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {getPhaseDescription(phase)}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <StatTile
                        icon={<Inventory2Outlined fontSize="small" />}
                        label="Cargos"
                        value={lots.length}
                        sub="in this session"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatTile
                        icon={<ScheduleOutlined fontSize="small" />}
                        label="Window"
                        value={
                          session.biddingStartsAt
                            ? new Date(session.biddingStartsAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'
                        }
                        sub={
                          session.biddingEndsAt
                            ? `ends ${new Date(session.biddingEndsAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}`
                            : ''
                        }
                      />
                    </Grid>
                    {summary && (
                      <>
                        <Grid item xs={6} sm={3}>
                          <StatTile
                            icon={<AccountBalanceWalletOutlined fontSize="small" />}
                            label="Wallet"
                            value={`${summary.balance ?? 0}`}
                            sub="tokens available"
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <StatTile
                            icon={<LockOutlined fontSize="small" />}
                            label="In escrow"
                            value={`${summary.escrowHeld ?? 0}`}
                            sub="locked on bids"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            {/* Personal quick stats during bidding */}
            {canPlaceBid(phase) && (myActiveBids > 0 || myLeading > 0) && (
              <Alert severity="success" sx={{ mb: 2 }} icon={<GavelIcon />}>
                You have <strong>{myActiveBids}</strong> active bid{myActiveBids !== 1 ? 's' : ''}
                {myLeading > 0 && (
                  <>
                    {' '}
                    · leading on <strong>{myLeading}</strong> lot{myLeading !== 1 ? 's' : ''}
                  </>
                )}
              </Alert>
            )}

            <Accordion
              defaultExpanded={phase === 'preview'}
              sx={{ mb: 3 }}
              disableGutters
              elevation={0}
              variant="outlined"
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InfoOutlined fontSize="small" color="action" />
                  <Typography fontWeight={600}>How cargo auctions work</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {[
                    {
                      step: '1',
                      title: 'Planning',
                      text: 'Admins list cargos with reference prices and win multipliers. Study lots before bidding opens.',
                    },
                    {
                      step: '2',
                      title: 'Bid',
                      text: 'During the live window, place token bids. Escrow holds your amount while you are the high bidder.',
                    },
                    {
                      step: '3',
                      title: 'Win',
                      text: 'Top bidders per cargo win a slot. Losers are refunded when the window closes.',
                    },
                    {
                      step: '4',
                      title: 'Deliver once',
                      text: 'Haul the matching cargo in-game. Your first delivery gets the multiplier before normal deductions.',
                    },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.step}>
                      <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Chip label={item.step} size="small" sx={{ mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.text}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Lots toolbar */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight={700}>
                Available cargos ({lots.length})
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Sort by</InputLabel>
                <Select label="Sort by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {lots.length === 0 && (
              <Alert severity="info">No cargo lots in this session yet.</Alert>
            )}

            <Grid container spacing={2.5}>
              {sortedLots.map((lot) => (
                <Grid item xs={12} sm={6} lg={4} key={lot._id}>
                  <CargoBidLotCard lot={lot} phase={phase} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
