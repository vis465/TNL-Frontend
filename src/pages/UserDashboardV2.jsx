import React, { useEffect, useState } from 'react';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/400.css';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import axiosInstance from '../utils/axios';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Avatar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Pagination, IconButton, useMediaQuery, useTheme, AppBar, Toolbar,
  Container, Fade, LinearProgress, TextField, alpha, Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Assignment from '@mui/icons-material/Assignment';
import Timeline from '@mui/icons-material/Timeline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import { myContracts } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';
import WalletTransactions from '../components/WalletTransactions';
import ActiveContracts from '../components/ActiveContracts';
import CompletedContracts from '../components/CompletedContracts';
import LicenseCard from '../components/LicenseCard';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { BentoGrid, BentoItem } from '../components/magicui/BentoGrid';
import { motion } from 'framer-motion';

const font = "'Montserrat', sans-serif";

const T = {
  bg: '#09090B',
  surface: '#111113',
  surfaceAlt: '#0F0F11',
  surfaceHover: '#1A1A1D',
  surfaceElevated: '#161618',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.1)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textFaint: '#3F3F46',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.06)',
  accentMid: 'rgba(228,255,26,0.12)',
  success: '#34D399',
  successDim: 'rgba(52,211,153,0.08)',
  info: '#60A5FA',
  infoDim: 'rgba(96,165,250,0.08)',
  warning: '#FBBF24',
  warningDim: 'rgba(251,191,36,0.08)',
  danger: '#FB7185',
  dangerDim: 'rgba(251,113,133,0.08)',
  radius: '10px',
  radiusSm: '6px',
  radiusXs: '4px',
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  boxShadow: 'none',
  transition: 'border-color 0.2s ease',
  '&:hover': { borderColor: T.borderHover },
};

const sxLabel = {
  fontFamily: font,
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: T.textMuted,
};

const sxValue = {
  fontFamily: font,
  fontSize: '1.85rem',
  fontWeight: 700,
  color: T.text,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
};

function StatCard({ icon, label, value, accent, tint }) {
  const bg = tint || (accent ? T.accentDim : 'rgba(255,255,255,0.02)');
  const iconColor = accent ? T.accent : T.textSecondary;
  return (
    <Card sx={{ ...sxCard, height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: accent
          ? `linear-gradient(90deg, ${T.accent}, transparent)`
          : 'transparent',
      }} />
      <CardContent sx={{ p: '20px !important' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={sxLabel}>{label}</Typography>
            <Box sx={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: bg, borderRadius: T.radiusSm,
              color: iconColor,
            }}>
              {icon}
            </Box>
          </Stack>
          <Typography sx={sxValue}>{value}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children, action }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Typography sx={{
        fontFamily: font,
        fontSize: '0.85rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: T.textMuted,
      }}>
        {children}
      </Typography>
      {action}
    </Stack>
  );
}

function InfoCell({ label, value, color }) {
  return (
    <Box sx={{
      p: '12px 14px',
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusSm,
      bgcolor: T.surfaceAlt,
      transition: 'border-color 0.2s ease',
      '&:hover': { borderColor: T.borderHover },
    }}>
      <Typography sx={{ ...sxLabel, fontSize: '0.75rem', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{
        fontFamily: font, fontSize: '1.2rem', fontWeight: 700,
        color: color || T.text, lineHeight: 1.2,
      }}>
        {value}
      </Typography>
    </Box>
  );
}

function TagChip({ label, color = T.textMuted, filled }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: '10px', py: '4px',
      border: `1px solid ${filled ? 'transparent' : T.border}`,
      borderRadius: T.radiusXs,
      bgcolor: filled ? alpha(color, 0.1) : 'transparent',
    }}>
      <Typography sx={{
        fontFamily: font, fontSize: '0.85rem', fontWeight: 500,
        color, letterSpacing: '0.01em',
      }}>
        {label}
      </Typography>
    </Box>
  );
}

function StatusBadge({ label, color = T.success }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: '10px', py: '3px',
      border: `1px solid ${alpha(color, 0.3)}`,
      borderRadius: T.radiusXs,
      bgcolor: alpha(color, 0.06),
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{
        fontFamily: font, fontSize: '0.78rem', fontWeight: 700,
        color, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </Typography>
    </Box>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: T.surfaceElevated, border: `1px solid ${T.borderStrong}`,
      borderRadius: T.radiusSm, p: '12px 16px', backdropFilter: 'blur(12px)',
    }}>
      <Typography sx={{ ...sxLabel, mb: 1, fontSize: '0.75rem' }}>{label}</Typography>
      {payload.map((p, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: p.color }} />
          <Typography sx={{ fontFamily: font, fontSize: '0.85rem', color: T.textMuted }}>
            {p.name}:
          </Typography>
          <Typography sx={{ fontFamily: font, fontSize: '0.85rem', color: T.text, fontWeight: 600 }}>
            {Number(p.value).toLocaleString()}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
};

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;
  const [jobid, Setjobid] = useState('');
  const [activeAttendanceEvents, setActiveAttendanceEvents] = useState([]);
  const [attendanceSubmitLoading, setAttendanceSubmitLoading] = useState(false);
  const [attendanceSubmitMsg, setAttendanceSubmitMsg] = useState('');
  const [jobmessage, setjobmessage] = useState('');
  const [contracts, setContracts] = useState({ active: [], history: [] });
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [externalUpcoming, setExternalUpcoming] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [pendingDivisionInvites, setPendingDivisionInvites] = useState(0);
  const [divisionSummary, setDivisionSummary] = useState(null);
  const [currentDivision, setCurrentDivision] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    (async () => {
      try { const { data } = await axiosInstance.get('/me/dashboard'); setData(data); }
      catch { setError('Failed to load dashboard'); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try { const res = await myContracts(); setContracts(res); }
      catch (e) { console.log(e); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const w = await getMyWallet();
        setWallet({ balance: Number(w.balance || 0), transactions: Array.isArray(w.transactions) ? w.transactions : [] });
      } catch (e) { console.log(e); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/attendance-events/active/me');
        setActiveAttendanceEvents(Array.isArray(data) ? data : []);
      } catch { /* silent */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/me/division/invites');
        setPendingDivisionInvites((data?.invites || []).length);
      } catch {
        setPendingDivisionInvites(0);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/me/division/summary');
        setDivisionSummary(data?.division ? data : null);
      } catch {
        setDivisionSummary(null);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/me/division');
        setCurrentDivision(data?.division || null);
      } catch {
        setCurrentDivision(null);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/calendar/today-events');
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => new Date(a.meetupTime || 0).getTime() - new Date(b.meetupTime || 0).getTime());
        setTodayEvents(list);
      } catch {
        setTodayEvents([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/calendar/feed');
        const list = Array.isArray(data) ? data : [];
        const now = Date.now();
        const upcoming = list
          .map((ev) => ({
            id: ev._id,
            title: ev.eventTitle || ev.title,
            start: new Date(ev.Meetuptime || ev.start).getTime(),
            link: ev.eventLink,
          }))
          .filter((ev) => ev.start >= now)
          .sort((a, b) => a.start - b.start)
          .slice(0, 5);
        setExternalUpcoming(upcoming);
      } catch { setExternalUpcoming([]); }
    })();
  }, []);

  const handleJobsubmit = async (jobidParam) => {
    try {
      setjobmessage('');
      const id = (jobidParam ?? jobid ?? '').toString().trim();
      if (!id) { setjobmessage('Please enter a JobId'); setTimeout(() => setjobmessage(''), 3000); return; }
      const resp = await axiosInstance.post('/hook/manual-jobs', { jobIDs: [id] });
      if (resp.status === 200 || resp.status === 201) { setjobmessage('Submitted for validation'); Setjobid(''); }
      else setjobmessage(resp.data?.message || 'Failed to submit');
    } catch (e) { setjobmessage(e?.response?.data?.message || 'Failed to submit'); }
    finally { setTimeout(() => setjobmessage(''), 3000); }
  };

  const handleMarkAttendance = async (eventId) => {
    try {
      setAttendanceSubmitLoading(true);
      setAttendanceSubmitMsg('');
      await axiosInstance.post(`/attendance-events/${eventId}/mark-attendance`, {});
      setAttendanceSubmitMsg('Attendance submitted');
      const { data } = await axiosInstance.get('/attendance-events/active/me');
      setActiveAttendanceEvents(Array.isArray(data) ? data : []);
    } catch (e) { setAttendanceSubmitMsg(e?.response?.data?.message || 'Failed'); }
    finally { setAttendanceSubmitLoading(false); setTimeout(() => setAttendanceSubmitMsg(''), 3000); }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthsWindow = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthNames[d.getMonth()] };
  });
  const monthlyMap = new Map(monthsWindow.map(m => [m.key, { revenue: 0, distance: 0, label: m.label }]));
  const jobsForCharts = data?.latestJobs || [];
  jobsForCharts.forEach(j => {
    const ts = j.deliveredTimestamp || j.createdAt;
    if (!ts) return;
    const d = new Date(ts); const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap.has(key)) {
      const cur = monthlyMap.get(key);
      cur.revenue += Number(j.revenue || j.income || 0);
      cur.distance += Number(j.distanceDriven || 0);
    }
  });
  const revenueData = Array.from(monthlyMap.values()).map(m => ({ month: m.label, revenue: m.revenue, distance: m.distance }));
  const hasData = jobsForCharts.length > 0;
  const fallbackRevenueData = [
    { month: 'Jan', revenue: 100, distance: 1000 }, { month: 'Feb', revenue: 0, distance: 0 },
    { month: 'Mar', revenue: 0, distance: 0 }, { month: 'Apr', revenue: 0, distance: 0 },
    { month: 'May', revenue: 0, distance: 0 }, { month: 'Jun', revenue: 100, distance: 1000 },
  ];
  const finalRevenueData = hasData ? revenueData : fallbackRevenueData;

  const weekdayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyAgg = new Map(weekdayOrder.map(d => [d, { jobs: 0, distance: 0 }]));
  jobsForCharts.forEach(j => {
    const ts = j.deliveredTimestamp || j.createdAt;
    if (!ts) return;
    const d = new Date(ts); const label = weekdayOrder[d.getDay()];
    const cur = weeklyAgg.get(label) || { jobs: 0, distance: 0 };
    cur.jobs += 1; cur.distance += Number(j.distanceDriven || 0);
    weeklyAgg.set(label, cur);
  });
  const weeklyData = weekdayOrder.map(day => ({ day, jobs: (weeklyAgg.get(day) || {}).jobs || 0 }));

  if (error) return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: T.bg }}>
      <Stack spacing={2} alignItems="center">
        <Typography sx={{ fontFamily: font, color: T.danger, fontSize: '1.05rem', fontWeight: 500 }}>{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{
          fontFamily: font, fontSize: '0.88rem', color: T.text, border: `1px solid ${T.border}`,
          borderRadius: T.radiusSm, textTransform: 'none', px: 3,
          '&:hover': { borderColor: T.borderHover, bgcolor: T.surfaceHover },
        }}>
          Retry
        </Button>
      </Stack>
    </Box>
  );

  if (!data) return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: T.bg }}>
      <Stack spacing={2} alignItems="center">
        <LinearProgress sx={{
          width: 140, height: 2, bgcolor: T.border, borderRadius: 1,
          '& .MuiLinearProgress-bar': { bgcolor: T.accent, borderRadius: 1 },
        }} />
        <Typography sx={{ ...sxLabel, fontSize: '0.75rem' }}>Loading dashboard</Typography>
      </Stack>
    </Box>
  );

  const {
    user, rider,
    latestJobs = [],
    progress = [],
    completions = [],
    totals = { totalKm: 0, totalRevenue: 0, totalJobs: 0 },
    attendance = { totalEventsAttended: 0, eventsAttended: [] },
    achievements = [],
    truckershubStats
  } = data;

  const thSnapshot = truckershubStats?.snapshot || {};
  const thTotals = {
    totalJobs: Number(thSnapshot.jobs ?? totals.totalJobs ?? 0),
    totalDistance: Number(thSnapshot.statistics?.distance?.total ?? thSnapshot.distance ?? totals.totalKm ?? 0),
    totalRevenue: Number(thSnapshot.statistics?.income?.total ?? thSnapshot.income ?? totals.totalRevenue ?? 0),
    avgPerJob: (() => {
      const jobs = Number(thSnapshot.jobs ?? totals.totalJobs ?? 0);
      const rev = Number(thSnapshot.statistics?.income?.total ?? thSnapshot.income ?? totals.totalRevenue ?? 0);
      return jobs > 0 ? Math.round((rev / jobs) * 100) / 100 : totals.avgPerJob || 0;
    })(),
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = rider?.name || user?.username || 'Driver';
  const firstName = displayName.split(' ')[0];
  const activeDivision = divisionSummary?.division || currentDivision;

  return (
    <MagicPageShell>
      <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', fontFamily: font }}>
        {pendingDivisionInvites > 0 && (
          <Container maxWidth="xl" sx={{ pt: 2 }}>
            <Alert
              severity="info"
              action={(
                <Button component={RouterLink} to="/division/invites" size="small" sx={{ textTransform: 'none' }}>
                  View invites
                </Button>
              )}
            >
              You have {pendingDivisionInvites} division invitation(s).
            </Alert>
          </Container>
        )}

        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 }, pb: 4 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            sx={{
              p: { xs: 2.25, md: 3 },
              borderRadius: 3,
              border: `1px solid ${alpha(T.accent, 0.24)}`,
              background: `linear-gradient(150deg, ${alpha(T.accent, 0.14)} 0%, ${alpha(T.info, 0.08)} 40%, ${alpha('#000', 0.08)} 100%)`,
              mb: 3,
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems={{ md: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar src={rider?.avatar} sx={{ width: 54, height: 54, border: `2px solid ${alpha(T.accent, 0.55)}` }}>
                  {firstName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: font, fontWeight: 900, fontSize: { xs: '1.15rem', md: '1.45rem' } }}>
                    {greeting}, {firstName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                    <TagChip label={user?.role || 'Member'} color={T.accent} filled />
                    {rider?.employeeID && <TagChip label={rider.employeeID} color={T.textSecondary} />}
                    <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: T.textMuted }}>
                      Rating {rider?.rating || 4.8}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack direction={{ xs: 'row', md: 'row' }} spacing={1}>
                <Button component={RouterLink} to="/contracts/me" variant="outlined" size="small">Contracts</Button>
                <Button component={RouterLink} to="/wallet" variant="outlined" size="small">Wallet</Button>
                <Button component={RouterLink} to="/leaderboard" variant="contained" size="small">Leaderboard</Button>
              </Stack>
            </Stack>
          </Box>

          <Fade in timeout={380}>
            <Box>
              <BentoGrid minItemWidth={220} gap={2} sx={{ mb: 3 }}>
                {[
                  { icon: <AccountBalanceWallet sx={{ fontSize: 17 }} />, label: 'Token Balance', value: Number(wallet?.balance || 0).toLocaleString(), accent: true, tint: null },
                  { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />, label: 'Total Jobs', value: thTotals.totalJobs.toLocaleString(), tint: T.infoDim },
                  { icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 17 }} />, label: 'Total Income', value: thTotals.totalRevenue.toLocaleString(), tint: T.successDim },
                  { icon: <PlaceOutlinedIcon sx={{ fontSize: 17 }} />, label: 'Distance (km)', value: thTotals.totalDistance.toLocaleString(), tint: T.warningDim },
                ].map((kpi, idx) => (
                  <BentoItem key={kpi.label} sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
                    <Box component={motion.div} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06, duration: 0.25 }}>
                      <StatCard {...kpi} />
                    </Box>
                  </BentoItem>
                ))}
              </BentoGrid>

              {activeDivision && (
                <Card sx={{ ...sxCard, mb: 3 }}>
                  <CardContent sx={{ p: '16px !important' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Avatar src={activeDivision.logoUrl || undefined} sx={{ width: 38, height: 38 }}>
                          {activeDivision.name?.[0] || 'D'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ ...sxLabel, display: 'block' }}>Current Division</Typography>
                          <Typography sx={{ fontFamily: font, fontWeight: 700, color: T.text }} noWrap>
                            {activeDivision.name}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        {activeDivision.slug && (
                          <Button size="small" variant="outlined" component={RouterLink} to={`/divisions/${activeDivision.slug}`}>
                            Public page
                          </Button>
                        )}
                        <Button size="small" variant="contained" component={RouterLink} to="/division">
                          Open division
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {divisionSummary?.division && (
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  sx={{ ...sxCard, mb: 3 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      height: 110,
                      background: divisionSummary.division.bannerUrl
                        ? `url(${divisionSummary.division.bannerUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${alpha(T.accent, 0.25)}, ${alpha(T.info, 0.2)})`,
                    }}
                  >
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))' }} />
                  </Box>
                  <CardContent sx={{ p: '20px !important', mt: -5, position: 'relative' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }} sx={{ mb: 2 }}>
                      <Avatar
                        src={divisionSummary.division.logoUrl || undefined}
                        sx={{ width: 72, height: 72, border: `4px solid ${T.surface}`, bgcolor: T.surfaceElevated }}
                      >
                        {divisionSummary.division.name?.[0] || 'D'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ ...sxLabel, display: 'block' }}>My Division</Typography>
                        <Typography variant="h6" sx={{ color: T.text, fontFamily: font, fontWeight: 700 }} noWrap>
                          {divisionSummary.division.name}
                          {divisionSummary.division.isLeader && (
                            <Typography component="span" sx={{ ml: 1, fontSize: '0.75rem', color: T.accent, fontWeight: 600 }}>
                              · LEADER
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: T.textSecondary, fontFamily: font }}>
                          Rank #{divisionSummary.me?.rank || '—'} of {divisionSummary.me?.peerCount || divisionSummary.division.memberCount || 0}
                          {' · '}{divisionSummary.division.memberCount || 0} members
                          {' · '}{divisionSummary.division.taxPercent || 0}% tax
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          component={RouterLink}
                          to={`/divisions/${divisionSummary.division.slug}`}
                          sx={{ borderColor: T.border, color: T.text }}
                        >
                          Public page
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          to="/division"
                          sx={{ bgcolor: T.accent, color: '#000', '&:hover': { bgcolor: alpha(T.accent, 0.85) } }}
                        >
                          Manage
                        </Button>
                      </Stack>
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid item xs={6} sm={3}>
                        <Stack sx={{ p: 1.5, borderRadius: T.radiusSm, border: `1px solid ${T.border}`, bgcolor: T.surfaceAlt }}>
                          <Typography variant="caption" sx={{ ...sxLabel }}>My jobs</Typography>
                          <Typography sx={{ color: T.text, fontFamily: font, fontWeight: 700 }}>
                            {(divisionSummary.me?.stats?.totalJobs || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Stack sx={{ p: 1.5, borderRadius: T.radiusSm, border: `1px solid ${T.border}`, bgcolor: T.surfaceAlt }}>
                          <Typography variant="caption" sx={{ ...sxLabel }}>My revenue</Typography>
                          <Typography sx={{ color: T.text, fontFamily: font, fontWeight: 700 }}>
                            {Math.round(divisionSummary.me?.stats?.totalRevenue || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Stack sx={{ p: 1.5, borderRadius: T.radiusSm, border: `1px solid ${T.border}`, bgcolor: T.surfaceAlt }}>
                          <Typography variant="caption" sx={{ ...sxLabel }}>Tax contributed</Typography>
                          <Typography sx={{ color: T.text, fontFamily: font, fontWeight: 700 }}>
                            {Math.round(divisionSummary.me?.stats?.totalTaxContributed || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Stack sx={{ p: 1.5, borderRadius: T.radiusSm, border: `1px solid ${T.border}`, bgcolor: T.surfaceAlt }}>
                          <Typography variant="caption" sx={{ ...sxLabel }}>Division wallet</Typography>
                          <Typography sx={{ color: T.text, fontFamily: font, fontWeight: 700 }}>
                            {Math.round(divisionSummary.division.walletBalance || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    {Array.isArray(divisionSummary.recentJobs) && divisionSummary.recentJobs.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ ...sxLabel, display: 'block', mb: 1 }}>Latest division jobs</Typography>
                        <Stack spacing={0.75}>
                          {divisionSummary.recentJobs.slice(0, 3).map((j, idx) => (
                            <Stack
                              key={idx}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{
                                p: 1,
                                borderRadius: T.radiusXs,
                                border: `1px solid ${j.mine ? alpha(T.accent, 0.35) : T.border}`,
                                bgcolor: j.mine ? T.accentDim : T.surfaceAlt,
                              }}
                            >
                              <Avatar src={j.riderAvatar || undefined} sx={{ width: 22, height: 22 }}>
                                {j.riderName?.[0] || '?'}
                              </Avatar>
                              <Typography variant="caption" sx={{ color: T.text, fontFamily: font, fontWeight: 600, minWidth: 120 }} noWrap>
                                {j.mine ? 'You' : j.riderName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: T.textSecondary, fontFamily: font, flex: 1 }} noWrap>
                                {j.cargo || 'cargo'} {j.sourceCity && j.destinationCity ? `(${j.sourceCity} → ${j.destinationCity})` : ''}
                              </Typography>
                              <Typography variant="caption" sx={{ color: T.textSecondary, fontFamily: font }}>
                                {j.distanceKm.toLocaleString()} km
                              </Typography>
                              <Typography variant="caption" sx={{ color: T.success, fontFamily: font, fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                                {j.revenue.toLocaleString()}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              <BentoGrid minItemWidth={360} gap={2} sx={{ mb: 3 }}>
                <BentoItem span={2}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>Revenue & Distance — 6 Months</SectionTitle>
                      <Box sx={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={finalRevenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gAccent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={T.accent} stopOpacity={0.15} />
                                <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gInfo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={T.info} stopOpacity={0.12} />
                                <stop offset="100%" stopColor={T.info} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 6" stroke={T.border} vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 12, fontFamily: font }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: T.textMuted, fontSize: 12, fontFamily: font }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke={T.accent} strokeWidth={1.5} fill="url(#gAccent)" dot={false} />
                            <Area type="monotone" dataKey="distance" name="Distance" stroke={T.info} strokeWidth={1.5} fill="url(#gInfo)" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                      <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Box sx={{ width: 16, height: 2, bgcolor: T.accent, borderRadius: 1 }} />
                          <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: T.textMuted, fontWeight: 500 }}>Revenue</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Box sx={{ width: 16, height: 2, bgcolor: T.info, borderRadius: 1 }} />
                          <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: T.textMuted, fontWeight: 500 }}>Distance</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </BentoItem>
                <BentoItem span={1}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>Jobs by Weekday</SectionTitle>
                      <Box sx={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 6" stroke={T.border} vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: T.textMuted, fontSize: 12, fontFamily: font }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: T.textMuted, fontSize: 12, fontFamily: font }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="jobs" name="Jobs" fill={T.accent} radius={[4, 4, 0, 0]} maxBarSize={28} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </BentoItem>
              </BentoGrid>

              {/* ── Quick actions + Job validator ───────────────── */}
              <BentoGrid minItemWidth={320} gap={2} sx={{ mb: 3 }}>
                <BentoItem span={1}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>Quick Actions</SectionTitle>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {[
                          { label: 'Contract Hub', icon: <Assignment sx={{ fontSize: 14 }} />, to: '/contracts/me' },
                          { label: 'Wallet', icon: <AccountBalanceWallet sx={{ fontSize: 14 }} />, to: '/wallet' },
                          { label: 'Leaderboard', icon: <Timeline sx={{ fontSize: 14 }} />, to: '/leaderboard' },
                          { label: 'Calendar', icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />, to: '/calendar' },
                        ].map(({ label, icon, to }) => (
                          <Button
                            key={label}
                            component={RouterLink}
                            to={to}
                            size="small"
                            startIcon={icon}
                            sx={{
                              fontFamily: font, fontSize: '0.85rem', fontWeight: 500,
                              color: T.text,
                              border: `1px solid ${T.border}`,
                              borderRadius: T.radiusSm, px: 2, py: 1,
                              textTransform: 'none', bgcolor: 'transparent',
                              '&:hover': { bgcolor: T.surfaceHover, borderColor: T.borderHover },
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </BentoItem>
                <BentoItem span={1}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>Manual Job Validation</SectionTitle>
                      {jobmessage && (
                        <Box sx={{
                          mb: 1.5, p: '8px 14px',
                          bgcolor: T.accentDim, border: `1px solid ${alpha(T.accent, 0.2)}`,
                          borderRadius: T.radiusSm,
                        }}>
                          <Typography sx={{ fontFamily: font, fontSize: '0.85rem', color: T.accent, fontWeight: 500 }}>
                            {jobmessage}
                          </Typography>
                        </Box>
                      )}
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TextField
                          size="small"
                          placeholder="Enter Job ID…"
                          value={jobid}
                          onChange={(e) => Setjobid(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleJobsubmit(jobid)}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'transparent', borderRadius: T.radiusSm,
                              fontFamily: font, fontSize: '0.95rem', color: T.text,
                              '& fieldset': { borderColor: T.border },
                              '&:hover fieldset': { borderColor: T.borderHover },
                              '&.Mui-focused fieldset': { borderColor: T.accent, borderWidth: '1px' },
                            },
                            '& input': { color: T.text, py: '9px', '&::placeholder': { color: T.textMuted, opacity: 1 } },
                          }}
                        />
                        <Button
                          onClick={() => handleJobsubmit(jobid)}
                          sx={{
                            fontFamily: font, fontWeight: 600, fontSize: '0.88rem',
                            bgcolor: T.accent, color: T.bg,
                            borderRadius: T.radiusSm, px: 2.5, py: '9px',
                            textTransform: 'none', whiteSpace: 'nowrap',
                            '&:hover': { bgcolor: '#c8e600' },
                            transition: 'background 0.15s ease',
                          }}
                        >
                          Submit
                        </Button>
                      </Stack>
                      <Typography sx={{ ...sxLabel, mt: 1.5, fontSize: '0.72rem', fontWeight: 400 }}>
                        For TruckersHub jobs that weren't auto-validated
                      </Typography>
                    </CardContent>
                  </Card>
                </BentoItem>
              </BentoGrid>

              {/* ── Upcoming events (calendar) ──────────────────── */}
              {todayEvents.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                      <CardContent sx={{ p: '20px !important' }}>
                        <SectionTitle
                          action={
                            <Button
                              component={RouterLink} to="/calendar" size="small"
                              startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                fontFamily: font, fontSize: '0.82rem', textTransform: 'none',
                                color: T.accent, border: `1px solid ${alpha(T.accent, 0.25)}`,
                                borderRadius: T.radiusSm, px: 1.5,
                                '&:hover': { bgcolor: T.accentDim, borderColor: alpha(T.accent, 0.4) },
                              }}
                            >
                              Full calendar
                            </Button>
                          }
                        >
                          Today&apos;s Events
                        </SectionTitle>
                        <Stack spacing={0}>
                          {todayEvents.map((ev, idx) => {
                            const meetupDate = ev.meetupTime ? new Date(ev.meetupTime) : null;
                            const departureDate = ev.departureTime ? new Date(ev.departureTime) : null;
                            const meetupLabel =
                              meetupDate && !Number.isNaN(meetupDate.getTime())
                                ? meetupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'TBD';
                            const departureLabel =
                              departureDate && !Number.isNaN(departureDate.getTime())
                                ? departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '';
                            return (
                              <Stack
                                key={ev.id || `${ev.title}-${idx}`} direction="row" alignItems="center" justifyContent="space-between"
                                sx={{
                                  py: 1.25,
                                  borderBottom: idx < todayEvents.length - 1 ? `1px solid ${T.border}` : 'none',
                                }}
                              >
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                  {ev.slotImageUrl ? (
                                    <Avatar
                                      src={ev.slotImageUrl}
                                      variant="rounded"
                                      sx={{ width: 40, height: 28, borderRadius: 1, border: `1px solid ${T.border}` }}
                                    />
                                  ) : (
                                    <Box sx={{
                                      width: 6, height: 6, borderRadius: '50%',
                                      bgcolor: T.accent, flexShrink: 0,
                                    }} />
                                  )}
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontFamily: font, fontSize: '0.95rem', color: T.text, fontWeight: 500 }} noWrap>
                                      {ev.title}
                                    </Typography>
                                    <Typography sx={{ fontFamily: font, fontSize: '0.78rem', color: T.textMuted }}>
                                      {ev.slotNumber != null ? `Slot ${ev.slotNumber}` : 'Slot TBD'}
                                      {ev.slotName ? ` · ${ev.slotName}` : ''}
                                      {ev.source ? ` · ${ev.source}` : ''}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: T.textMuted }}>
                                  {meetupLabel}
                                  {departureLabel ? ` - ${departureLabel}` : ''}
                                </Typography>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {externalUpcoming.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Card sx={sxCard}>
                      <CardContent sx={{ p: '20px !important' }}>
                        <SectionTitle>Upcoming Events</SectionTitle>
                        <Stack spacing={0}>
                          {externalUpcoming.map((ev, idx) => (
                            <Stack
                              key={ev.id} direction="row" alignItems="center" justifyContent="space-between"
                              sx={{
                                py: 1.25,
                                borderBottom: idx < externalUpcoming.length - 1 ? `1px solid ${T.border}` : 'none',
                              }}
                            >
                              <Typography sx={{ fontFamily: font, fontSize: '0.92rem', color: T.text }}>
                                {ev.title}
                              </Typography>
                              <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: T.textMuted }}>
                                {new Date(ev.start).toLocaleString(undefined, {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* ── Wallet + Contracts ──────────────────────────── */}
              <BentoGrid minItemWidth={360} gap={2} sx={{ mb: 3 }}>
                <BentoItem span={2}>
                  <Box component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}>
                    <WalletTransactions
                      wallet={wallet}
                      onRefresh={() => getMyWallet().then((w) => setWallet({
                        balance: Number(w.balance || 0),
                        transactions: Array.isArray(w.transactions) ? w.transactions : [],
                      }))}
                    />
                  </Box>
                </BentoItem>
                <BentoItem span={1}>
                  <Stack spacing={2}>
                    <Box component={motion.div} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                      <ActiveContracts onRefresh={() => myContracts().then((res) => setContracts(res))} />
                    </Box>
                    <Box component={motion.div} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                      <CompletedContracts onRefresh={() => myContracts().then((res) => setContracts(res))} />
                    </Box>
                  </Stack>
                </BentoItem>
              </BentoGrid>

              {/* ── Profile & TruckersHub ───────────────────────── */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} lg={7}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>
                        Profile & Game Details
                      </SectionTitle>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2.5}>
                            <Box>
                              <Typography sx={{ ...sxLabel, mb: 1 }}>Platform IDs</Typography>
                              <Stack spacing={0.75}>
                                <TagChip
                                  label={rider?.steamID ? `Steam: ${rider.steamID}` : 'No Steam ID'}
                                  color={rider?.steamID ? T.info : T.textMuted}
                                  filled={!!rider?.steamID}
                                />
                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                  <TagChip
                                    label={rider?.truckersmpId ? `TMP: ${rider.truckersmpId}` : 'No TMP ID'}
                                    color={rider?.truckersmpId ? T.info : T.textMuted}
                                    filled={!!rider?.truckersmpId}
                                  />
                                  <TagChip
                                    label={rider?.truckershubId ? `Hub: ${rider.truckershubId}` : 'No Hub ID'}
                                    color={rider?.truckershubId ? T.success : T.textMuted}
                                    filled={!!rider?.truckershubId}
                                  />
                                </Stack>
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2.5}>
                            <Box>
                              <Typography sx={{ ...sxLabel, mb: 1 }}>DLCs Owned</Typography>
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                <TagChip
                                  label={rider?.dlcsOwned?.ets2?.length > 0 ? `ETS2 ×${rider.dlcsOwned.ets2.length}` : 'No ETS2 DLCs'}
                                  color={rider?.dlcsOwned?.ets2?.length > 0 ? T.warning : T.textMuted}
                                  filled={rider?.dlcsOwned?.ets2?.length > 0}
                                />
                                <TagChip
                                  label={rider?.dlcsOwned?.ats?.length > 0 ? `ATS ×${rider.dlcsOwned.ats.length}` : 'No ATS DLCs'}
                                  color={rider?.dlcsOwned?.ats?.length > 0 ? T.warning : T.textMuted}
                                  filled={rider?.dlcsOwned?.ats?.length > 0}
                                />
                              </Stack>
                            </Box>
                            <Box>
                              <Typography sx={{ ...sxLabel, mb: 1 }}>Games</Typography>
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {rider?.gamesOwned?.length > 0
                                  ? rider.gamesOwned.map((g, i) => <TagChip key={i} label={g} color={T.warning} filled />)
                                  : <TagChip label="No games listed" />}
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>TruckersHub Snapshot</SectionTitle>
                      {truckershubStats && thSnapshot ? (
                        <>
                          <Typography sx={{ ...sxLabel, fontSize: '0.72rem', fontWeight: 400, mb: 2 }}>
                            Last updated: {truckershubStats.lastUpdatedAt
                              ? new Date(truckershubStats.lastUpdatedAt).toLocaleString()
                              : '—'}
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                            {[
                              { label: 'Level', value: thSnapshot.level ?? '—' },
                              { label: 'Avg Rating', value: thSnapshot.statistics?.rating?.avg ? thSnapshot.statistics.rating.avg.toFixed(2) : '—' },
                              { label: 'THP Total', value: thSnapshot.statistics?.THP?.total ? thSnapshot.statistics.THP.total.toLocaleString() : '—' },
                              { label: 'XP Total', value: thSnapshot.statistics?.XP?.total ? thSnapshot.statistics.XP.total.toLocaleString() : '—' },
                              { label: 'Fuel Burned', value: thSnapshot.statistics?.fuelBurned?.total ? thSnapshot.statistics.fuelBurned.total.toLocaleString() : '—' },
                              { label: 'Max Speed', value: thSnapshot.statistics?.speed?.max ? `${thSnapshot.statistics.speed.max.toFixed(1)} km/h` : '—' },
                            ].map(({ label, value }) => (
                              <InfoCell key={label} label={label} value={value} />
                            ))}
                          </Box>
                        </>
                      ) : (
                        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                          <TrendingUpIcon sx={{ color: T.textFaint, fontSize: 28 }} />
                          <Typography sx={{ fontFamily: font, fontSize: '0.92rem', color: T.textMuted }}>
                            No TruckersHub data available yet
                          </Typography>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* ── Events & Attendance + Achievements ──────────── */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} lg={7}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography sx={{
                          fontFamily: font, fontSize: '0.85rem', fontWeight: 600,
                          letterSpacing: '0.06em', textTransform: 'uppercase', color: T.textMuted,
                        }}>
                          Events & Attendance
                        </Typography>
                        <StatusBadge label="TruckersMP" color={T.success} />
                      </Stack>

                      <Box sx={{
                        p: '16px', mb: 2.5,
                        border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
                        bgcolor: T.surfaceAlt,
                      }}>
                        <Typography sx={{ ...sxLabel, fontSize: '0.72rem' }}>Total Events Attended</Typography>
                        <Typography sx={{ ...sxValue, fontSize: '2.25rem', mt: 0.5 }}>
                          {attendance?.totalEventsAttended || 0}
                        </Typography>
                      </Box>

                      <Typography sx={{ ...sxLabel, mb: 1.25 }}>Recently Attended</Typography>
                      <Stack spacing={1} sx={{ mb: 2.5 }}>
                        {(attendance?.eventsAttended || []).slice(0, 3).map((e) => (
                          <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between"
                            sx={{
                              p: '12px 14px', border: `1px solid ${T.border}`,
                              borderRadius: T.radiusSm, bgcolor: T.surfaceAlt,
                              transition: 'border-color 0.15s ease',
                              '&:hover': { borderColor: T.borderHover },
                            }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontFamily: font, fontSize: '0.95rem', fontWeight: 600, color: T.text }} noWrap>
                                {e.title || 'Event'}
                              </Typography>
                              <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: T.textMuted, mt: 0.25 }}>
                                {e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '—'}
                                {e.approvedAt ? ` · Approved ${new Date(e.approvedAt).toLocaleDateString()}` : ''}
                              </Typography>
                            </Box>
                            <StatusBadge label="Approved" color={T.success} />
                          </Stack>
                        ))}
                        {(attendance?.eventsAttended || []).length === 0 && (
                          <Typography sx={{ fontFamily: font, fontSize: '0.92rem', color: T.textMuted, py: 1 }}>
                            No events recorded yet.
                          </Typography>
                        )}
                        {(attendance?.eventsAttended || []).length > 6 && (
                          <Button onClick={() => { setAttendanceOpen(true); setAttendancePage(1); }}
                            sx={{
                              fontFamily: font, alignSelf: 'flex-start', fontSize: '0.85rem',
                              color: T.accent, textTransform: 'none', p: 0, minWidth: 0,
                              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                            }}>
                            View all →
                          </Button>
                        )}
                      </Stack>

                      <Typography sx={{ ...sxLabel, mb: 1.25 }}>Active Attendance Windows</Typography>
                      {attendanceSubmitMsg && (
                        <Box sx={{
                          mb: 1.5, p: '8px 14px',
                          bgcolor: T.accentDim, border: `1px solid ${alpha(T.accent, 0.2)}`,
                          borderRadius: T.radiusSm,
                        }}>
                          <Typography sx={{ fontFamily: font, fontSize: '0.85rem', color: T.accent, fontWeight: 500 }}>
                            {attendanceSubmitMsg}
                          </Typography>
                        </Box>
                      )}
                      <Stack spacing={1}>
                        {activeAttendanceEvents.map((ev) => (
                          <Stack key={ev._id} direction="row" alignItems="center" justifyContent="space-between"
                            sx={{
                              p: '12px 14px', border: `1px solid ${T.border}`,
                              borderRadius: T.radiusSm, bgcolor: T.surfaceAlt,
                              transition: 'border-color 0.15s ease',
                              '&:hover': { borderColor: T.borderHover },
                            }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontFamily: font, fontSize: '0.95rem', fontWeight: 600, color: T.text }} noWrap>
                                {ev.title}
                              </Typography>
                              <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: T.textMuted, mt: 0.25 }}>
                                {new Date(ev.eventDate).toLocaleString()}
                                {ev.endDate ? ` → ${new Date(ev.endDate).toLocaleString()}` : ''}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <StatusBadge
                                label={ev.isAttendanceOpen ? 'Open' : 'Closed'}
                                color={ev.isAttendanceOpen ? T.success : T.textMuted}
                              />
                              <Button
                                disabled={attendanceSubmitLoading || !ev.isAttendanceOpen}
                                onClick={() => handleMarkAttendance(ev._id)}
                                sx={{
                                  fontFamily: font, fontWeight: 600, fontSize: '0.82rem',
                                  bgcolor: ev.isAttendanceOpen ? T.accent : T.surfaceHover,
                                  color: ev.isAttendanceOpen ? T.bg : T.textMuted,
                                  borderRadius: T.radiusSm, px: 1.5, py: 0.75,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: ev.isAttendanceOpen ? '#c8e600' : T.surfaceHover },
                                  '&.Mui-disabled': { bgcolor: T.surfaceHover, color: T.textFaint },
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                I was there
                              </Button>
                            </Stack>
                          </Stack>
                        ))}
                        {activeAttendanceEvents.length === 0 && (
                          <Typography sx={{ fontFamily: font, fontSize: '0.92rem', color: T.textMuted, py: 1 }}>
                            No active attendance windows.
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Card component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} sx={sxCard}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <SectionTitle>Achievements</SectionTitle>
                      {achievements.length === 0 ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                          <EmojiEventsOutlinedIcon sx={{ color: T.textFaint, fontSize: 28 }} />
                          <Typography sx={{ fontFamily: font, fontSize: '0.92rem', color: T.textMuted }}>
                            No achievements yet
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack spacing={1}>
                          {achievements.slice(0, 6).map((a, idx) => (
                            <Stack key={idx} direction="row" spacing={1.5} alignItems="center"
                              sx={{
                                p: '12px 14px', border: `1px solid ${T.border}`,
                                borderRadius: T.radiusSm, bgcolor: T.surfaceAlt,
                                transition: 'border-color 0.15s ease',
                                '&:hover': { borderColor: T.borderHover },
                              }}>
                              <Avatar
                                src={a.logoUrl} alt={a.name} variant="rounded"
                                sx={{ width: 34, height: 34, bgcolor: T.surfaceElevated, borderRadius: T.radiusXs }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontFamily: font, fontSize: '0.95rem', fontWeight: 600, color: T.text }} noWrap>
                                  {a.name}
                                </Typography>
                                <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: T.textMuted }} noWrap>
                                  {a.description || ''}
                                  {a.issuedOn ? ` · ${new Date(a.issuedOn).toLocaleDateString()}` : ''}
                                </Typography>
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* ── License Card ────────────────────────────────── */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box component={motion.div} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <LicenseCard userData={user} riderData={rider} />
                  </Box>
                </Grid>
              </Grid>

            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ── Attendance modal ───────────────────────────────── */}
      <Dialog
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        fullWidth maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: T.surface, border: `1px solid ${T.borderStrong}`,
            borderRadius: T.radius, boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          },
        }}
      >
        <DialogTitle sx={{ p: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontFamily: font, fontWeight: 700, fontSize: '1.15rem', color: T.text }}>
              All Attended Events
            </Typography>
            <IconButton onClick={() => setAttendanceOpen(false)} size="small"
              sx={{ color: T.textMuted, '&:hover': { color: T.text } }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: '20px 24px' }}>
          {(() => {
            const all = attendance?.eventsAttended || [];
            const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
            const clampedPage = Math.min(attendancePage, totalPages);
            const pageItems = all.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
            return (
              <Stack spacing={1}>
                {pageItems.map((e) => (
                  <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{
                      p: '12px 14px', border: `1px solid ${T.border}`,
                      borderRadius: T.radiusSm, bgcolor: T.surfaceAlt,
                    }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: font, fontSize: '0.95rem', fontWeight: 600, color: T.text }} noWrap>
                        {e.title || 'Event'}
                      </Typography>
                      <Typography sx={{ fontFamily: font, fontSize: '0.82rem', color: T.textMuted }}>
                        {e.eventDate ? new Date(e.eventDate).toLocaleString() : '—'}
                      </Typography>
                    </Box>
                    <StatusBadge label={e.status?.toUpperCase() || 'COMPLETED'} color={T.success} />
                  </Stack>
                ))}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 2 }}>
                  <Typography sx={{ ...sxLabel, fontSize: '0.75rem' }}>
                    Page {clampedPage} of {totalPages}
                  </Typography>
                  <Pagination
                    count={totalPages} page={clampedPage}
                    onChange={(_, p) => setAttendancePage(p)} size="small"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontFamily: font, color: T.textMuted,
                        border: `1px solid ${T.border}`,
                        borderRadius: T.radiusXs, fontSize: '0.82rem',
                      },
                      '& .Mui-selected': {
                        bgcolor: `${T.accent}18 !important`,
                        color: T.accent,
                        borderColor: alpha(T.accent, 0.3),
                      },
                    }}
                  />
                </Stack>
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px', borderTop: `1px solid ${T.border}` }}>
          <Button onClick={() => setAttendanceOpen(false)}
            sx={{
              fontFamily: font, color: T.textMuted, fontSize: '0.88rem',
              textTransform: 'none', border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm, px: 2.5,
              '&:hover': { bgcolor: T.surfaceHover, color: T.text, borderColor: T.borderHover },
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MagicPageShell>
  );
}
