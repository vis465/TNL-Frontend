import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Badge,
  Divider,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Assignment,
  TrendingUp,
  TrendingDown,
  AccessTime,
  AttachMoney,
  LocationOn,
  MyLocation,
  Inventory2,
  Business,
  AltRoute,
  WarningAmber,
  Speed,
  Bolt,
  DirectionsRun,
  LocalShipping,
  LocalMall,
  Star,
  EmojiEvents,
  Leaderboard,
  Refresh,
  FilterList,
  Search,
  Sort,
  CheckCircle,
  Cancel,
  Schedule,
  Timer,
  Group,
  Person,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { listTemplates, buyContract, getContractStats, myContracts, getContractLeaderboard } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';

const ContractsMarketplace = () => {
  const [templates, setTemplates] = useState([]);
  const [myContractsData, setMyContractsData] = useState({ active: [], history: [] });
  const [wallet, setWallet] = useState({ balance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [contractLeaderboard, setContractLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [templatesData, contractsData, walletData] = await Promise.all([
        listTemplates(),
        myContracts(),
        getMyWallet()
      ]);
      setTemplates(templatesData);
      setMyContractsData(contractsData);
      setWallet(walletData);
      loadContractLeaderboard();
    } catch (err) {
      setError('Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContractLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const leaderboardData = await getContractLeaderboard(20);
      const formattedData = leaderboardData.map((rider, index) => ({
        rank: index + 1,
        name: rider.riderName || 'Unknown Rider',
        completed: rider.completedContracts || 0,
        active: rider.activeContracts || 0,
        totalEarnings: rider.netEarnings || 0,
        totalContracts: rider.totalContracts || 0,
        completionRate: rider.completionRate || 0,
        employeeId: rider.riderEmployeeId
      }));
      setContractLeaderboard(formattedData);
    } catch (err) {
      console.error('Leaderboard loading error:', err);
      // Fallback to mock data if API fails
      const mockLeaderboard = [
        { rank: 1, name: 'Alex Johnson', completed: 15, active: 3, totalEarnings: 2500, totalContracts: 18, completionRate: 83.3 },
        { rank: 2, name: 'Sarah Chen', completed: 12, active: 2, totalEarnings: 2100, totalContracts: 14, completionRate: 85.7 },
        { rank: 3, name: 'Mike Rodriguez', completed: 10, active: 4, totalEarnings: 1800, totalContracts: 14, completionRate: 71.4 },
        { rank: 4, name: 'Emma Wilson', completed: 8, active: 1, totalEarnings: 1500, totalContracts: 9, completionRate: 88.9 },
        { rank: 5, name: 'David Kim', completed: 7, active: 3, totalEarnings: 1200, totalContracts: 10, completionRate: 70.0 },
      ];
      setContractLeaderboard(mockLeaderboard);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleBuyContract = async (template) => {
    setSelectedTemplate(template);
    setPurchaseDialogOpen(true);
  };

  const handleViewDetails = (template) => {
    setSelectedTemplate(template);
    setDetailsDialogOpen(true);
  };

  const confirmPurchase = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      setError('');
      await buyContract(selectedTemplate._id);
      setSuccess('Contract purchased successfully!');
      setPurchaseDialogOpen(false);
      setSelectedTemplate(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const getCriteriaIcon = (type) => {
    const iconMap = {
      sourceCity: <LocationOn />,
      destinationCity: <MyLocation />,
      cargoName: <Inventory2 />,
      sourceCompany: <Business />,
      destinationCompany: <Business />,
      minDistance: <AltRoute />,
      maxDamagePct: <WarningAmber />,
      maxTopSpeedKmh: <Speed />,
      minAvgSpeedKmh: <Bolt />,
      maxAvgSpeedKmh: <DirectionsRun />,
      minRevenue: <AttachMoney />,
      maxTruckDamagePercent: <LocalShipping />,
      maxTrailerDamagePercent: <LocalMall />
    };
    return iconMap[type] || <CheckCircle />;
  };

  const getCriteriaColor = (type) => {
    const colorMap = {
      sourceCity: 'primary',
      destinationCity: 'secondary',
      cargoName: 'info',
      minDistance: 'primary',
      maxDamagePct: 'warning',
      minRevenue: 'success',
      maxTruckDamagePercent: 'error',
      maxTrailerDamagePercent: 'error'
    };
    return colorMap[type] || 'default';
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'affordable' && template.priceTokens <= wallet.balance) ||
                         (filterBy === 'premium' && template.priceTokens > 1000);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.priceTokens - b.priceTokens;
      case 'reward':
        return b.rewardTokens - a.rewardTokens;
      case 'deadline':
        return a.deadlineDays - b.deadlineDays;
      default:
        return 0;
    }
  });

  const isOwned = (templateId) => {
    return myContractsData.active.some(contract => 
      (contract.templateId && contract.templateId._id) === templateId || 
      contract.templateId === templateId
    );
  };

  if (loading && templates.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading contracts marketplace...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{ 
              mb: 2,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Contracts Marketplace
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover and purchase contracts to earn tokens and climb the leaderboard
          </Typography>
          
          {/* Wallet Balance */}
          <Card sx={{ 
            maxWidth: 300, 
            mx: 'auto', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                <AttachMoney />
                <Typography variant="h5" fontWeight="bold">
                  {wallet.formattedBalance || '0'} Tokens
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Error/Success Messages */}
          {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
          )}
          {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<Assignment />} label="Marketplace" />
          <Tab icon={<Leaderboard />} label="Leaderboard" />
          
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Fade in timeout={600}>
          <Box>
            {/* Filters and Search */}
            
            {/* Contract Cards */}
            <Grid container spacing={3}>
              {filteredTemplates.map((template, index) => (
                <Grid item xs={12} md={6} lg={4} key={template._id}>
                  <Zoom in timeout={800 + index * 100}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        },
                        transition: 'all 0.3s ease',
                        border: isOwned(template._id) ? '2px solid #4caf50' : '1px solid #e0e0e0'
                      }}
                    >
                      {isOwned(template._id) && (
                        <Chip
                          label="Owned"
                          color="success"
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                        />
                      )}
                      
                      <CardHeader
                        title={
                          <Typography variant="h6" fontWeight="bold" noWrap>
                            {template.title}
                          </Typography>
                        }
                        subheader={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {template.description}
                          </Typography>
                        }
                        action={
                          <IconButton size="small" onClick={() => handleViewDetails(template)}>
                            <Visibility />
                          </IconButton>
                        }
                      />
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* Price and Reward */}
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <Chip
                            icon={<AttachMoney />}
                            label={`Cost: ${template.priceTokens} Tokens`}
                            color="error"
                            variant="outlined"
                          />
                          <Chip
                            icon={<Star />}
                            label={`Reward: ${template.rewardTokens} Tokens`}
                            color="success"
                            variant="outlined"
                          />
                        </Stack>

                        {/* Deadline */}
                        <Chip
                          icon={<AccessTime />}
                          label={`${template.deadlineDays} days`}
                          color="info"
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />

                        {/* Tasks */}
                        {template.tasks && template.tasks.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Tasks ({template.tasks.length})
                            </Typography>
                            <Stack spacing={1}>
                              {template.tasks.slice(0, 3).map((task, taskIndex) => (
                                <Box key={taskIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                          fontWeight: 'bold',
                                    mr: 1
                                  }}>
                                    {taskIndex + 1}
                                  </Box>
                                  <Typography variant="body2" noWrap>
                          {task.title}
                                  </Typography>
                                </Box>
                              ))}
                              {template.tasks.length > 3 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{template.tasks.length - 3} more tasks
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        )}

                        {/* Criteria */}
                        {template.tasks && template.tasks[0]?.criteria && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Requirements
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {Object.entries(template.tasks[0].criteria).slice(0, 3).map(([key, value]) => (
                                <Chip
                                    key={key}
                                  size="small"
                                  icon={getCriteriaIcon(key)}
                                  label={`${key}: ${value}`}
                                  color={getCriteriaColor(key)}
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Assignment />}
                          onClick={() => handleBuyContract(template)}
                          disabled={isOwned(template._id) || template.priceTokens > wallet.balance}
                          sx={{ 
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                            }
                          }}
                        >
                          {isOwned(template._id) ? 'Owned' : 
                           template.priceTokens > wallet.balance ? 'Insufficient Funds' : 
                           'Purchase Contract'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>

            {filteredTemplates.length === 0 && (
              <Box textAlign="center" py={8}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No contracts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {tabValue === 1 && (
        <Fade in timeout={600}>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Contract Leaderboard
            </Typography>
            
            {leaderboardLoading ? (
              <LinearProgress />
            ) : (
              <Card>
                <CardContent>
                  <List>
                    {contractLeaderboard.map((rider, index) => (
                      <React.Fragment key={rider.rank}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: rider.rank <= 3 ? 'primary.main' : 'grey.500',
                              fontWeight: 'bold'
                            }}>
                              {rider.rank}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6" fontWeight="bold">
                                  {rider.name}
                                </Typography>
                                {rider.rank <= 3 && (
                                  <Star color="warning" fontSize="small" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Chip size="small" label={`${rider.completed} Completed`} color="success" />
                                <Chip size="small" label={`${rider.active} Active`} color="info" />
                                
                                {rider.completionRate && (
                                  <Chip 
                                    size="small" 
                                    label={`${rider.completionRate.toFixed(1)}% Success`} 
                                    color={rider.completionRate >= 80 ? 'success' : rider.completionRate >= 60 ? 'warning' : 'error'}
                                  />
                                )}
                               
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={`#${rider.rank}`}
                              color={rider.rank <= 3 ? 'primary' : 'default'}
                              variant={rider.rank <= 3 ? 'outlined' : 'default'}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < contractLeaderboard.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      )}

    

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Contract</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="h6">{selectedTemplate.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTemplate.description}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip icon={<AttachMoney />} label={`Cost: ${selectedTemplate.priceTokens} Tokens`} color="error" />
                <Chip icon={<Star />} label={`Reward: ${selectedTemplate.rewardTokens} Tokens`} color="success" />
              </Stack>
              <Typography variant="body2">
                Are you sure you want to purchase this contract? This will deduct {selectedTemplate.priceTokens} tokens from your wallet.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmPurchase}
            variant="contained"
            disabled={loading}
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {loading ? 'Processing...' : 'Purchase'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Assignment />
            <Typography variant="h6">Contract Details</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              {/* Header Info */}
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedTemplate.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedTemplate.description}
                </Typography>
                
                {/* Pricing Info */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Chip
                    icon={<AttachMoney />}
                    label={`Cost: ${selectedTemplate.priceTokens} Tokens`}
                    color="error"
                    variant="outlined"
                    size="large"
                  />
                  <Chip
                    icon={<Star />}
                    label={`Reward: ${selectedTemplate.rewardTokens} Tokens`}
                    color="success"
                    variant="outlined"
                    size="large"
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={`Deadline: ${selectedTemplate.deadlineDays} days`}
                    color="info"
                    variant="outlined"
                    size="large"
                  />
                </Stack>
              </Box>

              {/* Tasks Section */}
              {selectedTemplate.tasks && selectedTemplate.tasks.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment />
                    Tasks ({selectedTemplate.tasks.length})
                  </Typography>
                  <Stack spacing={2}>
                    {selectedTemplate.tasks.map((task, taskIndex) => (
                      <Card key={taskIndex} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {task.order || taskIndex + 1}
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {task.title}
                          </Typography>
                        </Stack>
                        
                        {/* Task Criteria */}
                        {task.criteria && Object.keys(task.criteria).length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                              Requirements:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              {Object.entries(task.criteria).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  size="small"
                                  icon={getCriteriaIcon(key)}
                                  label={`${key}: ${value}`}
                                  color={getCriteriaColor(key)}
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Availability Info */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  Availability
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip
                    icon={<Timer />}
                    label={`Start: ${selectedTemplate.startAt ? new Date(selectedTemplate.startAt).toLocaleString() : 'Immediate'}`}
                    color="info"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Timer />}
                    label={`End: ${selectedTemplate.endAt ? new Date(selectedTemplate.endAt).toLocaleString() : 'No expiration'}`}
                    color="warning"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {/* Status */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  Status
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip
                    label={selectedTemplate.active ? 'Active' : 'Inactive'}
                    color={selectedTemplate.active ? 'success' : 'error'}
                    variant="filled"
                  />
                  {isOwned(selectedTemplate._id) && (
                    <Chip
                      label="Owned"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {selectedTemplate && !isOwned(selectedTemplate._id) && selectedTemplate.priceTokens <= wallet.balance && (
            <Button
              onClick={() => {
                setDetailsDialogOpen(false);
                handleBuyContract(selectedTemplate);
              }}
              variant="contained"
              startIcon={<Assignment />}
              sx={{ 
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Purchase Contract
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContractsMarketplace;