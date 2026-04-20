import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import axiosInstance from '../utils/axios';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percent',
  value: 10,
  minPrice: 0,
  maxUses: 0,
  expiresAt: '',
  active: true,
};

function toDateInput(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const iso = d.toISOString();
    return iso.slice(0, 16);
  } catch (_e) {
    return '';
  }
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/coupons', { params: { limit: 500 } });
      setCoupons(Array.isArray(data?.coupons) ? data.coupons : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing({});
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percent',
      value: coupon.value ?? 0,
      minPrice: coupon.minPrice ?? 0,
      maxUses: coupon.maxUses ?? 0,
      expiresAt: toDateInput(coupon.expiresAt),
      active: coupon.active !== false,
    });
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.code.trim()) {
      setError('Code is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        value: Number(form.value) || 0,
        minPrice: Number(form.minPrice) || 0,
        maxUses: Number(form.maxUses) || 0,
        active: Boolean(form.active),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (editing?._id) {
        await axiosInstance.patch(`/coupons/${editing._id}`, payload);
        setFeedback(`Updated coupon ${payload.code}`);
      } else {
        await axiosInstance.post('/coupons', payload);
        setFeedback(`Created coupon ${payload.code}`);
      }
      closeForm();
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting?._id) return;
    try {
      await axiosInstance.delete(`/coupons/${deleting._id}`);
      setFeedback(`Deleted coupon ${deleting.code}`);
      setDeleting(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  };

  const active = useMemo(
    () => coupons.filter((c) => c.active && !(c.expiresAt && new Date(c.expiresAt).getTime() < Date.now())).length,
    [coupons]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <LocalOfferOutlined color="primary" />
        <Typography variant="h5" fontWeight={800}>
          Marketplace coupons
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New coupon
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Create discount codes that division leaders can apply at checkout when buying trucks from
        the marketplace. Percent coupons reduce by a percentage (0-100). Flat coupons subtract a
        fixed token amount. Use <code>maxUses = 0</code> for unlimited.
      </Typography>

      {feedback && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setFeedback('')}>
          {feedback}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total coupons</Typography>
              <Typography variant="h5" fontWeight={800}>{coupons.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Currently active</Typography>
              <Typography variant="h5" fontWeight={800} color="success.main">{active}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total redemptions</Typography>
              <Typography variant="h5" fontWeight={800}>
                {coupons.reduce((s, c) => s + (c.usedCount || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Card} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">Min price</TableCell>
              <TableCell align="right">Uses</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((c) => {
              const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
              const status = !c.active ? 'Disabled' : expired ? 'Expired' : 'Active';
              const statusColor = status === 'Active' ? 'success' : status === 'Expired' ? 'warning' : 'default';
              return (
                <TableRow key={c._id} hover>
                  <TableCell>
                    <Typography fontWeight={700}>{c.code}</Typography>
                    {c.description && (
                      <Typography variant="caption" color="text.secondary">{c.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{c.discountType}</TableCell>
                  <TableCell align="right">
                    {c.discountType === 'percent' ? `${c.value}%` : `${Number(c.value).toLocaleString()} tokens`}
                  </TableCell>
                  <TableCell align="right">{Number(c.minPrice || 0).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {c.usedCount || 0}
                    {c.maxUses > 0 ? ` / ${c.maxUses}` : ' / ∞'}
                  </TableCell>
                  <TableCell>{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={status} color={statusColor} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(c)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleting(c)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {!coupons.length && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No coupons yet. Create one to offer a discount.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editing)} onClose={() => !saving && closeForm()} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?._id ? `Edit ${editing.code}` : 'New coupon'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              autoFocus
              required
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
            <TextField
              label="Description (internal)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Discount type</InputLabel>
                <Select
                  label="Discount type"
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                >
                  <MenuItem value="percent">Percent (%)</MenuItem>
                  <MenuItem value="flat">Flat (tokens)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                label={form.discountType === 'percent' ? 'Percent (0-100)' : 'Tokens off'}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                type="number"
                label="Min price floor"
                value={form.minPrice}
                onChange={(e) => setForm((f) => ({ ...f, minPrice: e.target.value }))}
                helperText="Price cannot go below this"
                fullWidth
              />
              <TextField
                type="number"
                label="Max uses (0 = unlimited)"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              type="datetime-local"
              label="Expires at (optional)"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={saving}>Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>
            {saving ? 'Saving…' : editing?._id ? 'Save changes' : 'Create coupon'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete coupon</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleting?.code}</strong>? This will prevent any further redemptions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
