import React from 'react';
import { Box, Button, Card, CardContent, Stack, TextField } from '@mui/material';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';

export default function AdminFilterBar({
  search,
  children,
  onReset,
  sx,
}) {
  return (
    <Card variant="outlined" sx={{ mb: 2, ...sx }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ md: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            {search && (
              <TextField
                size="small"
                placeholder={search.placeholder || 'Search…'}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 220 }, flex: { md: '1 1 220px' } }}
              />
            )}
            {children}
            {onReset && (
              <Button size="small" variant="outlined" onClick={onReset} startIcon={<FilterListOutlined />}>
                Reset filters
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
