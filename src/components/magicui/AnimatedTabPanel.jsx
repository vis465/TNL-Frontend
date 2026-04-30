import React from 'react';
import { Box } from '@mui/material';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function AnimatedTabPanel({ panelKey, children }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Box>{children}</Box>;
  }

  return (
    <AnimatePresence mode="wait">
      <Box
        key={panelKey}
        component={motion.div}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {children}
      </Box>
    </AnimatePresence>
  );
}
