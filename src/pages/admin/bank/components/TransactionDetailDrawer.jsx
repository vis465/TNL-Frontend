import React from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import KindChip from './KindChip';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function MetaBlock({ title, data }) {
  if (!data || typeof data !== 'object') return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          bgcolor: 'action.hover',
          borderRadius: 1,
          fontSize: 12,
          overflow: 'auto',
          maxHeight: 240,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Box>
    </Box>
  );
}

export default function TransactionDetailDrawer({ open, transaction, onClose }) {
  if (!transaction) return null;
  const jobId = transaction.metadata?.jobID || transaction.jobContext?.jobID;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Transaction detail</Typography>
          <Button onClick={onClose}>Close</Button>
        </Stack>

        <KindChip kind={transaction.source?.kind} ledger={transaction.ledger || 'bank'} />
        <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
          {transaction.title || 'Untitled'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {new Date(transaction.createdAt).toLocaleString()}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2"><strong>Type:</strong> {transaction.type}</Typography>
          <Typography variant="body2"><strong>Amount:</strong> {formatCurrency(transaction.amount)}</Typography>
          <Typography variant="body2"><strong>Balance after:</strong> {formatCurrency(transaction.balanceAfter)}</Typography>
          {transaction.riderInfo?.name && (
            <Typography variant="body2"><strong>Rider:</strong> {transaction.riderInfo.name}</Typography>
          )}
          {transaction.divisionName && (
            <Typography variant="body2"><strong>Division:</strong> {transaction.divisionName}</Typography>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <MetaBlock title="Deduction details" data={transaction.deductionDetails} />
        <MetaBlock title="Job context" data={transaction.jobContext} />
        <MetaBlock title="Admin deduction" data={transaction.adminDeductionDetails} />
        <MetaBlock title="Metadata" data={transaction.metadata} />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {transaction.riderInfo?.id && transaction.riderInfo.id !== 'N/A' && (
            <Button
              size="small"
              component={RouterLink}
              to={`/admin/operations/rider-inspector?riderId=${transaction.riderInfo.id}`}
            >
              Inspect rider
            </Button>
          )}
          {jobId && (
            <Button
              size="small"
              component={RouterLink}
              to={`/admin/operations/token-calculator?jobID=${jobId}`}
            >
              Token breakdown
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
