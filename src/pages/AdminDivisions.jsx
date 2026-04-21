import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import LocalAtmOutlined from '@mui/icons-material/LocalAtmOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const emptyForm = {
  name: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  leader: null,
  maxMembers: '',
  taxPercent: '0',
};

export default function AdminDivisions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ _id: '', name: '', description: '', logoUrl: '', bannerUrl: '', maxMembers: '' });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Leader dropdown state
  const [leaderOptions, setLeaderOptions] = useState([]);
  const [leaderLoading, setLeaderLoading] = useState(false);
  const [leaderQuery, setLeaderQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/divisions');
      setItems(data.divisions || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!createOpen) return;
    const t = setTimeout(async () => {
      setLeaderLoading(true);
      try {
        const { data } = await axiosInstance.get('/divisions/leaders/search', {
          params: { q: leaderQuery || undefined, limit: 40 },
        });
        setLeaderOptions(data.users || []);
      } catch (_) {
        setLeaderOptions([]);
      } finally {
        setLeaderLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [createOpen, leaderQuery]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (d) => d.name?.toLowerCase().includes(term) || d.description?.toLowerCase().includes(term),
    );
  }, [items, q]);

  const openCreate = () => {
    setCreateForm(emptyForm);
    setLeaderQuery('');
    setCreateOpen(true);
  };

  const create = async () => {
    setError('');
    setSubmitting(true);
    try {
      if (!createForm.leader?._id) {
        setError('Please select a leader.');
        setSubmitting(false);
        return;
      }
      const { data } = await axiosInstance.post('/divisions', {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        logoUrl: createForm.logoUrl.trim(),
        bannerUrl: createForm.bannerUrl.trim(),
        leaderId: createForm.leader._id,
        maxMembers: createForm.maxMembers ? Number(createForm.maxMembers) : null,
        taxPercent: Number(createForm.taxPercent) || 0,
      });
      setCreateOpen(false);
      setCreateForm(emptyForm);
      load();
      if (data?.division?._id) navigate(`/admin/divisions/${data.division._id}`);
    } catch (e) {
      setError(e?.response?.data?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (d) => {
    setEditForm({
      _id: d._id,
      name: d.name || '',
      description: d.description || '',
      logoUrl: d.logoUrl || '',
      bannerUrl: d.bannerUrl || '',
      maxMembers: d.maxMembers == null ? '' : String(d.maxMembers),
    });
    setEditOpen(true);
  };

  const openDelete = (d) => {
    setDeleteTarget(d);
    setDeleteConfirm('');
  };

  const submitDelete = async () => {
    if (!deleteTarget || deleteConfirm !== deleteTarget.name) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/divisions/${deleteTarget._id}`);
      setDeleteTarget(null);
      setDeleteConfirm('');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const saveEdit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await axiosInstance.patch(`/divisions/${editForm._id}`, {
        name: editForm.name.trim(),
        description: editForm.description,
        logoUrl: editForm.logoUrl.trim(),
        bannerUrl: editForm.bannerUrl.trim(),
        maxMembers: editForm.maxMembers === '' ? null : Number(editForm.maxMembers),
      });
      setEditOpen(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Divisions</Typography>
          <Typography variant="body2" color="text.secondary">
            Oversee divisions, assign leaders, and track wallets across the community.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search divisions"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
          />
          <Button variant="contained" onClick={openCreate}>New division</Button>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {!loading && !filtered.length && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <GroupsOutlined sx={{ fontSize: 48, opacity: 0.6, mb: 1 }} />
            <Typography variant="h6">No divisions yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Create your first division to start onboarding riders.
            </Typography>
            <Button variant="contained" onClick={openCreate}>New division</Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {filtered.map((d) => (
          <Grid item xs={12} sm={6} md={4} key={d._id}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
              }}
            >
              <CardActionArea component={RouterLink} to={`/admin/divisions/${d._id}`}>
                {d.bannerUrl ? (
                  <CardMedia component="img" height="120" image={d.bannerUrl} alt={`${d.name} banner`} />
                ) : (
                  <Box sx={{ height: 120, background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})` }} />
                )}
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Avatar
                      src={d.logoUrl || undefined}
                      alt={d.name}
                      sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'background.paper', mt: -5, boxShadow: 3 }}
                    >
                      {d.name?.[0] || 'D'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{d.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        /{d.slug}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 40,
                    mb: 1.5,
                  }}>
                    {d.description || 'No description yet.'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" icon={<GroupsOutlined />} label={`${d.memberCount ?? 0} members`} />
                    <Chip size="small" icon={<AccountBalanceWalletOutlined />} label={`${(d.walletBalance ?? 0).toLocaleString()} tokens`} />
                    <Chip size="small" icon={<LocalAtmOutlined />} label={`Tax ${d.taxPercent ?? 0}%`} />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Stack direction="row" spacing={1} sx={{ p: 1.5, pt: 0 }}>
                <Tooltip title="Public page">
                  <IconButton
                    size="small"
                    component={RouterLink}
                    to={`/divisions/${d.slug}`}
                    target="_blank"
                    rel="noopener"
                  >
                    <OpenInNewOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(d)}>
                  Edit
                </Button>
                <Tooltip title="Delete division">
                  <IconButton size="small" color="error" onClick={() => openDelete(d)}>
                    <DeleteOutlineOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button size="small" component={RouterLink} to={`/admin/divisions/${d._id}`} variant="outlined" sx={{ ml: 'auto' }}>
                  Manage
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create division</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Logo URL (public CDN)"
                placeholder="https://cdn.example.com/logo.png"
                value={createForm.logoUrl}
                onChange={(e) => setCreateForm((p) => ({ ...p, logoUrl: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Banner URL (public CDN)"
                placeholder="https://cdn.example.com/banner.png"
                value={createForm.bannerUrl}
                onChange={(e) => setCreateForm((p) => ({ ...p, bannerUrl: e.target.value }))}
                fullWidth
              />
            </Stack>
            {(createForm.logoUrl || createForm.bannerUrl) && (
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px dashed', borderColor: 'divider' }}>
                {createForm.bannerUrl ? (
                  <Box component="img" src={createForm.bannerUrl} alt="Banner preview" sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <Box sx={{ height: 120, bgcolor: 'action.hover' }} />
                )}
                <Avatar
                  src={createForm.logoUrl || undefined}
                  sx={{ position: 'absolute', bottom: 8, left: 16, width: 48, height: 48, border: '2px solid', borderColor: 'background.paper' }}
                >
                  {createForm.name?.[0] || 'D'}
                </Avatar>
              </Box>
            )}
            <Autocomplete
              options={leaderOptions}
              loading={leaderLoading}
              value={createForm.leader}
              getOptionLabel={(o) => {
                if (!o) return '';
                const riderName = o.rider?.name || o.username || 'User';
                const employee = o.rider?.employeeID ? ` · ${o.rider.employeeID}` : '';
                return `${riderName} (${o.username})${employee}`;
              }}
              isOptionEqualToValue={(a, b) => a?._id === b?._id}
              onInputChange={(_, v, reason) => {
                if (reason === 'input') setLeaderQuery(v);
              }}
              onChange={(_, v) => setCreateForm((p) => ({ ...p, leader: v }))}
              renderOption={(props, o) => (
                <li {...props}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={o.rider?.avatar || undefined} sx={{ width: 28, height: 28 }}>
                      {(o.rider?.name || o.username || '?')?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {o.rider?.name || o.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{o.username}
                        {o.rider?.employeeID ? ` · ${o.rider.employeeID}` : ''}
                        {o.email ? ` · ${o.email}` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Leader (global rider search)"
                  required
                  helperText="Search by rider name, username, employee ID, or TruckersHub ID"
                />
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Max members"
                type="number"
                value={createForm.maxMembers}
                onChange={(e) => setCreateForm((p) => ({ ...p, maxMembers: e.target.value }))}
                fullWidth
                helperText="Leave blank for unlimited"
              />
              <TextField
                label="Initial tax %"
                type="number"
                value={createForm.taxPercent}
                onChange={(e) => setCreateForm((p) => ({ ...p, taxPercent: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={create}
            disabled={submitting || !createForm.name.trim() || !createForm.leader?._id}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit division</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Logo URL"
                value={editForm.logoUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, logoUrl: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Banner URL"
                value={editForm.bannerUrl}
                onChange={(e) => setEditForm((p) => ({ ...p, bannerUrl: e.target.value }))}
                fullWidth
              />
            </Stack>
            {(editForm.logoUrl || editForm.bannerUrl) && (
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px dashed', borderColor: 'divider' }}>
                {editForm.bannerUrl ? (
                  <Box component="img" src={editForm.bannerUrl} alt="Banner preview" sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <Box sx={{ height: 120, bgcolor: 'action.hover' }} />
                )}
                <Avatar
                  src={editForm.logoUrl || undefined}
                  sx={{ position: 'absolute', bottom: 8, left: 16, width: 48, height: 48, border: '2px solid', borderColor: 'background.paper' }}
                >
                  {editForm.name?.[0] || 'D'}
                </Avatar>
              </Box>
            )}
            <TextField
              label="Max members"
              type="number"
              value={editForm.maxMembers}
              onChange={(e) => setEditForm((p) => ({ ...p, maxMembers: e.target.value }))}
              fullWidth
              helperText="Blank = unlimited"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={submitting || !editForm.name.trim()}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete division</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will deactivate <b>{deleteTarget?.name}</b>, detach all active members, and cancel pending
              invites. Wallet transactions and historical data are preserved.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              To confirm, type the division name: <b>{deleteTarget?.name}</b>
            </Typography>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder={deleteTarget?.name || ''}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitDelete}
            disabled={deleting || !deleteTarget || deleteConfirm !== deleteTarget.name}
          >
            {deleting ? 'Deleting…' : 'Delete division'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
