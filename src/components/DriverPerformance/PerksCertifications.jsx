import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Box } from '@mui/material';
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';

export default function PerksCertifications({ perks = [], certs = [] }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <CardGiftcardOutlined fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>Perks & certifications</Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Active rank perks in this division
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {perks.length ? perks.map((p) => (
            <Chip key={p.id || p.name} size="small" color="primary" variant="outlined" label={p.name} />
          )) : (
            <Typography variant="body2" color="text.secondary">No perks unlocked yet</Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <WorkspacePremiumOutlined fontSize="small" color="success" />
          <Typography variant="caption" color="text.secondary">Earned certifications</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {certs.length ? certs.map((c) => (
            <Chip key={c.id} size="small" color="success" label={c.name} />
          )) : (
            <Typography variant="body2" color="text.secondary">No certifications earned yet</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
