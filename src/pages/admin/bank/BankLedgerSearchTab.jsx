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
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { searchLedger } from '../../../services/bankService';
import KindChip from './components/KindChip';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
}

export default function BankLedgerSearchTab({ onOpenDetail }) {
  const [jobID, setJobID] = useState('');
  const [appliedJobId, setAppliedJobId] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [grouped, setGrouped] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!appliedJobId) {
      setItems([]);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLedger({ ledger: 'all', jobID: appliedJobId, page, limit: 25 });
      setItems(data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setGrouped(data.grouped || null);
    } catch {
      setItems([]);
      setGrouped(null);
    } finally {
      setLoading(false);
    }
  }, [appliedJobId, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search bank, division, and rider wallet rows by job ID across all ledgers.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          label="Job ID"
          value={jobID}
          onChange={(e) => setJobID(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { setPage(1); setAppliedJobId(jobID.trim()); }
          }}
        />
        <Button variant="contained" onClick={() => { setPage(1); setAppliedJobId(jobID.trim()); }}>
          Search
        </Button>
      </Box>

      {grouped && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Matches — bank: {grouped.bank}, division: {grouped.division}, rider: {grouped.rider}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ledger</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Kind</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center"> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={`${row.ledger}-${row._id}`} hover>
                  <TableCell>{row.ledger}</TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell><KindChip kind={row.source?.kind} ledger={row.ledger} /></TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => onOpenDetail(row)}>
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow><TableCell colSpan={6} align="center">Enter a job ID to search</TableCell></TableRow>
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
