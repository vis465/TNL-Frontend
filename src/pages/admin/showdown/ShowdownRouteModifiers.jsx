import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import axiosInstance from '../../../utils/axios';
import MultiplierChip from '../../../components/showdown/MultiplierChip';

export default function ShowdownRouteModifiers() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [cityOpts, setCityOpts] = useState([]);
  const [form, setForm] = useState({
    code: '',
    sourceCityName: '',
    destCityName: '',
    revenueMultiplier: 2,
    fuelDiscountMultiplier: 1,
    cargoNameBonus: '',
    startsAt: '',
    expiresAt: '',
  });

  const load = async () => {
    const { data } = await axiosInstance.get('/admin/showdown/route-modifiers');
    setItems(data.items || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const searchCities = async (q) => {
    const { data } = await axiosInstance.get('/admin/showdown/lookup/cities', {
      params: { q, limit: 25 },
    });
    setCityOpts(data.items || []);
  };

  const save = async () => {
    await axiosInstance.post('/admin/showdown/route-modifiers', {
      ...form,
      cargoNameBonus: form.cargoNameBonus || null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
    setOpen(false);
    await load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete?')) return;
    await axiosInstance.delete(`/admin/showdown/route-modifiers/${id}`);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Route modifiers</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add
        </Button>
      </Stack>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Mult</TableCell>
              <TableCell>Window</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.code}</TableCell>
                <TableCell>
                  {row.sourceCityName} → {row.destCityName}
                </TableCell>
                <TableCell>
                  <MultiplierChip value={row.revenueMultiplier} />
                </TableCell>
                <TableCell>
                  {row.startsAt && new Date(row.startsAt).toLocaleString()} →{' '}
                  {row.expiresAt && new Date(row.expiresAt).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" color="error" onClick={() => del(row._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New route modifier</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              fullWidth
              required
            />
            <Autocomplete
              freeSolo
              options={cityOpts}
              getOptionLabel={(o) => (typeof o === 'string' ? o : o.name || '')}
              onInputChange={(_, v) => searchCities(v)}
              onChange={(_, v) =>
                setForm((f) => ({
                  ...f,
                  sourceCityName: typeof v === 'string' ? v : v?.name || '',
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Source city" required fullWidth />
              )}
            />
            <Autocomplete
              freeSolo
              options={cityOpts}
              getOptionLabel={(o) => (typeof o === 'string' ? o : o.name || '')}
              onInputChange={(_, v) => searchCities(v)}
              onChange={(_, v) =>
                setForm((f) => ({
                  ...f,
                  destCityName: typeof v === 'string' ? v : v?.name || '',
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Destination city" required fullWidth />
              )}
            />
            <TextField
              type="number"
              label="Revenue multiplier"
              value={form.revenueMultiplier}
              onChange={(e) =>
                setForm((f) => ({ ...f, revenueMultiplier: Number(e.target.value) }))
              }
              fullWidth
            />
            <TextField
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              label="Starts"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              fullWidth
            />
            <TextField
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              label="Expires"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
