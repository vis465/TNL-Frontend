import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { getAdminLoans } from '../services/loanService';
import { AdminEmptyState, AdminFilterBar, AdminPageHeader, useAdminFeedback } from '../components/admin/primitives';

const AdminLoans = () => {
  const { showError, Feedback } = useAdminFeedback();
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAdminLoans({ status: status || undefined });
      setItems(data.items || []);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <AdminPageHeader description="Track active, overdue, and closed fleet loans." sx={{ mb: 1 }} />

      <AdminFilterBar>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>
      </AdminFilterBar>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Loan</TableCell>
                <TableCell>Rider</TableCell>
                <TableCell>Principal</TableCell>
                <TableCell>EMI</TableCell>
                <TableCell>Outstanding</TableCell>
                <TableCell>Next Due</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((loan) => (
                <TableRow key={loan._id}>
                  <TableCell>{loan.loanNumber || loan._id}</TableCell>
                  <TableCell>{loan.riderId?.name || loan.riderId?.tmpIngameName || 'N/A'}</TableCell>
                  <TableCell>{loan.principal}</TableCell>
                  <TableCell>{loan.emiAmount}</TableCell>
                  <TableCell>{loan.outstandingAmount}</TableCell>
                  <TableCell>{loan.nextDueDate ? new Date(loan.nextDueDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={loan.status} color={loan.status === 'closed' ? 'success' : loan.status === 'overdue' ? 'error' : 'warning'} />
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ border: 0 }}>
                    <AdminEmptyState title="No loans found" description="Try a different status filter." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Showing {items.length} loans</Typography>
      </Box>
      <Feedback />
    </Container>
  );
};

export default AdminLoans;
