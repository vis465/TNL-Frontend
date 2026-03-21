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
  Alert
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  Refresh,
  Receipt,
  AttachMoney
} from '@mui/icons-material';

const WalletTransactions = ({ wallet, onRefresh }) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const walletTransactions = Array.isArray(wallet?.transactions) ? wallet.transactions : [];
    const recent = walletTransactions.slice(0, 10);
    const totalCredits = recent.filter((tx) => tx.type === 'credit').length;
    const totalDebits = recent.filter((tx) => tx.type === 'debit').length;

    setTransactions(recent);
    setStats({
      totalTransactions: recent.length,
      totalCredits,
      totalDebits
    });
  }, [wallet]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setLoading(true);
      setError('');
      await onRefresh();
    } catch (err) {
      setError('Failed to refresh transactions');
      console.error('Transaction refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type, sourceKind) => {
    if (sourceKind === 'admin_deduction') {
      return <TrendingDown color="error" />;
    }
    return type === 'credit' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  const getTransactionColor = (type, sourceKind) => {
    if (sourceKind === 'admin_deduction') {
      return 'error.main';
    }
    return type === 'credit' ? 'success.main' : 'error.main';
  };

  const getTransactionLabel = (transaction) => {
    if (transaction.source?.kind === 'admin_deduction') {
      return 'Admin Deduction';
    }
    return transaction.source?.kind || 'Manual';
  };

  const getTransactionChipColor = (sourceKind) => {
    switch (sourceKind) {
      case 'admin_deduction':
        return 'error';
      case 'job':
        return 'success';
      case 'adjustment':
        return 'info';
      case 'purchase':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && !transactions.length) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading transactions...
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
              <AccountBalanceWallet color="primary" />
              <Typography variant="h6">Recent Transactions</Typography>
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
          <Box>
          
            {stats && (
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Chip 
                  size="small" 
                  icon={<TrendingUp />} 
                  label={`${stats.totalCredits} Credits`} 
                  color="success" 
                  variant="outlined" 
                />
                <Chip 
                  size="small" 
                  icon={<TrendingDown />} 
                  label={`${stats.totalDebits} Debits`} 
                  color="error" 
                  variant="outlined" 
                />
              </Stack>
            )}
          </Box>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {transactions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No transactions yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your transaction history will appear here
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {transactions.slice(0, expanded ? 10 : 5).map((transaction, index) => (
              <React.Fragment key={transaction._id || index}>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getTransactionIcon(transaction.type, transaction.source?.kind)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" fontWeight="medium">
                          {transaction.title || 'Transaction'}
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={getTransactionColor(transaction.type, transaction.source?.kind)}
                        >
                          {transaction.formattedAmount} Tokens
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {transaction.formattedDate}
                        </Typography>
                        <Chip
                          size="small"
                          label={getTransactionLabel(transaction)}
                          variant="outlined"
                          color={getTransactionChipColor(transaction.source?.kind)}
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < transactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {transactions.length > 5 && (
          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              {expanded ? 'Showing all transactions' : `Showing 5 of ${transactions.length} transactions`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTransactions;
