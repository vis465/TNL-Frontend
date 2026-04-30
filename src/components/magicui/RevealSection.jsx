import React from 'react';
import { Box } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from './motionPresets';

export default function RevealSection({ children, sx, once = true, amount = 0.18 }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Box sx={sx}>{children}</Box>;
  }

  return (
    <Box
      component={motion.div}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      sx={sx}
    >
      {children}
    </Box>
  );
}
