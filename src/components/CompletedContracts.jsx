import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Stack, IconButton,
  LinearProgress, alpha
} from '@mui/material';
import {
  CheckCircle, Cancel, ExpandMore, ExpandLess,
  Refresh, TrendingUp, TrendingDown, History
} from '@mui/icons-material';
import { myContracts, getContractStats } from '../services/contractsService';

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
  infoDim: 'rgba(96,165,250,0.08)',
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

function StatusBadge({ label, color = T.success }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: '8px', py: '3px', borderRadius: T.radiusXs,
      bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.2)}`,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{
        fontFamily: font, fontSize: '0.6rem', fontWeight: 700,
        color, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </Typography>
    </Box>
  );
}

const CompletedContracts = ({ onRefresh }) => {
  const [contracts, setContracts] = useState({ active: [], history: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadContracts(); }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const [contractsData, statsData] = await Promise.all([
        myContracts(), getContractStats()
      ]);
      setContracts(contractsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadContracts();
    if (onRefresh) onRefresh();
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return T.success;
    if (status === 'failed') return T.danger;
    return T.textMuted;
  };

  if (loading && !contracts.history.length) {
    return (
      <Card sx={sxCard}>
        <CardContent sx={{ p: '20px !important' }}>
          <LinearProgress sx={{
            bgcolor: T.border, borderRadius: 1,
            '& .MuiLinearProgress-bar': { bgcolor: T.accent, borderRadius: 1 },
          }} />
          <Typography sx={{ ...sxLabel, mt: 1.5 }}>Loading contracts...</Typography>
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
              bgcolor: T.successDim, borderRadius: T.radiusSm, color: T.success,
            }}>
              <History sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontFamily: font, fontSize: '0.85rem', fontWeight: 700, color: T.text }}>
              Contract History
            </Typography>
            {contracts.history.length > 0 && (
              <Box sx={{
                minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: T.successDim, borderRadius: '10px', px: 0.75,
              }}>
                <Typography sx={{ fontFamily: font, fontSize: '0.6rem', fontWeight: 700, color: T.success }}>
                  {contracts.history.length}
                </Typography>
              </Box>
            )}
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

        {/* Stats row */}
        {stats && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: '10px', py: '4px', borderRadius: T.radiusXs,
              bgcolor: T.successDim, border: `1px solid ${alpha(T.success, 0.15)}`,
            }}>
              <CheckCircle sx={{ fontSize: 12, color: T.success }} />
              <Typography sx={{ fontFamily: font, fontSize: '0.65rem', fontWeight: 600, color: T.success }}>
                {stats.totalCompleted} Completed
              </Typography>
            </Box>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: '10px', py: '4px', borderRadius: T.radiusXs,
              bgcolor: T.dangerDim, border: `1px solid ${alpha(T.danger, 0.15)}`,
            }}>
              <Cancel sx={{ fontSize: 12, color: T.danger }} />
              <Typography sx={{ fontFamily: font, fontSize: '0.65rem', fontWeight: 600, color: T.danger }}>
                {stats.totalFailed} Failed
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

        {/* Contract list */}
        {contracts.history.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
            <History sx={{ fontSize: 28, color: T.textFaint }} />
            <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: T.textMuted, fontWeight: 500 }}>
              No completed contracts
            </Typography>
            <Typography sx={{ fontFamily: font, fontSize: '0.7rem', color: T.textFaint }}>
              Your contract history will appear here
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1}>
            {contracts.history.slice(0, expanded ? 10 : 5).map((contract, index) => (
              <Box
                key={contract._id || index}
                sx={{
                  p: '12px 14px', border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm, bgcolor: T.surfaceAlt,
                  transition: 'border-color 0.15s ease',
                  '&:hover': { borderColor: T.borderHover },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.8rem', fontWeight: 600,
                    color: T.text, minWidth: 0,
                  }} noWrap>
                    {contract.templateId?.title || 'Contract'}
                  </Typography>
                  <StatusBadge
                    label={contract.status || 'Completed'}
                    color={getStatusColor(contract.status)}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack spacing={0.25}>
                    <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: T.textMuted }}>
                      Started: {contract.formattedCreatedAt}
                    </Typography>
                    {contract.formattedCompletedAt && (
                      <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: T.textFaint }}>
                        Ended: {contract.formattedCompletedAt}
                      </Typography>
                    )}
                  </Stack>
                  {contract.status === 'completed' && (
                    <Typography sx={{ fontFamily: font, fontSize: '0.7rem', fontWeight: 700, color: T.success }}>
                      +{contract.templateId?.rewardTokens || 0}
                    </Typography>
                  )}
                  {contract.status === 'failed' && (
                    <Typography sx={{ fontFamily: font, fontSize: '0.7rem', fontWeight: 700, color: T.danger }}>
                      -{contract.templateId?.penaltyTokens || 0}
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {contracts.history.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography sx={{ fontFamily: font, fontSize: '0.65rem', color: T.textFaint }}>
              {expanded ? 'Showing all contracts' : `Showing 5 of ${contracts.history.length} contracts`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedContracts;
