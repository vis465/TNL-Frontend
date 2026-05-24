import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import {
  createOffence,
  deactivateOffence,
  fetchAdminOffences,
  updateOffence,
} from '../../services/rtoService';

const emptyForm = {
  code: '',
  title: '',
  description: '',
  fineAmount: 100,
  category: 'traffic',
  severity: 'minor',
};

export default function AdminRtoOffences() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setErr('');
    try {
      setItems(await fetchAdminOffences());
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load offences');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setErr('');
    setMsg('');
    try {
      if (editingId) {
        await updateOffence(editingId, form);
        setMsg('Offence updated');
      } else {
        await createOffence(form);
        setMsg('Offence created');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Save failed');
    }
  };

  return (
    <Box>
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Code"
                value={form.code}
                disabled={!!editingId}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                fullWidth
              />
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Fine amount"
                type="number"
                value={form.fineAmount}
                onChange={(e) => setForm({ ...form, fineAmount: Number(e.target.value) })}
              />
            </Stack>
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                sx={{ minWidth: 160 }}
              >
                {['traffic', 'conduct', 'fleet', 'other'].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Severity"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="minor">minor</MenuItem>
                <MenuItem value="major">major</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={save}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              {editingId && (
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel edit
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Fine</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Active</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((o) => (
            <TableRow key={o._id}>
              <TableCell>{o.code}</TableCell>
              <TableCell>{o.title}</TableCell>
              <TableCell>{o.fineAmount}</TableCell>
              <TableCell>{o.severity}</TableCell>
              <TableCell>{o.active ? 'yes' : 'no'}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => {
                    setEditingId(o._id);
                    setForm({
                      code: o.code,
                      title: o.title,
                      description: o.description || '',
                      fineAmount: o.fineAmount,
                      category: o.category,
                      severity: o.severity,
                    });
                  }}
                >
                  Edit
                </Button>
                {o.active && (
                  <Button size="small" color="warning" onClick={() => deactivateOffence(o._id).then(load)}>
                    Deactivate
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
