import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import LocalGasStationOutlined from '@mui/icons-material/LocalGasStationOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import { getDivisionTrucks } from '../services/fleetService';
import DivisionGlobalBanner from '../components/DivisionGlobalBanner';
import DashboardHero from '../components/magicui/DashboardHero';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { BentoGrid, BentoItem } from '../components/magicui/BentoGrid';
import AnimatedTabPanel from '../components/magicui/AnimatedTabPanel';

const DIVISION_FUEL_CAPACITY_L = 20_000;

const TAB_KEYS = ['overview', 'people', 'fleet', 'leaderboard'];
const TAB_INDEX_BY_KEY = TAB_KEYS.reduce((acc, key, index) => {
  acc[key] = index;
  return acc;
}, {});

export default function MyDivision() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [lb, setLb] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletForm, setWalletForm] = useState({ rider: null, amount: '', reason: '' });
  const [taxPct, setTaxPct] = useState('');
  const user = getItemWithExpiry('user') || {};

  const [inviteRider, setInviteRider] = useState(null);
  const [inviteOptions, setInviteOptions] = useState([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [fleetTrucks, setFleetTrucks] = useState([]);
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [leaderQueuesLoading, setLeaderQueuesLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState('');
  const [lbSortKey, setLbSortKey] = useState('jobs');
  const [lbSortDir, setLbSortDir] = useState('desc');

  const sortedLb = useMemo(() => {
    const rows = [...lb];
    rows.sort((a, b) => {
      const av = Number(a?.[lbSortKey] ?? 0);
      const bv = Number(b?.[lbSortKey] ?? 0);
      return lbSortDir === 'asc' ? av - bv : bv - av;
    });
    return rows;
  }, [lb, lbSortDir, lbSortKey]);

  const toggleLbSort = (key) => {
    if (lbSortKey === key) {
      setLbSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setLbSortKey(key);
    setLbSortDir('desc');
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: d } = await axiosInstance.get('/me/division');
      let resolvedDivision = d?.division || null;
      let leaderDivisionId = user?.leadsDivision?._id || null;

      if (!leaderDivisionId) {
        try {
          const { data: profile } = await axiosInstance.get('/auth/profile');
          leaderDivisionId = profile?.leadsDivision?._id || null;
        } catch (_) {
          leaderDivisionId = null;
        }
      }

      let isLeaderFromApi = d?.isLeader;
      if (!resolvedDivision && leaderDivisionId) {
        try {
          const { data: leaderDivisionRes } = await axiosInstance.get(`/divisions/${leaderDivisionId}`);
          resolvedDivision = leaderDivisionRes?.division || null;
          if (typeof leaderDivisionRes?.isLeader === 'boolean') isLeaderFromApi = leaderDivisionRes.isLeader;
        } catch (_) {
          resolvedDivision = null;
        }
      }

      const resolvedData = { ...(d || {}), division: resolvedDivision, isLeader: isLeaderFromApi };
      setData(resolvedData);
      if (resolvedDivision?._id) {
        const [{ data: l }, { data: m }, fleet] = await Promise.all([
          axiosInstance.get(`/divisions/${resolvedDivision._id}/leaderboard`, { params: { limit: 30 } }),
          axiosInstance.get(`/divisions/${resolvedDivision._id}/members`).catch(() => ({ data: { members: [] } })),
          getDivisionTrucks(resolvedDivision._id).catch(() => ({ trucks: [] })),
        ]);
        setLb(l.riders || []);
        setMembers(m.members || []);
        setFleetTrucks(Array.isArray(fleet?.trucks) ? fleet.trucks : []);
        setTaxPct(String(resolvedDivision.taxPercent ?? 0));
      } else {
        setLb([]);
        setMembers([]);
        setFleetTrucks([]);
        setJoinRequests([]);
        setSentInvites([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderQueues = async (divisionId) => {
    if (!divisionId || !isLeader) {
      setJoinRequests([]);
      setSentInvites([]);
      return;
    }
    setLeaderQueuesLoading(true);
    try {
      const [reqsRes, invitesRes] = await Promise.all([
        axiosInstance.get(`/divisions/${divisionId}/join-requests`).catch(() => ({ data: { requests: [] } })),
        axiosInstance.get(`/divisions/${divisionId}/invites`).catch(() => ({ data: { invites: [] } })),
      ]);
      setJoinRequests(reqsRes?.data?.requests || []);
      setSentInvites(invitesRes?.data?.invites || []);
    } finally {
      setLeaderQueuesLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const div = data?.division;
  const attendanceSummary = data?.attendanceSummary;
  const uid = String(user.id || user._id || '');
  const leaderIdStr = String(div?.leaderId || div?.leader?._id || '');
  const isLeader =
    data?.isLeader === true || Boolean(div && uid && leaderIdStr && uid === leaderIdStr);
  const isAdmin = user?.role === 'admin';

  const fleetSummary = useMemo(() => {
    const total = fleetTrucks.length;
    const blocked = fleetTrucks.filter((t) => t.blocked).length;
    const maintenanceCost = fleetTrucks
      .filter((t) => t.blocked)
      .reduce((sum, t) => sum + (Number(t.maintenanceCost) || 0), 0);
    const wearHigh = fleetTrucks.filter((t) => {
      const pct = (Number(t.wearKm || 0) / Math.max(1, Number(t.wearThresholdKm || 1))) * 100;
      return pct >= 70 && !t.blocked;
    }).length;
    const fleetKm = fleetTrucks.reduce((s, t) => s + (Number(t.odometerKm) || 0), 0);
    return { total, blocked, wearHigh, fleetKm, maintenanceCost };
  }, [fleetTrucks]);
  const premiumFuel = Math.max(0, Number(div?.fuelTankPremiumLiters) || 0);
  const standardFuel = Math.max(0, Number(div?.fuelTankNormalLiters ?? div?.fuelTankLiters) || 0);
  const totalFuel = premiumFuel + standardFuel;
  const totalFuelBurned = Math.max(0, Number(div?.stats?.totalFuelBurned) || 0);
  const avgFuelPerJob = (Number(div?.stats?.totalJobs) || 0) > 0
    ? totalFuelBurned / Math.max(1, Number(div?.stats?.totalJobs) || 0)
    : 0;
  const capacityPct = Math.max(0, Math.min(100, Math.round((totalFuel / DIVISION_FUEL_CAPACITY_L) * 100)));
  const premiumPct = Math.max(0, Math.min(100, Math.round((premiumFuel / DIVISION_FUEL_CAPACITY_L) * 100)));
  const standardPct = Math.max(0, Math.min(100, Math.round((standardFuel / DIVISION_FUEL_CAPACITY_L) * 100)));
  const premiumFill = Math.max(4, Math.min(100, premiumPct || 4));
  const standardFill = Math.max(4, Math.min(100, standardPct || 4));
  const remainingFuelCapacity = Math.max(0, DIVISION_FUEL_CAPACITY_L - totalFuel);

  const peopleRows = useMemo(() => {
    const base = Array.isArray(members) ? [...members] : [];
    const leaderObj = div?.leader || null;
    const leaderId = String(div?.leaderId || leaderObj?._id || '');
    if (!leaderId) return base;

    const hasLeader = base.some((m) => String(m?._id || m?.riderId || '') === leaderId);
    if (!hasLeader) {
      base.unshift({
        _id: leaderId,
        name: leaderObj?.name || leaderObj?.username || 'Division Leader',
        username: leaderObj?.username || '',
        employeeID: leaderObj?.employeeID || '',
        avatar: leaderObj?.avatar || '',
        isLeader: true,
        totalJobs: null,
      });
    }
    return base;
  }, [members, div]);
  const effectiveMemberCount = peopleRows.length || Number(div?.memberCount || 0);

  useEffect(() => {
    if (!isLeader || !div?._id) return;
    const t = setTimeout(async () => {
      setInviteLoading(true);
      try {
        const { data: r } = await axiosInstance.get(`/divisions/${div._id}/eligible-invitees`, {
          params: { q: inviteQuery || undefined },
        });
        setInviteOptions(r.riders || []);
      } catch (_) {
        setInviteOptions([]);
      } finally {
        setInviteLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [isLeader, div?._id, inviteQuery]);

  useEffect(() => {
    loadLeaderQueues(div?._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [div?._id, isLeader]);

  useEffect(() => {
    const tabKey = String(searchParams.get('tab') || '').toLowerCase();
    const nextIndex = TAB_INDEX_BY_KEY[tabKey];
    if (nextIndex == null || nextIndex === activeTab) return;
    setActiveTab(nextIndex);
  }, [searchParams, activeTab]);

  const setTabAndSyncQuery = (tabIndex) => {
    setActiveTab(tabIndex);
    const next = new URLSearchParams(searchParams);
    if (tabIndex <= 0) next.delete('tab');
    else next.set('tab', TAB_KEYS[tabIndex]);
    setSearchParams(next, { replace: true });
  };

  const leave = async () => {
    if (!window.confirm('Leave this division?')) return;
    try {
      await axiosInstance.post('/me/division/leave');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Leave failed');
    }
  };

  const invite = async () => {
    if (!inviteRider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${div._id}/invites`, { riderId: inviteRider._id });
      setInviteRider(null);
      setInviteQuery('');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Invite failed');
    }
  };

  const saveTax = async () => {
    try {
      await axiosInstance.patch(`/divisions/${div._id}/tax`, { taxPercent: Number(taxPct) });
      setTaxDialogOpen(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update tax');
    }
  };

  const distribute = async () => {
    if (!walletForm.rider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${div._id}/wallet/distribute`, {
        riderId: walletForm.rider._id,
        amount: Number(walletForm.amount),
        reason: walletForm.reason,
      });
      setWalletForm({ rider: null, amount: '', reason: '' });
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Payout failed');
    }
  };

  const acceptJoinRequest = async (reqId) => {
    try {
      await axiosInstance.post(`/divisions/${div._id}/join-requests/${reqId}/accept`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to accept request');
    }
  };

  const rejectJoinRequest = async (reqId) => {
    try {
      await axiosInstance.post(`/divisions/${div._id}/join-requests/${reqId}/reject`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to reject request');
    }
  };

  const cancelInvite = async (inviteId) => {
    try {
      await axiosInstance.delete(`/divisions/${div._id}/invites/${inviteId}`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to cancel invite');
    }
  };

  const removeMember = async (member) => {
    const memberId = String(member?._id || member?.riderId || '');
    if (!memberId || !div?._id || member?.isLeader) return;
    if (!window.confirm(`Remove ${member?.name || member?.username || 'this member'} from the division?`)) return;
    setRemovingMemberId(memberId);
    try {
      await axiosInstance.post(`/divisions/${div._id}/members/${memberId}/kick`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemovingMemberId('');
    }
  };

  return (
    <MagicPageShell>
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <DashboardHero
        title="My Division"
        subtitle="Track people, fleet readiness, and token health in one place. Use this command center to manage everything your division needs to keep moving."
        stats={[
          { label: 'Members', value: effectiveMemberCount },
          { label: 'Wallet', value: Number(div?.walletBalance || 0) },
          { label: 'Fleet Trucks', value: fleetSummary.total },
          { label: 'Blocked', value: fleetSummary.blocked },
        ]}
      />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <DivisionGlobalBanner globalAnnouncement={data?.globalAnnouncement} />

      {!div && !loading && (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>You are not in a division yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Check your invitations or browse divisions to join one.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button component={RouterLink} to="/division/invites" variant="contained">View invitations</Button>
              <Button component={RouterLink} to="/division-leaderboard" variant="outlined">Browse divisions</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {div && (
        <Grid container spacing={2.5} alignItems="flex-start">
          <Grid item xs={12} lg={8.5}>
            <Stack spacing={2}>
          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            {div.bannerUrl ? (
              <CardMedia component="img" image={div.bannerUrl} alt="banner" sx={{ height: 160, objectFit: 'cover' }} />
            ) : (
              <Box sx={{ height: 120, background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})` }} />
            )}
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Avatar
                  src={div.logoUrl || undefined}
                  sx={{ width: 64, height: 64, mt: -5, border: '3px solid', borderColor: 'background.paper', boxShadow: 3 }}
                >
                  {div.name?.[0] || 'D'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700}>{div.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{div.description}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap alignItems="center">
                    <Chip size="small" label={`Tax ${div.taxPercent}%`} />
                    {isLeader && (
                      <IconButton
                        size="small"
                        aria-label="Edit division tax"
                        onClick={() => {
                          setTaxPct(String(div.taxPercent ?? 0));
                          setTaxDialogOpen(true);
                        }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    )}
                    <Chip size="small" label={`Wallet ${(div.walletBalance ?? 0).toLocaleString()}`} />
                    <Chip size="small" label={`Members ${effectiveMemberCount}`} />
                  </Stack>
                  {(attendanceSummary || div.stats?.totalEventsAttended != null) && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                      <Chip
                        size="small"
                        variant="outlined"
                        color="info"
                        label={`Unique events (members): ${attendanceSummary?.uniqueEventsAttended ?? '—'}`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Recorded attendances: ${attendanceSummary?.totalAttendancesRecorded ?? div.stats?.totalEventsAttended ?? 0}`}
                      />
                    </Stack>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button component={RouterLink} to={`/divisions/${div.slug}`} variant="outlined">
                    Public page
                  </Button>
                  {isLeader && (
                    <>
                      <Button variant="outlined" onClick={() => setTabAndSyncQuery(2)}>
                        Fleet tab
                      </Button>
                      <Button component={RouterLink} to="/trucks/marketplace" variant="contained">
                        Buy truck
                      </Button>
                    </>
                  )}
                  <Button variant="outlined" color="warning" onClick={leave}>Leave</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <BentoGrid minItemWidth={180} gap={1.25}>
            <BentoItem>
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Members</Typography>
                <Typography variant="h6" fontWeight={800}>{effectiveMemberCount}</Typography>
              </Paper>
            </BentoItem>
            <BentoItem>
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Wallet</Typography>
                <Typography variant="h6" fontWeight={800}>{(div.walletBalance ?? 0).toLocaleString()}</Typography>
              </Paper>
            </BentoItem>
            <BentoItem>
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Fleet trucks</Typography>
                <Typography variant="h6" fontWeight={800}>{fleetSummary.total}</Typography>
              </Paper>
            </BentoItem>
            <BentoItem>
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Blocked trucks</Typography>
                <Typography variant="h6" fontWeight={800} color={fleetSummary.blocked ? 'warning.main' : 'success.main'}>
                  {fleetSummary.blocked}
                </Typography>
              </Paper>
            </BentoItem>
            <BentoItem>
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Fuel burned (all jobs)</Typography>
                <Typography variant="h6" fontWeight={800}>{Math.round(totalFuelBurned).toLocaleString()} L</Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg {avgFuelPerJob.toFixed(1)} L/job
                </Typography>
              </Paper>
            </BentoItem>
          </BentoGrid>

          <Card variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <LocalGasStationOutlined color="primary" />
                    <Typography fontWeight={700}>
                      Division fuel
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.4 }}>
                    Fuel ops are shared across the division. Premium gets consumed first and stretches farther per liter.
                  </Typography>
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      mb: 1,
                    }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#FFFF1D', fontWeight: 700 }}>
                          Premium tank
                        </Typography>
                        <Box sx={{ mt: 0.6, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: 44,
                              height: 84,
                              borderRadius: 999,
                              border: '2px solid #FFFF1D',
                              bgcolor: 'rgba(156,39,176,0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: `${premiumFill}%`,
                                background:
                                  'linear-gradient(180deg, #FFFF1D 0%, #FFFF1D 100%)',
                                transition: 'height .35s ease',
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {premiumFuel.toLocaleString()} L
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {premiumPct}% of total capacity
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#90caf9', fontWeight: 700 }}>
                          Standard tank
                        </Typography>
                        <Box sx={{ mt: 0.6, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: 44,
                              height: 84,
                              borderRadius: 999,
                              border: '2px solid rgba(144,202,249,0.6)',
                              bgcolor: 'rgba(25,118,210,0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                height: `${standardFill}%`,
                                background:
                                  'linear-gradient(180deg, rgba(144,202,249,0.95) 0%, rgba(25,118,210,0.95) 100%)',
                                transition: 'height .35s ease',
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {standardFuel.toLocaleString()} L
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {standardPct}% of total capacity
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      icon={<BoltOutlined sx={{ fontSize: 16 }} />}
                      sx={{ bgcolor: 'rgba(156,39,176,0.1)' }}
                      label="Premium consumed first"
                    />
                    <Chip
                      size="small"
                      icon={<SpeedOutlined sx={{ fontSize: 16 }} />}
                      sx={{ bgcolor: 'rgba(25,118,210,0.1)' }}
                      label="Premium gives longer coverage"
                    />
                    <Chip size="small" variant="outlined" label={`Total ${totalFuel.toLocaleString()} / ${DIVISION_FUEL_CAPACITY_L.toLocaleString()} L`} />
                    <Chip size="small" variant="outlined" label={`Filled ${capacityPct}%`} />
                    <Chip size="small" variant="outlined" label={`Free ${Math.round(remainingFuelCapacity).toLocaleString()} L`} />
                  </Stack>
                </Box>
                <Button component={RouterLink} to="/division/fuel" variant={isLeader ? 'contained' : 'outlined'}>
                  {isLeader ? 'Fuel marketplace' : 'Fuel market'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                <Typography fontWeight={700} sx={{ flex: 1 }}>
                  Division workspace
                </Typography>
                {isLeader && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      color={joinRequests.length ? 'warning' : 'default'}
                      label={`Applications ${joinRequests.length}`}
                    />
                    <Chip
                      size="small"
                      color={sentInvites.filter((i) => i.status === 'pending').length ? 'info' : 'default'}
                      label={`Invites ${sentInvites.filter((i) => i.status === 'pending').length}`}
                    />
                    {fleetSummary.blocked > 0 && (
                      <Chip size="small" color="error" label={`${fleetSummary.blocked} trucks blocked`} />
                    )}
                  </Stack>
                )}
              </Stack>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setTabAndSyncQuery(v)}
                sx={{ mt: 1.5, borderBottom: 1, borderColor: 'divider' }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Overview" />
                <Tab label={`People (${peopleRows.length})`} />
                <Tab label={`Fleet${fleetSummary.blocked ? ` (${fleetSummary.blocked} blocked)` : ''}`} />
                <Tab label={`Leaderboard (${lb.length})`} />
              </Tabs>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                <Chip size="small" variant={activeTab === 1 ? 'filled' : 'outlined'} label="People queue" onClick={() => setTabAndSyncQuery(1)} />
                <Chip size="small" variant={activeTab === 2 ? 'filled' : 'outlined'} label="Fleet health" onClick={() => setTabAndSyncQuery(2)} />
                <Chip size="small" variant={activeTab === 3 ? 'filled' : 'outlined'} label="Performance board" onClick={() => setTabAndSyncQuery(3)} />
              </Stack>
            </CardContent>
          </Card>

          <AnimatedTabPanel panelKey={`my-division-tab-${activeTab}`}>
          {activeTab === 0 && isAdmin && (
            <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                  <Typography fontWeight={700} sx={{ flex: 1 }}>
                    Admin quick actions
                  </Typography>
                  <Chip size="small" color="info" label="Admin mode" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1.5 }}>
                  Keep operations in one place: open division admin console only when deeper moderation is required.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  {div?._id && (
                    <Button component={RouterLink} to={`/admin/divisions/${div._id}`} variant="outlined">
                      Division admin console
                    </Button>
                  )}
                  <Button variant="outlined" onClick={() => setTabAndSyncQuery(1)}>
                    Review people
                  </Button>
                  <Button variant="outlined" onClick={() => setTabAndSyncQuery(2)}>
                    Review fleet
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 0 && isLeader && (() => {
            const inactiveMembers = members.filter((m) => m.inactive && !m.isLeader);
            if (!inactiveMembers.length) return null;
            return (
              <Card variant="outlined" sx={{ borderColor: 'warning.light' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography fontWeight={700}>Needs attention</Typography>
                    <Chip size="small" color="warning" label={`${inactiveMembers.length} inactive`} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These members haven't logged a job recently. Consider reaching out or reviewing their membership.
                  </Typography>
                  <Stack spacing={1}>
                    {inactiveMembers.slice(0, 8).map((m) => (
                      <Stack key={m._id} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                        <Avatar src={m.avatar || undefined} sx={{ width: 28, height: 28 }}>{m.name?.[0]}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{m.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.lastJobAt
                              ? `Last job ${m.daysSinceLastJob}d ago (${new Date(m.lastJobAt).toLocaleDateString()})`
                              : `No jobs logged since joining`}
                          </Typography>
                        </Box>
                        <Chip size="small" variant="outlined" color="warning" label="Inactive" />
                      </Stack>
                    ))}
                    {inactiveMembers.length > 8 && (
                      <Typography variant="caption" color="text.secondary">
                        …and {inactiveMembers.length - 8} more.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {activeTab === 1 && isLeader && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 2 }}>Leader tools</Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Chip
                      color={joinRequests.length ? 'warning' : 'default'}
                      label={`Pending applications: ${joinRequests.length}`}
                    />
                    <Chip
                      color={sentInvites.filter((i) => i.status === 'pending').length ? 'info' : 'default'}
                      label={`Pending invites: ${sentInvites.filter((i) => i.status === 'pending').length}`}
                    />
                    <Button size="small" variant="outlined" onClick={() => setTabAndSyncQuery(2)}>
                      Fleet maintenance tab
                    </Button>
                  </Stack>
                  {leaderQueuesLoading && <LinearProgress />}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Autocomplete
                      options={inviteOptions}
                      value={inviteRider}
                      loading={inviteLoading}
                      getOptionLabel={(o) => o ? `${o.name} (${o.employeeID || o.username || ''})` : ''}
                      isOptionEqualToValue={(a, b) => a?._id === b?._id}
                      onInputChange={(_, v, reason) => { if (reason === 'input') setInviteQuery(v); }}
                      onChange={(_, v) => setInviteRider(v)}
                      renderOption={(props, o) => (
                        <li {...props}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar src={o.avatar || undefined} sx={{ width: 28, height: 28 }}>{o.name?.[0]}</Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{o.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{o.employeeID} · {o.username}</Typography>
                            </Box>
                          </Stack>
                        </li>
                      )}
                      renderInput={(params) => <TextField {...params} label="Invite rider (search)" />}
                      sx={{ flex: 1, minWidth: 260 }}
                    />
                    <Button variant="contained" onClick={invite} disabled={!inviteRider?._id}>
                      Send invite
                    </Button>
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2">Pay member from division wallet</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Autocomplete
                      options={peopleRows}
                      value={walletForm.rider}
                      onChange={(_, v) => setWalletForm((p) => ({ ...p, rider: v }))}
                      getOptionLabel={(o) => o ? `${o.name} (${o.employeeID || ''})` : ''}
                      isOptionEqualToValue={(a, b) => a?._id === b?._id}
                      sx={{ minWidth: 240, flex: 1 }}
                      renderInput={(params) => <TextField {...params} label="Member" />}
                    />
                    <TextField label="Amount" type="number" value={walletForm.amount} onChange={(e) => setWalletForm((p) => ({ ...p, amount: e.target.value }))} />
                    <TextField label="Reason" value={walletForm.reason} onChange={(e) => setWalletForm((p) => ({ ...p, reason: e.target.value }))} />
                    <Button variant="outlined" onClick={distribute} disabled={!walletForm.rider || !(Number(walletForm.amount) > 0)}>
                      Distribute
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                  People ({peopleRows.length})
                </Typography>
                {!peopleRows.length && (
                  <Typography variant="body2" color="text.secondary">No members listed yet.</Typography>
                )}
                <Stack spacing={1.25}>
                  {peopleRows.map((m) => (
                    (() => {
                      const memberId = String(m._id || m.riderId || '');
                      const canRemove = isLeader && !m.isLeader && memberId && memberId !== uid;
                      const isRemoving = removingMemberId === memberId;
                      return (
                        <Stack
                          key={m._id || m.riderId || m.username || m.name}
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                          sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover' }}
                        >
                          <Avatar src={m.avatar || undefined} sx={{ width: 30, height: 30 }}>
                            {m.name?.[0] || m.username?.[0] || '?'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {m.name || m.username || 'Member'}
                              </Typography>
                              {m.isLeader && <Chip size="small" color="primary" label="Leader" />}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {m.employeeID || m.username || '—'}
                            </Typography>
                          </Box>
                          {Number.isFinite(Number(m.totalJobs)) && (
                            <Chip size="small" label={`${Number(m.totalJobs)} jobs`} />
                          )}
                          {canRemove && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              disabled={isRemoving}
                              onClick={() => removeMember(m)}
                            >
                              {isRemoving ? 'Removing…' : 'Remove'}
                            </Button>
                          )}
                        </Stack>
                      );
                    })()
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && isLeader && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                  Join applications ({joinRequests.length})
                </Typography>
                {!joinRequests.length && (
                  <Typography variant="body2" color="text.secondary">No pending applications.</Typography>
                )}
                <Stack spacing={1.25}>
                  {joinRequests.slice(0, 8).map((r) => (
                    <Stack key={r._id} direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Avatar src={r.rider?.avatar || undefined} sx={{ width: 30, height: 30 }}>
                          {r.rider?.name?.[0] || '?'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {r.rider?.name || r.riderId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {r.rider?.employeeID || ''} {r.rider?.username ? `· ${r.rider.username}` : ''}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" color="success" onClick={() => acceptJoinRequest(r._id)}>
                          Accept
                        </Button>
                        <Button size="small" color="error" onClick={() => rejectJoinRequest(r._id)}>
                          Reject
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && isLeader && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                  Sent invites ({sentInvites.filter((i) => i.status === 'pending').length} pending)
                </Typography>
                {!sentInvites.length && (
                  <Typography variant="body2" color="text.secondary">No invites sent yet.</Typography>
                )}
                <Stack spacing={1.25}>
                  {sentInvites.slice(0, 8).map((inv) => (
                    <Stack key={inv._id} direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {inv.riderId?.name || inv.riderId || 'Rider'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {inv.status} · Expires {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}
                        </Typography>
                      </Box>
                      {inv.status === 'pending' && (
                        <Button size="small" color="error" onClick={() => cancelInvite(inv._id)}>
                          Cancel invite
                        </Button>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && !isLeader && (
            <Alert severity="info">People management is available for division leaders.</Alert>
          )}

          {activeTab === 2 && (
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <LocalShippingOutlined color="primary" />
                <Typography fontWeight={700}>Division fleet</Typography>
                <Box sx={{ flex: 1 }} />
                <Button size="small" variant="outlined" component={RouterLink} to="/fleet">
                  Open fleet
                </Button>
                {isLeader && (
                  <Button
                    size="small"
                    variant="contained"
                    component={RouterLink}
                    to="/trucks/marketplace"
                  >
                    Buy truck
                  </Button>
                )}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={`Trucks ${fleetSummary.total}`} />
                <Chip
                  size="small"
                  color={fleetSummary.blocked ? 'error' : 'success'}
                  icon={<BuildOutlined sx={{ fontSize: 16 }} />}
                  label={
                    fleetSummary.blocked
                      ? `${fleetSummary.blocked} blocked`
                      : 'All operational'
                  }
                />
                {fleetSummary.wearHigh > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label={`${fleetSummary.wearHigh} wearing`}
                  />
                )}
                {fleetSummary.blocked > 0 && (
                  <Chip
                    size="small"
                    color="warning"
                    label={`Maintenance due ${Math.round(fleetSummary.maintenanceCost).toLocaleString()} tokens`}
                  />
                )}
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${Math.round(fleetSummary.fleetKm).toLocaleString()} km driven`}
                />
              </Stack>
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Garage layout
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                  {(fleetTrucks.length
                    ? fleetTrucks.slice(0, 8).map((t, idx) => ({
                        key: String(t._id || t.divisionTruckId || idx),
                        label:
                          t.displayName ||
                          `${t.brandName || ''} ${t.modelName || ''}`.trim() ||
                          'Truck',
                        inMaintenance:
                          Boolean(t.blocked) &&
                          Boolean(t.maintenanceReadyAt) &&
                          new Date(t.maintenanceReadyAt).getTime() > Date.now(),
                        needsMaintenance:
                          Boolean(t.blocked) &&
                          (!t.maintenanceReadyAt || new Date(t.maintenanceReadyAt).getTime() <= Date.now()),
                      }))
                    : Array.from({ length: Math.max(3, Math.min(8, fleetSummary.total || 3)) }).map((_, idx) => ({
                        key: `empty-${idx + 1}`,
                        label: `Empty bay ${idx + 1}`,
                        inMaintenance: false,
                        needsMaintenance: false,
                      }))).map((slot, idx) => (
                    <Box
                      key={slot.key}
                      sx={{
                        px: 1,
                        py: 0.5,
                        minWidth: 120,
                        maxWidth: 190,
                        textAlign: 'center',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: slot.needsMaintenance
                          ? 'error.main'
                          : slot.inMaintenance
                            ? 'info.main'
                            : 'divider',
                        bgcolor: fleetTrucks.length ? 'background.paper' : 'transparent',
                        opacity: fleetTrucks.length ? 1 : 0.55,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
                        {slot.label}
                      </Typography>
                      {(slot.needsMaintenance || slot.inMaintenance) && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.25,
                            fontWeight: 700,
                            color: slot.needsMaintenance ? 'error.main' : 'info.main',
                          }}
                        >
                          {slot.needsMaintenance ? 'Needs maintenance' : 'In maintenance'}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
              {fleetSummary.blocked > 0 && isLeader && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  {fleetSummary.blocked} truck{fleetSummary.blocked === 1 ? '' : 's'} need
                  maintenance — fleet deliveries won&apos;t attach to those trucks until they&apos;re
                  back online. Pay in Fleet management.
                </Alert>
              )}
            </CardContent>
          </Card>
          )}

          {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Division leaderboard</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rider</TableCell>
                    <TableCell>Route (latest)</TableCell>
                    <TableCell align="right" sortDirection={lbSortKey === 'jobs' ? lbSortDir : false}>
                      <TableSortLabel
                        active={lbSortKey === 'jobs'}
                        direction={lbSortKey === 'jobs' ? lbSortDir : 'desc'}
                        onClick={() => toggleLbSort('jobs')}
                      >
                        Jobs
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={lbSortKey === 'distance' ? lbSortDir : false}>
                      <TableSortLabel
                        active={lbSortKey === 'distance'}
                        direction={lbSortKey === 'distance' ? lbSortDir : 'desc'}
                        onClick={() => toggleLbSort('distance')}
                      >
                        Distance (km)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={lbSortKey === 'revenue' ? lbSortDir : false}>
                      <TableSortLabel
                        active={lbSortKey === 'revenue'}
                        direction={lbSortKey === 'revenue' ? lbSortDir : 'desc'}
                        onClick={() => toggleLbSort('revenue')}
                      >
                        Revenue
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={lbSortKey === 'fuelBurned' ? lbSortDir : false}>
                      <TableSortLabel
                        active={lbSortKey === 'fuelBurned'}
                        direction={lbSortKey === 'fuelBurned' ? lbSortDir : 'desc'}
                        onClick={() => toggleLbSort('fuelBurned')}
                      >
                        Fuel burned (L)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" title="While in this division" sortDirection={lbSortKey === 'attendance' ? lbSortDir : false}>
                      <TableSortLabel
                        active={lbSortKey === 'attendance'}
                        direction={lbSortKey === 'attendance' ? lbSortDir : 'desc'}
                        onClick={() => toggleLbSort('attendance')}
                      >
                        Attend. (div.)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" title="All approved events (rider profile)" sortDirection={lbSortKey === 'lifetimeEventsAttended' ? lbSortDir : false}>
                      <TableSortLabel
                        active={lbSortKey === 'lifetimeEventsAttended'}
                        direction={lbSortKey === 'lifetimeEventsAttended' ? lbSortDir : 'desc'}
                        onClick={() => toggleLbSort('lifetimeEventsAttended')}
                      >
                        Events (all-time)
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedLb.map((r) => (
                    <TableRow key={r.riderId}>
                      <TableCell>
                        {`${r.name || r.username || 'Unknown rider'}${r.inDivision === false ? ' (not in division)' : ''}`}
                      </TableCell>
                      <TableCell>
                        {(r.startCity || r.startCompany || r.destinationCity || r.destinationCompany)
                          ? `${r.startCity || '—'}${r.startCompany ? ` (${r.startCompany})` : ''} → ${r.destinationCity || '—'}${r.destinationCompany ? ` (${r.destinationCompany})` : ''}`
                          : '—'}
                      </TableCell>
                      <TableCell align="right">{r.jobs}</TableCell>
                      <TableCell align="right">{Math.round(r.distance || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Math.round(r.revenue || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Math.round(r.fuelBurned || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{r.attendance ?? 0}</TableCell>
                      <TableCell align="right">{r.lifetimeEventsAttended ?? 0}</TableCell>
                    </TableRow>
                  ))}
                  {!lb.length && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No jobs yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          )}
          </AnimatedTabPanel>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={3.5}>
            <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <LocalShippingOutlined color="primary" />
                    <Typography fontWeight={700}>Fleet sidebar</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Chip size="small" label={`${fleetSummary.total} trucks`} />
                    <Chip
                      size="small"
                      color={fleetSummary.blocked ? 'error' : 'success'}
                      label={`${fleetSummary.blocked} blocked`}
                    />
                    {fleetSummary.blocked > 0 && (
                      <Chip
                        size="small"
                        color="warning"
                        label={`${Math.round(fleetSummary.maintenanceCost).toLocaleString()} tokens due`}
                      />
                    )}
                  </Stack>
                  <Stack spacing={1}>
                    {fleetTrucks.slice(0, 8).map((t) => {
                      const now = Date.now();
                      const wearPct = Math.min(
                        100,
                        Math.round((Number(t.wearKm || 0) / Math.max(1, Number(t.wearThresholdKm || 1))) * 100)
                      );
                      const readyAt = t.maintenanceReadyAt ? new Date(t.maintenanceReadyAt).getTime() : 0;
                      const inMaintenance = Boolean(t.blocked && readyAt > now);
                      const needsMaintenance = Boolean(t.blocked && !inMaintenance);
                      const statusLabel = inMaintenance
                        ? 'In maintenance'
                        : needsMaintenance
                          ? 'Needs maintenance'
                          : 'Available';
                      const statusColor = inMaintenance
                        ? 'info'
                        : needsMaintenance
                          ? 'error'
                          : 'success';
                      return (
                        <Stack
                          key={t._id || t.divisionTruckId || `${t.brandName}-${t.modelName}`}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                        >
                          <Avatar
                            src={t.image || t.brandLogo || undefined}
                            variant="rounded"
                            sx={{ width: 34, height: 34, bgcolor: 'background.paper' }}
                          >
                            {(t.brandName || t.displayName || 'T')[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {t.displayName || `${t.brandName || ''} ${t.modelName || ''}`.trim() || 'Truck'}
                            </Typography>
                            <Chip
                              size="small"
                              color={statusColor}
                              label={statusLabel}
                              sx={{ height: 20, mt: 0.35, mb: 0.25 }}
                            />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              Wear {wearPct}% · {(Number(t.odometerKm) || 0).toLocaleString()} km
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                    {!fleetTrucks.length && (
                      <Typography variant="body2" color="text.secondary">
                        No trucks in fleet yet.
                      </Typography>
                    )}
                    {fleetTrucks.length > 8 && (
                      <Typography variant="caption" color="text.secondary">
                        +{fleetTrucks.length - 8} more trucks in fleet.
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button size="small" variant="outlined" onClick={() => setTabAndSyncQuery(2)}>
                      Fleet tab
                    </Button>
                    {isLeader && (
                      <Button size="small" component={RouterLink} to="/trucks/marketplace" variant="contained">
                        Buy truck
                      </Button>
                    )}
                  </Stack>
                  {isAdmin && div?._id && (
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/admin/divisions/${div._id}`}
                      variant="text"
                      sx={{ mt: 1 }}
                    >
                      Open admin division tools
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      <Dialog open={taxDialogOpen} onClose={() => setTaxDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Division tax rate</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Job revenue tax percentage credited to the division wallet. Must be within the server maximum.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Tax %"
            type="number"
            value={taxPct}
            onChange={(e) => setTaxPct(e.target.value)}
            inputProps={{ min: 0, max: 100, step: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaxDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveTax} disabled={!div?._id}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </MagicPageShell>
  );
}
