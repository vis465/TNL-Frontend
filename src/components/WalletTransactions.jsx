import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Stack, IconButton,
  LinearProgress, alpha
} from '@mui/material';
import {
  AccountBalanceWallet, TrendingUp, TrendingDown,
  ExpandMore, ExpandLess, Refresh, Receipt
} from '@mui/icons-material';

const font = "'Montserrat', sans-serif";

const T = {
  bg: '#09090B',
  surface: '#111113',
  surfaceAlt: '#0F0F11',
  surfaceHover: '#1A1A1D',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.1)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textFaint: '#3F3F46',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.06)',
  success: '#34D399',
  successDim: 'rgba(52,211,153,0.08)',
  info: '#60A5FA',
  danger: '#FB7185',
  dangerDim: 'rgba(251,113,133,0.08)',
  warning: '#FBBF24',
  radius: '10px',
  radiusSm: '6px',
  radiusXs: '4px',
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  boxShadow: 'none',
  transition: 'border-color 0.2s ease',
  '&:hover': { borderColor: T.borderHover },
  height: '100%',
};

const sxLabel = {
  fontFamily: font,
  fontSize: '0.65rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: T.textMuted,
};

const WalletTransactions = ({ wallet, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const walletTransactions = Array.isArray(wallet?.transactions) ? wallet.transactions : [];
    const recent = walletTransactions.slice(0, 10);
    const totalCredits = recent.filter((tx) => tx.type === 'credit').length;
    const totalDebits = recent.filter((tx) => tx.type === 'debit').length;
    setTransactions(recent);
    setStats({ totalTransactions: recent.length, totalCredits, totalDebits });
  }, [wallet]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setLoading(true);
      setError('');
      await onRefresh();
    } catch (err) {
      setError('Failed to refresh transactions');
    } finally {
      setLoading(false);
    }
  };

  const isCredit = (tx) => tx.type === 'credit' && tx.source?.kind !== 'admin_deduction';
  const getTxColor = (tx) => isCredit(tx) ? T.success : T.danger;
  const getTxBg = (tx) => isCredit(tx) ? T.successDim : T.dangerDim;

  const getSourceLabel = (tx) => {
    if (tx.source?.kind === 'admin_deduction') return 'Admin';
    const map = { job: 'Job', adjustment: 'Adjust', purchase: 'Purchase' };
    return map[tx.source?.kind] || 'Manual';
  };

  if (loading && !transactions.length) {
    return (
      <Card sx={sxCard}>
        <CardContent sx={{ p: '20px !important' }}>
          <LinearProgress sx={{
            bgcolor: T.border, borderRadius: 1,
            '& .MuiLinearProgress-bar': { bgcolor: T.accent, borderRadius: 1 },
          }} />
          <Typography sx={{ ...sxLabel, mt: 1.5 }}>Loading transactions...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sxCard}>
      <CardContent sx={{ p: '20px !important' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: T.accentDim, borderRadius: T.radiusSm, color: T.accent,
            }}>
              <AccountBalanceWallet sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontFamily: font, fontSize: '0.85rem', fontWeight: 700, color: T.text }}>
              Recent Transactions
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={handleRefresh} disabled={loading}
              sx={{ color: T.textMuted, '&:hover': { color: T.text, bgcolor: T.surfaceHover } }}>
              <Refresh sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}
              sx={{ color: T.textMuted, '&:hover': { color: T.text, bgcolor: T.surfaceHover } }}>
              {expanded ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Stats chips */}
        {stats && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: '10px', py: '4px', borderRadius: T.radiusXs,
              bgcolor: T.successDim, border: `1px solid ${alpha(T.success, 0.15)}`,
            }}>
              <TrendingUp sx={{ fontSize: 12, color: T.success }} />
              <Typography sx={{ fontFamily: font, fontSize: '0.65rem', fontWeight: 600, color: T.success }}>
                {stats.totalCredits} Credits
              </Typography>
            </Box>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: '10px', py: '4px', borderRadius: T.radiusXs,
              bgcolor: T.dangerDim, border: `1px solid ${alpha(T.danger, 0.15)}`,
            }}>
              <TrendingDown sx={{ fontSize: 12, color: T.danger }} />
              <Typography sx={{ fontFamily: font, fontSize: '0.65rem', fontWeight: 600, color: T.danger }}>
                {stats.totalDebits} Debits
              </Typography>
            </Box>
          </Stack>
        )}

        {error && (
          <Box sx={{
            mb: 2, p: '8px 14px', borderRadius: T.radiusSm,
            bgcolor: T.dangerDim, border: `1px solid ${alpha(T.danger, 0.2)}`,
          }}>
            <Typography sx={{ fontFamily: font, fontSize: '0.72rem', color: T.danger }}>{error}</Typography>
          </Box>
        )}

        {loading && (
          <LinearProgress sx={{
            mb: 2, height: 2, bgcolor: T.border, borderRadius: 1,
            '& .MuiLinearProgress-bar': { bgcolor: T.accent, borderRadius: 1 },
          }} />
        )}

        {/* Transactions list */}
        {transactions.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
            <Receipt sx={{ fontSize: 28, color: T.textFaint }} />
            <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: T.textMuted, fontWeight: 500 }}>
              No transactions yet
            </Typography>
            <Typography sx={{ fontFamily: font, fontSize: '0.7rem', color: T.textFaint }}>
              Your transaction history will appear here
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={0}>
            {transactions.slice(0, expanded ? 10 : 5).map((tx, index) => (
              <Stack
                key={tx._id || index}
                direction="row" alignItems="center" justifyContent="space-between"
                sx={{
                  py: 1.25,
                  borderBottom: index < (expanded ? Math.min(transactions.length, 10) : Math.min(transactions.length, 5)) - 1
                    ? `1px solid ${T.border}` : 'none',
                  transition: 'background 0.12s ease',
                  mx: -1, px: 1, borderRadius: T.radiusXs,
                  '&:hover': { bgcolor: T.surfaceHover },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: getTxBg(tx), borderRadius: T.radiusXs, flexShrink: 0,
                  }}>
                    {isCredit(tx)
                      ? <TrendingUp sx={{ fontSize: 14, color: T.success }} />
                      : <TrendingDown sx={{ fontSize: 14, color: T.danger }} />}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{
                      fontFamily: font, fontSize: '0.78rem', fontWeight: 600, color: T.text,
                    }} noWrap>
                      {tx.title || 'Transaction'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: T.textMuted }}>
                        {tx.formattedDate}
                      </Typography>
                      <Box sx={{
                        px: '6px', py: '1px', borderRadius: '3px',
                        border: `1px solid ${T.border}`,
                      }}>
                        <Typography sx={{ fontFamily: font, fontSize: '0.58rem', fontWeight: 500, color: T.textMuted }}>
                          {getSourceLabel(tx)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
                <Typography sx={{
                  fontFamily: font, fontSize: '0.8rem', fontWeight: 700,
                  color: getTxColor(tx), flexShrink: 0, ml: 1,
                }}>
                  {tx.formattedAmount} <Box component="span" sx={{ fontSize: '0.65rem', fontWeight: 500, color: T.textMuted }}>TKN</Box>
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {transactions.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: T.textFaint }}>
              {expanded ? 'Showing all transactions' : `Showing 5 of ${transactions.length} transactions`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTransactions;
