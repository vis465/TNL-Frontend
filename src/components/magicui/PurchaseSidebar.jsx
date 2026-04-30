import React from 'react';
import { Box, Drawer, Stack, Typography } from '@mui/material';

export default function PurchaseSidebar({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 440,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          p: 2.25,
          borderLeft: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        },
      }}
    >
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle ? <Typography variant="body2" color="text.secondary">{subtitle}</Typography> : null}
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>{children}</Box>
        {footer ? (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5, mt: 0.5 }}>
            {footer}
          </Box>
        ) : null}
      </Stack>
    </Drawer>
  );
}
