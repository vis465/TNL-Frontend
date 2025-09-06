import React, { useState, useEffect } from 'react';
import {
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axiosInstance from '../utils/axios';
import { normalizeName } from '../utils/normalizeName';

const AdminChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    rewards: ''
  });

  useEffect(() => {
    fetchChallenges();
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
      if (!formData.name || !formData.startCity || !formData.startCompany || 
          !formData.endCity || !formData.endCompany || !formData.minDistance || !formData.cargo) {
        setError('All fields are required');
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

      // Normalize names before sending to backend
      const normalizedData = {
        ...formData,
        startCity: normalizeName(formData.startCity),
        startCompany: normalizeName(formData.startCompany),
        endCity: normalizeName(formData.endCity),
        endCompany: normalizeName(formData.endCompany),
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
      
      if (!formData.name || !formData.startCity || !formData.startCompany || 
          !formData.endCity || !formData.endCompany || !formData.minDistance || !formData.cargo) {
        setError('All fields are required');
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

      // Normalize names before sending to backend
      const normalizedData = {
        ...formData,
        startCity: normalizeName(formData.startCity),
        startCompany: normalizeName(formData.startCompany),
        endCity: normalizeName(formData.endCity),
        endCompany: normalizeName(formData.endCompany),
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
      rewards: challenge.rewards || ''
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
      rewards: ''
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
    <Container maxWidth="xl" sx={{ 
      px: { xs: 1, sm: 2, md: 3 },
      pt: { xs: 8, sm: 9 },
      pb: 3
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Challenge Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchChallenges}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Create Challenge
          </Button>
        </Box>
      </Box>

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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {challenge.name}
                  </Typography>
                  <Chip 
                    label={challenge.status} 
                    color={challenge.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Route:</strong> {challenge.startCity} ({challenge.startCompany}) → {challenge.endCity} ({challenge.endCompany})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Requirements:</strong> {challenge.requiredJobs} jobs • Min {challenge.minDistance} km per job
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cargo:</strong> {challenge.cargo}
                  </Typography>
                </Stack>

                {/* Stats */}
                {challenge.stats && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Statistics:
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption">
                        Total: {challenge.stats.totalProgress}
                      </Typography>
                      <Typography variant="caption">
                        Completed: {challenge.stats.completedProgress}
                      </Typography>
                      <Typography variant="caption">
                        Drivers: {challenge.stats.uniqueDrivers}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="primary">
                      Completion Rate: {challenge.stats.completionRate}%
                    </Typography>
                  </Box>
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
        <DialogTitle>
          {createDialogOpen ? 'Create New Challenge' : 'Edit Challenge'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Challenge Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              multiline
              rows={2}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start City"
                value={formData.startCity}
                onChange={handleInputChange('startCity')}
                fullWidth
                required
                placeholder="e.g., Berlin"
              />
              <TextField
                label="Start Company"
                value={formData.startCompany}
                onChange={handleInputChange('startCompany')}
                fullWidth
                required
                placeholder="e.g., Tradeaux"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="End City"
                value={formData.endCity}
                onChange={handleInputChange('endCity')}
                fullWidth
                required
                placeholder="e.g., Paris"
              />
              <TextField
                label="End Company"
                value={formData.endCompany}
                onChange={handleInputChange('endCompany')}
                fullWidth
                required
                placeholder="e.g., Lisette Logistics"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Minimum Distance (km)"
                type="number"
                value={formData.minDistance}
                onChange={handleInputChange('minDistance')}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Required Jobs"
                type="number"
                value={formData.requiredJobs}
                onChange={handleInputChange('requiredJobs')}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Box>
            
            <TextField
              label="Cargo"
              value={formData.cargo}
              onChange={handleInputChange('cargo')}
              fullWidth
              required
              placeholder="e.g., Wood Bark"
            />
            
            <TextField
              label="Rewards"
              value={formData.rewards}
              onChange={handleInputChange('rewards')}
              fullWidth
              placeholder="e.g., Special badge, Discord role, etc."
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status === 'active'}
                  onChange={handleStatusChange}
                />
              }
              label="Active"
            />
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
  );
};

export default AdminChallenges;
