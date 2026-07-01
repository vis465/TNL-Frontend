import React from 'react';
import { Chip } from '@mui/material';

export default function SlotCapacityChip({ allocated = 0, max = 1, size = 'small' }) {
  const remaining = Math.max(0, max - allocated);
  let color = 'success';
  let label = `${remaining}/${max} available`;

  if (allocated >= max) {
    color = 'error';
    label = `${allocated}/${max} full`;
  } else if (allocated > 0) {
    color = 'warning';
    label = `${allocated}/${max} used`;
  }

  return <Chip label={label} color={color} size={size} variant="outlined" />;
}
