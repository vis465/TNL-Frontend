import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

export default function CargoBidCountdown({
  targetDate,
  prefix = '',
  expiredLabel = 'Ended',
  variant = 'default',
}) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!targetDate) {
      setLabel('');
      return undefined;
    }

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setLabel(expiredLabel);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setLabel(`${d}d ${h}h ${m}m ${s}s`);
      else if (h > 0) setLabel(`${h}h ${m}m ${s}s`);
      else if (m > 0) setLabel(`${m}m ${s}s`);
      else setLabel(`${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate, expiredLabel]);

  if (!targetDate) return null;

  const isHero = variant === 'hero';

  return (
    <Typography
      variant={isHero ? 'h4' : 'body2'}
      fontWeight={isHero ? 700 : 400}
      color={isHero ? 'inherit' : 'text.secondary'}
      sx={isHero ? { fontVariantNumeric: 'tabular-nums', letterSpacing: 0.5 } : undefined}
    >
      {prefix}
      {label}
    </Typography>
  );
}
