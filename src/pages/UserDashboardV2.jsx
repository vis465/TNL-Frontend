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
import { myContracts } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';
import CurrencyCard from '../components/CurrencyCard';
import WalletTransactions from '../components/WalletTransactions';
import ActiveContracts from '../components/ActiveContracts';
import CompletedContracts from '../components/CompletedContracts';
import AdminSidebar from '../components/AdminSidebar';


// Steam App ID to DLC name mapping
const STEAM_DLC_MAPPING = {
  // ETS2 DLCs
  
      "227310": " Going East!",
      "304212": " Scandinavia",
      "388478": " Rocket League Promo",
      "531130": " Vive la France !",
      "558244": " Italia",
      "925580": " Beyond the Baltic Sea",
      "1056760": " Road to the Black Sea",
      "1209460": " Iberia",
      "1650650": " DAF XG/XG+",
      "2004210": " West Balkans",
      "2371170": " MAN TGX",
      "2604420": " Greece",
      "2611740": " DAF XD",
      "2932420": " Renault Trucks E-Tech T",
      "3035040": " Scania S BEV",
      "3323350": " Volvo FH Series 5",
      "3323360": " Volvo FH Series 6",
      "3354860": " Iveco S-Way",
      "3796990": " Iceland",
      "3335300": " Greek Mythology Pack",
      "3034950": " Kässbohrer Trailer Pack",
      "3034940": " Kögel Trailer Pack",
      "2833100": " Schmitz Cargobull Trailer Pack",
      "2780810": " Nordic Horizons",
      "2780800": " JCB Equipment Pack",
      "2579670": " Modern Lines Paint Jobs Pack",
      "2569750": " Tirsan Trailer Pack",
      "2455690": " Wielton Trailer Pack",
      "2193220": " Feldbinder Trailer Pack",
      "1967650": " Street Art Paint Jobs Pack",
      "1967640": " Renault Trucks T Tuning Pack",
      "1918370": " Ukrainian Paint Jobs Pack",
      "1704460": " Volvo Construction Equipment",
      "1536500": " Heart of Russia",
      "1456860": " Farm Machinery",
      "1415700": " Super Stripes Paint Jobs Pack",
      "1299530": " FH Tuning Pack",
      "1209461": " HS-Schoch Tuning Pack",
      "1159030": " Bulgarian Paint Jobs Pack",
      "1117140": " Goodyear Tyres Pack",
      "1068290": " Pink Ribbon Charity Pack",
      "1056761": " Actros Tuning Pack",
      "980592": " Lithuanian Paint Jobs Pack",
      "980591": " Latvian Paint Jobs Pack",
      "980590": " Estonian Paint Jobs Pack",
      "933610": " Krone Trailer Pack",
      "925650": " Space Paint Jobs Pack",
      "909640": " Dutch Paint Jobs Pack",
      "876980": " Portuguese Paint Jobs Pack",
      "558245": " Special Transport",
      "558243": " Valentine's Paint Jobs Pack",
      "558242": " Australian Paint Jobs Pack",
      "558241": " Romanian Paint Jobs Pack",
      "558240": " Dragon Truck Design Pack",
      "540721": " Belgian Paint Jobs Pack",
      "540720": " Finnish Paint Jobs Pack",
      "531131": " Heavy Cargo Pack",
      "526950": " Lunar New Year Pack",
      "461249": " XF Tuning Pack",
      "461248": " Pirate Paint Jobs Pack",
      "461247": " Chinese Paint Jobs Pack",
      "461246": " Swiss Paint Jobs Pack",
      "461245": " South Korean Paint Jobs Pack",
      "461244": " Mighty Griffin Tuning Pack",
      "461243": " Austrian Paint Jobs Pack",
      "461242": " Window Flags",
      "461241": " Spanish Paint Jobs Pack",
      "461240": " Slovak Paint Jobs Pack",
      "388479": " Hungarian Paint Jobs Pack",
      "388477": " Schwarzmüller Trailer Pack",
      "388476": " Italian Paint Jobs Pack",
      "388475": " Wheel Tuning Pack",
      "388474": " Turkish Paint Jobs Pack",
      "388473": " PC Gamer DLC",
      "388472": " Japanese Paint Jobs Pack",
      "388471": " Michelin Fan Pack",
      "388470": " Cabin Accessories",
      "347213": " Russian Paint Jobs Pack",
      "347212": " Viking Legends",
      "347211": " Swedish Paint Jobs Pack",
      "347210": " Danish Paint Jobs Pack",
      "347190": " Norwegian Paint Jobs Pack",
      "318521": " Raven Truck Design Pack",
      "318520": " Christmas Paint Jobs Pack",
      "318511": " Czech Paint Jobs Pack",
      "318510": " French Paint Jobs Pack",
      "318500": " German Paint Jobs Pack",
      "304214": " High Power Cargo Pack",
      "304213": " Canadian Paint Jobs Pack",
      "304211": " USA Paint Jobs Pack",
      "304210": " Fantasy Paint Jobs Pack",
      "304140": " Brazilian Paint Jobs Pack",
      "304020": " Polish Paint Jobs Pack",
      "301180": " Flip Paint Designs",
      "297793": " Scottish Paint Jobs Pack",
      "297792": " Irish Paint Jobs Pack",
      "297791": " UK Paint Jobs Pack",
      "297790": " Metallic Paint Jobs Pack",
      "292320": " Force of Nature Paint Jobs Pack",
      "266931": " Prehistoric Paint Jobs Pack",
      "266930": " Ice Cold Paint Jobs Pack",
      "258460": " Halloween Paint Jobs Pack",
      "684630": "New Mexico",
      "800370": "Oregon",
      "1015160": "Washington",
      "1076080": "Forest Machinery",
      "1104880": "Utah",
      "1149810": "International LoneStar",
      "1162160": "Pink Ribbon Charity Pack",
      "1209470": "Idaho",
      "1209471": "Colorado",
      "1236650": "Mack Anthem®",
      "1415690": "Freightliner Cascadia® (3r/4th Generation)",
      "1415691": "Western Star® 49X",
      "1415692": "Wyoming",
      "1465750": "Texas",
      "1477840": "Cabin Accessories",
      "1621740": "Goodyear Tires Pack",
      "1662380": "Volvo Construction Equipment",
      "1708620": "International LT®",
      "1784890": "Retrowave Paint Jobs Pack",
      "1811080": "Montana",
      "1915840": "International 9900i",
      "1967690": "Lode King & Prestige Trailers Pack",
      "2093200": "Western Star® 57X",
      "2187930": "Wild West Paint Jobs Pack",
      "2209650": "Oklahoma",
      "2257950": "Western Star® 5700XE",
      "2298430": "Kansas",
      "2386480": "Volvo VNL",
      "2386530": "W900 Tuning Pack",
      "2543810": "Nebraska",
      "2585150": "Arkansas",
      "2638630": "Farm Machinery",
      "2675870": "Michelin Fan Pack",
      "2720080": "Kenworth T680 2022",
      "2730870": "Missouri",
      "2910160": "Sports Paint Jobs Pack",
      "2926440": "JCB Equipment Pack",
      "3012580": "Louisiana",
      "3025440": "Iowa",
      "3146090": "Mack Pinnacle",
      "3272290": "Freightliner Cascadia® (The Fifth Generation)",
      "3486960": "Illinois",
      "3749870": "South Dakota",
      "3793190": "RAM & Dodge Car Pack",
      "3793200": "FORD Car Pack",
      "3872930": "KRONE Agriculture Equipment",
      "432710": "Steampunk Paint Jobs Pack",
      "450550": "Wheel Tuning Pack",
      "463740": "Arizona",
      "520550": "Steering Creations Pack",
      "541260": "Peterbilt 389",
      "546260": "Halloween Paint Jobs Pack",
      "561620": "Dragon Truck Design Pack",
      "566890": "Christmas Paint Jobs Pack",
      "588600": "Valentine's Paint Jobs Pack",
      "620610": "Heavy Cargo Pack",
      "951650": "Classic Stripes Paint Jobs Pack",
      "962750": "Special Transport",
      "1116310": "Space Paint Jobs Pack",
      "421070": "Kenworth T680",
      "421080": "Peterbilt 579",
      "421081": "Volvo VNL 2014",
      "421090": "Nevada",
      "422310": "Kenworth W900"
};

// DLC categorization for display
const DLC_CATEGORIES = {
  ets2: {
    Maps: [
      "Going East!",
      "Scandinavia",
      "Vive la France !",
      "Italia",
      "Beyond the Baltic Sea",
      "Road to the Black Sea",
      "Iberia",
      "Heart of Russia",
      "West Balkans",
      "Greece",
      "Iceland"
    ],
    PaintJobs: [
      "Modern Lines Paint Jobs Pack",
      "Street Art Paint Jobs Pack",
      "Ukrainian Paint Jobs Pack",
      "Super Stripes Paint Jobs Pack",
      "Valentine's Paint Jobs Pack",
      "Lunar New Year Pack",
      "Christmas Paint Jobs Pack",
      "Halloween Paint Jobs Pack",
      "Ice Cold Paint Jobs Pack",
      "Space Paint Jobs Pack",
      "Pirate Paint Jobs Pack",
      "Prehistoric Paint Jobs Pack",
      "Viking Legends",
      "Fantasy Paint Jobs Pack",
      "Force of Nature Paint Jobs Pack",
      "Flip Paint Designs",
      "Metallic Paint Jobs Pack",
      "German Paint Jobs Pack",
      "Czech Paint Jobs Pack",
      "Slovak Paint Jobs Pack",
      "Polish Paint Jobs Pack",
      "Swiss Paint Jobs Pack",
      "Austrian Paint Jobs Pack",
      "Hungarian Paint Jobs Pack",
      "Norwegian Paint Jobs Pack",
      "Swedish Paint Jobs Pack",
      "Finnish Paint Jobs Pack",
      "Danish Paint Jobs Pack",
      "Estonian Paint Jobs Pack",
      "Latvian Paint Jobs Pack",
      "Lithuanian Paint Jobs Pack",
      "Dutch Paint Jobs Pack",
      "Spanish Paint Jobs Pack",
      "Portuguese Paint Jobs Pack",
      "French Paint Jobs Pack",
      "Italian Paint Jobs Pack",
      "Romanian Paint Jobs Pack",
      "Bulgarian Paint Jobs Pack",
      "UK Paint Jobs Pack",
      "Irish Paint Jobs Pack",
      "Scottish Paint Jobs Pack",
      "Belgian Paint Jobs Pack",
      "Turkish Paint Jobs Pack",
      "Canadian Paint Jobs Pack",
      "USA Paint Jobs Pack",
      "Brazilian Paint Jobs Pack",
      "Japanese Paint Jobs Pack",
      "South Korean Paint Jobs Pack",
      "Chinese Paint Jobs Pack",
      "Australian Paint Jobs Pack",
      "Russian Paint Jobs Pack"
    ],
    Tuning: [
      "Mighty Griffin Tuning Pack",
      "FH Tuning Pack",
      "XF Tuning Pack",
      "HS-Schoch Tuning Pack",
      "Actros Tuning Pack",
      "Renault Trucks T Tuning Pack",
      "Wheel Tuning Pack"
    ],
    Trucks: [
      "DAF XG/XG+",
      "DAF XD",
      "MAN TGX",
      "Renault Trucks E-Tech T",
      "Scania S BEV",
      "Volvo FH Series 5",
      "Volvo FH Series 6",
      "Iveco S-Way"
    ],
    Trailers: [
      "Kässbohrer Trailer Pack",
      "Kögel Trailer Pack",
      "Schmitz Cargobull Trailer Pack",
      "Tirsan Trailer Pack",
      "Wielton Trailer Pack",
      "Feldbinder Trailer Pack",
      "Krone Trailer Pack",
      "Schwarzmüller Trailer Pack"
    ],
    Cargo: [
      "Special Transport",
      "Heavy Cargo Pack",
      "High Power Cargo Pack",
      "Volvo Construction Equipment",
      "Farm Machinery"
    ],
    Other: [
      "Cabin Accessories",
      "Window Flags",
      "Pink Ribbon Charity Pack",
      "Michelin Fan Pack",
      "Goodyear Tyres Pack",
      "Dragon Truck Design Pack",
      "Raven Truck Design Pack",
      "Greek Mythology Pack",
      "Nordic Horizons",
      "PC Gamer DLC",
      "Rocket League Promo"
    ]
  },

  ats: {
    Maps: [
      "Arizona",
      "Nevada",
      "New Mexico",
      "Oregon",
      "Washington",
      "Utah",
      "Idaho",
      "Colorado",
      "Wyoming",
      "Texas",
      "Montana",
      "Oklahoma",
      "Kansas",
      "Nebraska",
      "Arkansas",
      "Missouri",
      "Louisiana",
      "Iowa",
      "Illinois",
      "South Dakota"
    ],
    PaintJobs: [
      "Retrowave Paint Jobs Pack",
      "Wild West Paint Jobs Pack",
      "Sports Paint Jobs Pack",
      "Steampunk Paint Jobs Pack",
      "Halloween Paint Jobs Pack",
      "Dragon Truck Design Pack",
      "Christmas Paint Jobs Pack",
      "Valentine's Paint Jobs Pack",
      "Classic Stripes Paint Jobs Pack",
      "Space Paint Jobs Pack"
    ],
    Tuning: [
      "Wheel Tuning Pack",
      "Steering Creations Pack",
      "W900 Tuning Pack"
    ],
    Trucks: [
      "Kenworth T680",
      "Peterbilt 579",
      "Volvo VNL 2014",
      "Kenworth W900",
      "Peterbilt 389",
      "International LoneStar",
      "Mack Anthem®",
      "Freightliner Cascadia® (3r/4th Generation)",
      "Western Star® 49X",
      "International LT®",
      "International 9900i",
      "Western Star® 57X",
      "Western Star® 5700XE",
      "Volvo VNL",
      "Kenworth T680 2022",
      "Mack Pinnacle",
      "Freightliner Cascadia® (The Fifth Generation)"
    ],
    Trailers: [
      "Lode King & Prestige Trailers Pack",
      "KRONE Agriculture Equipment"
    ],
    Cargo: [
      "Heavy Cargo Pack",
      "Special Transport",
      "Forest Machinery",
      "Volvo Construction Equipment",
      "Farm Machinery",
      "JCB Equipment Pack"
    ],
    Other: [
      "Cabin Accessories",
      "Goodyear Tires Pack",
      "Pink Ribbon Charity Pack",
      "Michelin Fan Pack",
      "RAM & Dodge Car Pack",
      "FORD Car Pack"
    ]
  }
};



// Helper function to get DLC name by ID


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
      </Container>
      </Box>
    </Box>
  );
}