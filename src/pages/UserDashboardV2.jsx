import React, { useEffect, useState } from 'react';
import tokenImage from '../img/panam.jpg';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import axiosInstance from '../utils/axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,  
  Pagination,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Container,
  Paper,
  Fade,
  Zoom,
  Slide,
  Badge,
  LinearProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Event from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import Close from '@mui/icons-material/Close';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Assignment from '@mui/icons-material/Assignment';
import Star from '@mui/icons-material/Star';
import Timeline from '@mui/icons-material/Timeline';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import { myContracts } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';
import CurrencyCard from '../components/CurrencyCard';
import WalletTransactions from '../components/WalletTransactions';
import ActiveContracts from '../components/ActiveContracts';
import CompletedContracts from '../components/CompletedContracts';
import AdminSidebar from '../components/AdminSidebar';
import LicenseCard from '../components/LicenseCard';


export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;
  const[jobid,Setjobid]=useState("0")
  const [activeAttendanceEvents, setActiveAttendanceEvents] = useState([]);
  const [attendanceSubmitLoading, setAttendanceSubmitLoading] = useState(false);
  const [attendanceSubmitMsg, setAttendanceSubmitMsg] = useState('');
  const [jobmessage, setjobmessage] = useState('');
  const [contracts, setContracts] = useState({ active: [], history: [] });
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const tokenImgUrl = tokenImage;

  // Real API call
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/me/dashboard');
        setData(data);
        // console.log(data.wallet.balance)
      } catch (e) {
        setError('Failed to load dashboard');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await myContracts();
        setContracts(res);
      } catch(e) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const w = await getMyWallet();
        setWallet({ balance: Number(w.balance || 0), transactions: Array.isArray(w.transactions) ? w.transactions : [] });
      } catch(e) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/attendance-events/active/me');
        const events = Array.isArray(data) ? data : [];
        setActiveAttendanceEvents(events);
      } catch (e) {
        // non-fatal for dashboard
        console.warn('Failed to load attendance events');
      }
    })();
  }, []);

  const handleJobsubmit = async (jobidParam) => {
    try {
      setjobmessage('');
      const id = (jobidParam ?? jobid ?? '').toString().trim();
      if (!id) {
        setjobmessage('Please enter a JobId');
        setTimeout(() => setjobmessage(''), 3000);
        return;
      }

      const payload = {
        jobIDs: [id]
      };

      const resp = await axiosInstance.post('/hook/manual-jobs', payload);
      if (resp.status === 200 || resp.status === 201) {
        setjobmessage('Jobs submitted for validation');
        Setjobid(''); // clear input
      } else {
        setjobmessage(resp.data?.message || 'Failed to submit jobs');
      }
    } catch (e) {
      setjobmessage(e?.response?.data?.message || 'Failed to submit jobs');
    } finally {
      setTimeout(() => setjobmessage(''), 3000);
    }
  };
  const handleMarkAttendance = async (eventId) => {
    try {
      setAttendanceSubmitLoading(true);
      setAttendanceSubmitMsg('');
      await axiosInstance.post(`/attendance-events/${eventId}/mark-attendance`, {});
      setAttendanceSubmitMsg('Attendance submitted for approval');
      // refresh active list
      const { data } = await axiosInstance.get('/attendance-events/active/me');
      const events = Array.isArray(data) ? data : [];
      setActiveAttendanceEvents(events);
    } catch (e) {
      setAttendanceSubmitMsg(e?.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setAttendanceSubmitLoading(false);
      setTimeout(() => setAttendanceSubmitMsg(''), 3000);
    }
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  // Derived chart data from latestJobs
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const monthsWindow = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthNames[d.getMonth()] };
  });

  const monthlyMap = new Map(monthsWindow.map(m => [m.key, { revenue: 0, distance: 0, label: m.label }]));
  const jobsForCharts = (data?.latestJobs || []);
  jobsForCharts.forEach(j => {
    const ts = j.deliveredTimestamp || j.createdAt;
    if (!ts) return;
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap.has(key)) {
      const cur = monthlyMap.get(key);
      cur.revenue += Number(j.revenue || j.income || 0);
      cur.distance += Number(j.distanceDriven || 0);
      monthlyMap.set(key, cur);
    }
  });
  const revenueData = Array.from(monthlyMap.values()).map(m => ({ month: m.label, revenue: m.revenue, distance: m.distance }));
  
  // Debug logging for charts
  //console.log('Chart Data Debug:');
  //console.log('Latest Jobs:', jobsForCharts.length);
  //console.log('Revenue Data:', revenueData);
  

  const weekdayOrder = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weeklyAgg = new Map(weekdayOrder.map(d => [d, { jobs: 0, distance: 0 }]));
  jobsForCharts.forEach(j => {
    const ts = j.deliveredTimestamp || j.createdAt;
    if (!ts) return;
    const d = new Date(ts);
    const label = weekdayOrder[d.getDay()];
    const cur = weeklyAgg.get(label) || { jobs: 0, distance: 0 };
    cur.jobs += 1;
    cur.distance += Number(j.distanceDriven || 0);
    weeklyAgg.set(label, cur);
  });
  const weeklyData = weekdayOrder.map(day => ({ 
    day, 
    jobs: (weeklyAgg.get(day) || {}).jobs || 0, 
    distance: (weeklyAgg.get(day) || {}).distance || 0 
  }));
  //console.log('Weekly Data:', weeklyData);
  // Add fallback data if no jobs exist for better chart visualization
  const hasData = jobsForCharts.length > 0;
  const fallbackRevenueData = [
    { month: 'Jan', revenue: 100, distance: 1000 },
    { month: 'Feb', revenue: 0, distance: 0 },
    { month: 'Mar', revenue: 0, distance: 0 },
    { month: 'Apr', revenue: 0, distance: 0 },
    { month: 'May', revenue: 0, distance: 0 },
    { month: 'Jun',  revenue: 100, distance: 1000 }
  ];
  
  const finalRevenueData = hasData ? revenueData : fallbackRevenueData;

  // Job distribution by distance buckets
  let local = 0, regional = 0, longhaul = 0;
  jobsForCharts.forEach(j => {
    const dist = Number(j.distanceDriven || 0);
    if (dist >= 1000) longhaul += 1;
    else if (dist >= 300) regional += 1;
    else local += 1;
  });
  const totalJobsForDist = Math.max(local + regional + longhaul, 1);
  const jobTypeData = [
    { name: 'Long Haul', value: Math.round((longhaul / totalJobsForDist) * 100), color: '#3B82F6' },
    { name: 'Regional', value: Math.round((regional / totalJobsForDist) * 100), color: '#10B981' },
    { name: 'Local', value: Math.round((local / totalJobsForDist) * 100), color: '#F59E0B' }
  ];

  if (error) return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
      <Typography color="error" variant="h6">{error}</Typography>
    </Box>
  );

  if (!data) return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
      <Typography variant="h6" color="text.secondary">Loading your dashboard...</Typography>
    </Box>
  );

  const { user, rider, latestJobs = [], progress = [], completions = [], totals = { totalKm: 0, totalRevenue: 0, totalJobs: 0 }, attendance = { totalEventsAttended: 0, eventsAttended: [] }, achievements = [] } = data;


  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar 
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={handleMobileDrawerClose}
        user={user}
      />

      <Box sx={{ flex: 1 }}>
      {/* Mobile Header */}
      {isMobile && (
        <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Header */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={3}>
            <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ 
                  width: { xs: 60, md: 100 }, 
                  height: { xs: 60, md: 100 }, 
                  bgcolor: 'primary.main', 
                  fontSize: { xs: 20, md: 28 }, 
                  fontWeight: 700 
                }} src={rider?.avatar}>
                  
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                    Welcome back, {rider?.name || user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Role • {user?.role || 'Professional'}
                  </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="warning.main">{'★★★★★'.slice(0, Math.max(1, Math.floor(rider?.rating || 4.8)))}</Typography>
                      <Typography variant="caption" color="text.secondary">{rider?.rating || 4.8}</Typography>
                    </Stack>
                    <Chip size="small" color="primary" variant="outlined" label={user?.role} />
                    
                    {rider?.employeeID && (
                      <Chip size="small" color="info" variant="outlined" label={rider.employeeID} />
                    )}
                   
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid item>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">Today's Date</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Enhanced Stats Cards with Animations */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
              <Zoom in timeout={1000}>
                
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <AttachMoneyOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {Number(wallet?.balance || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total tokens
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in timeout={1000}>
                
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <AttachMoneyOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {Number(totals?.totalJobs || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Jobs
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in timeout={1200}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <AttachMoneyOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          ₹{Number(totals?.totalRevenue || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Revenue
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in timeout={1400}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <PlaceOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {Number(totals?.totalKm || 0).toLocaleString()} km
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Distance Driven
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in timeout={1600}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #4facfe 0%,rgb(219, 207, 30) 100%)',
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                        <EmojiEventsOutlinedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700} >
                          {attendance.totalEventsAttended || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Events Attended
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        </Fade>

        {/* Wallet Section */}
        <Fade in timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <WalletTransactions wallet={wallet} onRefresh={() => {
                getMyWallet().then(w => setWallet({ balance: Number(w.balance || 0), transactions: Array.isArray(w.transactions) ? w.transactions : [] }));
              }} />
            </Grid>
          </Grid>
        </Fade>

        {/* Contracts Section - Active and Completed Side by Side */}
        <Fade in timeout={1200}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <ActiveContracts onRefresh={() => {
                myContracts().then(res => setContracts(res));
              }} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <CompletedContracts onRefresh={() => {
                myContracts().then(res => setContracts(res));
              }} />
            </Grid>
          </Grid>
        </Fade>

        {/* Additional Dashboard Content */}
          <Fade in timeout={1200}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button 
                  variant='outlined'
                  startIcon={<Assignment />}
                  component={RouterLink}
                  to="/contracts/me"
                >
                  My Contracts
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AccountBalanceWallet />}
                  component={RouterLink}
                  to="/wallet"
                >
                  Wallet Details
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Timeline />}
                  component={RouterLink}
                  to="/leaderboard"
                >
                  Leaderboard
                </Button>
              </Stack>
            </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>

           <Fade in timeout={1200}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
                 <CardContent>
                   {jobmessage && (
                    <Chip size="small" color="info" variant="outlined" label={jobmessage} />
                  )}
            <Typography>Job not validated? Enter your JobId from Truckershub to validate</Typography>
             <TextField
              fullWidth
              label="JobId"
              name="JobId"
              value={jobid}
              onChange={(e) => Setjobid(e.target.value)}
              margin="normal"
              required
            />
            <Button
                variant="outlined"
                size="small"
                onClick={() => handleJobsubmit(jobid)}
              >
                Submit
              </Button>
                </CardContent>
                </Card>
                 </Grid>
                 
            </Grid>
          </Fade>

          {/* Attendance */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">Event Attendance</Typography>
                  <Chip size="small" color="primary" variant="outlined" label="TruckersMP" />
                </Stack>
                <Typography variant="h3" fontWeight={700}>{attendance?.totalEventsAttended || 0}</Typography>
                <Typography variant="body2" color="text.secondary">total events attended</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Recently Attended</Typography>
                <Stack spacing={1.5}>
                  {(attendance?.eventsAttended || []).slice(0, 1).map((e) => (
                    <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>{e.title || 'Event'}</Typography>
                        <Typography variant="caption" color="text.secondary">{e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '—'}{e.approvedAt ? ` • approved ${new Date(e.approvedAt).toLocaleDateString()}` : ''}</Typography>
                      </Box>
                      <Chip size="small" color="success" variant="outlined" label="Approved" />
                    </Stack>
                  ))}
                  {((attendance?.eventsAttended || []).length || 0) === 0 && (
                    <Typography variant="body2" color="text.secondary">No events recorded yet.</Typography>
                  )}
                </Stack>
                {((attendance?.eventsAttended || []).length || 0) > 6 && (
                  <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={() => { setAttendanceOpen(true); setAttendancePage(1); }}>
                      View all attended events
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Active Attendance</Typography>
                  {attendanceSubmitMsg && (
                    <Chip size="small" color="info" variant="outlined" label={attendanceSubmitMsg} />
                  )}
                </Stack>
                <Stack spacing={1.5}>
                  {activeAttendanceEvents.map((ev) => (
                    <Stack key={ev._id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>{ev.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ev.eventDate).toLocaleString()} {ev.endDate ? `- ${new Date(ev.endDate).toLocaleString()}` : ''}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={ev.isAttendanceOpen ? 'Open' : 'Closed'} color={ev.isAttendanceOpen ? 'success' : 'default'} />
                        <Button
                          variant="contained"
                          size="small"
                          disabled={attendanceSubmitLoading || !ev.isAttendanceOpen}
                          onClick={() => handleMarkAttendance(ev._id)}
                        >
                          I was there
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                  {activeAttendanceEvents.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No active attendance right now.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Achievements */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Achievements</Typography>
                {achievements.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No achievements yet.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {achievements.slice(0, 8).map((a, idx) => (
                      <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                          <Avatar src={a.logoUrl} alt={a.name} variant="rounded" sx={{ width: 40, height: 40 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body1" fontWeight={600} noWrap>{a.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{a.description || ''}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">{a.issuedOn ? new Date(a.issuedOn).toLocaleDateString() : ''}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Rider Profile Metadata */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Profile Information</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Steam Information
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            size="small" 
                            label={rider?.steamID ? `Steam ID: ${rider.steamID}` : 'No Steam ID'} 
                            color={rider?.steamID ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2"  gutterBottom>
                          TruckersMP Information
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip 
                            size="small" 
                            label={rider?.truckersmpId ? `TruckersMP ID: ${rider.truckersmpId}` : 'No TruckersMP ID'} 
                            color={rider?.truckersmpId ? 'secondary' : 'default'}
                            variant="outlined"
                          />
                          <Chip 
                            size="small" 
                            label={rider?.truckershubId ? `TruckersHub ID: ${rider.truckershubId}` : 'No TruckersHub ID'} 
                            color={rider?.truckershubId ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2"  gutterBottom>
                          DLCs Owned
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {rider?.dlcsOwned?.ets2?.length > 0 ? (
                            <Chip 
                              size="small" 
                              label={`ETS2 DLCs: ${rider.dlcsOwned.ets2.length}`} 
                              color="info"
                              
                              variant="outlined"
                              sx={{m:8}}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="No ETS2 DLCs" 
                              color="default"
                              variant="outlined"
                            />
                          )}
                          {rider?.dlcsOwned?.ats?.length > 0 ? (
                            <Chip 
                              size="small" 
                              label={`ATS DLCs: ${rider.dlcsOwned.ats.length}`} 
                              color="info"
                              variant="outlined"
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="No ATS DLCs" 
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Games Owned
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {rider?.gamesOwned?.length > 0 ? (
                            <Chip 
                              size="small" 
                              label={`Games: ${rider.gamesOwned.length}`} 
                              color="warning"
                              variant="outlined"
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="No games listed" 
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
                  {/* <Grid container spacing={2}>

               {rider?.dlcsOwned?.ets2?.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6" gutterBottom>
      ETS2 DLCs
    </Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {rider.dlcsOwned.ets2.map((appId, index) => (
        <Chip
          key={appId || index}
          size="small"
          label={STEAM_DLC_MAPPING[appId] || appId}
          color="primary"
          variant="outlined"
        />
      ))}
    </Stack>
  </Box>
)}

{rider?.dlcsOwned?.ats?.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      ATS DLCs
    </Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {rider.dlcsOwned.ats.map((appId, index) => (
        <Chip
          key={appId || index}
          size="small"
          label={STEAM_DLC_MAPPING[appId] || appId}
          color="secondary"
          variant="outlined"
        />
      ))}
    </Stack>
  </Box>
)}

                </Grid> */}
                {rider?.gamesOwned?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Games Owned
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {rider.gamesOwned.map((game, index) => (
                        <Chip 
                          key={index}
                          size="small" 
                          label={game} 
                          color="warning"
                          variant="filled"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={attendanceOpen} onClose={() => setAttendanceOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">All Attended Events</Typography>
              <IconButton onClick={() => setAttendanceOpen(false)} size="small"><CloseIcon /></IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {(() => {
              const all = attendance?.eventsAttended || [];
              const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
              const clampedPage = Math.min(attendancePage, totalPages);
              const start = (clampedPage - 1) * pageSize;
              const pageItems = all.slice(start, start + pageSize);
              return (
                <Stack spacing={1.5}>
                  {pageItems.map((e) => (
                    <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>{e.title || 'Event'}</Typography>
                        <Typography variant="caption" color="text.secondary">{e.eventDate ? new Date(e.eventDate).toLocaleString() : '—'}</Typography>
                      </Box>
                      <Chip size="small" color="success" variant="outlined" label={e.status || 'completed'} />
                    </Stack>
                  ))}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Page {clampedPage} of {totalPages}</Typography>
                    <Pagination
                      count={totalPages}
                      page={clampedPage}
                      onChange={(_, page) => setAttendancePage(page)}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </Stack>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttendanceOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Challenges */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Active Challenges</Typography>
                  <TrackChangesOutlinedIcon color="disabled" fontSize="small" />
                </Stack>
                <Stack spacing={1.5}>
                  {(() => {
                    // Group progress by challenge to show each challenge only once
                    const challengeMap = new Map();
                    progress.forEach((p) => {
                      const challengeId = p.challengeId;
                      if (!challengeMap.has(challengeId)) {
                        challengeMap.set(challengeId, {
                          challengeId,
                          challengeName: p.challengeName || challengeId,
                          totalDistance: 0,
                          totalJobs: 0,
                          isCompleted: false,
                          lastUpdated: p.timestamp
                        });
                      }
                      const challenge = challengeMap.get(challengeId);
                      challenge.totalDistance += p.distanceDriven || 0;
                      challenge.totalJobs += 1;
                      if (p.challengeCompleted) {
                        challenge.isCompleted = true;
                      }
                      if (new Date(p.timestamp) > new Date(challenge.lastUpdated)) {
                        challenge.lastUpdated = p.timestamp;
                      }
                    });
                    
                    return Array.from(challengeMap.values()).map((challenge) => (
                      <Box key={challenge.challengeId} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>{challenge.challengeName}</Typography>
                          {challenge.isCompleted && (
                          <Chip size="small" color="success" variant="outlined" label="Completed" />
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Total Distance: {challenge.totalDistance} km</Typography>
                          <Typography variant="body2" color="text.secondary">Jobs: {challenge.totalJobs}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Last updated: {new Date(challenge.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Box>
                    ));
                  })()}
                  {progress.length === 0 && (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }} spacing={1}>
                      <TrackChangesOutlinedIcon color="disabled" fontSize="large" />
                      <Typography variant="body2" color="text.secondary">No active challenges</Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
         
        </Grid>

        {/* License Section */}
        <Fade in timeout={1200}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <LicenseCard userData={user} riderData={rider} />
            </Grid>
          </Grid>
        </Fade>
      </Container>
      </Box>
    </Box>
  );
}