import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  bankBonus,
  bankDeduct,
  bankCreditDivision,
  bankDebitDivision,
  getBankDivisions,
  searchRiders,
} from '../../../services/bankService';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
}

export default function BankActionsTab({ onSuccess, onError }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [riderOptions, setRiderOptions] = useState([]);
  const [deductRiders, setDeductRiders] = useState([]);
  const [deductAmount, setDeductAmount] = useState('');
  const [deductReason, setDeductReason] = useState('');
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [division, setDivision] = useState(null);
  const [divAmount, setDivAmount] = useState('');
  const [divReason, setDivReason] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBankDivisions('').then((d) => setDivisionOptions(d.items || []));
  }, []);

  const runConfirmed = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      if (confirm.type === 'bonus') {
        const res = await bankBonus(Number(amount), selectedRiders.map((r) => r._id), reason, `ui-${Date.now()}`);
        onSuccess?.(`Credited ${res.credited} riders`);
      } else if (confirm.type === 'deduct') {
        const res = await bankDeduct(Number(deductAmount), deductRiders.map((r) => r._id), deductReason, `ui-deduct-${Date.now()}`);
        onSuccess?.(`Deducted from ${res.deducted} riders (${formatCurrency(res.totalDeducted)})`);
      } else if (confirm.type === 'divCredit') {
        await bankCreditDivision(division._id, { amount: Number(divAmount), reason: divReason });
        onSuccess?.(`Sent ${formatCurrency(divAmount)} to ${division.name}`);
      } else if (confirm.type === 'divDebit') {
        await bankDebitDivision(division._id, { amount: Number(divAmount), reason: divReason });
        onSuccess?.(`Collected ${formatCurrency(divAmount)} from ${division.name}`);
      }
      setConfirm(null);
    } catch (e) {
      onError?.(e.response?.data?.message || e.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const searchRiderOpts = useCallback(async (q) => {
    if (!q || q.length < 2) return;
    setRiderOptions(await searchRiders(q, 10));
  }, []);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Bonus payout</Typography>
              <Stack spacing={2}>
                <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Autocomplete
                  multiple
                  options={riderOptions}
                  getOptionLabel={(o) => `${o.name || o.tmpIngameName} (${o.employeeID || o._id})`}
                  value={selectedRiders}
                  onChange={(_, v) => setSelectedRiders(v)}
                  onInputChange={(_, v) => searchRiderOpts(v)}
                  renderInput={(params) => <TextField {...params} label="Riders (empty = all active)" />}
                />
                <Button variant="contained" onClick={() => setConfirm({ type: 'bonus', label: `Pay bonus ${formatCurrency(amount)}?` })}>
                  Pay bonus
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Deduct from riders</Typography>
              <Stack spacing={2}>
                <TextField label="Amount" type="number" value={deductAmount} onChange={(e) => setDeductAmount(e.target.value)} />
                <TextField label="Reason" value={deductReason} onChange={(e) => setDeductReason(e.target.value)} />
                <Autocomplete
                  multiple
                  options={riderOptions}
                  getOptionLabel={(o) => `${o.name || o.tmpIngameName} (${o.employeeID || o._id})`}
                  value={deductRiders}
                  onChange={(_, v) => setDeductRiders(v)}
                  onInputChange={(_, v) => searchRiderOpts(v)}
                  renderInput={(params) => <TextField {...params} label="Riders" required />}
                />
                <Button color="warning" variant="contained" onClick={() => setConfirm({ type: 'deduct', label: `Deduct ${formatCurrency(deductAmount)} from ${deductRiders.length} rider(s)?` })}>
                  Deduct
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Division transfers</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
                <Autocomplete
                  sx={{ minWidth: 260 }}
                  options={divisionOptions}
                  getOptionLabel={(o) => `${o.name} (${formatCurrency(o.walletBalance)})`}
                  value={division}
                  onChange={(_, v) => setDivision(v)}
                  onInputChange={(_, q) => getBankDivisions(q).then((d) => setDivisionOptions(d.items || []))}
                  renderInput={(params) => <TextField {...params} label="Division" />}
                />
                <TextField label="Amount" type="number" value={divAmount} onChange={(e) => setDivAmount(e.target.value)} />
                <TextField label="Reason" value={divReason} onChange={(e) => setDivReason(e.target.value)} sx={{ flex: 1 }} />
                <Button variant="outlined" onClick={() => setConfirm({ type: 'divCredit', label: `Send ${formatCurrency(divAmount)} to ${division?.name}?` })} disabled={!division}>
                  Bank → division
                </Button>
                <Button variant="outlined" color="warning" onClick={() => setConfirm({ type: 'divDebit', label: `Collect ${formatCurrency(divAmount)} from ${division?.name}?` })} disabled={!division}>
                  Division → bank
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        <DialogTitle>Confirm action</DialogTitle>
        <DialogContent><Typography>{confirm?.label}</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="contained" onClick={runConfirmed} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
