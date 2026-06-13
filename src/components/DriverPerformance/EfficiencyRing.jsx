import React from 'react';
import { Box, Typography } from '@mui/material';

function scoreColor(score) {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#3b82f6';
  if (score >= 55) return '#f59e0b';
  if (score >= 40) return '#ef4444';
  return '#dc2626';
}

export default function EfficiencyRing({ value = 0, size = 56, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = scoreColor(pct);

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth={6} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {Math.round(pct)}
        </Typography>
      </Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

export { scoreColor };
