import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

export default function LiveFeedPanel({ items, loading, error }) {
  if (loading) return <Typography color="text.secondary">Loading feed…</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!items?.length) {
    return (
      <Typography color="text.secondary" variant="body2">
        No live messages yet.
      </Typography>
    );
  }
  return (
    <Stack spacing={1.5}>
      {items.map((it) => (
        <Paper key={it._id} variant="outlined" sx={{ p: 1.5, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {it.createdAt ? new Date(it.createdAt).toLocaleString() : ''} · {it.source}
          </Typography>
          <Typography variant="body2">{it.message}</Typography>
        </Paper>
      ))}
    </Stack>
  );
}
