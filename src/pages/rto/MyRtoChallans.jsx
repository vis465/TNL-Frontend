import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RtoChallanDrawer from '../../components/rto/RtoChallanDrawer';
import {
  fetchMyChallans,
  payAllMyChallans,
  payMyChallan,
  submitChallanAppeal,
} from '../../services/rtoService';

export default function MyRtoChallans() {
  const [items, setItems] = useState([]);
  const [outstanding, setOutstanding] = useState(0);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      const data = await fetchMyChallans();
      setItems(data.items || []);
      setOutstanding(data.outstanding || 0);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load fines');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        My RTO fines
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Outstanding: <strong>{outstanding}</strong> tokens
      </Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" disabled={!outstanding} onClick={() => payAllMyChallans().then(load)}>
          Pay all pending
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Offence</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.challanNumber}</TableCell>
              <TableCell>{c.offenceTitle}</TableCell>
              <TableCell>{c.amount}</TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => {
                    setSelected(c);
                    setDrawerOpen(true);
                  }}
                >
                  Details
                </Button>
                {c.status === 'pending' && (
                  <Button size="small" variant="outlined" onClick={() => payMyChallan(c._id).then(load)}>
                    Pay
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected?.status === 'pending' && (
        <Box sx={{ mt: 3, maxWidth: 480 }}>
          <Typography variant="subtitle2" gutterBottom>
            Appeal (pending challan)
          </Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            value={appealText}
            onChange={(e) => setAppealText(e.target.value)}
          />
          <Button
            sx={{ mt: 1 }}
            onClick={() => submitChallanAppeal(selected._id, appealText).then(load)}
          >
            Submit appeal
          </Button>
        </Box>
      )}

      <RtoChallanDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} challan={selected} />
    </Box>
  );
}
