import React, { useEffect, useMemo, useState } from 'react';
import ridersService from '../services/ridersService';
import { useAuth } from '../contexts/AuthContext';
import {
  Avatar,
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
  Divider,
  Fab,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
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
  useMediaQuery,
  useTheme,
  Slide,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DirectionsCar as DirectionsCarIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const initialForm = {
  name: '',
  username: '',
  tmpIngameName: '',
  age: '',
  steamID: '',
  steamID64: '',
  truckersmpId: '',
  truckershubId: '',
  role: 'rider',
  notes: '',
  active: true,
};

export default function AdminRiders() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [vtcId, setVtcId] = useState('70030');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [gameFilter, setGameFilter] = useState('');
  const [dlcFilter, setDlcFilter] = useState('');

  const isAdmin = useMemo(() => ['admin','eventteam','hrteam'].includes(user?.role), [user]);
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ridersService.list();
      setRiders(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  const totals = useMemo(() => {
    const totalKm = riders.reduce((acc, r) => acc + (Number(r.totalKm) || 0), 0);
    const totalRevenue = riders.reduce((acc, r) => acc + (Number(r.totalRevenue) || 0), 0);
    const totalJobs = riders.reduce((acc, r) => acc + (Number(r.totalJobs) || 0), 0);
    const activeCount = riders.filter(r => r.active).length;
    return { totalKm, totalRevenue, totalJobs, activeCount };
  }, [riders]);

  const filtered = useMemo(() => {
    let result = riders;
    
    if (showActiveOnly) {
      result = result.filter(r => r.active);
    }
    
    if (gameFilter) {
      result = result.filter(r => Array.isArray(r.gamesOwned) && r.gamesOwned.includes(gameFilter));
    }

    if (dlcFilter) {
      const [game, dlcName] = dlcFilter.split('::');
      if (game && dlcName) {
        result = result.filter(r => Array.isArray(r?.dlcsOwned?.[game]) && r.dlcsOwned[game].includes(dlcName));
      }
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.username || '').toLowerCase().includes(q) ||
        (r.steamID || '').toLowerCase().includes(q) ||
        (r.steamID64 || '').toLowerCase().includes(q) ||
        (r.truckersmpId || '').toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [riders, search, showActiveOnly, gameFilter, dlcFilter]);

 

  const handleOpenModal = (rider = null) => {
    if (rider) {
      setEditingId(rider._id);
      setForm({
        name: rider.name || '',
        username: rider.username || '',
        tmpIngameName: rider.tmpIngameName || rider.username || '',
        age: rider.age || '',
        steamID: rider.steamID || '',
        steamID64: rider.steamID64 || '',
        truckersmpId: rider.truckersmpId || '',
        truckershubId: rider.truckershubId || '',
        role: rider.role || 'trainee',
        notes: rider.notes || '',
        active: !!rider.active,
      });
    } else {
      setEditingId(null);
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await ridersService.update(editingId, form);
      } else {
        await ridersService.create(form);
      }
      handleCloseModal();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rider? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await ridersService.remove(id);
      await load();
    } catch (e) {
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const onSync = async () => {
    setLoading(true);
    setError('');
    try {
      await ridersService.syncVtc(vtcId);
      await load();
    } catch (e) {
      setError('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography color="text.secondary">
            You don't have permission to access this page.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Riders Management
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ px: 3 }}
          >
            Add Rider
          </Button>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'primary.50' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {riders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Riders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'success.50' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {totals.activeCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'info.50' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {totals.totalKm.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total KM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: 'warning.50' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {totals.totalJobs.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Jobs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search riders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select
                fullWidth
                label="Game"
                value={gameFilter}
                onChange={(e) => { setGameFilter(e.target.value); setDlcFilter(''); }}
                SelectProps={{ native: true }}
              >
                <option value="">All Games</option>
                <option value="ets2">ETS2</option>
                <option value="ats">ATS</option>
              </TextField>
              <TextField
                select
                fullWidth
                label="DLC"
                value={dlcFilter}
                onChange={(e) => setDlcFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">All DLCs</option>
                {gameFilter === 'ets2' && (
                  [
                    'Going East!','Scandinavia','Vive la France!','Italia','Beyond the Baltic Sea','Road to the Black Sea','Iberia','West Balkans','Heart of Russia (if released)',
                    'Heavy Cargo Pack','Special Transport','High Power Cargo Pack','Cabin Accessories','Wheel Tuning Pack','Krone Trailer Pack','FH Tuning Pack','Mighty Griffin Tuning Pack'
                  ].map((d) => (
                    <option key={d} value={`ets2::${d}`}>{d}</option>
                  ))
                )}
                {gameFilter === 'ats' && (
                  [
                    'New Mexico','Oregon','Washington','Utah','Idaho','Colorado','Wyoming','Montana','Texas','Oklahoma','Kansas','Nebraska','Arkansas',
                    'Heavy Cargo Pack','Special Transport','Cabin Accessories','Wheel Tuning Pack'
                  ].map((d) => (
                    <option key={d} value={`ats::${d}`}>{d}</option>
                  ))
                )}
              </TextField>
            </Stack>
          </Grid>

            <Grid item xs={6} md={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FilterListIcon fontSize="small" />
                <Switch
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  size="small"
                />
                <Typography variant="body2">Active Only</Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

    {/* DLC Analytics */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>DLC Ownership - ETS2</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(() => {
                const counts = new Map();
                riders.forEach(r => (r?.dlcsOwned?.ets2 || []).forEach(d => counts.set(d, (counts.get(d) || 0) + 1)));
                return Array.from(counts.entries()).sort((a,b) => b[1]-a[1]).slice(0, 20).map(([name, count]) => (
                  <Chip key={name} label={`${name}: ${count}`} />
                ));
              })()}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>DLC Ownership - ATS</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(() => {
                const counts = new Map();
                riders.forEach(r => (r?.dlcsOwned?.ats || []).forEach(d => counts.set(d, (counts.get(d) || 0) + 1)));
                return Array.from(counts.entries()).sort((a,b) => b[1]-a[1]).slice(0, 20).map(([name, count]) => (
                  <Chip key={name} label={`${name}: ${count}`} />
                ));
              })()}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

      {/* Riders Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700,  }}>Rider</TableCell>
                <TableCell sx={{ fontWeight: 700,  }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 700,  }}>TruckersMP</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700,  }}>KM</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700,  }}>Revenue</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700,  }}>Jobs</TableCell>
                <TableCell sx={{ fontWeight: 700,  }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700,  }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((rider) => (
                <TableRow key={rider._id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={rider.avatar} sx={{ width: 40, height: 40 }}>
                        {(rider.name || '?')[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{rider.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rider.username || 'No username'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {rider.employeeID || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {rider.truckersmpId || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {Number(rider.totalKm || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      ${Number(rider.totalRevenue || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {Number(rider.totalJobs || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rider.active ? 'Active' : 'Inactive'}
                      color={rider.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Rider">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(rider)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Rider">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(rider._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {search || showActiveOnly ? 'No riders match your search criteria' : 'No riders found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon />
              <Typography variant="h6">
                {editingId ? 'Edit Rider' : 'Create New Rider'}
              </Typography>
            </Stack>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <Box component="form" onSubmit={onSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter rider's full name"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Game username"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TMP In-game Name"
                  value={form.tmpIngameName}
                  onChange={(e) => setForm({ ...form, tmpIngameName: e.target.value })}
                  placeholder="TMP in-game name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Age"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TruckersMP ID"
                  value={form.truckersmpId}
                  onChange={(e) => setForm({ ...form, truckersmpId: e.target.value })}
                  placeholder="TMP ID"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TruckersHub User ID"
                  value={form.truckershubId}
                  onChange={(e) => setForm({ ...form, truckershubId: e.target.value })}
                  placeholder="TruckersHub user ID"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Steam ID"
                  value={form.steamID}
                  onChange={(e) => setForm({ ...form, steamID: e.target.value })}
                  placeholder="Steam ID"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Steam ID 64"
                  value={form.steamID64}
                  onChange={(e) => setForm({ ...form, steamID64: e.target.value })}
                  placeholder="Steam ID 64"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add any additional notes about this rider..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body1">Status:</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color={!form.active ? 'primary' : 'text.secondary'}>
                      Inactive
                    </Typography>
                    <Switch
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      color="success"
                    />
                    <Typography variant="body2" color={form.active ? 'success.main' : 'text.secondary'}>
                      Active
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value="rider">rider</option>
                  <option value="trainee">trainee</option>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseModal} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={formLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={formLoading}
            >
              {editingId ? 'Update Rider' : 'Create Rider'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add rider"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenModal()}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}