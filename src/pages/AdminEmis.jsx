import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { getAdminInstallments, runMonthlyDeductions } from '../services/loanService';

const AdminEmis = () => {
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminInstallments({ status: status || undefined });
      setItems(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load EMI records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const onRunNow = async () => {
    try {
      setRunning(true);
      setError('');
      const result = await runMonthlyDeductions();
      setMessage(`Monthly run complete. Processed ${result.processed || 0} installments.`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to run deductions');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Admin EMI Tracking</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </TextField>
          <Button variant="contained" onClick={onRunNow} disabled={running}>
            {running ? 'Running...' : 'Run Monthly Deduction'}
          </Button>
        </Stack>
      </Stack>
      {(loading || running) && <LinearProgress sx={{ mb: 2 }} />}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Loan</TableCell>
                <TableCell>Rider</TableCell>
                <TableCell>Installment</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Carry Fwd</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it._id}>
                  <TableCell>{it.loanId?.loanNumber || it.loanId?._id || '-'}</TableCell>
                  <TableCell>{it.riderId?.name || it.riderId?.tmpIngameName || '-'}</TableCell>
                  <TableCell>#{it.installmentNo}</TableCell>
                  <TableCell>{new Date(it.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{it.dueAmount}</TableCell>
                  <TableCell>{it.paidAmount}</TableCell>
                  <TableCell>{it.carryForwardAmount}</TableCell>
                  <TableCell>
                    <Chip size="small" label={it.status} color={it.status === 'paid' ? 'success' : it.status === 'overdue' ? 'error' : 'warning'} />
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>No EMI records found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminEmis;
