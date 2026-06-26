import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

/**
 * Page header for admin child routes. Omit title when AdminLayout already shows it.
 */
export default function AdminPageHeader({ title, description, actions, sx }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      spacing={1.5}
      sx={{ mb: 2, ...sx }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {title && (
          <Typography variant="h5" fontWeight={800} sx={{ mb: description ? 0.5 : 0 }}>
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
