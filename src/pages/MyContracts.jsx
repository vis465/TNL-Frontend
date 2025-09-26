import React, { useEffect, useState } from 'react';
import { myContracts } from '../services/contractsService';

import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Container,
  Grid,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  TrendingUp,
  Flag,
  Refresh,
  PlayArrow,
  Done
} from '@mui/icons-material';

// Mock service for demo


export default function MyContracts() {
  const [data, setData] = useState({ active: [], history: [] });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await myContracts();
      setData(result);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    myContracts()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const renderContract = (c) => {
    const tpl = c.templateId || {};
    const tasks = Array.isArray(tpl.tasks) ? tpl.tasks : [];
    const progress = Array.isArray(c.progress) ? c.progress : [];
    const total = tasks.length || progress.length || 1;
    const done = progress.filter(p => p.status === 'done').length;
    const pct = Math.round((done / total) * 100);

    // Determine current/next task index
    let nextIdx = typeof c.currentTaskIndex === 'number' ? c.currentTaskIndex : 0;
    if (!tasks[nextIdx]) {
      const doneOrders = new Set(progress.filter(p => p.status === 'done').map(p => p.order));
      nextIdx = tasks.findIndex(t => !doneOrders.has(t.order));
      if (nextIdx < 0) nextIdx = tasks.length - 1;
    }
    const nextTask = tasks[nextIdx] || null;

    const getTaskStatus = (t) => {
      const found = progress.find(p => p.order === t.order);
      return found?.status === 'done' ? 'done' : 'pending';
    };

    const renderCriteria = (criteria) => {
      if (!criteria) return null;
      const entries = Object.entries(criteria).filter(([, v]) => v !== '' && v != null);
      if (!entries.length) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No specific requirements
          </Typography>
        );
      }
      return (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {entries.map(([k, v]) => (
            <Chip
              key={k}
              label={`${k}: ${v}`}
              size="small"
              variant="outlined"
             
            />
          ))}
        </Stack>
      );
    };

    const isOverdue = new Date(c.deadlineAt) < new Date();
    const statusColor = c.status === 'completed' ? '#2e7d32' : c.status === 'active' ? '#1976d2' : '#666';

    return (
      <Paper
        key={c._id}
        elevation={0}
        sx={{
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ p: 4 }}>
          {/* Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Assignment sx={{ color: '#1976d2', fontSize: 28 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                  {tpl.title}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={c.status.toUpperCase()}
                  size="small"
                  sx={{
                   
                    color: statusColor,
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={isOverdue ? <Flag sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                  label={`Due: ${new Date(c.deadlineAt).toLocaleDateString()}`}
                  size="small"
                  sx={{
                    bgcolor: isOverdue ? '#ffeaea' : '#f8f9fa',
                    color: isOverdue ? '#d32f2f' : '#666'
                  }}
                />
                <Chip
                  icon={<TrendingUp sx={{ fontSize: 16 }} />}
                  label={`${done}/${total} Complete`}
                  size="small"
                  
                />
              </Stack>
            </Box>
            
            <Typography variant="h4" sx={{ color: statusColor, fontWeight: 300, minWidth: 60, textAlign: 'right' }}>
              {pct}%
            </Typography>
          </Stack>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#f5f5f5',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: pct === 100 ? '#2e7d32' : '#1976d2'
                }
              }}
            />
          </Box>

          {/* Tasks List */}
          {tasks.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'white', fontWeight: 500 }}>
                Progress Steps
              </Typography>
              
              <List dense sx={{  borderRadius: 2, p: 1 }}>
                {tasks.map((t, idx) => {
                  const taskStatus = getTaskStatus(t);
                  const isCompleted = taskStatus === 'done';
                  
                  return (
                    <ListItem
                      key={t.order}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        mb: 0.5,
                     
                        border: '1px solid',
                        borderColor: isCompleted ? '#c8e6c9' : '#e0e0e0'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {isCompleted ? (
                              <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
                            ) : (
                              <PlayArrow sx={{ color: '#1976d2', fontSize: 20 }} />
                            )}
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: isCompleted ? 600 : 500,
                                color: isCompleted ? '#2e7d32' : 'white'
                              }}
                            >
                              {idx + 1}. {t.title}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                            {isCompleted ? 'Completed' : 'In Progress'}
                          </Typography>
                        }
                      />
                      
                      <Chip
                        icon={isCompleted ? <Done sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                        label={isCompleted ? 'Done' : 'Pending'}
                        size="small"
                        sx={{
                          
                          color: isCompleted ? '#2e7d32' : '#f57c00',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>

              {/* Next Step */}
              {nextTask && getTaskStatus(nextTask) !== 'done' && (
                <Box sx={{ mt: 3, p: 3, borderRadius: 2, border: '1px solid #bbdefb' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#1976d2', fontWeight: 600 }}>
                    Next Step: {nextTask.title}
                  </Typography>
                  {renderCriteria(nextTask.criteria)}
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    );
  };

  const LoadingSkeleton = () => (
    <Paper elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
      <Box sx={{ p: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="text" width={200} height={32} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
          <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 12 }} />
          <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 12 }} />
        </Stack>
        <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
        <Stack spacing={1}>
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
        </Stack>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh',color: 'white' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Assignment sx={{ fontSize: 40, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 300, color: 'white' }}>
                  My Contracts
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#666' }}>
                  Track your progress and commitments
                </Typography>
              </Box>
            </Stack>
            
            <IconButton
              onClick={refresh}
              disabled={loading}
              sx={{
               
                width: 48,
                height: 48
              }}
            >
              <Refresh className={loading ? 'animate-spin' : ''} />
            </IconButton>
          </Stack>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <Typography variant="h6" sx={{ mb: 3,  fontWeight: 500 }}>
              Active Contracts ({loading ? '...' : data.active.length})
            </Typography>
            {loading ? (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            ) : data.active.length > 0 ? (
              data.active.map(renderContract)
            ) : (
              <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 3, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No active contracts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You don't have any active contracts at the moment.
                </Typography>
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 500 }}>
              Contract History ({loading ? '...' : data.history.length})
            </Typography>
            {loading ? (
              <LoadingSkeleton />
            ) : data.history.length > 0 ? (
              data.history.map(renderContract)
            ) : (
              <Paper elevation={0} sx={{ p: 4, border: '1px solid #e0e0e0', borderRadius: 3, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No completed contracts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your completed contracts will appear here.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}