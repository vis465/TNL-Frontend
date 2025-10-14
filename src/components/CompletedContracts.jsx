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
  Cancel,
  ExpandMore,
  ExpandLess,
  Refresh,
  TrendingUp,
  TrendingDown,
  Star,
  History
} from '@mui/icons-material';
import { myContracts, getContractStats } from '../services/contractsService';

const CompletedContracts = ({ onRefresh }) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Cancel color="error" />;
      default:
        return <History color="default" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && !contracts.history.length) {
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
              <History color="primary" />
              <Typography variant="h6">Completed Contracts</Typography>
              {contracts.history.length > 0 && (
                <Badge badgeContent={contracts.history.length} color="primary">
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
                label={`${stats.totalCompleted} Completed`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                size="small" 
                icon={<Cancel />} 
                label={`${stats.totalFailed} Failed`} 
                color="error" 
                variant="outlined" 
              />
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

        {contracts.history.length === 0 ? (
          <Box textAlign="center" py={4}>
            <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No completed contracts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your contract history will appear here
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {contracts.history.slice(0, expanded ? 10 : 5).map((contract, index) => (
              <React.Fragment key={contract._id || index}>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getStatusIcon(contract.status)}
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
                            color={getStatusColor(contract.status)}
                            variant="outlined"
                          />
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
                            {contract.status === 'completed' && (
                              <Chip
                                size="small"
                                icon={<TrendingUp />}
                                label={`+${contract.templateId?.rewardTokens || 0}`}
                                color="success"
                                variant="outlined"
                              />
                            )}
                            {contract.status === 'failed' && (
                              <Chip
                                size="small"
                                icon={<TrendingDown />}
                                label={`-${contract.templateId?.penaltyTokens || 0}`}
                                color="error"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                        {contract.formattedCompletedAt && (
                          <Typography variant="caption" color="text.secondary">
                            Completed: {contract.formattedCompletedAt}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < contracts.history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {contracts.history.length > 5 && (
          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              {expanded ? 'Showing all contracts' : `Showing 5 of ${contracts.history.length} contracts`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedContracts;
