import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { applyShowdownCssVars } from '../../theme/showdownTheme';

/**
 * Layout shell for Showdown routes. Global Showdown styling comes from App ThemeProvider
 * when the user is logged in and Showdown is enabled; this only sets optional CSS variables
 * on a local root for scoped accents.
 */
export default function ShowdownLayout({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) applyShowdownCssVars(ref.current);
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {children}
    </Box>
  );
}
