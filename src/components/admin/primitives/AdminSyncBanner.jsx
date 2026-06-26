import React from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import SyncOutlined from '@mui/icons-material/SyncOutlined';

function formatSyncedAt(iso) {
  if (!iso) return 'Never synced';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return 'Unknown';
  }
}

export default function AdminSyncBanner({
  lastSyncedAt,
  count,
  weightRange,
  onSync,
  syncing = false,
  sx,
}) {
  const weightHint =
    weightRange?.min != null && weightRange?.max != null
      ? ` · Weight range ${weightRange.min}–${weightRange.max} t`
      : '';

  return (
    <Alert
      severity="info"
      icon={false}
      sx={{ mb: 2, ...sx }}
      action={
        <Button
          color="inherit"
          size="small"
          variant="outlined"
          startIcon={syncing ? <CircularProgress size={14} color="inherit" /> : <SyncOutlined />}
          onClick={onSync}
          disabled={syncing}
        >
          {syncing ? 'Syncing…' : 'Sync from Nexon'}
        </Button>
      }
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} alignItems={{ sm: 'center' }}>
        <Typography variant="body2" fontWeight={600}>
          Catalog sync
        </Typography>
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, mx: 0.5, opacity: 0.5 }}>
          ·
        </Box>
        <Typography variant="body2" color="text.secondary">
          Last synced {formatSyncedAt(lastSyncedAt)}
          {count != null ? ` · ${count.toLocaleString()} cargos` : ''}
          {weightHint}
        </Typography>
      </Stack>
    </Alert>
  );
}
