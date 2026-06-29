import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { getBankDivisions, getDivisionWalletTransactions } from '../../../services/bankService';
import KindChip from './components/KindChip';

const DIV_KINDS = ['', 'job_tax', 'distribute', 'bank_credit', 'bank_debit', 'fuel_purchase', 'adjustment'];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
}

export default function BankDivisionTab({ onOpenDetail }) {
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [division, setDivision] = useState(null);
  const [kind, setKind] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!division?._id) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getDivisionWalletTransactions(division._id, page, 20, kind ? { kind } : {});
      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [division, page, kind]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getBankDivisions('').then((d) => setDivisionOptions(d.items || []));
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Autocomplete
          sx={{ minWidth: 280 }}
          options={divisionOptions}
          getOptionLabel={(o) => `${o.name} — ${formatCurrency(o.walletBalance)}`}
          value={division}
          onChange={(_, v) => { setDivision(v); setPage(1); }}
          onInputChange={(_, q) => getBankDivisions(q).then((d) => setDivisionOptions(d.items || []))}
          renderInput={(params) => <TextField {...params} label="Division" size="small" />}
        />
        <TextField
          select
          size="small"
          label="Kind"
          value={kind}
          onChange={(e) => { setKind(e.target.value); setPage(1); }}
          sx={{ minWidth: 180 }}
        >
          {DIV_KINDS.map((k) => (
            <MenuItem key={k || 'all'} value={k}>{k || 'All kinds'}</MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Kind</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center"> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell><KindChip kind={row.source?.kind} ledger="division" /></TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onOpenDetail({ ...row, ledger: 'division' })}>
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow><TableCell colSpan={5} align="center">Select a division</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
      </Box>
    </Box>
  );
}
