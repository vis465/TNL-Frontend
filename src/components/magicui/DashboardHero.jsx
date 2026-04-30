import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import MagicCard from './MagicCard';
import NumberTicker from './NumberTicker';

function StatCard({ label, value }) {
  const theme = useTheme();
  const p = theme.palette.primary.main;
  return (
    <MagicCard
      style={{
        minHeight: 96,
        background: alpha('#0a0a0a', 0.72),
        borderColor: alpha(p, 0.45),
        boxShadow: `0 0 24px ${alpha(p, 0.18)} inset, 0 8px 32px ${alpha('#000', 0.35)}`,
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Typography variant="caption" sx={{ color: alpha(p, 0.92), textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.12em' }}>
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: '#ffff00',
            textShadow: `0 0 20px ${alpha(p, 0.55)}`,
            fontWeight: 900,
            mt: 0.5,
          }}
        >
          <NumberTicker value={value} />
        </Typography>
      </Box>
    </MagicCard>
  );
}

export default function DashboardHero({ title, subtitle, stats = [], compact }) {
  const theme = useTheme();
  const p = theme.palette.primary.main;

  return (
    <Box sx={{ position: 'relative', mb: compact ? 1.75 : 2.5 }}>
      <MagicCard
        style={{
          background: `
            radial-gradient(ellipse 900px 400px at 10% -20%, ${alpha(p, 0.25)} 0%, transparent 50%),
            radial-gradient(ellipse 700px 360px at 90% 0%, ${alpha(theme.palette.primary.dark, 0.35)} 0%, transparent 45%),
            linear-gradient(165deg, #080808 0%, #141414 50%, #0a0a0a 100%)
          `,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: alpha(p, 0.42),
          boxShadow: `0 24px 64px ${alpha('#000', 0.55)}, 0 0 120px ${alpha(p, 0.12)}`,
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(-12deg, transparent, transparent 54px, ${alpha(p, 0.04)} 54px, ${alpha(p, 0.04)} 56px)`,
            pointerEvents: 'none',
            opacity: 0.85,
          }}
        />
        <Box sx={{ position: 'relative', p: compact ? { xs: 2, md: 2.5 } : { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.75,
              px: 1.25,
              py: 0.35,
              borderRadius: 99,
              border: `1px solid ${alpha(p, 0.35)}`,
              bgcolor: alpha(p, 0.08),
              boxShadow: `0 0 24px ${alpha(p, 0.15)}`,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: p,
                boxShadow: `0 0 12px ${p}`,
                animation: 'pulseGlow 2.2s ease-in-out infinite',
                '@keyframes pulseGlow': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.15)' },
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em', color: alpha(p, 1) }}>
              OPS LIVE
            </Typography>
          </Box>

          <Typography
            variant={compact ? 'h5' : 'h4'}
            sx={{
              color: '#fafafa',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              '& span': { color: p, textShadow: `0 0 40px ${alpha(p, 0.55)}` },
            }}
          >
            <span>{title.slice(0, 1)}</span>
            {title.slice(1)}
          </Typography>
          <Typography sx={{ mt: 1.1, color: alpha('#ffffff', 0.72), maxWidth: 820, fontSize: compact ? '0.875rem' : undefined }}>
            {subtitle}
          </Typography>
          {stats.length > 0 && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: compact ? 1.75 : 2 }}>
              {stats.slice(0, 4).map((s) => (
                <Box key={s.label} sx={{ flex: 1, minWidth: 0 }}>
                  <StatCard label={s.label} value={Number(s.value) || 0} />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </MagicCard>
    </Box>
  );
}
