import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Refresh,
  Receipt,
  Add,
  AttachMoney,
  History,
  Timeline
} from '@mui/icons-material';
import { getMyWallet, getWalletStats, purchase } from '../services/walletService';

const Wallet = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseTitle, setPurchaseTitle] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError('');
      const [walletData, statsData] = await Promise.all([
        getMyWallet(),
        getWalletStats()
      ]);
      setWallet(walletData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Wallet loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWalletData();
  };

  const handlePurchase = async () => {
    if (!purchaseAmount || !purchaseTitle) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setPurchaseLoading(true);
      setError('');
      await purchase(
        parseFloat(purchaseAmount),
        purchaseTitle,
        { source: 'manual_purchase' },
        `purchase_${Date.now()}`
      );
      setPurchaseDialogOpen(false);
      setPurchaseAmount('');
      setPurchaseTitle('');
      loadWalletData(); // Refresh data
    } catch (err) {
      setError(err.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
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

  if (loading && !wallet.balance) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading wallet...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountBalanceWallet color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Wallet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your tokens and view transaction history
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setPurchaseDialogOpen(true)}
            >
              Add Tokens
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Balance Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Current Balance
              </Typography>
              <Typography variant="h2" fontWeight="bold">
                {wallet.formattedBalance || '0'} Tokens
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {stats && (
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    icon={<TrendingUp />}
                    label={`${stats.totalCredits} Credits`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<TrendingDown />}
                    label={`${stats.totalDebits} Debits`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<Receipt />}
                    label={`${stats.totalTransactions} Total`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Stack>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<History />} label="Transaction History" />
          <Tab icon={<Timeline />} label="Statistics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Transaction History
            </Typography>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {wallet.transactions.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No transactions yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your transaction history will appear here
                </Typography>
              </Box>
            ) : (
              <List>
                {wallet.transactions.map((transaction, index) => (
                  <React.Fragment key={transaction._id || index}>
                    <ListItem>
                      <ListItemIcon>
                        {getTransactionIcon(transaction.type, transaction.source?.kind)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {transaction.title || 'Transaction'}
                            </Typography>
                            <Typography
                              variant="h6"
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
                    {index < wallet.transactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Transaction Summary
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Credits</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      +{stats.totalCreditAmount} Tokens
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Debits</Typography>
                    <Typography fontWeight="bold" color="error.main">
                      -{stats.totalDebitAmount} Tokens
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Net Balance</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {stats.totalCreditAmount - stats.totalDebitAmount} Tokens
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Activity Overview
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Transactions</Typography>
                    <Typography fontWeight="bold">{stats.totalTransactions}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Credit Transactions</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {stats.totalCredits}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Debit Transactions</Typography>
                    <Typography fontWeight="bold" color="error.main">
                      {stats.totalDebits}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Tokens</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">Tokens</InputAdornment>,
              }}
            />
            <TextField
              label="Description"
              value={purchaseTitle}
              onChange={(e) => setPurchaseTitle(e.target.value)}
              fullWidth
              placeholder="e.g., Manual top-up, Event reward, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            disabled={purchaseLoading || !purchaseAmount || !purchaseTitle}
          >
            {purchaseLoading ? 'Processing...' : 'Add Tokens'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Wallet;
