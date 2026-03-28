import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import TruckThumbAvatar from '../components/TruckThumbAvatar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  listAdminTrucks,
  createAdminTruck,
  updateAdminTruck,
  deleteAdminTruck
} from '../services/adminTrucksService';

const emptyForm = () => ({
  itemId: '',
  brand: '',
  truckModelName: '',
  name: '',
  truckID: '',
  truckModelID: '',
  truckName: '',
  brandLogo: '',
  truckCompanyLogo: '',
  image: '',
  truckImageLink: '',
  gameType: 'ets2',
  department: '',
  price: '',
  discount: '0',
  effectivePrice: '',
  stock: '0',
  resellable: false,
  maxResalePrice: '0',
  rentPerJobTokens: '0',
  isActive: true,
  source: 'marketplace'
});

function truckToForm(t) {
  const f = emptyForm();
  if (!t) return f;
  return {
    itemId: t.itemId != null ? String(t.itemId) : '',
    brand: t.brand || '',
    truckModelName: t.truckModelName || t.modelName || '',
    name: t.name || '',
    truckID: t.truckID || '',
    truckModelID: t.truckModelID || '',
    truckName: t.truckName || '',
    brandLogo: t.brandLogo || '',
    truckCompanyLogo: t.truckCompanyLogo || '',
    image: t.image || '',
    truckImageLink: t.truckImageLink || '',
    gameType: t.gameType || 'ets2',
    department: t.department || '',
    price: t.price != null ? String(t.price) : '',
    discount: t.discount != null ? String(t.discount) : '0',
    effectivePrice: t.effectivePrice != null ? String(t.effectivePrice) : '',
    stock: t.stock != null ? String(t.stock) : '0',
    resellable: Boolean(t.resellable),
    maxResalePrice: t.maxResalePrice != null ? String(t.maxResalePrice) : '0',
    rentPerJobTokens: t.rentPerJobTokens != null ? String(t.rentPerJobTokens) : '0',
    isActive: t.isActive !== false,
    source: t.source || 'marketplace'
  };
}

function formToCreatePayload(form) {
  const num = (v) => (v === '' || v == null ? undefined : Number(v));
  const body = {
    brand: form.brand.trim(),
    truckModelName: form.truckModelName.trim(),
    name: form.name.trim() || undefined,
    truckID: form.truckID.trim() || undefined,
    truckModelID: form.truckModelID.trim() || undefined,
    truckName: form.truckName.trim() || undefined,
    brandLogo: form.brandLogo.trim() || undefined,
    truckCompanyLogo: form.truckCompanyLogo.trim() || undefined,
    image: form.image.trim() || undefined,
    truckImageLink: form.truckImageLink.trim() || undefined,
    gameType: form.gameType.trim() || undefined,
    department: form.department.trim() || undefined,
    price: num(form.price),
    discount: num(form.discount),
    effectivePrice: num(form.effectivePrice),
    stock: num(form.stock),
    resellable: form.resellable,
    maxResalePrice: num(form.maxResalePrice),
    rentPerJobTokens: num(form.rentPerJobTokens),
    isActive: form.isActive,
    source: form.source.trim() || 'marketplace'
  };
  if (form.itemId.trim()) body.itemId = form.itemId.trim();
  return body;
}

function formToPatchPayload(form) {
  const num = (v) => (v === '' || v == null ? undefined : Number(v));
  const displayName =
    form.name.trim() || `${form.brand.trim()} ${form.truckModelName.trim()}`.trim();
  return {
    brand: form.brand.trim(),
    truckModelName: form.truckModelName.trim(),
    modelName: form.truckModelName.trim(),
    name: displayName,
    truckID: form.truckID.trim() || undefined,
    truckModelID: form.truckModelID.trim() || undefined,
    truckName: form.truckName.trim() || undefined,
    brandLogo: form.brandLogo.trim() || undefined,
    truckCompanyLogo: form.truckCompanyLogo.trim() || undefined,
    image: form.image.trim() || undefined,
    truckImageLink: form.truckImageLink.trim() || undefined,
    gameType: form.gameType.trim() || undefined,
    department: form.department.trim() || undefined,
    price: num(form.price) ?? 0,
    discount: num(form.discount) ?? 0,
    effectivePrice: num(form.effectivePrice) ?? 0,
    stock: num(form.stock) ?? 0,
    resellable: form.resellable,
    maxResalePrice: num(form.maxResalePrice) ?? 0,
    rentPerJobTokens: num(form.rentPerJobTokens) ?? 0,
    isActive: form.isActive,
    source: form.source.trim() || 'marketplace'
  };
}

export default function AdminTrucks() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterGame, setFilterGame] = useState('');
  const [activeOnly, setActiveOnly] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterBrand.trim()) params.brand = filterBrand.trim();
      if (filterGame.trim()) params.gameType = filterGame.trim();
      if (activeOnly === 'true' || activeOnly === 'false') params.active = activeOnly;
      const data = await listAdminTrucks(params);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total) || 0);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load trucks.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterBrand, filterGame, activeOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditItemId(null);
    setForm(emptyForm());
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditItemId(row.itemId);
    setForm(truckToForm(row));
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.brand.trim() || !form.truckModelName.trim()) {
      setFormError('Brand and model name are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editItemId) {
        await updateAdminTruck(editItemId, formToPatchPayload(form));
      } else {
        await createAdminTruck(formToCreatePayload(form));
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.itemId) return;
    setDeleting(true);
    try {
      await deleteAdminTruck(deleteTarget.itemId);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const f = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Truck catalogue
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add truck
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load()}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage marketplace trucks in the <strong>Trucks</strong> collection. Riders see active items on the truck
        marketplace.
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }} alignItems="center">
        <TextField
          size="small"
          label="Filter brand"
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          sx={{ minWidth: 160 }}
        />
        <TextField
          size="small"
          label="Game type"
          value={filterGame}
          onChange={(e) => setFilterGame(e.target.value)}
          placeholder="ets2"
          sx={{ minWidth: 120 }}
        />
        <TextField
          size="small"
          select
          label="Active"
          value={activeOnly}
          onChange={(e) => setActiveOnly(e.target.value)}
          sx={{ minWidth: 140 }}
          SelectProps={{ native: true }}
        >
          <option value="">All</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </TextField>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 1 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={88} />
              <TableCell>Item ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Brand / model</TableCell>
              <TableCell>Game</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Rent/job</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No trucks found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {items.map((row) => (
              <TableRow key={row.itemId || row._id} hover>
                <TableCell sx={{ py: 1, verticalAlign: 'middle' }}>
                  <TruckThumbAvatar
                    image={row.truckImageLink}
                    bannerImage={row.image}
                    brandLogo={row.brandLogo || row.truckCompanyLogo}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{row.itemId}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.brand} {row.truckModelName || row.modelName}
                </TableCell>
                <TableCell>{row.gameType || '—'}</TableCell>
                <TableCell align="right">{Number(row.effectivePrice ?? row.price ?? 0).toLocaleString()}</TableCell>
                <TableCell align="right">{row.stock ?? 0}</TableCell>
                <TableCell align="right">{row.rentPerJobTokens ?? 0}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.isActive ? 'Yes' : 'No'} color={row.isActive ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(row)} aria-label="edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)} aria-label="delete">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Total: {total}
      </Typography>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editItemId ? `Edit truck ${editItemId}` : 'Add truck'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Item ID (optional — auto if empty)"
                value={form.itemId}
                onChange={f('itemId')}
                disabled={Boolean(editItemId)}
                helperText={editItemId ? 'Item ID cannot be changed' : 'Leave blank to generate'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required size="small" label="Brand" value={form.brand} onChange={f('brand')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                size="small"
                label="Model name"
                value={form.truckModelName}
                onChange={f('truckModelName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Display name" value={form.name} onChange={f('name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="truckID (slug)" value={form.truckID} onChange={f('truckID')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="truckModelID"
                value={form.truckModelID}
                onChange={f('truckModelID')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="truckName" value={form.truckName} onChange={f('truckName')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Game type" value={form.gameType} onChange={f('gameType')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Department" value={form.department} onChange={f('department')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Brand logo URL" value={form.brandLogo} onChange={f('brandLogo')} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Company logo URL"
                value={form.truckCompanyLogo}
                onChange={f('truckCompanyLogo')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Banner image URL" value={form.image} onChange={f('image')} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Truck image URL"
                value={form.truckImageLink}
                onChange={f('truckImageLink')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Price" type="number" value={form.price} onChange={f('price')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Discount"
                type="number"
                value={form.discount}
                onChange={f('discount')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Effective price"
                type="number"
                value={form.effectivePrice}
                onChange={f('effectivePrice')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Stock" type="number" value={form.stock} onChange={f('stock')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Rent / job (tokens)"
                type="number"
                value={form.rentPerJobTokens}
                onChange={f('rentPerJobTokens')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Max resale price"
                type="number"
                value={form.maxResalePrice}
                onChange={f('maxResalePrice')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth size="small" label="Source" value={form.source} onChange={f('source')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
                }
                label="Active (shown in marketplace)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.resellable}
                    onChange={(e) => setForm((p) => ({ ...p, resellable: e.target.checked }))}
                  />
                }
                label="Resellable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete truck?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Remove <strong>{deleteTarget?.name}</strong> (itemId {deleteTarget?.itemId})? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
