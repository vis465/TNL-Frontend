import React, { useEffect, useState } from 'react';
import { myContracts } from '../services/contractsService';
import { Card, CardContent, Typography, Grid, LinearProgress, Chip, Stack } from '@mui/material';

export default function MyContracts() {
  const [data, setData] = useState({ active: [], history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    myContracts()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography sx={{ p: 2 }}>Loading...</Typography>;

  const renderContract = (c) => {
    const tpl = c.templateId || {};
    const total = (c.progress || []).length || 1;
    const done = (c.progress || []).filter(p => p.status === 'done').length;
    const pct = Math.round((done / total) * 100);
    return (
      <Card key={c._id} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{tpl.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: 'wrap' }}>
            <Chip label={`Status: ${c.status}`} />
            <Chip label={`Deadline: ${new Date(c.deadlineAt).toLocaleString()}`} />
            <Chip label={`Progress: ${done}/${total}`} />
          </Stack>
          <LinearProgress variant="determinate" value={pct} />
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ mb: 1 }}>Active</Typography>
        {data.active.map(renderContract)}
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ mb: 1 }}>History</Typography>
        {data.history.map(renderContract)}
      </Grid>
    </Grid>
  );
}


