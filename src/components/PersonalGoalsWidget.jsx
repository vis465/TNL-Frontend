import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  EmojiEvents,
  TrendingUp,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axios';

export default function PersonalGoalsWidget() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await axiosInstance.get('/personal-goals');
      // Show only active goals, limit to 4
      const activeGoals = data.filter((g) => g.status === 'active').slice(0, 4);
      setGoals(activeGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (goals.length === 0) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No active goals. Create your first goal to start earning coins!
        </Typography>
        <Button
          variant="contained"
          size="small"
          component={RouterLink}
          to="/goals"
        >
          Create Goal
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {goals.map((goal) => (
        <Grid item xs={12} sm={6} key={goal._id}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <RadioButtonUnchecked fontSize="small" color="primary" />
                  <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }}>
                    {goal.title}
                  </Typography>
                </Stack>
                {goal.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    {goal.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 4 }}>
                  <Chip
                    icon={<TrendingUp />}
                    label="Active"
                    color="primary"
                    size="small"
                  />
                  <Chip
                    icon={<EmojiEvents />}
                    label="100 coins reward"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {goals.length >= 4 && (
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', pt: 1 }}>
            <Button
              variant="text"
              size="small"
              component={RouterLink}
              to="/goals"
            >
              View All Goals →
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

