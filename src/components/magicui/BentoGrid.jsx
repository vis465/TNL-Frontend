import React from 'react';
import { Box } from '@mui/material';

export function BentoGrid({ children, minItemWidth = 240, gap = 2, sx }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
        gap,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function BentoItem({ children, span = 1, sx }) {
  return (
    <Box
      sx={{
        gridColumn: { xs: 'span 1', md: `span ${span}` },
        minWidth: 0,
        transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          '& .MuiCard-root, & .MuiPaper-root': {
            borderColor: 'rgba(125,211,252,0.5)',
            boxShadow: '0 16px 30px rgba(8,47,73,0.28)',
          },
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
