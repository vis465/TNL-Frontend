import React from 'react';
import Chip from '@mui/material/Chip';

export default function MultiplierChip({ value, label }) {
  const v = Number(value);
  const text = Number.isFinite(v) ? `×${v}` : label || '—';
  return (
    <Chip
      size="small"
      label={text}
      color="primary"
      variant="outlined"
      sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}
    />
  );
}
