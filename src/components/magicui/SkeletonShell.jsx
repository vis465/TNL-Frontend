import React from 'react';
import { Grid, Skeleton, Stack } from '@mui/material';

export default function SkeletonShell({ cards = 3, chart = false }) {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        {Array.from({ length: cards }).map((_, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Skeleton variant="rounded" height={160} />
          </Grid>
        ))}
      </Grid>
      {chart ? <Skeleton variant="rounded" height={280} /> : null}
    </Stack>
  );
}
