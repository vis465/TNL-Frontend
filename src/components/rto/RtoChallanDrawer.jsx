import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Chip,
  Link,
  Divider,
} from '@mui/material';

export default function RtoChallanDrawer({ open, onClose, challan }) {
  if (!challan) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 2 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {challan.challanNumber}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        <Chip size="small" label={challan.status} />
        <Chip size="small" label={`${challan.amount} tokens`} color="warning" />
        {challan.appealStatus && challan.appealStatus !== 'none' && (
          <Chip size="small" label={`Appeal: ${challan.appealStatus}`} variant="outlined" />
        )}
      </Stack>

      <Typography variant="subtitle2" color="text.secondary">
        Offence
      </Typography>
      <Typography variant="body1" gutterBottom>
        {challan.offenceTitle} ({challan.offenceCode})
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Accused
      </Typography>
      <Typography variant="body2" gutterBottom>
        {challan.accusedRiderName} · {challan.accusedEmployeeId}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Issued by
      </Typography>
      <Typography variant="body2" gutterBottom>
        {challan.issuedByUsername || '—'}
      </Typography>

      {challan.notes && (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            Notes
          </Typography>
          <Typography variant="body2" paragraph>
            {challan.notes}
          </Typography>
        </>
      )}

      {challan.appealReason && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Appeal
          </Typography>
          <Typography variant="body2">{challan.appealReason}</Typography>
        </>
      )}

      {Array.isArray(challan.proofs) && challan.proofs.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Proofs
          </Typography>
          <Stack spacing={1}>
            {challan.proofs.map((p, i) => (
              <Box key={i}>
                <Chip size="small" label={p.type} sx={{ mr: 1 }} />
                <Link href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.caption || p.url}
                </Link>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Drawer>
  );
}
