import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function StatCard({ label, value, sub, color = 'primary.main', icon: Icon }) {
  return (
    <Card sx={{ height: '100%', borderTop: 3, borderColor: color }}>
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.1 }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {sub}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box sx={{ color, opacity: 0.85 }}>
              <Icon sx={{ fontSize: 32 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
