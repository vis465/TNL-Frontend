import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import {
  canPlaceBid,
  isBiddingClosed,
  formatCargoClass,
  getIllustrativePayoutEur,
  getMyBidLabel,
} from '../../utils/cargoBidUi';

export default function CargoBidLotCard({ lot, phase }) {
  const theme = useTheme();
  const biddingOpen = canPlaceBid(phase) && (lot.status === 'open' || !lot.status);
  const closed = isBiddingClosed(phase);
  const mult = Number(lot.revenueMultiplier) || 1;
  const illustrative = getIllustrativePayoutEur(lot.basePriceEur, mult);
  const myBid = getMyBidLabel(lot, phase);
  const highBid = Number(lot.currentHighBid) || 0;
  const bidders = Number(lot.bidderCount) || 0;
  const winners = Number(lot.winnersCount) || 1;
  const competitionPct = winners > 0 ? Math.min(100, (bidders / Math.max(winners, 1)) * 25) : 0;

  const accent = closed
    ? theme.palette.grey[600]
    : lot.highlight || mult >= 2.5
      ? theme.palette.success.main
      : theme.palette.primary.main;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ...(!closed && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }),
        borderColor: lot.myBid?.status === 'active' && biddingOpen ? accent : closed ? 'warning.dark' : 'divider',
        bgcolor: closed ? alpha(theme.palette.grey[500], 0.06) : 'background.paper',
        filter: closed ? 'grayscale(0.35)' : 'none',
      }}
    >
      <Box sx={{ height: 4, bgcolor: accent }} />

      {closed && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
          }}
        >
          <Chip
            size="small"
            icon={<LockOutlined />}
            label="Bidding closed"
            color="warning"
            variant="filled"
          />
        </Box>
      )}

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0, flex: 1, pr: closed ? 4 : 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
              <LocalShippingOutlined fontSize="small" color="action" />
              <Typography variant="h6" fontWeight={700} noWrap title={lot.cargoName}>
                {lot.cargoName}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={formatCargoClass(lot.cargoClass)} variant="outlined" />
              {lot.highlight && !closed && (
                <Chip size="small" label="Featured" color="warning" variant="filled" />
              )}
            </Stack>
          </Box>
          <Chip
            size="small"
            icon={<TrendingUpOutlined />}
            label={`${mult}×`}
            color={closed ? 'default' : 'success'}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          />
        </Stack>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: closed
              ? alpha(theme.palette.grey[500], 0.1)
              : alpha(theme.palette.success.main, 0.08),
            border: `1px solid ${
              closed ? alpha(theme.palette.grey[500], 0.25) : alpha(theme.palette.success.main, 0.2)
            }`,
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            {closed ? 'Win multiplier (winners)' : 'Illustrative win payout'}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            color={closed ? 'text.primary' : 'success.main'}
          >
            ~€{illustrative}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ref. ~€{lot.basePriceEur} base × {mult}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mt: 2 }}>
          {lot.pricePerKm != null && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Market rate
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                €{lot.pricePerKm}/t·km
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Winner slots
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Top {winners}
            </Typography>
          </Stack>
        </Stack>

        {(biddingOpen || closed) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {closed ? 'Final high bid' : 'Current high bid'}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {highBid > 0 ? `${highBid} tokens` : 'No bids'}
                </Typography>
              </Stack>
              {biddingOpen && lot.minNextBid != null && (
                <Typography variant="caption" color="text.secondary">
                  Min. next bid: <strong>{lot.minNextBid}</strong> tokens
                </Typography>
              )}
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupsOutlined fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  {bidders} bidder{bidders !== 1 ? 's' : ''}
                </Typography>
              </Stack>
              {biddingOpen && (
                <LinearProgress
                  variant="determinate"
                  value={competitionPct}
                  color="primary"
                  sx={{ height: 6, borderRadius: 1 }}
                />
              )}
              {lot.myRank != null && (
                <Chip
                  size="small"
                  icon={<EmojiEventsOutlined />}
                  label={`Your rank #${lot.myRank}`}
                  color={lot.myRank <= winners ? 'success' : 'default'}
                  variant={lot.myRank <= winners ? 'filled' : 'outlined'}
                />
              )}
            </Stack>
          </>
        )}

        {myBid && (
          <Chip size="small" label={myBid.text} color={myBid.color} sx={{ mt: 2 }} />
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={biddingOpen ? 'contained' : 'outlined'}
          component={RouterLink}
          to={`/cargo-bids/lots/${lot._id}`}
          size="medium"
          color={closed ? 'inherit' : 'primary'}
        >
          {biddingOpen
            ? lot.myBid
              ? 'Raise bid'
              : 'Place bid'
            : closed
              ? 'View results'
              : 'View & plan'}
        </Button>
      </CardActions>
    </Card>
  );
}
