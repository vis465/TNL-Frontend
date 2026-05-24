import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { getUserRole } from '../../localStorageWithExpiry';
import RtoChallanDrawer from '../../components/rto/RtoChallanDrawer';
import {
  cancelChallan,
  exportChallansCsv,
  fetchAdminChallans,
  reviewAppeal,
  waiveChallan,
} from '../../services/rtoService';

export default function AdminRtoChallans() {
  const isAdmin = getUserRole() === 'admin';
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      setItems(await fetchAdminChallans(status ? { status } : {}));
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load challans');
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    const res = await exportChallansCsv(status ? { status } : {});
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rto-challans.csv';
    a.click();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          RTO challans
        </Typography>
        <Button variant="outlined" onClick={handleExport}>
          Export CSV
        </Button>
      </Stack>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <TextField
        select
        size="small"
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        sx={{ mb: 2, minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>
        {['pending', 'paid', 'waived', 'cancelled'].map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </TextField>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Accused</TableCell>
            <TableCell>Offence</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Appeal</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c._id} hover>
              <TableCell>{c.challanNumber}</TableCell>
              <TableCell>{c.accusedRiderName}</TableCell>
              <TableCell>{c.offenceTitle}</TableCell>
              <TableCell>{c.amount}</TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell>{c.appealStatus}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => {
                    setSelected(c);
                    setDrawerOpen(true);
                  }}
                >
                  View
                </Button>
                {isAdmin && c.status === 'pending' && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => waiveChallan(c._id).then(load)}
                    >
                      Waive
                    </Button>
                    <Button
                      size="small"
                      color="warning"
                      onClick={() => cancelChallan(c._id).then(load)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {isAdmin && c.appealStatus === 'pending' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => reviewAppeal(c._id, 'upheld').then(load)}
                    >
                      Uphold
                    </Button>
                    <Button
                      size="small"
                      onClick={() => reviewAppeal(c._id, 'rejected').then(load)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RtoChallanDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        challan={selected}
      />
    </Box>
  );
}
