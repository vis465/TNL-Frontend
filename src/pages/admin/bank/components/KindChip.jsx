import React from 'react';
import { Chip } from '@mui/material';

const KIND_COLORS = {
  job_deductions: 'warning',
  admin_deduction: 'error',
  bonus_payout: 'success',
  division_credit: 'info',
  division_debit: 'info',
  job: 'success',
  job_tax: 'warning',
  bank_credit: 'info',
  bank_debit: 'info',
  adjustment: 'default',
};

export default function KindChip({ kind, ledger }) {
  const label = [ledger, kind].filter(Boolean).join(' · ') || 'unknown';
  return (
    <Chip
      size="small"
      label={label}
      color={KIND_COLORS[kind] || 'default'}
      variant="outlined"
      sx={{ textTransform: 'none' }}
    />
  );
}
