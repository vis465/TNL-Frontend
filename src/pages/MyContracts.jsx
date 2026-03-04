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
  ListItemButton,
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
  const [selectedTaskOrderByContractId, setSelectedTaskOrderByContractId] = useState({});

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

  // Keep a sensible "selected task" per contract (defaults to current/next task).
  useEffect(() => {
    const contracts = [...(data.active || []), ...(data.history || [])];
    if (!contracts.length) return;

    setSelectedTaskOrderByContractId((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const c of contracts) {
        if (!c?._id) continue;
        if (next[c._id] != null) continue;

        const tpl = c.templateId || {};
        const tasks = Array.isArray(tpl.tasks) ? tpl.tasks : [];
        const progress = Array.isArray(c.progress) ? c.progress : [];

        let nextIdx = typeof c.currentTaskIndex === 'number' ? c.currentTaskIndex : 0;
        if (!tasks[nextIdx]) {
          const doneOrders = new Set(progress.filter(p => p.status === 'done').map(p => p.order));
          nextIdx = tasks.findIndex(t => !doneOrders.has(t.order));
          if (nextIdx < 0) nextIdx = 0;
        }

        const defaultOrder = tasks[nextIdx]?.order ?? tasks[0]?.order ?? null;
        if (defaultOrder != null) {
          next[c._id] = defaultOrder;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [data]);

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
      // Filter out ID fields and empty values
      const entries = Object.entries(criteria)
        .filter(([k, v]) => !k.endsWith('Id') && v !== '' && v != null);
      
      if (!entries.length) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No specific requirements
          </Typography>
        );
      }

      // Helper to convert camelCase to readable format
      const formatLabel = (key) => {
        return key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      };

      const formatValue = (value) => {
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (Array.isArray(value)) return value.filter(v => v != null && v !== '').join(', ');
        if (value && typeof value === 'object') return JSON.stringify(value);
        return String(value);
      };

      return (
        <Grid container spacing={2}>
          {entries.map(([k, v]) => (
            <Grid item xs={12} sm={6} md={4} key={k}>
              <Box sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1.5,
                bgcolor: '#fafafa',
                transition: 'all 0.2s ease'
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#666', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  {formatLabel(k)}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1976d2',
                    fontWeight: 500
                  }}
                >
                  {formatValue(v)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      );
    };

    const isOverdue = new Date(c.deadlineAt) < new Date();
    const statusColor = c.status === 'completed' ? '#2e7d32' : c.status === 'active' ? '#1976d2' : '#666';
    const selectedOrder = selectedTaskOrderByContractId[c._id] ?? nextTask?.order ?? tasks[0]?.order ?? null;
    const selectedTask = selectedOrder != null ? tasks.find(t => t.order === selectedOrder) : null;
    const selectedIdx = selectedTask ? tasks.findIndex(t => t.order === selectedTask.order) : -1;
    const selectedStatus = selectedTask ? getTaskStatus(selectedTask) : 'pending';

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
              <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                  Contract Jobs
                </Typography>
                <Typography variant="body2" sx={{ color: '#9aa0a6' }}>
                  Select a job to view its requirements
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                {/* Left: step-by-step job list */}
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, bgcolor: '#0f141a' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                          Job checklist
                        </Typography>
                        <Chip
                          size="small"
                          icon={<TrendingUp sx={{ fontSize: 16 }} />}
                          label={`${done}/${total}`}
                          sx={{ bgcolor: '#111827', color: 'white' }}
                        />
                      </Stack>
                    </Box>

                    <List dense disablePadding>
                      {tasks.map((t, idx) => {
                        const taskStatus = getTaskStatus(t);
                        const isCompleted = taskStatus === 'done';
                        const isCurrent = nextTask && nextTask.order === t.order && !isCompleted;
                        const isSelected = selectedOrder != null && selectedOrder === t.order;

                        return (
                          <ListItem disablePadding key={t.order}>
                            <ListItemButton
                              onClick={() => {
                                if (!c?._id) return;
                                setSelectedTaskOrderByContractId((prev) => ({ ...prev, [c._id]: t.order }));
                              }}
                              sx={{
                                py: 1.25,
                                px: 2,
                                borderBottom: idx === tasks.length - 1 ? 'none' : '1px solid #eaeaea',
                                bgcolor: isSelected ? '#101b2a' : 'transparent',
                                '&:hover': { bgcolor: isSelected ? '#0f2038' : '#0b0f14' }
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: '100%' }}>
                                {isCompleted ? (
                                  <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
                                ) : isCurrent ? (
                                  <PlayArrow sx={{ color: '#42a5f5', fontSize: 20 }} />
                                ) : (
                                  <Schedule sx={{ color: '#9aa0a6', fontSize: 20 }} />
                                )}

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: isSelected ? 700 : isCompleted ? 600 : 500,
                                      color: isCompleted ? '#9ad3a2' : 'white'
                                    }}
                                    noWrap
                                  >
                                    {idx + 1}. {t.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#9aa0a6' }}>
                                    {isCompleted ? 'Completed' : isCurrent ? 'Current job' : 'Upcoming'}
                                  </Typography>
                                </Box>

                                <Chip
                                  size="small"
                                  icon={isCompleted ? <Done sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                                  label={isCompleted ? 'Done' : isCurrent ? 'Now' : 'Pending'}
                                  sx={{
                                    bgcolor: isCompleted ? '#e8f5e9' : isCurrent ? '#e3f2fd' : '#fff3e0',
                                    color: isCompleted ? '#2e7d32' : isCurrent ? '#1565c0' : '#ef6c00',
                                    fontWeight: 600
                                  }}
                                />
                              </Stack>
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </Grid>

                {/* Right: selected job requirements */}
                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: '#0f141a'
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: '#9aa0a6', fontWeight: 700, letterSpacing: 0.4 }}>
                          {selectedTask
                            ? `JOB ${selectedIdx >= 0 ? selectedIdx + 1 : ''} OF ${tasks.length}`
                            : `JOB REQUIREMENTS`}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }} noWrap>
                          {selectedTask ? selectedTask.title : 'Select a job'}
                        </Typography>
                      </Box>

                      {selectedTask && (
                        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <Chip
                            size="small"
                            label={selectedStatus === 'done' ? 'Completed' : nextTask?.order === selectedTask.order ? 'Current' : 'Pending'}
                            sx={{
                              bgcolor: selectedStatus === 'done' ? '#e8f5e9' : nextTask?.order === selectedTask.order ? '#e3f2fd' : '#fff3e0',
                              color: selectedStatus === 'done' ? '#2e7d32' : nextTask?.order === selectedTask.order ? '#1565c0' : '#ef6c00',
                              fontWeight: 700
                            }}
                          />
                          {nextTask?.order === selectedTask.order && selectedStatus !== 'done' && (
                            <Chip
                              size="small"
                              icon={<PlayArrow sx={{ fontSize: 16 }} />}
                              label="Do this next"
                              sx={{ bgcolor: '#111827', color: 'white', fontWeight: 700 }}
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>

                    {selectedTask ? (
                      <>
                        <Typography variant="body2" sx={{ color: '#c7ccd1', mb: 2 }}>
                          Complete the requirements below to finish this job.
                        </Typography>
                        {renderCriteria(selectedTask.criteria)}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#c7ccd1' }}>
                        Pick a job from the checklist to see exactly what you need to do.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
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
          <Grid item xs={12}>
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
          
          <Grid item xs={12}>
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