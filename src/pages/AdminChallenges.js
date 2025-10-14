import React, { useState, useEffect } from 'react';
import {
  Divider,
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Stack,
  Snackbar,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Menu as MenuMui } from '@mui/icons-material';
import axiosInstance, { fetchEts2Map } from '../utils/axios';
import Autocomplete from '@mui/material/Autocomplete';
import { normalizeName } from '../utils/normalizeName';
import { fetchCargos } from '../services/cargoService';
import AdminSidebar from '../components/AdminSidebar';

const AdminChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startCity: '',
    startCompany: '',
    endCity: '',
    endCompany: '',
    minDistance: '',
    requiredJobs: 1,
    cargo: '',
    status: 'active',
    rewards: '',
    allowAutoPark: false,
    maxTopSpeedKmh: '',
    maxTruckDamagePercent: '',
    difficulty: 'medium',
    endDate: ''
  });

  const [mapData, setMapData] = useState({ cities: [] });
  const [cityOptions, setCityOptions] = useState([]);
  const [companyOptionsByCity, setCompanyOptionsByCity] = useState({});
  const [cargoOptions, setCargoOptions] = useState([]);

  useEffect(() => {
    fetchChallenges();
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    (async () => {
      try {
        const md = await fetchEts2Map();
        const cities = md?.mapData?.cities || [];
        setMapData({ cities });
        setCityOptions(cities.map(c => c.name).filter(Boolean).sort());
        const byCity = {};
        for (const c of cities) {
          byCity[c.name] = (c.companies||[]).map(co => co.name).filter(Boolean).sort();
        }
        setCompanyOptionsByCity(byCity);
        
        // Load cargo options
        const cargos = await fetchCargos();
        setCargoOptions(cargos);
      } catch (_) {}
    })();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/challenges');
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      console.log('Creating challenge with data:', formData);
      setActionLoading(true);
      setError('');
      
      // Validate form data
      if (!formData.name || !formData.minDistance || !formData.cargo || !formData.endDate) {
        setError('Required: name, minDistance, cargo, endDate');
        return;
      }

      if (formData.minDistance <= 0) {
        setError('Minimum distance must be greater than 0');
        return;
      }

      if (formData.requiredJobs <= 0) {
        setError('Required jobs must be greater than 0');
        return;
      }

      // Validate endDate is in the future
      const endDateTime = new Date(formData.endDate);
      if (endDateTime <= new Date()) {
        setError('End date must be in the future');
        return;
      }

      // Normalize names before sending to backend
      const normalizedData = {
        ...formData,
        startCity: formData.startCity ? normalizeName(formData.startCity) : '',
        startCompany: formData.startCompany ? normalizeName(formData.startCompany) : '',
        endCity: formData.endCity ? normalizeName(formData.endCity) : '',
        endCompany: formData.endCompany ? normalizeName(formData.endCompany) : '',
        cargo: normalizeName(formData.cargo)
      };
      
      await axiosInstance.post('/challenges', normalizedData);
      setSuccess('Challenge created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchChallenges();
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError(error.response?.data?.message || 'Failed to create challenge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditChallenge = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      if (!formData.name || !formData.minDistance || !formData.cargo || !formData.endDate) {
        setError('Required: name, minDistance, cargo, endDate');
        return;
      }

      if (formData.minDistance <= 0) {
        setError('Minimum distance must be greater than 0');
        return;
      }

      if (formData.requiredJobs <= 0) {
        setError('Required jobs must be greater than 0');
        return;
      }

      // Validate endDate is in the future
      const endDateTime = new Date(formData.endDate);
      if (endDateTime <= new Date()) {
        setError('End date must be in the future');
        return;
      }

      // Normalize names before sending to backend
      const normalizedData = {
        ...formData,
        startCity: formData.startCity ? normalizeName(formData.startCity) : '',
        startCompany: formData.startCompany ? normalizeName(formData.startCompany) : '',
        endCity: formData.endCity ? normalizeName(formData.endCity) : '',
        endCompany: formData.endCompany ? normalizeName(formData.endCompany) : '',
        cargo: normalizeName(formData.cargo)
      };
      
      await axiosInstance.put(`/challenges/${selectedChallenge._id}`, normalizedData);
      setSuccess('Challenge updated successfully');
      setEditDialogOpen(false);
      resetForm();
      fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
      setError(error.response?.data?.message || 'Failed to update challenge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteChallenge = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      await axiosInstance.delete(`/challenges/${selectedChallenge._id}`);
      setSuccess('Challenge deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedChallenge(null);
      fetchChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError(error.response?.data?.message || 'Failed to delete challenge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (challenge) => {
    try {
      setActionLoading(true);
      setError('');
      
      await axiosInstance.patch(`/challenges/${challenge._id}/toggle-status`);
      setSuccess(`Challenge ${challenge.status === 'active' ? 'deactivated' : 'activated'} successfully`);
      fetchChallenges();
    } catch (error) {
      console.error('Error toggling challenge status:', error);
      setError(error.response?.data?.message || 'Failed to toggle challenge status');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (challenge) => {
    setSelectedChallenge(challenge);
    setFormData({
      name: challenge.name,
      description: challenge.description || '',
      startCity: challenge.startCity,
      startCompany: challenge.startCompany,
      endCity: challenge.endCity,
      endCompany: challenge.endCompany,
      minDistance: challenge.minDistance,
      requiredJobs: challenge.requiredJobs,
      cargo: challenge.cargo,
      status: challenge.status,
      rewards: challenge.rewards || '',
      allowAutoPark: Boolean(challenge.allowAutoPark),
      maxTopSpeedKmh: challenge.maxTopSpeedKmh || '',
      maxTruckDamagePercent: challenge.maxTruckDamagePercent || '',
      difficulty: challenge.difficulty || 'medium',
      endDate: challenge.endDateIST || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (challenge) => {
    setSelectedChallenge(challenge);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startCity: '',
      startCompany: '',
      endCity: '',
      endCompany: '',
      minDistance: '',
      requiredJobs: 1,
      cargo: '',
      status: 'active',
      rewards: '',
      allowAutoPark: false,
      maxTopSpeedKmh: '',
      maxTruckDamagePercent: '',
      difficulty: 'medium'
    });
    setSelectedChallenge(null);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleStatusChange = (event) => {
    setFormData(prev => ({
      ...prev,
      status: event.target.checked ? 'active' : 'inactive'
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

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
                Challenge Management
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Container maxWidth="xl" sx={{ 
          px: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 8, sm: 9 },
          pb: 3
        }}>
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.5,
          background: (theme) => 'yellow',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 ,color:'black'}}>Challenge Management</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 ,color:'black'}}>Create, edit and monitor driving challenges</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchChallenges}
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.6)',color:'black' }}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Create Challenge
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>
      )}

      {/* Challenges Grid */}
      <Grid container spacing={3}>
        {challenges.map((challenge) => (
          <Grid item xs={12} sm={6} md={4} key={challenge._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: (theme) => `linear-gradient(135deg, ${challenge.status === 'active' ? theme.palette.success.main : theme.palette.grey[600]} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'primary.contrastText'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{challenge.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={challenge.status.toUpperCase()} size="small" color={challenge.status === 'active' ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
                  <Chip label={challenge.allowAutoPark ? 'AUTO PARK: ON' : 'AUTO PARK: OFF'} size="small" color={challenge.allowAutoPark ? 'info' : 'warning'} sx={{ fontWeight: 700 }} />
                  {challenge.difficulty && (
                    <Chip label={`DIFFICULTY: ${challenge.difficulty.toUpperCase()}`} size="small" color="secondary" sx={{ fontWeight: 700 }} />
                  )}
                </Stack>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Route</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {(challenge.startCity || 'Any City')} ({challenge.startCompany || 'Any Company'}) → {(challenge.endCity || 'Any City')} ({challenge.endCompany || 'Any Company'})
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', textAlign: 'center' }}>
                      <Typography variant="overline" sx={{ display: 'block', fontWeight: 900, opacity: 0.9 }}>Required Jobs</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{challenge.requiredJobs}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', textAlign: 'center' }}>
                      <Typography variant="overline" sx={{ display: 'block', fontWeight: 900, opacity: 0.9 }}>Min Distance</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{challenge.minDistance} km</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Cargo</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{challenge.cargo}</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>End Date (IST)</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{challenge.endDateFormatted || 'Not set'}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {challenge.stats && (
                  <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                    <Grid item xs={4}>
                      <Box sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>Total</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{challenge.stats.totalProgress}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>Drivers</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{challenge.stats.uniqueDrivers}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.7 }}>Rate</Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 900 }}>{challenge.stats.completionRate}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box>
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={() => window.open(`/admin/challenges/${challenge._id}`, '_blank')}
                      disabled={actionLoading}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={challenge.status === 'active' ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      onClick={() => handleToggleStatus(challenge)}
                      disabled={actionLoading}
                      color={challenge.status === 'active' ? 'success' : 'default'}
                    >
                      {challenge.status === 'active' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => openEditDialog(challenge)}
                      disabled={actionLoading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => openDeleteDialog(challenge)}
                      disabled={actionLoading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {challenges.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No challenges found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first challenge to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Create Challenge
          </Button>
        </Paper>
      )}

      {/* Create/Edit Challenge Dialog */}
      <Dialog 
        open={createDialogOpen || editDialogOpen} 
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {createDialogOpen ? 'Create New Challenge' : 'Edit Challenge'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={formData.status === 'active' ? 'ACTIVE' : 'INACTIVE'} color={formData.status === 'active' ? 'success' : 'default'} size="small" sx={{ fontWeight: 700 }} />
              <Chip label={formData.allowAutoPark ? 'AUTO PARK: ON' : 'AUTO PARK: OFF'} color={formData.allowAutoPark ? 'info' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
            </Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Basics</Typography>
            <TextField
              label="Challenge Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
              placeholder="e.g., Innsbruck → Verona Logs Sprint"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              multiline
              rows={2}
              placeholder="Tell a short story about this challenge..."
            />
            <Divider />
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Route</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Autocomplete
                freeSolo
                options={cityOptions}
                value={formData.startCity || ''}
                onInputChange={(_, v) => setFormData({ ...formData, startCity: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Start City (leave blank for Any)" placeholder="e.g., Berlin" helperText="Leave empty to allow any city" />
                )}
                fullWidth
              />
              <Autocomplete
                freeSolo
                options={companyOptionsByCity[formData.startCity] || []}
                value={formData.startCompany || ''}
                onInputChange={(_, v) => setFormData({ ...formData, startCompany: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Start Company (leave blank for Any)" placeholder="e.g., Tradeaux" helperText="Leave empty to allow any company" />
                )}
                fullWidth
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Autocomplete
                freeSolo
                options={cityOptions}
                value={formData.endCity || ''}
                onInputChange={(_, v) => setFormData({ ...formData, endCity: v })}
                renderInput={(params) => (
                  <TextField {...params} label="End City (leave blank for Any)" placeholder="e.g., Paris" helperText="Leave empty to allow any city" />
                )}
                fullWidth
              />
              <Autocomplete
                freeSolo
                options={companyOptionsByCity[formData.endCity] || []}
                value={formData.endCompany || ''}
                onInputChange={(_, v) => setFormData({ ...formData, endCompany: v })}
                renderInput={(params) => (
                  <TextField {...params} label="End Company (leave blank for Any)" placeholder="e.g., Lisette Logistics" helperText="Leave empty to allow any company" />
                )}
                fullWidth
              />
            </Box>
            <Divider />
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Requirements</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Minimum Distance (km)"
                type="number"
                value={formData.minDistance}
                onChange={handleInputChange('minDistance')}
                fullWidth
                required
                inputProps={{ min: 1 }}
                helperText="Minimum distance per job to qualify"
              />
              <TextField
                label="Required Jobs"
                type="number"
                value={formData.requiredJobs}
                onChange={handleInputChange('requiredJobs')}
                fullWidth
                required
                inputProps={{ min: 1 }}
                helperText="Number of qualifying jobs to complete the challenge"
              />
            </Box>
            
            <Autocomplete
              freeSolo
              options={cargoOptions}
              value={formData.cargo}
              onInputChange={(_, v) => setFormData({ ...formData, cargo: v })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Cargo" 
                  fullWidth 
                  required
                  placeholder="e.g., Wood Bark"
                  helperText="Select from available cargo or type custom name"
                />
              )}
            />
            
            <TextField
              label="Rewards"
              value={formData.rewards}
              onChange={handleInputChange('rewards')}
              fullWidth
              placeholder="e.g., Special badge, Discord role, etc."
            />
            
            <TextField
              label="End Date & Time (IST)"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleInputChange('endDate')}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Challenge will automatically become inactive after this time"
            />
            
            <FormControl fullWidth>
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                value={formData.difficulty}
                label="Difficulty"
                onChange={handleInputChange('difficulty')}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
                <MenuItem value="extreme">Extreme</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Max Top Speed (km/h)"
              type="number"
              value={formData.maxTopSpeedKmh}
              onChange={handleInputChange('maxTopSpeedKmh')}
              fullWidth
              placeholder="e.g., 110"
              helperText="Optional. Jobs exceeding this top speed will not qualify"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Max Truck Damage (%)"
              type="number"
              value={formData.maxTruckDamagePercent}
              onChange={handleInputChange('maxTruckDamagePercent')}
              fullWidth
              placeholder="e.g., 20"
              helperText="Optional. Jobs exceeding this damage will not qualify"
              inputProps={{ min: 0, max: 100 }}
            />
            <Divider />
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === 'active'}
                  onChange={handleStatusChange}
                />
              }
              label="Active"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.allowAutoPark)}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowAutoPark: e.target.checked }))}
                />
              }
              label="Allow Auto Park"
            />
            <Typography variant="caption" color="text.secondary">
              If enabled, jobs that were auto-parked will be accepted for this challenge.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={createDialogOpen ? handleCreateChallenge : handleEditChallenge}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : (createDialogOpen ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Challenge</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the challenge "{selectedChallenge?.name}"? 
            This action cannot be undone and will also delete all related progress data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteChallenge}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminChallenges;
