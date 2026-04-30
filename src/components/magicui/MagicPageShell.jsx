import React from 'react';
import { Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export default function MagicPageShell({ children, containerSx }) {
  const theme = useTheme();
  const p = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        color: 'text.primary',
        background: 'transparent',
        '& .MuiCard-root, & .MuiPaper-root': {
          background: isDark ? alpha('#141414', 0.94) : alpha('#ffffff', 0.92),
          border: `1px solid ${alpha(p, isDark ? 0.38 : 0.45)}`,
          boxShadow: `0 8px 32px ${alpha(p, isDark ? 0.07 : 0.12)}, 0 0 1px ${alpha(p, 0.2)}`,
          backdropFilter: 'blur(10px)',
          color: 'text.primary',
          borderRadius: 3,
        },
        '& .MuiButton-contained.MuiButton-containedPrimary': {
          background: `linear-gradient(145deg, ${p} 0%, ${theme.palette.primary.dark} 100%)`,
          color: `${theme.palette.primary.contrastText} !important`,
          boxShadow: `0 10px 28px ${alpha(p, 0.35)}, 0 0 40px ${alpha(p, 0.15)}`,
          '&:hover': {
            background: `linear-gradient(145deg, ${theme.palette.primary.light} 0%, ${p} 100%)`,
            boxShadow: `0 12px 36px ${alpha(p, 0.45)}`,
          },
          '& .MuiButton-label': {
            color: 'inherit !important',
          },
          '& .MuiButton-startIcon, & .MuiButton-endIcon': {
            color: 'inherit',
          },
        },
        '& .MuiButton-outlined': {
          borderColor: alpha(p, 0.55),
          color: isDark ? '#fafafa' : '#0a0a0a',
          background: isDark ? alpha('#000', 0.25) : alpha(p, 0.08),
          '&:hover': {
            borderColor: p,
            background: alpha(p, 0.12),
          },
        },
        '& .MuiChip-root': {
          background: isDark ? alpha('#000', 0.45) : alpha(p, 0.15),
          border: `1px solid ${alpha(p, 0.4)}`,
          color: isDark ? '#f8fafc' : '#0a0a0a',
        },
        '& .MuiTabs-indicator': {
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${p}, ${theme.palette.primary.dark})`,
        },
        '& .MuiTab-root': {
          color: isDark ? 'rgba(248,250,252,0.82)' : 'rgba(10,10,10,0.74)',
          textTransform: 'none',
          fontWeight: 700,
          '&.Mui-selected': { color: p },
        },
        '& .MuiTableCell-root': {
          borderBottomColor: alpha(isDark ? '#fff' : '#000', isDark ? 0.1 : 0.08),
          color: 'inherit',
        },
        '& .MuiTableHead-root .MuiTableCell-root': {
          color: isDark ? alpha(p, 1) : '#0a0a0a',
          fontWeight: 800,
        },
        '& .MuiTypography-root': {
          textWrap: 'pretty',
        },
        '& .MuiLinearProgress-root': {
          backgroundColor: alpha(p, isDark ? 0.15 : 0.2),
        },
        '& .MuiLinearProgress-bar': {
          background: `linear-gradient(90deg, ${p}, ${theme.palette.primary.light})`,
        },
        '& .MuiDialog-paper': {
          background: isDark ? alpha('#0f0f0f', 0.98) : '#ffffff',
          border: `1px solid ${alpha(p, 0.35)}`,
          boxShadow: `0 24px 80px ${alpha('#000', 0.45)}, 0 0 80px ${alpha(p, 0.12)}`,
        },
        ...containerSx,
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  );
}
