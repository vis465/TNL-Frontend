import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { getBankTransactions, getBankDivisions, searchRiders } from '../../../services/bankService';
import LedgerFiltersBar, { filtersToParams } from './components/LedgerFiltersBar';
import KindChip from './components/KindChip';

const EMPTY_FILTERS = {
  kind: '', type: '', jobID: '', q: '', from: '', to: '', rider: null, riderId: '', division: null, divisionId: '',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
}

function toCsv(rows) {
  const headers = ['date', 'type', 'kind', 'amount', 'title', 'rider', 'jobID'];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      new Date(r.createdAt).toISOString(),
      r.type,
      r.source?.kind,
      r.amount,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.riderInfo?.name || '').replace(/"/g, '""')}"`,
      r.metadata?.jobID || '',
    ].join(','));
  }
  return lines.join('\n');
}

export default function BankLedgerTab({ onOpenDetail }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState({});
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [riderOptions, setRiderOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);

  const load = useCallback(async (p = page, f = applied) => {
    setLoading(true);
    try {
      const data = await getBankTransactions(p, 20, f);
      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => { load(page, applied); }, [page, applied, load]);

  const applyFilters = () => {
    setPage(1);
    setApplied(filtersToParams(filters));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setApplied({});
  };

  const exportCsv = async () => {
    const data = await getBankTransactions(1, 500, applied);
    const blob = new Blob([toCsv(data.items || [])], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-ledger-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <LedgerFiltersBar
        filters={filters}
        onChange={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        riderOptions={riderOptions}
        onRiderSearch={async (q) => {
          if (!q || q.length < 2) return;
          setRiderOptions(await searchRiders(q, 10));
        }}
        divisionOptions={divisionOptions}
        onDivisionSearch={async (q) => {
          const d = await getBankDivisions(q || undefined);
          setDivisionOptions(d.items || []);
        }}
      />

      <StackRow>
        <Typography variant="subtitle1" fontWeight={600}>Bank transactions</Typography>
        <Button size="small" startIcon={<DownloadOutlined />} onClick={exportCsv}>Export CSV</Button>
      </StackRow>

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
                <TableCell>Rider</TableCell>
                <TableCell align="center"> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell><KindChip kind={row.source?.kind} ledger="bank" /></TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell align="right" sx={{ color: row.type === 'credit' ? 'success.main' : 'error.main' }}>
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell>{row.riderInfo?.name || '—'}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onOpenDetail({ ...row, ledger: 'bank' })}>
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow><TableCell colSpan={6} align="center">No transactions</TableCell></TableRow>
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

function StackRow({ children }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      {children}
    </Box>
  );
}
