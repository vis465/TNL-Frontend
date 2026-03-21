import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assignment,
  AccessTime,
  AttachMoney,
  Star,
  EmojiEvents,
  Leaderboard,
  Refresh,
  Search,
  Sort,
  CheckCircle,
  Schedule,
  Timer,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import { listTemplates, buyContract, myContracts, getContractLeaderboard } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';

// Custom hook for countdown timer
const useCountdown = (deadlineDate) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!deadlineDate) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadline = new Date(deadlineDate).getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadlineDate]);

  return timeLeft;
};

function getTemplateMetrics(template) {
  const cost = Number(template?.priceTokens || 0);
  const reward = Number(template?.rewardTokens || 0);
  const profit = reward - cost;
  const roiPct = cost > 0 ? Math.round(((reward - cost) / cost) * 100) : null;

  const tasks = Array.isArray(template?.tasks) ? template.tasks : [];
  const totalCriteriaKeys = tasks.reduce((sum, t) => {
    const criteria = t?.criteria && typeof t.criteria === 'object' ? t.criteria : null;
    if (!criteria) return sum;
    return sum + Object.entries(criteria).filter(([, v]) => v !== '' && v != null).length;
  }, 0);

  const startAt = template?.startAt ? new Date(template.startAt) : null;
  const endAt = template?.endAt ? new Date(template.endAt) : null;
  const now = new Date();
  const isNotStarted = startAt && startAt > now;
  const isExpired = endAt && endAt < now;

  const deadlineStart = startAt || now;
  const deadlineDate = new Date(deadlineStart.getTime() + (template?.deadlineDays || 0) * 24 * 60 * 60 * 1000);

  return {
    cost,
    reward,
    profit,
    roiPct,
    taskCount: tasks.length,
    totalCriteriaKeys,
    startAt,
    endAt,
    deadlineDate,
    isNotStarted,
    isExpired
  };
}

// Contract Card Component
const ContractCard = ({ template, wallet, isOwned, onBuyContract, onViewDetails }) => {
  const m = getTemplateMetrics(template);
  const countdown = useCountdown(m.deadlineDate);
  const canAfford = m.cost <= Number(wallet?.balance || 0);
  const isPositive = m.profit > 0;
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 8
        },
        transition: 'all 0.3s ease',
        border: isOwned(template._id) ? '2px solid rgba(76, 175, 80, 0.6)' : '1px solid',
        borderColor: 'divider',
        borderRadius: 3
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

      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: 'rgba(118, 75, 162, 0.10)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(102, 126, 234, 0.18)',
                color: 'primary.main',
                fontWeight: 900
              }}
            >
              <Assignment fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap>
                {template.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {m.taskCount} jobs • {m.totalCriteriaKeys} requirements
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            <Chip
              size="small"
              icon={<TrendingUp sx={{ fontSize: 16 }} />}
              label={`Profit ${m.profit >= 0 ? '+' : ''}${m.profit}`}
              color={isPositive ? 'success' : 'warning'}
              variant="outlined"
            />
            {m.roiPct != null && (
              <Chip size="small" label={`${m.roiPct >= 0 ? '+' : ''}${m.roiPct}%`} variant="outlined" sx={{ fontWeight: 700 }} />
            )}
          </Stack>
        </Stack>
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {template.description}
        </Typography>

        {/* Store-like pricing row */}
        <Grid container spacing={1.25} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Cost
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <AttachMoney fontSize="small" />
                <Typography variant="subtitle1" fontWeight={900}>
                  {m.cost}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Reward
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Star fontSize="small" />
                <Typography variant="subtitle1" fontWeight={900}>
                  {m.reward}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Profit
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <TrendingUp fontSize="small" color={isPositive ? 'success' : 'warning'} />
                <Typography variant="subtitle1" fontWeight={900} color={isPositive ? 'success.main' : 'warning.main'}>
                  {m.profit >= 0 ? '+' : ''}{m.profit}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {!canAfford && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            You don't have enough tokens to buy this contract yet.
          </Alert>
        )}

        {/* Deadline / Availability */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip
            icon={<AccessTime />}
            label={`Deadline: ${template.deadlineDays} days`}
            color="info"
            variant="outlined"
          />
          {countdown && countdown !== 'Expired' && (
            <Chip
              icon={<Timer />}
              label={`⏱️ ${countdown}`}
              color="warning"
              variant="filled"
              sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
            />
          )}
          {(m.isNotStarted || m.isExpired) && (
            <Chip
              icon={<Timer />}
              label={m.isExpired ? 'Expired' : 'Not started yet'}
              color={m.isExpired ? 'error' : 'warning'}
              variant="filled"
            />
          )}
          {(template.startAt || template.endAt) && (
            <Tooltip
              title={`Start: ${m.startAt ? m.startAt.toLocaleString() : 'Immediate'} • End: ${m.endAt ? m.endAt.toLocaleString() : 'No expiration'}`}
            >
              <Chip
                icon={<Schedule />}
                label="Time window"
                color="default"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Stack>

        <Button
          variant="text"
          size="small"
          startIcon={<Visibility />}
          onClick={() => onViewDetails(template)}
          sx={{ px: 0, fontWeight: 800 }}
        >
          View details
        </Button>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Assignment />}
          onClick={() => onBuyContract(template)}
          disabled={isOwned(template._id) || template.priceTokens > wallet.balance}
          sx={{ borderRadius: 999, fontWeight: 900 }}
        >
          {isOwned(template._id)
            ? 'Already owned'
            : template.priceTokens > wallet.balance
              ? 'Not enough tokens'
              : `Buy for ${template.priceTokens} tokens`}
        </Button>
      </CardActions>
    </Card>
  );
};

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
        rank: typeof rider.rank === 'number' ? rider.rank : index + 1,
        name: rider.riderName || 'Unknown Rider',
        completed: rider.completedContracts || 0,
        active: rider.activeContracts || 0,
        totalEarnings: rider.netEarnings ?? rider.totalEarnings ?? 0,
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
      setSuccess('Contract purchased successfully! Go to “My Contracts” to start your next job.');
      setPurchaseDialogOpen(false);
      setSelectedTemplate(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key) =>
    String(key)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

  const formatValue = (value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.filter((v) => v != null && v !== '').join(', ');
    if (value && typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  function getTemplateMetrics(template) {
    const cost = Number(template?.priceTokens || 0);
    const reward = Number(template?.rewardTokens || 0);
    const profit = reward - cost;
    const roiPct = cost > 0 ? Math.round(((reward - cost) / cost) * 100) : null;

    const tasks = Array.isArray(template?.tasks) ? template.tasks : [];
    const totalCriteriaKeys = tasks.reduce((sum, t) => {
      const criteria = t?.criteria && typeof t.criteria === 'object' ? t.criteria : null;
      if (!criteria) return sum;
      return sum + Object.entries(criteria).filter(([, v]) => v !== '' && v != null).length;
    }, 0);

    const startAt = template?.startAt ? new Date(template.startAt) : null;
    const endAt = template?.endAt ? new Date(template.endAt) : null;
    const now = new Date();
    const isNotStarted = startAt && startAt > now;
    const isExpired = endAt && endAt < now;

    // Calculate deadline date: start from startAt or now, add deadlineDays
    const deadlineStart = startAt || now;
    const deadlineDate = new Date(deadlineStart.getTime() + (template?.deadlineDays || 0) * 24 * 60 * 60 * 1000);

    return {
      cost,
      reward,
      profit,
      roiPct,
      taskCount: tasks.length,
      totalCriteriaKeys,
      startAt,
      endAt,
      deadlineDate,
      isNotStarted,
      isExpired
    };
  }

  const filteredTemplates = useMemo(() => {
    const list = Array.isArray(templates) ? templates : [];
    const balance = Number(wallet?.balance || 0);
    const q = searchTerm.trim().toLowerCase();

    const bySearchAndFilter = list.filter((template) => {
      const title = (template?.title || '').toLowerCase();
      const desc = (template?.description || '').toLowerCase();
      const matchesSearch = !q || title.includes(q) || desc.includes(q);

      const metrics = getTemplateMetrics(template);
      const matchesFilter =
        filterBy === 'all' ||
        (filterBy === 'affordable' && metrics.cost <= balance) ||
        (filterBy === 'profitable' && metrics.profit > 0) ||
        (filterBy === 'availableNow' && !metrics.isNotStarted && !metrics.isExpired);

      return matchesSearch && matchesFilter;
    });

    const sorted = [...bySearchAndFilter].sort((a, b) => {
      const aM = getTemplateMetrics(a);
      const bM = getTemplateMetrics(b);
      switch (sortBy) {
        case 'price':
          return aM.cost - bM.cost;
        case 'reward':
          return bM.reward - aM.reward;
        case 'profit':
          return bM.profit - aM.profit;
        case 'deadline':
          return Number(a?.deadlineDays || 0) - Number(b?.deadlineDays || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [templates, wallet?.balance, searchTerm, filterBy, sortBy]);

  const marketplaceSummary = useMemo(() => {
    const ownedActive = Array.isArray(myContractsData?.active) ? myContractsData.active.length : 0;
    const ownedHistory = Array.isArray(myContractsData?.history) ? myContractsData.history.length : 0;
    const ownedTotal = ownedActive + ownedHistory;

    const balance = Number(wallet?.balance || 0);
    const affordableCount = (Array.isArray(templates) ? templates : []).filter((t) => getTemplateMetrics(t).cost <= balance)
      .length;

    return { ownedActive, ownedHistory, ownedTotal, affordableCount };
  }, [myContractsData?.active, myContractsData?.history, templates, wallet?.balance]);

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
        <Box sx={{ mb: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 2, md: 3 }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={800} sx={{ mb: 0.75 }}>
                  Contracts Marketplace
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860 }}>
                  Browse available contracts like a store. Buy one, then go to your contract hub to see the next job and its exact requirements.
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  <Chip
                    icon={<TrendingUp />}
                    label={`${marketplaceSummary.ownedActive} active • ${marketplaceSummary.ownedTotal} owned`}
                    variant="outlined"
                  />
                  <Chip icon={<Star />} label={`${marketplaceSummary.affordableCount} affordable`} color="success" variant="outlined" />
                </Stack>
              </Box>

              <Stack spacing={1.25} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AttachMoney fontSize="small" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Token balance
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={800}>
                      {wallet.formattedBalance || wallet.balance || 0}
                    </Typography>
                  </Stack>
                </Paper>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    component={RouterLink}
                    to="/contracts/me"
                    variant="contained"
                    size={isMobile ? 'medium' : 'large'}
                    startIcon={<Assignment />}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800
                    }}
                  >
                    Open Contract Hub
                  </Button>
                  <Button
                    variant="outlined"
                    size={isMobile ? 'medium' : 'large'}
                    startIcon={<Refresh />}
                    onClick={loadData}
                    disabled={loading}
                    sx={{ borderRadius: 999 }}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
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
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search contracts (title or description)…"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3.5}>
                  <FormControl fullWidth>
                    <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="affordable">Affordable (within wallet)</MenuItem>
                      <MenuItem value="profitable">Profitable (reward &gt; cost)</MenuItem>
                      <MenuItem value="availableNow">Available now (within time window)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3.5}>
                  <FormControl fullWidth>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <MenuItem value="price">Sort: Lowest cost</MenuItem>
                      <MenuItem value="reward">Sort: Highest reward</MenuItem>
                      <MenuItem value="profit">Sort: Highest profit</MenuItem>
                      <MenuItem value="deadline">Sort: Soonest deadline</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                    <Chip icon={<Sort />} label={`${filteredTemplates.length} shown`} variant="outlined" />
                    <Button
                      component={RouterLink}
                      to="/contracts/me"
                      variant="text"
                      size="small"
                      startIcon={<Assignment />}
                      sx={{ ml: 'auto' }}
                    >
                      Open Contract Hub
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Contract Cards */}
            <Grid container spacing={3}>
              {filteredTemplates.map((template, index) => (
                <Grid item xs={12} md={6} lg={4} key={template._id}>
                    <ContractCard
                      template={template}
                      wallet={wallet}
                      isOwned={isOwned}
                      onBuyContract={handleBuyContract}
                      onViewDetails={handleViewDetails}
                    />
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
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Contract Leaderboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ranked by overall contract performance (completed, earnings and success rate).
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  component={RouterLink}
                  to="/contracts/me"
                  variant="contained"
                  startIcon={<Assignment />}
                  sx={{ borderRadius: 999, fontWeight: 900 }}
                >
                  Open Contract Hub
                </Button>
                <Button variant="outlined" startIcon={<Refresh />} onClick={loadContractLeaderboard} disabled={leaderboardLoading}>
                  Refresh
                </Button>
              </Stack>
            </Stack>
            
            {leaderboardLoading ? (
              <LinearProgress />
            ) : (
              <>
                {/* Top 3 spotlight */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {contractLeaderboard.slice(0, 3).map((rider) => (
                    <Grid item xs={12} md={4} key={`top-${rider.rank}`}>
                      <Card
                        sx={{
                          height: '100%',
                          border: '1px solid',
                          borderColor: 'divider',
                          background:
                            rider.rank === 1
                              ? 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(118,75,162,0.12) 100%)'
                              : rider.rank === 2
                              ? 'linear-gradient(135deg, rgba(192,192,192,0.14) 0%, rgba(102,126,234,0.10) 100%)'
                              : 'linear-gradient(135deg, rgba(205,127,50,0.14) 0%, rgba(102,126,234,0.10) 100%)'
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>
                                {rider.rank}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <EmojiEvents fontSize="small" />
                                  Top performer
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" noWrap>
                                  {rider.name}
                                </Typography>
                              </Box>
                            </Stack>
                            <Star color="warning" />
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={`${rider.completed} Completed`} color="success" />
                            <Chip size="small" label={`${rider.active} Active`} color="info" />
                            <Chip size="small" label={`${rider.totalContracts || rider.completed + rider.active} Total`} variant="outlined" />
                            <Chip size="small" label={`${Number(rider.totalEarnings || 0).toLocaleString()} Tokens`} color="secondary" variant="outlined" />
                            {rider.completionRate != null && (
                              <Chip
                                size="small"
                                label={`${Number(rider.completionRate).toFixed(1)}% Success`}
                                color={rider.completionRate >= 80 ? 'success' : rider.completionRate >= 60 ? 'warning' : 'error'}
                              />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Full list */}
                <Card>
                  <CardContent>
                    <List>
                      {contractLeaderboard.map((rider, index) => (
                        <React.Fragment key={rider.rank}>
                          <ListItem
                            secondaryAction={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  size="small"
                                  label={`${Number(rider.totalEarnings || 0).toLocaleString()} Tokens`}
                                  color="secondary"
                                  variant="outlined"
                                />
                                <Chip
                                  size="small"
                                  label={`#${rider.rank}`}
                                  color={rider.rank <= 3 ? 'primary' : 'default'}
                                  variant={rider.rank <= 3 ? 'outlined' : 'filled'}
                                />
                              </Stack>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: rider.rank <= 3 ? 'primary.main' : 'grey.700',
                                  fontWeight: 'bold'
                                }}
                              >
                                {rider.rank}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                    {rider.name}
                                  </Typography>
                                  {rider.rank <= 3 && <Star color="warning" fontSize="small" />}
                                </Box>
                              }
                              secondary={
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  <Chip size="small" label={`${rider.completed} Completed`} color="success" />
                                  <Chip size="small" label={`${rider.active} Active`} color="info" />
                                  {rider.completionRate != null && (
                                    <Chip
                                      size="small"
                                      label={`${Number(rider.completionRate).toFixed(1)}% Success`}
                                      color={rider.completionRate >= 80 ? 'success' : rider.completionRate >= 60 ? 'warning' : 'error'}
                                    />
                                  )}
                                </Stack>
                              }
                            />
                          </ListItem>
                          {index < contractLeaderboard.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </>
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
                                  label={`${formatLabel(key)}: ${formatValue(value)}`}
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