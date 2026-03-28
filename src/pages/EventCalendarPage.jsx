import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Calendercomponent from '../components/Calender';

export default function EventCalendarPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 2 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Event calendar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
          Events are loaded from our database (synced / hosted TMP events). Times and details match Event Management.
        </Typography>
        <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Calendercomponent />
        </Paper>
      </Container>
    </Box>
  );
}
