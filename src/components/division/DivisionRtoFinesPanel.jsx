import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  fetchDivisionRtoChallans,
  payAllDivisionChallans,
  payDivisionChallans,
  payDivisionRiderChallans,
} from '../../services/rtoService';

export default function DivisionRtoFinesPanel({ divisionId }) {
  const [riders, setRiders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [divisionOutstanding, setDivisionOutstanding] = useState(0);
  const [partialByRider, setPartialByRider] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!divisionId) return;
    setErr('');
    setLoading(true);
    try {
      const data = await fetchDivisionRtoChallans(divisionId);
      setRiders(data.riders || []);
      setWalletBalance(data.walletBalance || 0);
      setDivisionOutstanding(data.divisionOutstanding || 0);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load RTO fines');
    } finally {
      setLoading(false);
    }
  }, [divisionId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPending = useMemo(
    () => riders.reduce((s, r) => s + (r.totalDue || 0), 0),
    [riders]
  );

  const payRiderFull = async (riderId) => {
    setErr('');
    try {
      await payDivisionRiderChallans(divisionId, riderId, {});
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Payment failed');
    }
  };

  const payRiderPartial = async (riderId) => {
    const amount = Number(partialByRider[riderId]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErr('Enter a valid partial payment amount');
      return;
    }
    setErr('');
    try {
      await payDivisionRiderChallans(divisionId, riderId, { amount });
      setPartialByRider((p) => ({ ...p, [riderId]: '' }));
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Payment failed');
    }
  };

  const payChallanFull = async (challanId) => {
    setErr('');
    try {
      await payDivisionChallans(divisionId, [challanId]);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Payment failed');
    }
  };

  if (!divisionId) return null;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            RTO fines — members
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Division wallet: {walletBalance.toLocaleString()} tokens · Outstanding fines: {divisionOutstanding.toLocaleString()} · Pending due: {totalPending.toLocaleString()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          disabled={!totalPending || loading}
          onClick={() => payAllDivisionChallans(divisionId).then(load)}
        >
          Pay all members (full)
        </Button>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      {!riders.length && !loading && (
        <Typography variant="body2" color="text.secondary">
          No pending RTO challans for division members.
        </Typography>
      )}

      {riders.map((rider) => (
        <Accordion key={String(rider.riderId)} disableGutters sx={{ mb: 1, border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: '100%', pr: 1 }}>
              <Typography fontWeight={600}>
                {rider.name || 'Rider'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rider.employeeId || '—'}
              </Typography>
              <Chip size="small" color="warning" label={`${rider.totalDue || 0} tokens due`} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  label="Partial payment (tokens)"
                  value={partialByRider[rider.riderId] ?? ''}
                  onChange={(e) => setPartialByRider((p) => ({ ...p, [rider.riderId]: e.target.value }))}
                  inputProps={{ min: 1, max: rider.totalDue }}
                  sx={{ maxWidth: 220 }}
                />
                <Button size="small" variant="outlined" onClick={() => payRiderPartial(rider.riderId)}>
                  Pay partial
                </Button>
                <Button size="small" variant="contained" onClick={() => payRiderFull(rider.riderId)}>
                  Pay full ({rider.totalDue})
                </Button>
              </Stack>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Challan</TableCell>
                    <TableCell>Offence</TableCell>
                    <TableCell align="right">Fine</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Due</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rider.challans || []).map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>{c.challanNumber}</TableCell>
                      <TableCell>{c.offenceTitle}</TableCell>
                      <TableCell align="right">{c.amount}</TableCell>
                      <TableCell align="right">{c.paidAmount || 0}</TableCell>
                      <TableCell align="right">{c.amountDue ?? c.amount}</TableCell>
                      <TableCell align="right">
                        <Button size="small" disabled={!(c.amountDue > 0)} onClick={() => payChallanFull(c._id)}>
                          Pay full
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
