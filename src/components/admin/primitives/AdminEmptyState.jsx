import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxOutlined from '@mui/icons-material/InboxOutlined';

export default function AdminEmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon: Icon = InboxOutlined,
  sx,
}) {
  return (
    <Box sx={{ textAlign: 'center', py: 4, px: 2, ...sx }}>
      {Icon && <Icon sx={{ fontSize: 40, opacity: 0.45, mb: 1 }} color="action" />}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2 : 0, maxWidth: 420, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
