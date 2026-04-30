import React from 'react';
import { Box, Drawer, Stack, Typography } from '@mui/material';

export default function PurchaseSidebar({
  open,
  onClose,
  title,
  subtitle,
  children,
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
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Drawer>
  );
}
