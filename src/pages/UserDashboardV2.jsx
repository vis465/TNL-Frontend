import React, { useEffect, useState } from 'react';
import tokenImage from '../img/panam.jpg';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import axiosInstance from '../utils/axios';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Avatar, Chip, Button, Divider,
  Dialog, DialogTitle, TextField, DialogContent, DialogActions,
  Pagination, IconButton, useMediaQuery, useTheme, AppBar, Toolbar,
  Container, Fade, Badge, Alert, LinearProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Assignment from '@mui/icons-material/Assignment';
import Timeline from '@mui/icons-material/Timeline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { myContracts } from '../services/contractsService';
import { getMyWallet } from '../services/walletService';
import CurrencyCard from '../components/CurrencyCard';
import WalletTransactions from '../components/WalletTransactions';
import ActiveContracts from '../components/ActiveContracts';
import CompletedContracts from '../components/CompletedContracts';
import AdminSidebar from '../components/AdminSidebar';
import LicenseCard from '../components/LicenseCard';

// ─── Design tokens ────────────────────────────────────────────────
const T = {
  bg: '#0A0A0B',
  surface: '#111113',
  surfaceHover: '#18181B',
  border: '#27272A',
  borderStrong: '#3F3F46',
  text: '#FAFAFA',
  textMuted: '#71717A',
  textFaint: '#3F3F46',
  accent: '#E4FF1A',       // electric lime — memorable single accent
  accentDim: 'rgba(228,255,26,0.08)',
  success: '#22C55E',
  info: '#38BDF8',
  warning: '#F59E0B',
  danger: '#F43F5E',
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '6px',
  boxShadow: 'none',
};

const sxLabel = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: T.textMuted,
  // fontFamily: '"DM Mono", monospace',
};

const sxValue = {
  fontSize: '1.75rem',
  fontWeight: 800,
  color: T.text,
  // fontFamily: '"Syne", sans-serif',
  lineHeight: 1.1,
};

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({ icon, label, value, accent }) {
  return (
    <Card sx={{ ...sxCard, height: '100%' }}>
      <CardContent sx={{ p: '16px !important' }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={sxLabel}>{label}</Typography>
            <Box sx={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: accent ? T.accentDim : 'rgba(255,255,255,0.04)',
              borderRadius: '4px',
              color: accent ? T.accent : T.textMuted,
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

function SectionLabel({ children }) {
  return (
    <Typography sx={{ ...sxLabel, mb: 1, display: 'flex', alignItems: 'center', gap: 1.0,
      '&::after': { content: '""', flex: 1, height: '1px', bgcolor: T.border }
    }}>
      {children}
    </Typography>
  );
}

function StatusDot({ color = T.success }) {
  return (
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
  );
}

function MonoChip({ label, color = T.textMuted }) {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: '8px', py: '3px',
      border: `1px solid ${T.border}`,
      borderRadius: '3px',
      bgcolor: 'transparent',
    }}>
      <Typography sx={{ fontSize: '11px',  color, letterSpacing: '0.03em' }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px', p: '10px 14px' }}>
      <Typography sx={{ ...sxLabel, mb: 0.75 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: p.color }} />
          <Typography sx={{ fontSize: '12px', color: T.textMuted,  }}>
            {p.name}:
          </Typography>
          <Typography sx={{ fontSize: '12px', color: T.text,  fontWeight: 700 }}>
            {Number(p.value).toLocaleString()}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
};

// ─── Main component ───────────────────────────────────────────────
export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);
  const pageSize = 10;
  const [jobid, Setjobid] = useState('0');
  const [activeAttendanceEvents, setActiveAttendanceEvents] = useState([]);
  const [attendanceSubmitLoading, setAttendanceSubmitLoading] = useState(false);
  const [attendanceSubmitMsg, setAttendanceSubmitMsg] = useState('');
  const [jobmessage, setjobmessage] = useState('');
  const [contracts, setContracts] = useState({ active: [], history: [] });
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ── API calls ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try { const { data } = await axiosInstance.get('/me/dashboard'); setData(data); }
      catch (e) { setError('Failed to load dashboard'); }
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
      } catch (e) { console.warn('Failed to load attendance events'); }
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

  // ── Chart data derivation ──────────────────────────────────────
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
    { month: 'May', revenue: 0, distance: 0 }, { month: 'Jun', revenue: 100, distance: 1000 }
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
      <Typography sx={{ color: T.danger }}>{error}</Typography>
    </Box>
  );

  if (!data) return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: T.bg }}>
      <Stack spacing={1} alignItems="center">
        <LinearProgress sx={{ width: 120, bgcolor: T.border, '& .MuiLinearProgress-bar': { bgcolor: T.accent } }} />
        <Typography sx={{ ...sxLabel }}>Loading dashboard</Typography>
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: T.bg,  }}>
      {/* Google fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
      `}</style>

      <AdminSidebar
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={() => setMobileDrawerOpen(false)}
        user={user}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Mobile AppBar */}
        {isMobile && (
          <AppBar position="sticky" elevation={0} sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, display: { xs: 'flex', md: 'none' } }}>
            <Toolbar sx={{ minHeight: '52px !important' }}>
              <IconButton edge="start" onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} sx={{ color: T.text, mr: 2 }}>
                <MenuIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '15px', color: T.text, flex: 1 }}>
                Dashboard
              </Typography>
              <MonoChip label={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} color={T.textMuted} />
            </Toolbar>
          </AppBar>
        )}

        {/* ── Top identity bar ───────────────────────────────────── */}
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 10,
          bgcolor: T.bg, borderBottom: `1px solid ${T.border}`,
          px: { xs: 2, md: 3 }, py: '12px',
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.75} alignItems="center">
              <Avatar
                src={rider?.avatar}
                sx={{ width: 44, height: 44, border: `2px solid ${T.border}`, bgcolor: T.surface, fontSize: '16px', fontWeight: 700 }}
              />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '17px', color: T.text, lineHeight: 1.2 }}>
                  {rider?.name || user?.username}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.375 }}>
                  <MonoChip label={user?.role || 'Member'} color={T.accent} />
                  {rider?.employeeID && <MonoChip label={rider.employeeID} />}
                  <Stack direction="row" spacing={0.25} alignItems="center">
                    <Typography sx={{ fontSize: '12px', color: T.warning, letterSpacing: '-0.02em' }}>
                      {'★'.repeat(Math.min(5, Math.floor(rider?.rating || 4.8)))}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: T.textMuted,  }}>
                      {rider?.rating || 4.8}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
            {!isMobile && (
              <Typography sx={{ ...sxLabel }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            )}
          </Stack>
        </Box>

        <Container maxWidth="xl" sx={{ py: 2, px: { xs: 2, md: 3 } }}>

          {/* ── Row 1: Stats ─────────────────────────────────────── */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<AccountBalanceWallet sx={{ fontSize: 16 }} />} label="Token Balance" value={Number(wallet?.balance || 0).toLocaleString()} accent />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />} label="Total Jobs" value={thTotals.totalJobs.toLocaleString()} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16 }} />} label="Total Income" value={thTotals.totalRevenue.toLocaleString()} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard icon={<PlaceOutlinedIcon sx={{ fontSize: 16 }} />} label="Distance (km)" value={`${thTotals.totalDistance.toLocaleString()}`} />
            </Grid>
          </Grid>
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} lg={7}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Profile & game details</SectionLabel>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography sx={{ ...sxLabel, mb: 1.0 }}>Steam</Typography>
                          <MonoChip label={rider?.steamID ? `Steam: ${rider.steamID}` : 'No Steam ID'} color={rider?.steamID ? T.info : T.textMuted} />
                        </Box>
                        <Box>
                          <Typography sx={{ ...sxLabel, mb: 1.0 }}>TruckersMP / Hub</Typography>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            <MonoChip label={rider?.truckersmpId ? `TMP: ${rider.truckersmpId}` : 'No TMP ID'} color={rider?.truckersmpId ? T.info : T.textMuted} />
                            <MonoChip label={rider?.truckershubId ? `Hub: ${rider.truckershubId}` : 'No Hub ID'} color={rider?.truckershubId ? T.success : T.textMuted} />
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography sx={{ ...sxLabel, mb: 1.0 }}>DLCs</Typography>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            <MonoChip label={rider?.dlcsOwned?.ets2?.length > 0 ? `ETS2 ×${rider.dlcsOwned.ets2.length}` : 'No ETS2 DLCs'} color={rider?.dlcsOwned?.ets2?.length > 0 ? T.warning : T.textMuted} />
                            <MonoChip label={rider?.dlcsOwned?.ats?.length > 0 ? `ATS ×${rider.dlcsOwned.ats.length}` : 'No ATS DLCs'} color={rider?.dlcsOwned?.ats?.length > 0 ? T.warning : T.textMuted} />
                          </Stack>
                        </Box>
                        <Box>
                          <Typography sx={{ ...sxLabel, mb: 1.0 }}>Games</Typography>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            {rider?.gamesOwned?.length > 0
                              ? rider.gamesOwned.map((g, i) => <MonoChip key={i} label={g} color={T.warning} />)
                              : <MonoChip label="No games listed" />
                            }
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>TruckersHub snapshot</SectionLabel>
                  {truckershubStats && thSnapshot ? (
                    <>
                      <Typography sx={{ ...sxLabel, mb: 2.0 }}>
                        Updated: {truckershubStats.lastUpdatedAt ? new Date(truckershubStats.lastUpdatedAt).toLocaleString() : '—'}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.0 }}>
                        {[
                          { label: 'Level', value: thSnapshot.level ?? '—' },
                          { label: 'Avg rating', value: thSnapshot.statistics?.rating?.avg ? thSnapshot.statistics.rating.avg.toFixed(2) : '—' },
                          { label: 'THP total', value: thSnapshot.statistics?.THP?.total ? thSnapshot.statistics.THP.total.toLocaleString() : '—' },
                          { label: 'XP total', value: thSnapshot.statistics?.XP?.total ? thSnapshot.statistics.XP.total.toLocaleString() : '—' },
                          { label: 'Fuel burned', value: thSnapshot.statistics?.fuelBurned?.total ? thSnapshot.statistics.fuelBurned.total.toLocaleString() : '—' },
                          { label: 'Max speed', value: thSnapshot.statistics?.speed?.max ? `${thSnapshot.statistics.speed.max.toFixed(1)} km/h` : '—' },
                        ].map(({ label, value }) => (
                          <Box key={label} sx={{ p: '10px 12px', border: `1px solid ${T.border}`, borderRadius: '4px' }}>
                            <Typography sx={sxLabel}>{label}</Typography>
                            <Typography sx={{ fontSize: '18px', fontWeight: 800, color: T.text, mt: 0.5 }}>
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Typography sx={{ fontSize: '13px', color: T.textMuted }}>No TruckersHub statistics available yet.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* ── Row 2: Quick actions + Job validator ──────────────── */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={6}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Quick actions</SectionLabel>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {[
                      { label: 'Contract Hub', icon: <Assignment sx={{ fontSize: 14 }} />, to: '/contracts/me' },
                      { label: 'Wallet', icon: <AccountBalanceWallet sx={{ fontSize: 14 }} />, to: '/wallet' },
                      { label: 'Leaderboard', icon: <Timeline sx={{ fontSize: 14 }} />, to: '/leaderboard' },
                    ].map(({ label, icon, to }) => (
                      <Button
                        key={label}
                        component={RouterLink}
                        to={to}
                        size="small"
                        startIcon={icon}
                        sx={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: T.text,
                          border: `1px solid ${T.border}`,
                          borderRadius: '4px',
                          px: '12px',
                          py: '7px',
                          textTransform: 'none',
                          bgcolor: 'transparent',
                          '&:hover': { bgcolor: T.surfaceHover, borderColor: T.borderStrong },
                          transition: 'all 0.15s',
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Manual job validation</SectionLabel>
                  {jobmessage && (
                    <Box sx={{ mb: 1.25, p: '8px 12px', bgcolor: T.accentDim, border: `1px solid ${T.accent}`, borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '12px', color: T.accent,  }}>{jobmessage}</Typography>
                    </Box>
                  )}
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      size="small"
                      placeholder="Job ID"
                      value={jobid}
                      onChange={(e) => Setjobid(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJobsubmit(jobid)}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'transparent',
                          borderRadius: '4px',
                          
                          fontSize: '13px',
                          color: T.text,
                          '& fieldset': { borderColor: T.border },
                          '&:hover fieldset': { borderColor: T.borderStrong },
                          '&.Mui-focused fieldset': { borderColor: T.accent, borderWidth: '1px' },
                        },
                        '& input': { color: T.text, '&::placeholder': { color: T.textMuted } },
                      }}
                    />
                    <Button
                      onClick={() => handleJobsubmit(jobid)}
                      sx={{
                        bgcolor: T.accent, color: T.bg,
                           fontWeight: 700,
                        fontSize: '12px', textTransform: 'none',
                        borderRadius: '4px', px: '16px', py: '8px', whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#c8e600' },
                        transition: 'background 0.15s',
                      }}
                    >
                      Submit
                    </Button>
                  </Stack>
                  <Typography sx={{ ...sxLabel, mt: 1.0, fontSize: '10px' }}>
                    For TruckersHub jobs that weren't auto-validated
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Row 3: Wallet + Contracts ─────────────────────────── */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={7}>
              <WalletTransactions
                wallet={wallet}
                onRefresh={() => getMyWallet().then((w) => setWallet({ balance: Number(w.balance || 0), transactions: Array.isArray(w.transactions) ? w.transactions : [] }))}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5}>
                <ActiveContracts onRefresh={() => myContracts().then((res) => setContracts(res))} />
                <CompletedContracts onRefresh={() => myContracts().then((res) => setContracts(res))} />
              </Stack>
            </Grid>
          </Grid>

          {/* ── Row 4: Events + Achievements ──────────────────────── */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} lg={7}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <SectionLabel>Events & attendance</SectionLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto', pl: '12px' }}>
                      <StatusDot />
                      <Typography sx={{ ...sxLabel }}>TruckersMP</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.0, mb: 2.5 }}>
                    <Box sx={{ p: '12px', border: `1px solid ${T.border}`, borderRadius: '4px' }}>
                      <Typography sx={sxLabel}>Total attended</Typography>
                      <Typography sx={{ ...sxValue, fontSize: '2rem', mt: 0.5 }}>{attendance?.totalEventsAttended || 0}</Typography>
                    </Box>
                  </Box>

                  <SectionLabel>Recently attended</SectionLabel>
                  <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                    {(attendance?.eventsAttended || []).slice(0, 3).map((e) => (
                      <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between"
                        sx={{ p: '10px 12px', border: `1px solid ${T.border}`, borderRadius: '4px', bgcolor: T.surfaceHover }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.text,  }} noWrap>
                            {e.title || 'Event'}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: T.textMuted,  }}>
                            {e.eventDate ? new Date(e.eventDate).toLocaleDateString() : '—'}
                            {e.approvedAt ? ` · approved ${new Date(e.approvedAt).toLocaleDateString()}` : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ px: '8px', py: '3px', border: `1px solid ${T.success}`, borderRadius: '3px' }}>
                          <Typography sx={{ fontSize: '10px', color: T.success,  fontWeight: 700 }}>
                            APPROVED
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                    {((attendance?.eventsAttended || []).length || 0) === 0 && (
                      <Typography sx={{ fontSize: '13px', color: T.textMuted, py: '8px' }}>No events recorded yet.</Typography>
                    )}
                    {((attendance?.eventsAttended || []).length || 0) > 6 && (
                      <Button onClick={() => { setAttendanceOpen(true); setAttendancePage(1); }}
                        sx={{ alignSelf: 'flex-start', fontSize: '11px', color: T.accent,  textTransform: 'none', p: 0, minWidth: 0 }}>
                        View all →
                      </Button>
                    )}
                  </Stack>

                  <SectionLabel>Active attendance windows</SectionLabel>
                  {attendanceSubmitMsg && (
                    <Box sx={{ mb: 1.25, p: '8px 12px', bgcolor: T.accentDim, border: `1px solid ${T.accent}`, borderRadius: '4px' }}>
                      <Typography sx={{ fontSize: '12px', color: T.accent}}>{attendanceSubmitMsg}</Typography>
                    </Box>
                  )}
                  <Stack spacing={0.75}>
                    {activeAttendanceEvents.map((ev) => (
                      <Stack key={ev._id} direction="row" alignItems="center" justifyContent="space-between"
                        sx={{ p: '10px 12px', border: `1px solid ${T.border}`, borderRadius: '4px', bgcolor: T.surfaceHover }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.text,  }} noWrap>
                            {ev.title}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: T.textMuted,  }}>
                            {new Date(ev.eventDate).toLocaleString()}
                            {ev.endDate ? ` → ${new Date(ev.endDate).toLocaleString()}` : ''}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ px: '8px', py: '3px', border: `1px solid ${ev.isAttendanceOpen ? T.success : T.textFaint}`, borderRadius: '3px' }}>
                            <Typography sx={{ fontSize: '10px', color: ev.isAttendanceOpen ? T.success : T.textMuted,  fontWeight: 700 }}>
                              {ev.isAttendanceOpen ? 'OPEN' : 'CLOSED'}
                            </Typography>
                          </Box>
                          <Button
                            disabled={attendanceSubmitLoading || !ev.isAttendanceOpen}
                            onClick={() => handleMarkAttendance(ev._id)}
                            sx={{
                              bgcolor: ev.isAttendanceOpen ? T.accent : T.surface,
                              color: ev.isAttendanceOpen ? T.bg : T.textMuted,
                               fontWeight: 700,
                              fontSize: '11px', textTransform: 'none',
                              borderRadius: '4px', px: '12px', py: '6px',
                              '&:hover': { bgcolor: ev.isAttendanceOpen ? '#c8e600' : T.surface },
                              '&.Mui-disabled': { bgcolor: T.surfaceHover, color: T.textFaint },
                              transition: 'background 0.15s',
                            }}
                          >
                            I was there
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
                    {activeAttendanceEvents.length === 0 && (
                      <Typography sx={{ fontSize: '13px', color: T.textMuted, py: '8px' }}>No active attendance windows.</Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Achievements</SectionLabel>
                  {achievements.length === 0 ? (
                    <Typography sx={{ fontSize: '13px', color: T.textMuted, py: '8px' }}>No achievements yet.</Typography>
                  ) : (
                    <Stack spacing={0.75}>
                      {achievements.slice(0, 6).map((a, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="center"
                          sx={{ p: '10px 12px', border: `1px solid ${T.border}`, borderRadius: '4px', bgcolor: T.surfaceHover }}>
                          <Avatar src={a.logoUrl} alt={a.name} variant="rounded" sx={{ width: 36, height: 36, bgcolor: T.surface, borderRadius: '4px' }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: T.text,  }} noWrap>{a.name}</Typography>
                              <Typography sx={{ fontSize: '11px', color: T.textMuted,  }} noWrap>
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

          {/* ── Row 5: Profile & TruckersHub snapshot ─────────────── */}
        

          {/* ── Row 6: Challenges ─────────────────────────────────── */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} lg={6}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Active challenges</SectionLabel>
                  <Stack spacing={0.75}>
                    {(() => {
                      const challengeMap = new Map();
                      progress.forEach((p) => {
                        const cid = p.challengeId;
                        if (!challengeMap.has(cid)) challengeMap.set(cid, { challengeId: cid, challengeName: p.challengeName || cid, totalDistance: 0, totalJobs: 0, isCompleted: false, lastUpdated: p.timestamp });
                        const c = challengeMap.get(cid);
                        c.totalDistance += p.distanceDriven || 0;
                        c.totalJobs += 1;
                        if (p.challengeCompleted) c.isCompleted = true;
                        if (new Date(p.timestamp) > new Date(c.lastUpdated)) c.lastUpdated = p.timestamp;
                      });
                      return Array.from(challengeMap.values()).map((c) => (
                        <Box key={c.challengeId} sx={{ p: '12px', border: `1px solid ${T.border}`, borderRadius: '4px', bgcolor: T.surfaceHover }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: T.text,  }}>{c.challengeName}</Typography>
                            {c.isCompleted && (
                              <Box sx={{ px: '8px', py: '3px', border: `1px solid ${T.success}`, borderRadius: '3px' }}>
                                <Typography sx={{ fontSize: '10px', color: T.success,  fontWeight: 700 }}>DONE</Typography>
                              </Box>
                            )}
                          </Stack>
                          <Stack direction="row" spacing={2}>
                            <Typography sx={{ fontSize: '11px', color: T.textMuted,  }}>{c.totalDistance.toLocaleString()} km</Typography>
                            <Typography sx={{ fontSize: '11px', color: T.textMuted,  }}>{c.totalJobs} jobs</Typography>
                            <Typography sx={{ fontSize: '11px', color: T.textFaint,  }}>{new Date(c.lastUpdated).toLocaleDateString()}</Typography>
                          </Stack>
                        </Box>
                      ));
                    })()}
                    {progress.length === 0 && (
                      <Stack alignItems="center" sx={{ py: '32px' }} spacing={1}>
                        <TrackChangesOutlinedIcon sx={{ color: T.textFaint, fontSize: 32 }} />
                        <Typography sx={{ fontSize: '13px', color: T.textMuted }}>No active challenges</Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Row 7: Charts ─────────────────────────────────────── */}
          {/* <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={7}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Revenue & distance — last 6 months</SectionLabel>
                  <Box sx={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={finalRevenueData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                        <defs>
                          <pattern id="revPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                            <rect width="1" height="1" fill={T.accent} opacity="0.4" />
                          </pattern>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 11,  }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: T.textMuted, fontSize: 11,  }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={T.accent} strokeWidth={2} fill={T.accentDim} dot={false} />
                        <Area type="monotone" dataKey="distance" name="Distance" stroke={T.info} strokeWidth={2} fill="rgba(56,189,248,0.06)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Box sx={{ width: 20, height: 2, bgcolor: T.accent }} />
                      <Typography sx={{ ...sxLabel }}>Revenue</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Box sx={{ width: 20, height: 2, bgcolor: T.info }} />
                      <Typography sx={{ ...sxLabel }}>Distance</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={sxCard}>
                <CardContent sx={{ p: '16px !important' }}>
                  <SectionLabel>Jobs by weekday</SectionLabel>
                  <Box sx={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: T.textMuted, fontSize: 11,  }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: T.textMuted, fontSize: 11,  }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="jobs" name="Jobs" fill={T.accent} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid> */}

          {/* ── License ───────────────────────────────────────────── */}
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12}>
              <LicenseCard userData={user} riderData={rider} />
            </Grid>
          </Grid>

        </Container>
      </Box>

      {/* ── Attendance modal ─────────────────────────────────────── */}
      <Dialog
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        fullWidth maxWidth="md"
        PaperProps={{ sx: { bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: '6px', boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ p: '20px', borderBottom: `1px solid ${T.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800, fontSize: '16px', color: T.text }}>All attended events</Typography>
            <IconButton onClick={() => setAttendanceOpen(false)} size="small" sx={{ color: T.textMuted }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: '20px' }}>
          {(() => {
            const all = attendance?.eventsAttended || [];
            const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
            const clampedPage = Math.min(attendancePage, totalPages);
            const pageItems = all.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
            return (
              <Stack spacing={0.75}>
                {pageItems.map((e) => (
                  <Stack key={e.id} direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ p: '10px 12px', border: `1px solid ${T.border}`, borderRadius: '4px', bgcolor: T.surfaceHover }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: T.text,  }} noWrap>{e.title || 'Event'}</Typography>
                      <Typography sx={{ fontSize: '11px', color: T.textMuted,  }}>
                        {e.eventDate ? new Date(e.eventDate).toLocaleString() : '—'}
                      </Typography>
                    </Box>
                    <MonoChip label={e.status?.toUpperCase() || 'COMPLETED'} color={T.success} />
                  </Stack>
                ))}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1.5 }}>
                  <Typography sx={sxLabel}>Page {clampedPage} of {totalPages}</Typography>
                  <Pagination count={totalPages} page={clampedPage} onChange={(_, p) => setAttendancePage(p)} size="small"
                    sx={{ '& .MuiPaginationItem-root': { color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: '3px',  fontSize: '11px' },
                      '& .Mui-selected': { bgcolor: T.accent + '22', color: T.accent, borderColor: T.accent } }} />
                </Stack>
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: '16px 20px', borderTop: `1px solid ${T.border}` }}>
          <Button onClick={() => setAttendanceOpen(false)}
            sx={{ color: T.textMuted,  fontSize: '12px', textTransform: 'none',
              border: `1px solid ${T.border}`, borderRadius: '4px', px: '16px', '&:hover': { bgcolor: T.surfaceHover, color: T.text } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}