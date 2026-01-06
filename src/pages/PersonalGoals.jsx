import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  RadioButtonUnchecked,
  EmojiEvents,
  TrendingUp,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

export default function PersonalGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleting, setDeleting] = useState(null);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/personal-goals');
      setGoals(data || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch goals',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({ title: goal.title, description: goal.description || '' });
    } else {
      setEditingGoal(null);
      setFormData({ title: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGoal(null);
    setFormData({ title: '', description: '' });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    try {
      if (editingGoal) {
        await axiosInstance.patch(`/personal-goals/${editingGoal._id}`, formData);
        setMessage({ type: 'success', text: 'Goal updated successfully' });
      } else {
        await axiosInstance.post('/personal-goals', formData);
        setMessage({ type: 'success', text: 'Goal created successfully' });
      }
      handleCloseDialog();
      fetchGoals();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save goal',
      });
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    setDeleting(goalId);
    try {
      await axiosInstance.delete(`/personal-goals/${goalId}`);
      setMessage({ type: 'success', text: 'Goal deleted successfully' });
      fetchGoals();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete goal',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleComplete = async (goal) => {
    if (goal.status === 'completed') {
      setMessage({ type: 'info', text: 'This goal is already completed' });
      return;
    }

    setCompleting(goal._id);
    try {
      await axiosInstance.patch(`/personal-goals/${goal._id}`, {
        status: 'completed',
      });
      setMessage({
        type: 'success',
        text: 'Goal completed! You have been awarded 100 coins! 🎉',
      });
      fetchGoals();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to complete goal',
      });
    } finally {
      setCompleting(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <RadioButtonUnchecked />;
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const cancelledGoals = goals.filter((g) => g.status === 'cancelled');

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Personal Goals (KMS)
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          New Goal
        </Button>
      </Stack>

      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingUp color="primary" />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {activeGoals.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Goals
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <EmojiEvents color="success" />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {completedGoals.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Cancel color="action" />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {cancelledGoals.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : goals.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No goals yet. Create your first goal to get started!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Create Goal
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} key={goal._id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {getStatusIcon(goal.status)}
                          <Typography variant="h6" fontWeight={600}>
                            {goal.title}
                          </Typography>
                        </Stack>
                        {goal.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {goal.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={goal.status}
                        color={getStatusColor(goal.status)}
                        size="small"
                      />
                      {goal.coinsAwarded && (
                        <Chip
                          icon={<EmojiEvents />}
                          label="100 coins awarded"
                          color="success"
                          size="small"
                        />
                      )}
                      {goal.completedAt && (
                        <Typography variant="caption" color="text.secondary">
                          Completed: {new Date(goal.completedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {goal.status === 'active' && (
                        <Tooltip title="Mark as Completed">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleComplete(goal)}
                            disabled={completing === goal._id}
                          >
                            {completing === goal._id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckCircle />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                      {goal.status !== 'completed' && (
                        <>
                          <Tooltip title="Edit Goal">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(goal)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Goal">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(goal._id)}
                              disabled={deleting === goal._id}
                            >
                              {deleting === goal._id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Delete />
                              )}
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Complete 10 jobs this month"
            />
            <TextField
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Add more details about your goal..."
            />
            {editingGoal && (
              <Alert severity="info">
                Completing this goal will award you 100 coins!
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGoal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

