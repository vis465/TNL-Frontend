import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Container,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Autocomplete,
  Pagination,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Badge,
  LinearProgress,
  Fade,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Payment,
  History,
  Refresh,
  AttachMoney,
  People,
  Description,
  Add,
  Remove,
  FilterList,
  Search,
  Download,
  Visibility,
  TrendingDown,
  AccountBalanceWallet,
  MonetizationOn,
  Assessment,
  Speed,
  Warning,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  BarChart,
  PieChart,
  ShowChart,
  Timeline,
  Receipt,
  LocalShipping,
  Gavel,
  Speed as SpeedIcon,
  Park,
  Build
} from '@mui/icons-material';
import { getBankBalance, getBankTransactions, bankBonus, bankDeduct, searchRiders } from '../services/bankService';

export default function AdminBank() {
  const [balance, setBalance] = useState(0);
  const [tx, setTx] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Store all transactions for metrics
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [riderIds, setRiderIds] = useState('');
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [riderQuery, setRiderQuery] = useState('');
  const [riderOptions, setRiderOptions] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Deduction state
  const [deductAmount, setDeductAmount] = useState('');
  const [deductReason, setDeductReason] = useState('');
  const [deductRiderIds, setDeductRiderIds] = useState('');
  const [selectedDeductRiders, setSelectedDeductRiders] = useState([]);
  const [deductRiderQuery, setDeductRiderQuery] = useState('');
  const [deductRiderOptions, setDeductRiderOptions] = useState([]);
  const [deductLoading, setDeductLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionsPerPage] = useState(20);

  // New UI state
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const refresh = async (page = currentPage) => {
    try {
      setLoading(true);
      setErr(''); setMsg('');

      // Load balance
      const b = await getBankBalance();
      setBalance(b.balance || 0);

      // Load paginated transactions for display
      const t = await getBankTransactions(page, transactionsPerPage);
      setTx(t.items || []);
      setTotalPages(Math.ceil((t.total || t.items?.length || 0) / transactionsPerPage));

      // Load all transactions for metrics (first page with large limit)
      const allT = await getBankTransactions(1, 10000); // Load all transactions
      setAllTransactions(allT.items || []);
    } catch (e) {
      setErr(e.message || 'Failed to load bank data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Note: Filtering is now handled by the backend API
  // Client-side filtering removed to fix pagination issues

  const getFinancialMetrics = () => {
    // Use all transactions from all pages, not just current page
    const jobDeductions = allTransactions.filter(t => t.source?.kind === 'job_deductions');
    const adminDeductions = allTransactions.filter(t => t.source?.kind === 'admin_deduction');
    const credits = allTransactions.filter(t => t.type === 'credit');

    const totalDeductions = jobDeductions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalCredits = credits.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalAdminDeductions = adminDeductions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    return {
      totalDeductions,
      totalCredits,
      totalAdminDeductions,
      jobCount: jobDeductions.length,
      creditCount: credits.length,
      adminDeductionCount: adminDeductions.length
    };
  };

  const openTransactionDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDialogOpen(true);
  };

  useEffect(() => { refresh(); }, []);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    refresh(page);
  };

  const onBonus = async () => {
    if (!amount || isNaN(Number(amount))) {
      setErr('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setErr(''); setMsg('');
    try {
      const idsTyped = riderIds.trim() ? riderIds.split(',').map(s => s.trim()) : [];
      const idsSelected = selectedRiders.map(r => r._id);
      const allIds = [...new Set([...idsTyped, ...idsSelected])];
      const ids = allIds.length ? allIds : undefined;
      const res = await bankBonus(Number(amount), ids, reason, `ui-${Date.now()}`);
      setMsg(`Successfully credited ${res.credited} riders with $${Number(amount).toLocaleString()}`);
      setAmount(''); setReason(''); setRiderIds(''); setSelectedRiders([]);
      await refresh();
    } catch (e) {
      setErr(e.message || 'Bonus payout failed');
    } finally {
      setLoading(false);
    }
  };

  const onDeduct = async () => {
    if (!deductAmount || isNaN(Number(deductAmount))) {
      setErr('Please enter a valid amount');
      return;
    }

    const idsTyped = deductRiderIds.trim() ? deductRiderIds.split(',').map(s => s.trim()) : [];
    const idsSelected = selectedDeductRiders.map(r => r._id);
    const allIds = [...new Set([...idsTyped, ...idsSelected])];

    if (allIds.length === 0) {
      setErr('Please select at least one rider');
      return;
    }

    setDeductLoading(true);
    setErr(''); setMsg('');
    try {
      const res = await bankDeduct(Number(deductAmount), allIds, deductReason, `ui-deduct-${Date.now()}`);

      if (res.failedDeductions && res.failedDeductions.length > 0) {
        const failedNames = res.failedDeductions.map(f => f.name).join(', ');
        setMsg(`Successfully deducted from ${res.deducted} riders. Failed: ${failedNames}`);
      } else {
        setMsg(`Successfully deducted $${Number(deductAmount).toLocaleString()} from ${res.deducted} riders. Total: $${res.totalDeducted.toLocaleString()}`);
      }

      setDeductAmount('');
      setDeductReason('');
      setDeductRiderIds('');
      setSelectedDeductRiders([]);
      await refresh();
    } catch (e) {
      if (e.response?.data?.insufficientRiders) {
        const insufficientNames = e.response.data.insufficientRiders.map(r => `${r.name} (${r.currentBalance}/${r.required})`).join(', ');
        setErr(`Insufficient funds: ${insufficientNames}`);
      } else {
        setErr(e.message || 'Deduction failed');
      }
    } finally {
      setDeductLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? '#2e7d32' : '#d32f2f';
  };

  const metrics = getFinancialMetrics();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Modern Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <AccountBalance sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 0.5 }}>
                  TNL Bank Control
                </Typography>
                <Typography variant="h6" sx={{ color: '#718096', fontWeight: 400 }}>
                  Financial Management & Analytics Dashboard
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Export Data
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={refresh}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Alerts */}
          <Fade in={!!err || !!msg}>
            <Box>
              {err && (
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)' }}
                  action={
                    <IconButton size="small" onClick={() => setErr('')}>
                      <Cancel />
                    </IconButton>
                  }
                >
                  {err}
                </Alert>
              )}
              {msg && (
                <Alert
                  severity="success"
                  sx={{ mb: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)' }}
                  action={
                    <IconButton size="small" onClick={() => setMsg('')}>
                      <CheckCircle />
                    </IconButton>
                  }
                >
                  {msg}
                </Alert>
              )}
            </Box>
          </Fade>
        </Box>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                <AccountBalance sx={{ fontSize: 120 }} />
              </Box>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                    Total Balance
                  </Typography>
                  <TrendingUp sx={{ fontSize: 28 }} />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(balance)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Current available funds
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                <TrendingDown sx={{ fontSize: 120 }} />
              </Box>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                    Job Deductions
                  </Typography>
                  <LocalShipping sx={{ fontSize: 28 }} />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(metrics.totalDeductions)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {metrics.jobCount} jobs processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                <MonetizationOn sx={{ fontSize: 120 }} />
              </Box>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                    Total Credits
                  </Typography>
                  <TrendingUp sx={{ fontSize: 28 }} />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(metrics.totalCredits)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {metrics.creditCount} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                <Gavel sx={{ fontSize: 120 }} />
              </Box>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                    Admin Deductions
                  </Typography>
                  <Gavel sx={{ fontSize: 28 }} />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(metrics.totalAdminDeductions)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {metrics.adminDeductionCount} manual deductions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ px: 3 }}
            >
              <Tab
                label="Transaction Management"
                icon={<Receipt />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
              <Tab
                label="Quick Actions"
                icon={<Add />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
              <Tab
                label="Analytics"
                icon={<Assessment />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 0 }}>
            {/* Transaction Management Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                {/* Transaction List Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#666' }}>
                    Recent Transactions ({tx.length} of {allTransactions.length} total)
                  </Typography>
                </Box>

                {/* Transactions List */}
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                  </Box>
                ) : (
                  <Box>
                    {tx.map((transaction, index) => (
                      <Card
                        key={transaction._id}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => openTransactionDialog(transaction)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={3}>
                              <Avatar sx={{
                                bgcolor: transaction.type === 'credit' ? '#4caf50' : '#f44336',
                                width: 48,
                                height: 48
                              }}>
                                {transaction.type === 'credit' ? <Add /> : <Remove />}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {transaction.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                  {transaction.riderInfo?.name || transaction.riderName || 'Unknown Rider'}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                  <Chip
                                    label={transaction.type}
                                    size="small"
                                    color={transaction.type === 'credit' ? 'success' : 'error'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  <Chip
                                    label={transaction.source?.kind || 'Unknown'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Stack>
                              </Box>
                            </Stack>

                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 700,
                                  color: transaction.type === 'credit' ? '#4caf50' : '#f44336'
                                }}
                              >
                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}


            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Bonus Payout */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                          <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#e3f2fd',
                            color: '#1976d2'
                          }}>
                            <Add />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Bonus Payout
                          </Typography>
                        </Stack>

                        <Stack spacing={3}>
                          <TextField
                            label="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                            }}
                          />
                          <TextField
                            label="Reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Description /></InputAdornment>,
                            }}
                          />
                          <Autocomplete
                            multiple
                            options={riderOptions}
                            getOptionLabel={(option) => `${option.name || option.username || option.employeeID} (${option.employeeID || option._id})`}
                            value={selectedRiders}
                            onChange={(_, newValue) => setSelectedRiders(newValue)}
                            onInputChange={async (_, query) => {
                              setRiderQuery(query);
                              if (query && query.length >= 2) {
                                try {
                                  const riders = await searchRiders(query);
                                  setRiderOptions(riders);
                                } catch (e) {
                                  setRiderOptions([]);
                                }
                              } else {
                                setRiderOptions([]);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Riders"
                                placeholder="Search riders..."
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: <InputAdornment position="start"><People /></InputAdornment>,
                                }}
                              />
                            )}
                          />

                          {/* Show selected riders as chips with removable "x" */}
                          {selectedRiders.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                              {selectedRiders.map(r => {
                                const id = r._id || r.employeeID || r.id;
                                const label = `${r.name || r.username || 'Unknown'} (${r.employeeID || r._id || ''})`;
                                return (
                                  <Chip
                                    key={id || label}
                                    label={label}
                                    onDelete={() => setSelectedRiders(prev => prev.filter(p => (p._id || p.employeeID || p.id) !== id))}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          )}

                          <Button
                            variant="contained"
                            onClick={onBonus}
                            disabled={loading}
                            size="large"
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              py: 1.5,
                              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                              }
                            }}
                          >
                            {loading ? 'Processing...' : 'Process Payout'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Money Deduction */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                          <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#ffebee',
                            color: '#d32f2f'
                          }}>
                            <Remove />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Money Deduction
                          </Typography>
                        </Stack>

                        <Stack spacing={3}>
                          <TextField
                            label="Amount to Deduct"
                            value={deductAmount}
                            onChange={(e) => setDeductAmount(e.target.value)}
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                            }}
                          />
                          <TextField
                            label="Reason for Deduction"
                            value={deductReason}
                            onChange={(e) => setDeductReason(e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Description /></InputAdornment>,
                            }}
                          />
                          <Autocomplete
                            multiple
                            options={deductRiderOptions}
                            getOptionLabel={(option) => `${option.name || option.username || option.employeeID} (${option.employeeID || option._id})`}
                            value={selectedDeductRiders}
                            onChange={(_, newValue) => setSelectedDeductRiders(newValue)}
                            onInputChange={async (_, query) => {
                              setDeductRiderQuery(query);
                              if (query && query.length >= 2) {
                                try {
                                  const riders = await searchRiders(query);
                                  setDeductRiderOptions(riders);
                                } catch (e) {
                                  setDeductRiderOptions([]);
                                }
                              } else {
                                setDeductRiderOptions([]);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Riders"
                                placeholder="Search riders..."
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: <InputAdornment position="start"><People /></InputAdornment>,
                                }}
                              />
                            )}
                          />

                          {/* Show selected deduct riders as chips with removable "x" */}
                          {selectedDeductRiders.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                              {selectedDeductRiders.map(r => {
                                const id = r._id || r.employeeID || r.id;
                                const label = `${r.name || r.username || 'Unknown'} (${r.employeeID || r._id || ''})`;
                                return (
                                  <Chip
                                    key={id || label}
                                    label={label}
                                    onDelete={() => setSelectedDeductRiders(prev => prev.filter(p => (p._id || p.employeeID || p.id) !== id))}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          )}

                          <Button
                            variant="contained"
                            color="error"
                            onClick={onDeduct}
                            disabled={deductLoading}
                            size="large"
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              py: 1.5
                            }}
                          >
                            {deductLoading ? 'Processing...' : 'Process Deduction'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Financial Analytics
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Deduction Breakdown
                        </Typography>
                        {(() => {
                          const jobDeductions = allTransactions.filter(t => t.source?.kind === 'job_deductions');
                          const deductionBreakdown = jobDeductions.reduce((acc, t) => {
                            if (t.deductionDetails) {
                              acc.cargoDamage += t.deductionDetails.cargoDamage || 0;
                              acc.autoPark += t.deductionDetails.autoPark || 0;
                              acc.speedViolation += t.deductionDetails.speedViolation || 0;
                              acc.fixedTax += t.deductionDetails.fixedTax || 0;
                            }
                            return acc;
                          }, { cargoDamage: 0, autoPark: 0, speedViolation: 0, fixedTax: 0 });

                          return (
                            <Stack spacing={2}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Build sx={{ color: '#ff9800', fontSize: 20 }} />
                                  <Typography variant="body2">Cargo Damage</Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                                  {deductionBreakdown.cargoDamage}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Park sx={{ color: '#9c27b0', fontSize: 20 }} />
                                  <Typography variant="body2">Auto-Park</Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                                  {deductionBreakdown.autoPark}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <SpeedIcon sx={{ color: '#f44336', fontSize: 20 }} />
                                  <Typography variant="body2">Speed Violation</Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#f44336' }}>
                                  {deductionBreakdown.speedViolation}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Receipt sx={{ color: '#4caf50', fontSize: 20 }} />
                                  <Typography variant="body2">Fixed Tax</Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                                  {deductionBreakdown.fixedTax}
                                </Typography>
                              </Box>
                            </Stack>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Transaction Summary
                        </Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Total Transactions</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {allTransactions.length}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Job Deductions</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f44336' }}>
                              {metrics.jobCount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Credits</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              {metrics.creditCount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">Admin Actions</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                              {metrics.adminDeductionCount}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Transaction Detail Dialog */}
        <Dialog
          open={transactionDialogOpen}
          onClose={() => setTransactionDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Receipt />
              <Typography variant="h6">Transaction Details</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Description</Typography>
                  <Typography variant="body1">{selectedTransaction.title}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Amount</Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: selectedTransaction.type === 'credit' ? '#4caf50' : '#f44336'
                    }}
                  >
                    {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(selectedTransaction.amount))}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Rider</Typography>
                  <Typography variant="body1">
                    {selectedTransaction.riderInfo?.name || selectedTransaction.riderName || 'Unknown'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Date & Time</Typography>
                  <Typography variant="body1">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {selectedTransaction.deductionDetails && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Deduction Details</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {selectedTransaction.deductionDetails.cargoDamage > 0 && (
                        <Chip label={`Cargo: ${selectedTransaction.deductionDetails.cargoDamage}`} size="small" />
                      )}
                      {selectedTransaction.deductionDetails.autoPark > 0 && (
                        <Chip label={`Auto: ${selectedTransaction.deductionDetails.autoPark}`} size="small" />
                      )}
                      {selectedTransaction.deductionDetails.speedViolation > 0 && (
                        <Chip label={`Speed: ${selectedTransaction.deductionDetails.speedViolation}`} size="small" />
                      )}
                      {selectedTransaction.deductionDetails.fixedTax > 0 && (
                        <Chip label={`Tax: ${selectedTransaction.deductionDetails.fixedTax}`} size="small" />
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransactionDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}