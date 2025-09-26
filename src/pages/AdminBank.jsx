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
  Autocomplete
} from '@mui/material';
import { 
  AccountBalance, 
  TrendingUp, 
  Payment, 
  History, 
  Refresh,
  AttachMoney,
  People,
  Description
} from '@mui/icons-material';
import { getBankBalance, getBankTransactions, bankBonus, searchRiders } from '../services/bankService';

export default function AdminBank() {
  const [balance, setBalance] = useState(0);
  const [tx, setTx] = useState([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [riderIds, setRiderIds] = useState('');
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [riderQuery, setRiderQuery] = useState('');
  const [riderOptions, setRiderOptions] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      setErr(''); setMsg('');
      const b = await getBankBalance();
      setBalance(b.balance || 0);
      const t = await getBankTransactions(100);
      setTx(t.items || []);
    } catch (e) { 
      setErr(e.message || 'Failed to load bank data'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionColor = (type) => {
    return type === 'CREDIT' ? '#2e7d32' : '#d32f2f';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <AccountBalance sx={{ fontSize: 40, color: '#1976d2' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 300}}>
              TNL  Bank Administration
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666' }}>
                Financial Management Dashboard
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Alerts */}
        {err && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {err}
          </Alert>
        )}
        {msg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {msg}
          </Alert>
        )}

        {/* Balance Card */}
        <Paper elevation={0} sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Box sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <TrendingUp sx={{ color: '#1976d2' }} />
                  <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
                    Current Balance
                  </Typography>
                </Stack>
                <Typography variant="h2" sx={{ fontWeight: 200, color: 'white' }}>
                  {formatCurrency(balance)}
                </Typography>
              </Box>
              <IconButton 
                onClick={refresh} 
                disabled={loading}
                sx={{ 
                  
                  
                  width: 48,
                  height: 48
                }}
              >
                <Refresh />
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Bonus Payout Section */}
        <Paper elevation={0} sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Box sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Payment sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{  fontWeight: 500 }}>
                Bonus Payout
              </Typography>
            </Stack>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <TextField
                  label="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AttachMoney sx={{ fontSize: 20 }} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Description sx={{ fontSize: 20 }} /></InputAdornment>,
                  }}
                />
              </Stack>
              
              <TextField
                label="Rider IDs (comma-separated, optional)"
                value={riderIds}
                onChange={(e) => setRiderIds(e.target.value)}
                fullWidth
                multiline
                rows={2}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><People sx={{ fontSize: 20 }} /></InputAdornment>,
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
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={option.name || option.username || option.employeeID}
                      size="small"
                      sx={{ 
                        bgcolor: '#e3f2fd', 
                        color: '#1976d2',
                        '& .MuiChip-deleteIcon': { color: '#1976d2' }
                      }}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Riders (name, username, employee ID)"
                    placeholder="Type to search riders..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <People sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px'
                  }
                }}
              />

              {selectedRiders.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {selectedRiders.map((r) => (
                    <Chip
                      key={r._id}
                      label={`${r.name || r.username || r.employeeID} (${r.employeeID || r._id})`}
                      onDelete={() => setSelectedRiders(selectedRiders.filter(x => x._id !== r._id))}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              )}
              
              <Box>
                <Button
                  variant="contained"
                  onClick={onBonus}
                  disabled={loading}
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500
                  }}
                >
                  {loading ? 'Processing...' : 'Process Payout'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Transactions Table */}
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Box sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <History sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{  fontWeight: 500 }}>
                Transaction History
              </Typography>
            </Stack>
            
            <Box sx={{ overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Date & Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Type
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Amount
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Balance After
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Source
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Description
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tx.map((row, index) => (
                    <TableRow 
                      key={row._id}
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' },
                        borderBottom: index === tx.length - 1 ? 'none' : '1px solid #f0f0f0'
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(row.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {new Date(row.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.type}
                          size="small"
                          sx={{
                            bgcolor: row.type === 'CREDIT' ? '#e8f5e8' : '#ffeaea',
                            color: getTransactionColor(row.type),
                            fontWeight: 500,
                            minWidth: 70
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: getTransactionColor(row.type)
                          }}
                        >
                          {formatCurrency(Math.abs(row.amount))}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(row.balanceAfter)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {row.source?.kind || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.title}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}