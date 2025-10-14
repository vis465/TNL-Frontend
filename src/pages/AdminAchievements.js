import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Menu as MenuMui,
} from '@mui/icons-material';
import AdminSidebar from '../components/AdminSidebar';
import axiosInstance from '../utils/axios';
import ridersService from '../services/ridersService';

const AdminAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    riderId: '',
    name: '',
    logoUrl: '',
    description: '',
    issuedOn: new Date().toISOString().split('T')[0]
  });

  const [filters, setFilters] = useState({
    riderId: '',
    search: ''
  });

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  useEffect(() => {
    fetchData();
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [achievementsRes, ridersData] = await Promise.all([
        axiosInstance.get('/achievements'),
        ridersService.list()
      ]);
      
      setAchievements(achievementsRes.data || []);
      setRiders(ridersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Error fetching data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = async () => {
    try {
      const response = await axiosInstance.post('/achievements', formData);
      setAchievements([response.data, ...achievements]);
      setDialogOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Achievement created successfully', severity: 'success' });
    } catch (error) {
      console.error('Error creating achievement:', error);
      setSnackbar({ open: true, message: 'Error creating achievement', severity: 'error' });
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await axiosInstance.delete(`/achievements/${id}`);
      setAchievements(achievements.filter(a => a._id !== id));
      setSnackbar({ open: true, message: 'Achievement deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting achievement:', error);
      setSnackbar({ open: true, message: 'Error deleting achievement', severity: 'error' });
    }
  };

  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      riderId: achievement.riderId,
      name: achievement.name,
      logoUrl: achievement.logoUrl,
      description: achievement.description,
      issuedOn: achievement.issuedOn ? new Date(achievement.issuedOn).toISOString().split('T')[0] : ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      riderId: '',
      name: '',
      logoUrl: '',
      description: '',
      issuedOn: new Date().toISOString().split('T')[0]
    });
    setEditingAchievement(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const getRiderName = (riderId) => {
    const rider = riders.find(r => r._id === riderId);
    return rider ? `${rider.name} (${rider.employeeID})` : 'Unknown Rider';
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesRider = !filters.riderId || achievement.riderId === filters.riderId;
    const matchesSearch = !filters.search || 
      achievement.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      achievement.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesRider && matchesSearch;
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar 
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={handleMobileDrawerClose}
        user={user}
      />

      <Box sx={{ flex: 1 }}>
        {/* Mobile Header */}
        {isMobile && (
          <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuMui />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Achievement Management
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Achievement Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ px: 3 }}
        >
          Issue Achievement
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                fullWidth
                size="small"
                options={[{ _id: '', name: 'All Riders', employeeID: '' }, ...riders]}
                getOptionLabel={(option) => option._id === '' ? 'All Riders' : `${option.name} (${option.employeeID})`}
                value={filters.riderId ? riders.find(r => r._id === filters.riderId) || null : { _id: '', name: 'All Riders', employeeID: '' }}
                onChange={(event, newValue) => {
                  setFilters({ ...filters, riderId: newValue?._id || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Rider"
                    placeholder="Search riders..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    {option._id === '' ? (
                      <Typography variant="body2" fontWeight={600}>
                        All Riders
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                          {option.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.employeeID}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                noOptionsText="No riders found"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search achievements"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or description..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Achievements Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Rider</TableCell>
                  <TableCell>Issued On</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAchievements.map((achievement) => (
                  <TableRow key={achievement._id}>
                    <TableCell>
                      <Avatar
                        src={achievement.logoUrl}
                        alt={achievement.name}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {achievement.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRiderName(achievement.riderId)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(achievement.issuedOn).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAchievement(achievement)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAchievement(achievement._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredAchievements.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No achievements found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAchievement ? 'Edit Achievement' : 'Issue New Achievement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={riders}
                getOptionLabel={(option) => `${option.name} (${option.employeeID})`}
                value={riders.find(r => r._id === formData.riderId) || null}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, riderId: newValue?._id || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rider *"
                    placeholder="Search for a rider..."
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {option.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.employeeID} • {option.username || 'No username'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                noOptionsText="No riders found"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Achievement Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Logo URL"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of the achievement"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Issued On"
                value={formData.issuedOn}
                onChange={(e) => setFormData({ ...formData, issuedOn: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateAchievement}
            variant="contained"
            disabled={!formData.riderId || !formData.name || !formData.logoUrl}
          >
            {editingAchievement ? 'Update' : 'Issue'} Achievement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminAchievements;
