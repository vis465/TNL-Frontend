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
import { myContracts } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';
import CurrencyCard from '../components/CurrencyCard';


export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;
  const [activeAttendanceEvents, setActiveAttendanceEvents] = useState([]);
  const [attendanceSubmitLoading, setAttendanceSubmitLoading] = useState(false);
  const [attendanceSubmitMsg, setAttendanceSubmitMsg] = useState('');
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

  // Sidebar content component
  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Dashboard</Typography>
      </Box>
      <List sx={{ flex: 1 }}>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/dashboard" onClick={handleMobileDrawerClose}>
            <ListItemIcon><DashboardOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/challenges" onClick={handleMobileDrawerClose}>
            <ListItemIcon><AssignmentTurnedInOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Challenges" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/leaderboard" onClick={handleMobileDrawerClose}>
            <ListItemIcon><LeaderboardOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Leaderboards" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/contracts" onClick={handleMobileDrawerClose}>
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="Contracts" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Desktop Sidebar */}
      <Drawer 
        variant="permanent" 
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 220,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 220, boxSizing: 'border-box' }
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        onOpen={handleMobileDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Dashboard Menu
          </Typography>
          <IconButton onClick={handleMobileDrawerClose}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <SidebarContent />
      </SwipeableDrawer>

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

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
        {/* Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
        
            <CurrencyCard data={data} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Distance</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {Number(totals?.totalKm || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">kilometers driven</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                    <PlaceOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                    ₹{Number(totals?.totalRevenue || 0).toLocaleString()}
                    </Typography>
                   
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.main' }}>
                    <AttachMoneyOutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Jobs</Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {Number(totals?.totalJobs || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">completed deliveries</Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main' }}>
                    <Inventory2OutlinedIcon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active Contracts */}
        {contracts.active?.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>Active Contracts</Typography>
            <a href="/contracts/me" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary" size="small" sx={{ mb: 2 }}>
                View Progress
              </Button>
            </a>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {contracts.active.map(c => {
                const tpl = c.templateId || {};
                const total = (c.progress || []).length || 1;
                const done = (c.progress || []).filter(p => p.status === 'done').length;
                const pct = Math.round((done / total) * 100);
                return (
                  <Grid item xs={12} md={6} key={c._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700}>{tpl.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{tpl.description}</Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
                          <Chip label={`Deadline: ${new Date(c.deadlineAt).toLocaleDateString()}`} />
                          <Chip label={`Progress: ${done}/${total}`} />
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ height: 8, bgcolor: 'divider', borderRadius: 4 }}>
                            <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
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
                  {(attendance?.eventsAttended || []).slice(0, 6).map((e) => (
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
                              sx={{m:4}}
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
                {rider?.dlcsOwned?.ets2?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2"  gutterBottom>
                      ETS2 DLCs (Beta)
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {rider.dlcsOwned.ets2.map((dlc, index) => (
                        <Chip 
                          key={index}
                          size="small" 
                          label={dlc} 
                           color="info"
                              variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
                {rider?.dlcsOwned?.ats?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color gutterBottom>
                      ATS DLCs
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {rider.dlcsOwned.ats.map((dlc, index) => (
                        <Chip 
                          key={index}
                          size="small" 
                          label={dlc} 
                           color="info"
                              variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
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

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={6}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Revenue & Distance Trend</Typography>
                  <Stack direction="row" spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#3B82F6' }} />
                      <Typography variant="caption">Revenue</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#10B981' }} />
                      <Typography variant="caption">Distance</Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <Box sx={{ width: '100%', height: 300 }}>
                  {!hasData && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No job data available for trend analysis
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Complete some deliveries to see your revenue and distance trends
                      </Typography>
                    </Box>
                  )}
                  {hasData && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={finalRevenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <YAxis stroke="#64748B" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#revenueGradient)" strokeWidth={3} />
                      <Area type="monotone" dataKey="distance" stroke="#10B981" fillOpacity={1} fill="url(#distanceGradient)" strokeWidth={3} />
                    </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Weekly Activity</Typography>
                  <Stack direction="row" spacing={3}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#3B82F6' }} />
                      <Typography variant="caption">Jobs</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#10B981' }} />
                      <Typography variant="caption">Distance (km)</Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <Box sx={{ width: '100%', height: 300 }}>
                  {!hasData && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No job data available for weekly analysis
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Complete some deliveries to see your weekly activity patterns
                      </Typography>
                    </Box>
                  )}
                  {hasData && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" stroke="#64748B" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <YAxis yAxisId="left" stroke="#64748B" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748B" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Bar yAxisId="left" dataKey="jobs" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="right" dataKey="distance" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Job distribution and latest jobs */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Job Distribution</Typography>
                <Box sx={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={jobTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {jobTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {jobTypeData.map((item, index) => (
                    <Stack key={index} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                        <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700}>{item.value}%</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Recent Deliveries</Typography>
                    <LocalShippingOutlinedIcon color="disabled" fontSize="small" />
                  
                </Stack>
                <Stack spacing={1.5}>
              {latestJobs.slice(0, 5).map((job, index) => (
                    <Stack key={job.jobID || index} direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Inventory2OutlinedIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {job.source?.city?.name || 'Unknown'} → {job.destination?.city?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.source?.company?.name || '-'} to {job.destination?.company?.name || '-'}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{job.distanceDriven || 0} km</Typography>
                          <Divider orientation="vertical" flexItem />
                          <Typography variant="caption" color="text.secondary">${job.revenue || job.income || 0}</Typography>
                          <Divider orientation="vertical" flexItem />
                          <Typography variant="caption" color="text.secondary">{new Date(job.deliveredTimestamp || job.createdAt).toLocaleDateString()}</Typography>
                        </Stack>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" color="success.main" fontWeight={700}>${job.revenue || job.income || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Revenue</Typography>
                      </Box>
                    </Stack>
              ))}
              {latestJobs.length === 0 && (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }} spacing={1}>
                      <Inventory2OutlinedIcon color="disabled" fontSize="large" />
                  <Typography variant="body2" color="text.secondary">No recent deliveries</Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
      </Box>
      </Box>
    </Box>
  );
}