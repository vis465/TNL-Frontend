import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
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
import { createLoan, forepayUpcomingEmi, getLoanPlans, getMyLoanInstallments, getMyLoans } from '../services/loanService';

const MAX_LOAN_PRINCIPAL = 10000;

const Loans = () => {
  const [principal, setPrincipal] = useState(1000);
  const [plans, setPlans] = useState([]);
  const [selectedTenure, setSelectedTenure] = useState(3);
  const [myLoans, setMyLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedPlan = useMemo(
    () => plans.find((p) => Number(p.tenureMonths) === Number(selectedTenure)),
    [plans, selectedTenure]
  );

  async function loadPlans(p = principal) {
    const principalValue = Number(p);
    if (!Number.isFinite(principalValue) || principalValue <= 0 || principalValue > MAX_LOAN_PRINCIPAL) {
      setPlans([]);
      return;
    }
    const data = await getLoanPlans(principalValue);
    setPlans(data.items || []);
    if (data.items?.length && !data.items.some((x) => Number(x.tenureMonths) === Number(selectedTenure))) {
      setSelectedTenure(data.items[0].tenureMonths);
    }
  }

  async function loadMyLoans() {
    const data = await getMyLoans();
    setMyLoans(data || []);
    if ((data || []).length && !selectedLoanId) {
      setSelectedLoanId(data[0]._id);
    }
  }

  async function loadInstallments(loanId) {
    if (!loanId) return;
    const data = await getMyLoanInstallments(loanId);
    setInstallments(data.installments || []);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([loadPlans(), loadMyLoans()]);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load loan data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    loadInstallments(selectedLoanId).catch(() => setInstallments([]));
  }, [selectedLoanId]);

  const onCreateLoan = async () => {
    try {
      const principalValue = Number(principal);
      if (!Number.isFinite(principalValue) || principalValue <= 0) {
        setError('Principal must be greater than 0');
        return;
      }
      if (principalValue > MAX_LOAN_PRINCIPAL) {
        setError(`Maximum loan limit is ${MAX_LOAN_PRINCIPAL} tokens`);
        return;
      }
      setActionLoading(true);
      setError('');
      setMessage('');
      await createLoan({
        principal: principalValue,
        tenureMonths: Number(selectedTenure),
        metadata: { source: 'rider_ui' }
      });
      await Promise.all([loadPlans(principal), loadMyLoans()]);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create loan');
    } finally {
      setActionLoading(false);
    }
  };

  const onForepayUpcoming = async () => {
    if (!selectedLoanId) return;
    try {
      setActionLoading(true);
      setError('');
      setMessage('');
      const result = await forepayUpcomingEmi(selectedLoanId);
      setMessage(`EMI #${result.installmentNo} forepaid. Debited ${result.debitedAmount} tokens.`);
      await Promise.all([loadMyLoans(), loadInstallments(selectedLoanId)]);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to forepay EMI');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Loans & EMI</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select your loan amount and tenure. EMI is calculated with flat interest.
      </Typography>

      {(loading || actionLoading) && <LinearProgress sx={{ mb: 2 }} />}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Take New Loan</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  onBlur={() => loadPlans(principal).catch(() => {})}
                  inputProps={{ min: 1, max: MAX_LOAN_PRINCIPAL }}
                  helperText={`Maximum allowed: ${MAX_LOAN_PRINCIPAL} tokens`}
                />
                <TextField
                  select
                  label="Tenure (months)"
                  value={selectedTenure}
                  onChange={(e) => setSelectedTenure(Number(e.target.value))}
                >
                  {plans.map((p) => (
                    <MenuItem key={p.tenureMonths} value={p.tenureMonths}>
                      {p.tenureMonths} months | EMI {p.emiAmount}
                    </MenuItem>
                  ))}
                </TextField>
                {selectedPlan && (
                  <Box>
                    <Typography variant="body2">Total Interest: {selectedPlan.totalInterest}</Typography>
                    <Typography variant="body2">Total Payable: {selectedPlan.totalPayable}</Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>Monthly EMI: {selectedPlan.emiAmount}</Typography>
                  </Box>
                )}
                <Button variant="contained" onClick={onCreateLoan} disabled={actionLoading || !selectedPlan}>
                  Buy Loan
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>My Loans</Typography>
              <Stack spacing={1}>
                {myLoans.length === 0 && <Typography variant="body2">No loans yet.</Typography>}
                {myLoans.map((loan) => (
                  <Box
                    key={loan._id}
                    sx={{ border: 1, borderColor: selectedLoanId === loan._id ? 'primary.main' : 'divider', p: 1.5, borderRadius: 1, cursor: 'pointer' }}
                    onClick={() => setSelectedLoanId(loan._id)}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1">{loan.loanNumber || loan._id}</Typography>
                      <Chip size="small" label={loan.status} color={loan.status === 'closed' ? 'success' : loan.status === 'overdue' ? 'error' : 'warning'} />
                    </Stack>
                    <Typography variant="caption">Outstanding: {loan.outstandingAmount} | EMI: {loan.emiAmount}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                onClick={onForepayUpcoming}
                disabled={actionLoading || !selectedLoanId}
              >
                Forepay Upcoming EMI
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>EMI Schedule</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Carry Fwd</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {installments.map((it) => (
                    <TableRow key={it._id}>
                      <TableCell>{it.installmentNo}</TableCell>
                      <TableCell>{new Date(it.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{it.dueAmount}</TableCell>
                      <TableCell>{it.paidAmount}</TableCell>
                      <TableCell>{it.carryForwardAmount}</TableCell>
                      <TableCell>{it.status}</TableCell>
                    </TableRow>
                  ))}
                  {installments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>Select a loan to view EMI schedule.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Loans;
