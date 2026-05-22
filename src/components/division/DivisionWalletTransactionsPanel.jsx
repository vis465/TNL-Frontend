import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import axiosInstance from '../../utils/axios';
import {
  DIVISION_WALLET_KIND_OPTIONS,
  formatDivisionWalletRow,
} from '../../utils/divisionWalletTransactionLabels';

export default function DivisionWalletTransactionsPanel({
  divisionId,
  title = 'Wallet transactions',
  limit = 50,
  dense = false,
  sx: sxProp,
}) {
  const [kind, setKind] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!divisionId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get(`/divisions/${divisionId}/wallet/transactions`, {
        params: { limit, ...(kind ? { kind } : {}) },
      });
      setItems(data.transactions || []);
    } catch (e) {
      setItems([]);
      setError(e?.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [divisionId, kind, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box sx={sxProp}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
          {title}
        </Typography>
        <TextField
          select
          size="small"
          label="Filter by type"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          {DIVISION_WALLET_KIND_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Table size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((t) => {
            const { kindLabel, typeLabel, signedAmount } = formatDivisionWalletRow(t);
            return (
              <TableRow key={t._id} hover>
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={typeLabel}
                    color={t.type === 'credit' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{kindLabel}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: signedAmount >= 0 ? 'success.main' : 'text.primary' }}>
                  {signedAmount >= 0 ? '+' : ''}
                  {Math.abs(signedAmount).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{t.title || '—'}</Typography>
                  {t.riderName && (
                    <Typography variant="caption" color="text.secondary">
                      {t.riderName}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {!loading && !items.length && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No transactions{kind ? ' for this filter' : ''}.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
