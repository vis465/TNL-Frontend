import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import restoreIcon from '../img/restore.png';
import revealIcon from '../img/reveal.png';
import protectIcon from '../img/protect.png';
import tokenIcon from '../img/token.png';
import doubleIcon from '../img/double.png';

const POWERUP_DISPLAY = {
  restore_streak: {
    label: 'Restore Streak',
    description: 'Claiming auto-restores your streak to the value before the latest reset (one-time use)',
    image: restoreIcon,
  },
  reveal_next_milestone: {
    label: 'Reveal Next Milestone',
    description: 'Claiming auto-reveals the reward for the next hidden milestone; the revealed reward becomes claimable after you reach that milestone (one-time use)',
    image: revealIcon,
  },
  streak_protection: {
    label: 'Streak Protection',
    description: 'Claiming activates streak protection for 24 hours (prevents rejection) (one-time use)',
    image: protectIcon,
  },
  wallet_tokens: {
    label: 'Wallet Tokens',
    description: 'Claiming immediately credits tokens into your wallet (one-time)',
    image: tokenIcon,
  },
  double_streak: {
    label: '2x Streak',
    description: 'Claiming activates 2x streak: your next approved attendance within expiry counts +2 instead of +1 (one-time use)',
    image: doubleIcon,
  },
};

function slugToLabel(type) {
  if (!type) return 'Powerup';
  return String(type)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function getPowerupDisplay(type) {
  return POWERUP_DISPLAY[type] || {
    label: slugToLabel(type),
    description: '',
    image: null,
  };
}

export function formatPowerupLabel(type) {
  return getPowerupDisplay(type).label;
}

export function PowerupLogo({ type, size = 36, sx = {}, alt = '' }) {
  const meta = getPowerupDisplay(type);

  if (!meta.image) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(14, Math.round(size * 0.45)),
          fontWeight: 700,
          ...sx,
        }}
      >
        {meta.label?.[0] || '?'}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={meta.image}
      alt={alt || meta.label}
      sx={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'inline-block',
        ...sx,
      }}
    />
  );
}
export function PowerupBadge({ type, size = 36, showDescription = false, showLabel = true, sx = {} }) {
  const meta = getPowerupDisplay(type);

  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={sx}>
      <PowerupLogo type={type} size={size} />
      {showLabel && (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '0.95rem' }}>
            {meta.label}
          </Typography>
          {showDescription && meta.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              {meta.description}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
}
