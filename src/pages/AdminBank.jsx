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
    return type === 'credit' ? '#2e7d32' : '#d32f2f';
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

        {/* Job Deductions Summary */}
        <Paper elevation={0} sx={{ mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Box sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Payment sx={{ color: '#ff9800' }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Job Deductions Summary
              </Typography>
            </Stack>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
              {(() => {
                const jobDeductions = tx.filter(t => t.source?.kind === 'job_deductions');
                const totalDeductions = jobDeductions.reduce((sum, t) => sum + (t.amount || 0), 0);
                const totalJobs = jobDeductions.length;
                const avgDeduction = totalJobs > 0 ? totalDeductions / totalJobs : 0;
                
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
                  <>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#ff9800' }}>
                        {totalDeductions.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Total Deducted
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2,  borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                        {totalJobs}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Jobs Processed
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2,  borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {Math.round(avgDeduction)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Avg per Job
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Deduction Breakdown
                      </Typography>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Cargo Damage:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{deductionBreakdown.cargoDamage}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Auto-Park:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{deductionBreakdown.autoPark}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Speed Violation:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{deductionBreakdown.speedViolation}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Fixed Tax:</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{deductionBreakdown.fixedTax}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </>
                );
              })()}
            </Box>
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
                      Buyer/Payee
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Source
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '2px solid #e0e0e0' }}>
                      Deduction Details
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tx.map((row, index) => (
                    <TableRow 
                      key={row._id}
                      sx={{ 
                        
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
                            // bgcolor: row.type === 'credit' ? '#5ce15cff' : '#e04646ff',
                            color: getTransactionColor(row.type),
                            fontWeight: 800,
                            
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
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.riderInfo?.name || row.riderName || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            ID: {row.riderInfo?.employeeId || row.riderEmployeeId || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.source?.kind || '-'}
                          size="small"
                          sx={{
                            bgcolor: row.source?.kind === 'job_deductions' ? '#ff9800' : '#e0e0e0',
                            color: row.source?.kind === 'job_deductions' ? 'white' : '#666',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.title}
                        </Typography>
                        {row.jobContext && (
                          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                            Revenue: €{row.jobContext.revenue?.toLocaleString() || 0} | 
                            Server: {row.jobContext.server || 'Unknown'} | 
                            Speed: {row.jobContext.topSpeedKmh || 0} km/h
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.deductionDetails ? (
                          <Box>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                              Base: {row.deductionDetails.baseTokens} → Final: {row.deductionDetails.finalTokens}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {row.deductionDetails.cargoDamage > 0 && (
                                <Chip label={`Cargo: ${row.deductionDetails.cargoDamage}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} />
                              )}
                              {row.deductionDetails.autoPark > 0 && (
                                <Chip label={`Auto: ${row.deductionDetails.autoPark}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} />
                              )}
                              {row.deductionDetails.speedViolation > 0 && (
                                <Chip label={`Speed: ${row.deductionDetails.speedViolation}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} />
                              )}
                              {row.deductionDetails.fixedTax > 0 && (
                                <Chip label={`Tax: ${row.deductionDetails.fixedTax}`} size="small" sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#999' }}>
                            -
                          </Typography>
                        )}
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