import React from 'react';
import { Box, Slider, Stack, Typography } from '@mui/material';

export default function AdminRangeSlider({
  label,
  min = 0,
  max = 100,
  value,
  onChange,
  unit = 't',
  step = 1,
  disabled = false,
  sx,
}) {
  const [lo, hi] = value;
  const rangeLabel = `${lo}${unit} – ${hi}${unit}`;

  return (
    <Box sx={{ px: 0.5, minWidth: { xs: '100%', sm: 260 }, flex: { md: '1 1 280px' }, ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.primary" fontWeight={700}>
          {rangeLabel}
        </Typography>
      </Stack>
      <Slider
        value={value}
        onChange={(_, v) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled || min >= max}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `${v}${unit}`}
        size="small"
        sx={{ mt: 0.5, mx: 0.5 }}
      />
    </Box>
  );
}
