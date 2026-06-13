import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Stack, Chip, Tooltip, Divider } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { keyframes } from '@mui/system';
import truckImage from '../img/vtctruck.png';
import { getPowerupInventory } from '../services/rewardsService';
import { formatPowerupLabel } from './PowerupDisplay';

// Jackpot pulse animation
const jackpotPulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

// Helper to calculate days until expiry
function daysUntil(dateValue) {
  if (!dateValue) return null;
  const ms = new Date(dateValue).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function formatDateTime(dateValue) {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

function formatExpiryText(dateValue) {
  const days = daysUntil(dateValue);
  if (days == null) return 'No expiry set';
  if (days <= 0) return 'Expired';
  if (days === 1) return 'Expires in 1 day';
  return `Expires in ${days} days`;
}

export default function StreakCard({ streakData, milestones = [], onClaimClick, onClaimReward }) {
  const current = Number(streakData?.currentStreak || 0);
  const highest = Number(streakData?.highestStreak || 0);
  const next = Number(streakData?.nextMilestoneAt || 3);
  const steps = Number(streakData?.stepsToNextMilestone || 0);
  const unclaimed = Number(streakData?.unclaimedMilestones || 0);

  // Animate from base to current on each mount/refresh so movement is visible.
  const [displayValue, setDisplayValue] = useState(0);
  const [claimingId, setClaimingId] = useState('');
  const [powerupInventory, setPowerupInventory] = useState({ available: [], active: [], used: [], expired: [] });

  useEffect(() => {
    setDisplayValue(0);
    const id = setTimeout(() => setDisplayValue(Math.max(0, current)), 160);
    return () => clearTimeout(id);
  }, [current]);

  useEffect(() => {
    let mounted = true;

    const loadInventory = async () => {
      try {
        const inventory = await getPowerupInventory();
        if (mounted) {
          setPowerupInventory(inventory || { available: [], active: [], used: [], expired: [] });
        }
      } catch {
        if (mounted) {
          setPowerupInventory({ available: [], active: [], used: [], expired: [] });
        }
      }
    };

    loadInventory();

    return () => {
      mounted = false;
    };
  }, []);

  // Fixed max track at 15 for the 0-15 numbering requirement
  const maxTrack = 15;

  const milestoneStops = useMemo(() => {
    const stops = [];
    for (let i = 3; i <= maxTrack; i += 3) {
      stops.push(i);
    }
    return stops;
  }, []);

  const positionPct = Math.max(0, Math.min(100, (displayValue / maxTrack) * 100));

  const stopPct = (value) => Math.max(0, Math.min(100, (value / maxTrack) * 100));

  // Get milestone data for a specific streak count
  const getMilestoneData = (streakCount) => {
    return milestones.find((m) => m.streakCount === streakCount);
  };

  const milestonePowerupLookup = useMemo(() => {
    const allPowerups = [
      ...(Array.isArray(powerupInventory?.available) ? powerupInventory.available : []),
      ...(Array.isArray(powerupInventory?.active) ? powerupInventory.active : []),
      ...(Array.isArray(powerupInventory?.used) ? powerupInventory.used : []),
      ...(Array.isArray(powerupInventory?.expired) ? powerupInventory.expired : []),
    ];

    return new Map(allPowerups.map((powerup) => [String(powerup.milestoneId || powerup._id), powerup]));
  }, [powerupInventory]);

  // Group milestones
  const groupedMilestones = useMemo(() => {
    const claimed = milestones.filter((m) => m.status === 'claimed');
    const unlocked = milestones.filter((m) => m.status === 'unlocked' && !m.claimed);
    const locked = milestones.filter((m) => m.status === 'locked');
    return { claimed, unlocked, locked };
  }, [milestones]);

  const handleClaim = async (milestone) => {
    if (onClaimReward && !claimingId) {
      setClaimingId(milestone._id);
      try {
        await onClaimReward(milestone);
        // Refresh inventory after claiming so applied/used status is visible immediately
        try {
          const inventory = await getPowerupInventory();
          setPowerupInventory(inventory || { available: [], active: [], used: [], expired: [] });
        } catch (e) {
          // ignore inventory refresh errors
        }
      } finally {
        setClaimingId('');
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Timeline Section */}
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, mb: 2 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <LocalFireDepartmentIcon color="warning" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>Streak Progress</Typography>
            </Stack>
            <Chip size="small" icon={<EmojiEventsIcon />} label={`Highest: ${highest}`} />
          </Stack>

          {/* Streak Info */}
          <Stack spacing={0.75}>
            <Typography variant="h4" fontWeight={700} color="warning.main">{current} days</Typography>
            <Typography variant="body2" color="text.secondary">
              Next milestone in {steps} more attendance{steps === 1 ? '' : 's'}
            </Typography>
          </Stack>

          {/* Road Timeline with truck ON the road */}
          <Box sx={{ position: 'relative', py: 2, px: 1 }}>
            {/* Road base - asphalt texture */}
            <Box
              sx={{
                height: 34,
                borderRadius: 2,
                bgcolor: '#333',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)',
                border: '2px solid #222'
              }}
            >
              {/* Road progress indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${positionPct}%`,
                  background: 'linear-gradient(90deg, #f7c84f 0%, #f59e0b 100%)',
                  transition: 'width 900ms ease',
                  borderRadius: 2
                }}
              />

              {/* Road center line dashes */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 2,
                  transform: 'translateY(-50%)',
                  background: `repeating-linear-gradient(
                    90deg,
                    #fff 0px,
                    #fff 15px,
                    transparent 15px,
                    transparent 30px
                  )`,
                  zIndex: 3
                }}
              />

              {/* Truck ON the road */}
              <Box
                sx={{
                  position: 'absolute',
                  left: `${positionPct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'left 900ms ease',
                  zIndex: 5
                }}
              >
                <Box
                  component="img"
                  src={truckImage}
                  alt="Truck moving along streak road"
                  sx={{
                    width: { xs: 110, sm: 160 },
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    backgroundColor: 'transparent',
                    filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </Box>
            </Box>

            {/* Milestone markers */}
            {milestoneStops.map((stop) => {
              const pct = stopPct(stop);
              const reached = current >= stop;
              const milestone = getMilestoneData(stop);

              return (
                <Box key={stop} sx={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: reached ? 'warning.main' : 'text.disabled',
                      boxShadow: reached ? '0 0 0 6px rgba(251,191,36,0.12)' : 'none'
                    }}
                  />
                  <Tooltip title={`${stop}-day milestone`}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: reached ? 'warning.main' : 'text.disabled',
                        mt: 1.1
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 28,
                          px: 0.8,
                          py: 0.15,
                          borderRadius: 999,
                          textAlign: 'center',
                          bgcolor: reached ? 'warning.main' : 'action.hover',
                          color: reached ? '#111' : 'text.secondary',
                          boxShadow: reached ? '0 0 0 6px rgba(251,191,36,0.14), 0 0 14px rgba(251,191,36,0.45)' : 'none',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.8rem',
                            lineHeight: 1,
                            textShadow: reached ? '0 1px 0 rgba(255,255,255,0.35)' : 'none'
                          }}
                        >
                          {stop}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>

          {/* Quick stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              <strong>{unclaimed}</strong> unclaimed milestone{unclaimed === 1 ? '' : 's'}
            </Typography>
            <Button size="small" variant="text" sx={{ fontSize: '0.8rem' }} onClick={onClaimClick}>
              View All Rewards →
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Detailed Milestones Section Below */}
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
        <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 700 }}>
          <RedeemOutlinedIcon sx={{ fontSize: 20 }} /> Milestone Rewards Details
        </Typography>

        <Stack spacing={1.75}>
          <Box sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Reward flow
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              When you claim a milestone reward it is applied immediately. Most rewards are one-time: some take effect instantly (for example, wallet tokens or streak restore), while others become active for a limited period (for example, protection or 2x streak).
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Review claimed rewards and their current state on the Powerups page (Menu → Powerups). Active items show remaining time; used or expired items are retained for your records.
            </Typography>
          </Box>

          {/* Unlocked section */}
          {!!groupedMilestones.unlocked.length && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75, color: 'success.main', fontSize: '0.85rem' }}>
                🎁 Unlocked & Ready to Claim
              </Typography>
              <Stack spacing={0.75}>
                {groupedMilestones.unlocked.map((m) => (
                  <Box key={m._id || `u-${m.streakCount}`} sx={{ p: 1.5, border: '2px solid', borderColor: 'success.light', borderRadius: 1, bgcolor: 'success.lighter' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack spacing={0.25} flex={1}>
                        <Typography variant="body2" fontWeight={700}>
                          {m.streakCount}-Day Milestone
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reward: <strong>{formatPowerupLabel(m.powerupType) || 'Hidden'}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.claimExpiresAt ? `Claim deadline: ${formatExpiryText(m.claimExpiresAt)}` : 'Claim deadline unavailable'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Claiming auto-applies this reward. Check the Powerups tab to see if it is active or has been used.
                        </Typography>
                      </Stack>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                        onClick={() => handleClaim(m)}
                        disabled={claimingId === m._id}
                      >
                        {claimingId === m._id ? '...' : 'Claim'}
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Claimed section */}
          {!!groupedMilestones.claimed.length && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75, color: 'success.main', fontSize: '0.85rem' }}>
                ✓ Claimed
              </Typography>
              <Stack spacing={0.5}>
                {groupedMilestones.claimed.map((m) => {
                  const powerup = m.powerupId ? milestonePowerupLookup.get(String(m.powerupId)) : null;
                  const usageExpiryText = powerup?.usageExpiresAt
                    ? `${formatExpiryText(powerup.usageExpiresAt)} (${formatDateTime(powerup.usageExpiresAt)})`
                    : 'Use window: 3 days from claim';

                  return (
                    <Box key={m._id || `c-${m.streakCount}`} sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 16, mt: 0.2 }} />
                        <Stack spacing={0.15} flex={1}>
                          <Typography variant="caption">
                            <strong>{m.streakCount}-day</strong> — {formatPowerupLabel(m.powerupType) || 'reward'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Claimed: {formatDateTime(m.claimedAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Status: {(() => {
                              if (!powerup) return 'In inventory';
                              const s = String(powerup.status || '').toLowerCase();
                              if (s === 'active') return `Active${powerup.activeUntil ? ` • ${formatExpiryText(powerup.activeUntil)}` : ''}`;
                              if (s === 'used') return 'Used';
                              if (s === 'expired') return 'Expired';
                              return 'In inventory';
                            })()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {usageExpiryText}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Locked section */}
          {!!groupedMilestones.locked.length && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75, color: 'text.secondary', fontSize: '0.85rem' }}>
                🔒 Locked - Keep Your Streak!
              </Typography>
              <Stack spacing={0.5}>
                {groupedMilestones.locked.slice(0, 5).map((m) => (
                  <Box key={m._id || `l-${m.streakCount}`} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <LockOutlinedIcon color="disabled" sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        <strong>{m.streakCount}-day</strong> — {m.revealed ? (formatPowerupLabel(m.powerupType) || 'Mystery') : '❓ Hidden'}
                      </Typography>
                      {!m.revealed && <Chip size="small" label="Locked" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {!groupedMilestones.unlocked.length && !groupedMilestones.claimed.length && !groupedMilestones.locked.length && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No milestones yet. Start attending to build your streak!
            </Typography>
          )}
        </Stack>
      </Box>

    </Box>
  );
}
