import React, { useEffect, useState } from 'react';
import { getBankBalance, getBankTransactions, bankBonus } from '../services/bankService';
import { Card, CardContent, Typography, Grid, Button, TextField, Alert, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';

export default function AdminBank() {
  const [balance, setBalance] = useState(0);
  const [tx, setTx] = useState([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [riderIds, setRiderIds] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const refresh = async () => {
    try {
      setErr(''); setMsg('');
      const b = await getBankBalance();
      setBalance(b.balance || 0);
      const t = await getBankTransactions(100);
      setTx(t.items || []);
    } catch (e) { setErr(e.message || 'Failed to load bank'); }
  };

  useEffect(() => { refresh(); }, []);

  const onBonus = async () => {
    setErr(''); setMsg('');
    try {
      const ids = riderIds.trim() ? riderIds.split(',').map(s => s.trim()) : undefined;
      const res = await bankBonus(Number(amount), ids, reason, `ui-${Date.now()}`);
      setMsg(`Credited ${res.credited} riders`);
      await refresh();
    } catch (e) { setErr(e.message || 'Bonus failed'); }
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {err && (<Grid item xs={12}><Alert severity="error">{err}</Alert></Grid>)}
      {msg && (<Grid item xs={12}><Alert severity="success">{msg}</Alert></Grid>)}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Bank Balance</Typography>
            <Typography variant="h4">{balance}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Bonus Payout</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField label="Amount" value={amount} onChange={e=>setAmount(e.target.value)} size="small"/>
              <TextField label="Reason" value={reason} onChange={e=>setReason(e.target.value)} size="small" sx={{ flex: 1 }}/>
            </Stack>
            <TextField label="Rider IDs (comma-separated, optional)" value={riderIds} onChange={e=>setRiderIds(e.target.value)} fullWidth size="small" sx={{ mb: 2 }}/>
            <Button variant="contained" onClick={onBonus}>Pay from Bank</Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Bank Transactions</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Balance After</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Title</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tx.map(row => (
                  <TableRow key={row._id}>
                    <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.balanceAfter}</TableCell>
                    <TableCell>{row.source?.kind}</TableCell>
                    <TableCell>{row.title}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


