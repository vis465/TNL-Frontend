import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Stack, Button, Chip, Divider, Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import { PowerupBadge, formatPowerupLabel } from './PowerupDisplay';

function daysUntil(dateValue) {
  if (!dateValue) return null;
  const ms = new Date(dateValue).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export default function RewardClaim({ milestones = [], onClaim, claimingId = '' }) {
  const grouped = useMemo(() => {
    const claimed = milestones.filter((m) => m.status === 'claimed');
    const unlocked = milestones.filter((m) => m.status === 'unlocked' && !m.claimed);
    const locked = milestones.filter((m) => m.status === 'locked');
    return { claimed, unlocked, locked };
  }, [milestones]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Milestone Rewards</Typography>
        <Stack spacing={2}>
          {!!grouped.unlocked.length && grouped.unlocked.map((m) => (
            <Box key={m._id || `u-${m.streakCount}`} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                  <Typography fontWeight={700}>
                    <RedeemOutlinedIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    {m.streakCount}-Day Milestone
                  </Typography>
                  <PowerupBadge type={m.powerupType} size={22} showDescription />
                  <Typography variant="body2" color="text.secondary">
                    Reward: {formatPowerupLabel(m.powerupType) || 'Hidden'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Expires in {daysUntil(m.claimExpiresAt)} day(s)
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  onClick={() => onClaim(m)}
                  disabled={claimingId === m._id}
                >
                  {claimingId === m._id ? 'Claiming...' : 'Claim'}
                </Button>
              </Stack>
            </Box>
          ))}

          <Divider />

          {!!grouped.claimed.length && grouped.claimed.map((m) => (
            <Box key={m._id || `c-${m.streakCount}`} sx={{ p: 1.25, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  {m.streakCount}-day milestone claimed ({formatPowerupLabel(m.powerupType) || 'reward'})
                </Typography>
              </Stack>
            </Box>
          ))}

          {!!grouped.locked.length && grouped.locked.slice(0, 4).map((m) => (
            <Box key={m._id || `l-${m.streakCount}`} sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LockOutlinedIcon color="disabled" fontSize="small" />
                <Typography variant="body2">
                  {m.streakCount}-day milestone - {m.revealed ? (formatPowerupLabel(m.powerupType) || 'Hidden') : '??? (Hidden)'}
                </Typography>
                {!m.revealed && <Chip size="small" label="Locked" />}
              </Stack>
            </Box>
          ))}

          {!grouped.unlocked.length && !grouped.claimed.length && !grouped.locked.length && (
            <Typography variant="body2" color="text.secondary">No milestones yet.</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
