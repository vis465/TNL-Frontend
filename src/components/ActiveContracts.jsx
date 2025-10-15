import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Collapse,
  Stack,
  Divider,
  LinearProgress,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  ExpandMore,
  ExpandLess,
  Refresh,
  TrendingUp,
  TrendingDown,
  Timer,
  Star
} from '@mui/icons-material';
import { myContracts, getContractStats } from '../services/contractsService';

const ActiveContracts = ({ onRefresh }) => {
  const [contracts, setContracts] = useState({ active: [], history: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const [contractsData, statsData] = await Promise.all([
        myContracts(),
        getContractStats()
      ]);
      setContracts(contractsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load contracts');
      console.error('Contract loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadContracts();
    if (onRefresh) onRefresh();
  };

  const getStatusIcon = (contract) => {
    if (contract.isExpired) return <Warning color="warning" />;
    if (contract.daysRemaining !== null && contract.daysRemaining <= 3) return <Timer color="warning" />;
    return <CheckCircle color="success" />;
  };

  const getStatusColor = (contract) => {
    if (contract.isExpired) return 'warning';
    if (contract.daysRemaining !== null && contract.daysRemaining <= 3) return 'warning';
    return contract.statusColor;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  if (loading && !contracts.active.length) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading contracts...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Assignment color="primary" />
              <Typography variant="h6">Active Contracts</Typography>
              {contracts.active.length > 0 && (
                <Badge badgeContent={contracts.active.length} color="primary">
                  <Box />
                </Badge>
              )}
            </Box>
            <Box display="flex" gap={1}>
              <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>
        }
        subheader={
          stats && (
            <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
              <Chip 
                size="small" 
                icon={<CheckCircle />} 
                label={`${stats.totalActive} Active`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                size="small" 
                icon={<Star />} 
                label={`${stats.totalCompleted} Completed`} 
                color="primary" 
                variant="outlined" 
              />
              {stats.expiringSoon > 0 && (
                <Chip 
                  size="small" 
                  icon={<Warning />} 
                  label={`${stats.expiringSoon} Expiring Soon`} 
                  color="warning" 
                  variant="outlined" 
                />
              )}
            </Stack>
          )
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {contracts.active.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No active contracts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visit the contracts marketplace to get started
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {contracts.active.slice(0, expanded ? 10 : 5).map((contract, index) => (
              <React.Fragment key={contract._id || index}>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getStatusIcon(contract)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">
                          {contract.templateId?.title || 'Contract'}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={contract.status}
                            color={getStatusColor(contract)}
                            variant="outlined"
                          />
                          {contract.daysRemaining !== null && (
                            <Chip
                              size="small"
                              icon={<Schedule />}
                              label={`${contract.daysRemaining}d left`}
                              color={contract.daysRemaining <= 3 ? 'warning' : 'default'}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            Started: {contract.formattedCreatedAt}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              size="small"
                              icon={<TrendingUp />}
                              label={`+${contract.templateId?.rewardTokens || 0}`}
                              color="success"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              icon={<TrendingDown />}
                              label={`-${contract.templateId?.penaltyTokens || 0}`}
                              color="error"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      
                      </Box>
                    }
                  />
                </ListItem>
                {index < contracts.active.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {contracts.active.length > 5 && (
          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              {expanded ? 'Showing all contracts' : `Showing 5 of ${contracts.active.length} contracts`}
            </Typography>
          </Box>
        )}

        {stats && stats.totalReward > 0 && (
          <Box mt={2} p={2} bgcolor="success.50" borderRadius={1}>
            <Typography variant="body2" color="success.dark" fontWeight="bold">
              Total Potential Reward: {stats.totalReward} Tokens
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveContracts;
