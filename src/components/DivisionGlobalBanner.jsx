import React from 'react';
import { Alert, Stack, Typography } from '@mui/material';

const bannerSx = {
  bgcolor: 'success.dark',
  color: 'success.contrastText',
  '& .MuiAlert-message': { width: '100%' },
};

/**
 * @param {{ globalAnnouncement?: { manualMessage?: string, refreshMessage?: string }, variant?: 'fullBleed' | 'contained' }} props
 */
export default function DivisionGlobalBanner({ globalAnnouncement, variant = 'contained' }) {
  const manual = globalAnnouncement?.manualMessage?.trim();
  const refresh = globalAnnouncement?.refreshMessage?.trim();
  if (!manual && !refresh) return null;

  const isFullBleed = variant === 'fullBleed';

  return (
    <Alert
      severity="success"
      icon={false}
      sx={{
        ...bannerSx,
        ...(isFullBleed
          ? {
              borderRadius: 0,
              py: 1.25,
              justifyContent: 'center',
              textAlign: 'center',
            }
          : { mb: 2 }),
      }}
    >
      <Stack spacing={manual && refresh ? 1 : 0} sx={{ width: '100%' }}>
        {manual && (
          <Typography variant="body1" fontWeight={600} sx={{ whiteSpace: 'pre-wrap' }}>
            {manual}
          </Typography>
        )}
        {refresh && (
          <Typography
            variant={manual ? 'body2' : 'body1'}
            fontWeight={manual ? 500 : 600}
            sx={{ whiteSpace: 'pre-wrap', opacity: manual ? 0.95 : 1 }}
          >
            {refresh}
          </Typography>
        )}
      </Stack>
    </Alert>
  );
}
