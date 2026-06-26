import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Divider,
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
  FormControlLabel,
  Switch,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import MagicPageShell from '../components/magicui/MagicPageShell';
import AnimatedTabPanel from '../components/magicui/AnimatedTabPanel';
import DivisionWalletTransactionsPanel from '../components/division/DivisionWalletTransactionsPanel';
import MemberNudgeDialog from '../components/division/MemberNudgeDialog';
import { DriverPerformanceProvider } from '../contexts/DriverPerformanceContext';
import DriverPerformanceDashboard from '../components/DriverPerformance/Dashboard';
import { AdminEmptyState, useAdminFeedback } from '../components/admin/primitives';

const DIVISION_FUEL_CAPACITY_L = 20_000;

const DEFAULT_DW_NOTIFY = {
  jobDelivered: true,
  jobFuelSummary: true,
  tokenPayoutSummary: false,
  walletTreasury: true,
  memberLifecycle: true,
  fleetGarage: true,
  divisionSettings: true,
};

export default function AdminDivisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, Feedback } = useAdminFeedback();
  const [tab, setTab] = useState(0);
  const [division, setDivision] = useState(null);
  const [members, setMembers] = useState([]);
  const [lb, setLb] = useState([]);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [inactivityDays, setInactivityDays] = useState(14);
  const [onlyInactive, setOnlyInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [taxPct, setTaxPct] = useState('');
  const [walletForm, setWalletForm] = useState({ rider: null, amount: '', reason: '' });
  const [splitForm, setSplitForm] = useState({ amount: '', recipients: [] });

  const [inviteRider, setInviteRider] = useState(null);
  const [inviteOptions, setInviteOptions] = useState([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [leaderOptions, setLeaderOptions] = useState([]);
  const [leaderQuery, setLeaderQuery] = useState('');
  const [leaderLoading, setLeaderLoading] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLeader, setTransferLeader] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', logoUrl: '', bannerUrl: '', maxMembers: '' });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [trucks, setTrucks] = useState([]);
  const [trucksLoading, setTrucksLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [divisionJobs, setDivisionJobs] = useState([]);
  const [divisionJobsTotal, setDivisionJobsTotal] = useState(0);
  const [divisionJobsPage, setDivisionJobsPage] = useState(1);
  const [divisionJobsLimit] = useState(20);
  const [divisionJobsLoading, setDivisionJobsLoading] = useState(false);
  const [includeRemovedJobs, setIncludeRemovedJobs] = useState(false);
  const [investmentSummary, setInvestmentSummary] = useState({ totalInvested: 0, byRider: [] });

  const [dwWebhookUrl, setDwWebhookUrl] = useState('');
  const [dwNotify, setDwNotify] = useState(DEFAULT_DW_NOTIFY);
  const [savingDiscord, setSavingDiscord] = useState(false);

  const user = getItemWithExpiry('user') || {};
  const uid = String(user.id || user._id || '');
  const leaderIdStr = String(division?.leaderId || division?.leader?._id || '');
  const isLeader = Boolean(uid && leaderIdStr && uid === leaderIdStr);
  const canStaff = user.role === 'admin' || user.role === 'communityManager';
  const canEditSettings = canStaff;
  const canManageWallet = isLeader || user.role === 'admin';
  const canManageMembers = isLeader || canStaff;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/divisions/${id}`);
      setDivision(data.division);
      if (data.division && (user.role === 'admin' || user.role === 'communityManager')) {
        setDwWebhookUrl(data.division.discordWebhookUrl || '');
        setDwNotify({ ...DEFAULT_DW_NOTIFY, ...(data.division.discordWebhookNotify || {}) });
      }
      setAttendanceSummary(data.attendanceSummary || null);
      setTaxPct(String(data.division?.taxPercent ?? 0));
      const [m, l, inv, jr, invest] = await Promise.all([
        axiosInstance.get(`/divisions/${id}/members`),
        axiosInstance.get(`/divisions/${id}/leaderboard`),
        axiosInstance.get(`/divisions/${id}/invites`),
        axiosInstance.get(`/divisions/${id}/join-requests`).catch(() => ({ data: { requests: [] } })),
        axiosInstance.get(`/divisions/${id}/investments/summary`).catch(() => ({ data: { totalInvested: 0, byRider: [] } })),
      ]);
      setMembers(m.data.members || []);
      setInactivityDays(Number(m.data.inactivityDays) || 14);
      setLb(l.data.riders || []);
      setInvites(inv.data.invites || []);
      setJoinRequests(jr.data.requests || []);
      setInvestmentSummary({
        totalInvested: Number(invest?.data?.totalInvested) || 0,
        byRider: Array.isArray(invest?.data?.byRider) ? invest.data.byRider : [],
      });
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadTrucks = async () => {
    if (!id) return;
    setTrucksLoading(true);
    try {
      const { data } = await axiosInstance.get(`/divisions/${id}/trucks`);
      setTrucks(Array.isArray(data?.trucks) ? data.trucks : []);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load trucks');
    } finally {
      setTrucksLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 6 && id) loadTrucks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, id]);

  const loadDivisionJobs = async () => {
    if (!id) return;
    setDivisionJobsLoading(true);
    try {
      const { data } = await axiosInstance.get(`/divisions/${id}/jobs`, {
        params: {
          page: divisionJobsPage,
          limit: divisionJobsLimit,
          includeRemoved: includeRemovedJobs || undefined,
        },
      });
      setDivisionJobs(Array.isArray(data?.items) ? data.items : []);
      setDivisionJobsTotal(Number(data?.total) || 0);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load division jobs');
    } finally {
      setDivisionJobsLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== 7 || !id) return;
    loadDivisionJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, id, divisionJobsPage, includeRemovedJobs]);

  const removeDivisionJobFromStats = async (job) => {
    if (!window.confirm(`Remove job ${job?.jobID || job?._id} from this division's stats?`)) return;
    try {
      await axiosInstance.post(`/divisions/${id}/jobs/${job._id}/remove-from-stats`);
      await load();
      await loadDivisionJobs();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to remove job from division stats');
    }
  };

  const restoreDivisionJobToStats = async (job) => {
    if (!window.confirm(`Restore job ${job?.jobID || job?._id} into this division's stats?`)) return;
    try {
      await axiosInstance.post(`/divisions/${id}/jobs/${job._id}/restore-to-stats`);
      await load();
      await loadDivisionJobs();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to restore job into division stats');
    }
  };

  const patchTruck = async (truckId, body) => {
    // Defense-in-depth: the backend PATCH /trucks/:truckId/admin already
    // enforces adminOrCommunityManager. Refuse at the client too so an
    // inspected button can't surprise the user with a 403.
    if (!canStaff) {
      alert('Only admin or community manager can perform this action.');
      return;
    }
    try {
      await axiosInstance.patch(`/divisions/${id}/trucks/${truckId}/admin`, body);
      await loadTrucks();
    } catch (e) {
      alert(e?.response?.data?.message || 'Truck update failed');
    }
  };

  const forceMaintain = async (truckId) => {
    try {
      await axiosInstance.post(`/divisions/${id}/trucks/${truckId}/maintain`);
      await loadTrucks();
    } catch (e) {
      alert(e?.response?.data?.message || 'Maintenance failed');
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!canManageMembers) return;
      setInviteLoading(true);
      try {
        const { data } = await axiosInstance.get(`/divisions/${id}/eligible-invitees`, {
          params: { q: inviteQuery || undefined },
        });
        setInviteOptions(data.riders || []);
      } catch (_) {
        setInviteOptions([]);
      } finally {
        setInviteLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [inviteQuery, id, canManageMembers]);

  useEffect(() => {
    if (!transferOpen) return;
    const t = setTimeout(async () => {
      setLeaderLoading(true);
      try {
        const { data } = await axiosInstance.get('/divisions/leaders/search', {
          params: { q: leaderQuery || undefined, excludeDivisionId: id, limit: 25 },
        });
        setLeaderOptions(data.users || []);
      } catch (_) {
        setLeaderOptions([]);
      } finally {
        setLeaderLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [transferOpen, leaderQuery, id]);

  const openEdit = () => {
    if (!division) return;
    setEditForm({
      name: division.name || '',
      description: division.description || '',
      logoUrl: division.logoUrl || '',
      bannerUrl: division.bannerUrl || '',
      maxMembers: division.maxMembers == null ? '' : String(division.maxMembers),
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      await axiosInstance.patch(`/divisions/${id}`, {
        name: editForm.name.trim(),
        description: editForm.description,
        logoUrl: editForm.logoUrl.trim(),
        bannerUrl: editForm.bannerUrl.trim(),
        maxMembers: editForm.maxMembers === '' ? null : Number(editForm.maxMembers),
      });
      setEditOpen(false);
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Save failed');
    }
  };

  const saveDiscordWebhook = async () => {
    if (!canStaff) return;
    setSavingDiscord(true);
    try {
      await axiosInstance.patch(`/divisions/${id}`, {
        discordWebhookUrl: dwWebhookUrl.trim(),
        discordWebhookNotify: dwNotify,
      });
      await load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Discord webhook settings failed to save');
    } finally {
      setSavingDiscord(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteRider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${id}/invites`, { riderId: inviteRider._id });
      setInviteRider(null);
      setInviteQuery('');
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Invite failed');
    }
  };

  const addMember = async () => {
    if (!inviteRider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${id}/members`, { riderId: inviteRider._id });
      setInviteRider(null);
      setInviteQuery('');
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Add member failed');
    }
  };

  const saveTax = async () => {
    try {
      await axiosInstance.patch(`/divisions/${id}/tax`, { taxPercent: Number(taxPct) });
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Tax update failed');
    }
  };

  const distribute = async () => {
    if (!walletForm.rider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${id}/wallet/distribute`, {
        riderId: walletForm.rider._id,
        amount: Number(walletForm.amount),
        reason: walletForm.reason,
      });
      setWalletForm({ rider: null, amount: '', reason: '' });
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Distribute failed');
    }
  };

  const split = async () => {
    try {
      const ids = (splitForm.recipients || []).map((r) => r._id).filter(Boolean);
      if (!ids.length) return;
      await axiosInstance.post(`/divisions/${id}/wallet/split`, {
        amount: Number(splitForm.amount),
        recipientRiderIds: ids,
        mode: 'equal',
      });
      setSplitForm({ amount: '', recipients: [] });
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Split failed');
    }
  };

  const kick = async (riderId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axiosInstance.post(`/divisions/${id}/members/${riderId}/kick`);
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Kick failed');
    }
  };

  const staffRemove = async (riderId) => {
    if (!window.confirm('Remove this member as staff?')) return;
    try {
      await axiosInstance.post(`/divisions/${id}/members/${riderId}/remove`);
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Remove failed');
    }
  };

  const transferLeadership = async () => {
    if (!transferLeader?._id) return;
    try {
      await axiosInstance.patch(`/divisions/${id}/leader`, { leaderId: transferLeader._id });
      setTransferOpen(false);
      setTransferLeader(null);
      load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Transfer failed');
    }
  };

  const openDelete = () => {
    setDeleteConfirm('');
    setDeleteOpen(true);
  };

  const submitDelete = async () => {
    if (!division || deleteConfirm !== division.name) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/divisions/${id}`);
      setDeleteOpen(false);
      navigate('/admin/divisions');
    } catch (e) {
      showError(e?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const memberById = useMemo(() => new Map(members.map((m) => [String(m._id), m])), [members]);
  const premiumFuel = Math.max(0, Number(division?.fuelTankPremiumLiters) || 0);
  const standardFuel = Math.max(0, Number(division?.fuelTankNormalLiters ?? division?.fuelTankLiters) || 0);
  const totalFuel = premiumFuel + standardFuel;
  const premiumPct = Math.max(0, Math.min(100, (premiumFuel / DIVISION_FUEL_CAPACITY_L) * 100));
  const standardPct = Math.max(0, Math.min(100, (standardFuel / DIVISION_FUEL_CAPACITY_L) * 100));
  const fuelFillPct = Math.max(
    0,
    Math.min(100, Math.round((totalFuel / DIVISION_FUEL_CAPACITY_L) * 100))
  );
  const fuelStatus = totalFuel <= 0
    ? { label: 'Empty', color: 'error' }
    : fuelFillPct < 20
      ? { label: 'Low', color: 'warning' }
      : fuelFillPct < 80
        ? { label: 'Healthy', color: 'success' }
        : { label: 'Near full', color: 'info' };

  return (
    <MagicPageShell>
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={RouterLink} to="/admin/divisions" sx={{ mb: 2 }}>
        Back to divisions
      </Button>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {division && (
        <Card sx={{ mb: 3, overflow: 'hidden' }} variant="outlined">
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1920 / 500',
              bgcolor: 'common.black',
              overflow: 'hidden',
            }}
          >
            {division.bannerUrl ? (
              <CardMedia
                component="img"
                image={division.bannerUrl}
                alt="banner"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})` }} />
            )}
          </Box>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Avatar
                src={division.logoUrl || undefined}
                sx={{ width: 72, height: 72, mt: -6, border: '3px solid', borderColor: 'background.paper', boxShadow: 3 }}
              >
                {division.name?.[0] || 'D'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5" fontWeight={800} noWrap>{division.name}</Typography>
                  <Chip size="small" label={`/${division.slug}`} />
                  {!division.active && <Chip size="small" color="warning" label="Inactive" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {division.description || 'No description yet.'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={`Members: ${division.memberCount ?? 0}${division.maxMembers ? ` / ${division.maxMembers}` : ''}`} />
                  <Chip size="small" label={`Wallet: ${(division.walletBalance ?? 0).toLocaleString()}`} />
                  <Chip size="small" label={`Tax: ${division.taxPercent ?? 0}%`} />
                  <Chip size="small" color={fuelStatus.color} label={`Fuel: ${fuelStatus.label} (${fuelFillPct}%)`} />
                  <Chip size="small" variant="outlined" label={`Total fuel: ${Math.round(totalFuel).toLocaleString()} / ${DIVISION_FUEL_CAPACITY_L.toLocaleString()} L`} />
                  <Chip size="small" variant="outlined" label={`Premium ${Math.round(premiumFuel).toLocaleString()} L · Standard ${Math.round(standardFuel).toLocaleString()} L`} />
                  <Chip size="small" label={`Leader: ${division.leader?.username || '—'}`} />
                </Stack>
              </Box>
              <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
                <Tooltip title="Open public page">
                  <IconButton component={RouterLink} to={`/divisions/${division.slug}`} target="_blank" rel="noopener">
                    <OpenInNewOutlined />
                  </IconButton>
                </Tooltip>
                {(isLeader || canEditSettings) && (
                  <Button size="small" startIcon={<SwapHorizOutlined />} onClick={() => setTransferOpen(true)} variant="outlined">
                    Transfer leader
                  </Button>
                )}
                {canEditSettings && (
                  <>
                    <Button size="small" startIcon={<EditOutlined />} onClick={openEdit} variant="outlined">
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteOutlineOutlined />}
                      onClick={openDelete}
                      variant="outlined"
                      color="error"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Overview" />
        <Tab label="Members" />
        <Tab label="Leaderboard" />
        <Tab label="Wallet" />
        <Tab label="Invites" />
        <Tab
          label={`Requests${joinRequests.length ? ` (${joinRequests.length})` : ''}`}
        />
        <Tab label={`Trucks${trucks.length ? ` (${trucks.length})` : ''}`} />
        <Tab label={`Jobs${divisionJobsTotal ? ` (${divisionJobsTotal})` : ''}`} />
        <Tab label="Performance" />
      </Tabs>

      <AnimatedTabPanel panelKey={`admin-division-tab-${tab}`}>
      {tab === 0 && division && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexWrap="wrap">
              <Box><Typography variant="caption" color="text.secondary">Members</Typography><Typography variant="h6">{division.memberCount ?? 0}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Wallet balance</Typography><Typography variant="h6">{(division.walletBalance ?? 0).toLocaleString()} tokens</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Tax rate</Typography><Typography variant="h6">{division.taxPercent ?? 0}%</Typography></Box>
              <Box sx={{ minWidth: 260, width: '100%', maxWidth: 360 }}>
                <Typography variant="caption" color="text.secondary">Fuel status</Typography>
                <Typography variant="h6">{fuelStatus.label} ({fuelFillPct}%)</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(totalFuel).toLocaleString()} / {DIVISION_FUEL_CAPACITY_L.toLocaleString()} L total
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  {/* Fuel Tank Visualization */}
                  <Box sx={{ position: 'relative', width: 70, height: 140, flexShrink: 0 }}>
                    {/* Tank outline */}
                    <Box sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '10px 10px 6px 6px',
                      border: `3px solid`,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: `inset 0 3px 8px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`,
                    }} />

                    {/* Tank body details */}
                    <Box sx={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      right: 6,
                      bottom: 6,
                      borderRadius: '6px 6px 3px 3px',
                      border: `1px solid`,
                      borderColor: 'divider',
                      opacity: 0.3,
                    }} />

                    {/* Measurement markings */}
                    {[25, 50, 75].map((mark) => (
                      <Box key={mark} sx={{
                        position: 'absolute',
                        left: -6,
                        right: -6,
                        top: `${100 - mark}%`,
                        height: '1px',
                        bgcolor: 'divider',
                        opacity: 0.5,
                      }} />
                    ))}

                    {/* Fuel level */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${fuelFillPct}%`,
                      borderRadius: '6px 6px 3px 3px',
                      overflow: 'hidden',
                      transition: 'height 1.2s cubic-bezier(.22,1,.36,1)',
                      boxShadow: `inset 0 1px 2px rgba(0,0,0,0.2)`,
                    }}>
                      {/* Premium fuel (bottom layer) */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${totalFuel > 0 ? (premiumFuel / totalFuel) * 100 : 0}%`,
                        background: `linear-gradient(180deg, #f59e0bdd 0%, #f59e0b 100%)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }} />
                      {/* Standard fuel (top layer) */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: `${totalFuel > 0 ? (premiumFuel / totalFuel) * 100 : 0}%`,
                        left: 0,
                        right: 0,
                        height: `${totalFuel > 0 ? (standardFuel / totalFuel) * 100 : 0}%`,
                        background: `linear-gradient(180deg, #38bdf8dd 0%, #38bdf8 100%)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3)`,
                      }} />
                    </Box>

                    {/* Tank cap */}
                    <Box sx={{
                      position: 'absolute',
                      top: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 20,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'divider',
                      border: `2px solid`,
                      borderColor: 'divider',
                      boxShadow: `0 1px 3px rgba(0,0,0,0.2)`,
                    }} />

                    {/* Fill level indicator */}
                    <Box sx={{
                      position: 'absolute',
                      right: -28,
                      top: `${100 - fuelFillPct}%`,
                      transform: 'translateY(-50%)',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'text.primary',
                      bgcolor: 'background.paper',
                      px: 0.75,
                      py: 0.5,
                      borderRadius: 1,
                      border: `1px solid`,
                      borderColor: 'divider',
                      whiteSpace: 'nowrap',
                      boxShadow: `0 2px 4px rgba(0,0,0,0.1)`,
                    }}>
                      {fuelFillPct}%
                    </Box>
                  </Box>

                  {/* Fuel details */}
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 0.5, opacity: 0.9 }} />
                        <Typography variant="caption" color="text.secondary">Premium {Math.round(premiumFuel).toLocaleString()} L</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'info.main', borderRadius: 0.5, opacity: 0.9 }} />
                        <Typography variant="caption" color="text.secondary">Standard {Math.round(standardFuel).toLocaleString()} L</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Unique events (members)</Typography>
                <Typography variant="h6">{attendanceSummary?.uniqueEventsAttended ?? '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Internal events: {attendanceSummary?.uniqueAttendanceEvents ?? 0} · TMP HR: {attendanceSummary?.uniqueHrEvents ?? 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Recorded attendances</Typography>
                <Typography variant="h6">{attendanceSummary?.totalAttendancesRecorded ?? division.stats?.totalEventsAttended ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary">Approved marks while in division</Typography>
              </Box>
              <Box><Typography variant="caption" color="text.secondary">Leader</Typography><Typography variant="h6">{division.leader?.username || '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Created</Typography><Typography variant="h6">{new Date(division.createdAt).toLocaleDateString()}</Typography></Box>
            </Stack>

            {canStaff && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Discord — division webhook
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  When set, lifecycle and wallet events go to this URL instead of the global{' '}
                  <code>DISCORD_WEBHOOK_DIVISIONS</code> channel. Member job posts use the same URL.
                </Typography>
                <TextField
                  label="Discord webhook URL"
                  placeholder="https://discord.com/api/webhooks/…"
                  value={dwWebhookUrl}
                  onChange={(e) => setDwWebhookUrl(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  helperText="Must start with https://discord.com/api/webhooks/ — create a webhook in your division server channel."
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  What to send (only applies when a webhook URL is set above)
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={dwNotify.jobDelivered} onChange={(e) => setDwNotify((p) => ({ ...p, jobDelivered: e.target.checked }))} />}
                    label="Member job deliveries (route, cargo, distance, job value)"
                  />
                  <FormControlLabel
                    control={<Switch checked={dwNotify.jobFuelSummary} onChange={(e) => setDwNotify((p) => ({ ...p, jobFuelSummary: e.target.checked }))} />}
                    label="Fuel after each job (burned + tank % / liters)"
                  />
                  <FormControlLabel
                    control={<Switch checked={dwNotify.tokenPayoutSummary} onChange={(e) => setDwNotify((p) => ({ ...p, tokenPayoutSummary: e.target.checked }))} />}
                    label="Token payout snippet (gross, division levy, net to rider)"
                  />
                  <FormControlLabel
                    control={<Switch checked={dwNotify.walletTreasury} onChange={(e) => setDwNotify((p) => ({ ...p, walletTreasury: e.target.checked }))} />}
                    label="Wallet: payouts, splits, levy refunds"
                  />
                  <FormControlLabel
                    control={<Switch checked={dwNotify.memberLifecycle} onChange={(e) => setDwNotify((p) => ({ ...p, memberLifecycle: e.target.checked }))} />}
                    label="Members: join requests, kicks, acceptances"
                  />
                  <FormControlLabel
                    control={<Switch checked={dwNotify.fleetGarage} onChange={(e) => setDwNotify((p) => ({ ...p, fleetGarage: e.target.checked }))} />}
                    label="Fleet: truck purchases & maintenance"
                  />
                  <FormControlLabel
                    control={<Switch checked={dwNotify.divisionSettings} onChange={(e) => setDwNotify((p) => ({ ...p, divisionSettings: e.target.checked }))} />}
                    label="Admin: created/deleted, leader change, tax % updates"
                  />
                </Stack>
                <Button variant="contained" onClick={saveDiscordWebhook} disabled={savingDiscord}>
                  {savingDiscord ? 'Saving…' : 'Save Discord settings'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            {(() => {
              const inactiveCount = members.filter((m) => m.inactive && !m.isLeader).length;
              const visible = onlyInactive ? members.filter((m) => m.inactive || m.isLeader) : members;
              return (
                <>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Inactivity threshold: <b>{inactivityDays} days</b> since last job
                      {inactiveCount > 0 && (
                        <> · <Chip size="small" color="warning" label={`${inactiveCount} inactive`} sx={{ ml: 0.5 }} /></>
                      )}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant={onlyInactive ? 'contained' : 'outlined'}
                        color="warning"
                        onClick={() => setOnlyInactive((v) => !v)}
                      >
                        {onlyInactive ? 'Showing inactive only' : 'Filter inactive'}
                      </Button>
                      {canStaff && inactiveCount > 0 && (
                        <Button size="small" variant="outlined" onClick={() => setNudgeOpen(true)}>
                          Nudge templates…
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Activity</TableCell>
                        <TableCell align="right" title="While in this division">Attend. (div.)</TableCell>
                        <TableCell align="right" title="All approved events on rider profile">Events (all-time)</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        {canManageMembers && <TableCell align="right">Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visible.map((m) => (
                        <TableRow
                          key={m._id}
                          sx={{
                            ...(m.isLeader ? { bgcolor: 'action.hover' } : {}),
                            ...(m.inactive && !m.isLeader ? { '& td': { color: 'text.secondary' } } : {}),
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar src={m.avatar || undefined} sx={{ width: 28, height: 28 }}>{m.name?.[0]}</Avatar>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                                  {m.isLeader && <Chip size="small" color="primary" label="Leader" />}
                                  {m.inactive && !m.isLeader && (
                                    <Chip size="small" color="warning" variant="outlined" label="Inactive" />
                                  )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary">{m.username}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{m.employeeID}</TableCell>
                          <TableCell>
                            {m.lastJobAt ? (
                              <Typography variant="caption">
                                {m.daysSinceLastJob === 0
                                  ? 'Today'
                                  : `${m.daysSinceLastJob}d ago`}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                  · {new Date(m.lastJobAt).toLocaleDateString()}
                                </Typography>
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">No jobs yet</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">{m.eventsAttendedInDivision ?? 0}</TableCell>
                          <TableCell align="right">{m.lifetimeEventsAttended ?? 0}</TableCell>
                          <TableCell align="right">{(m.balance ?? 0).toLocaleString()}</TableCell>
                          {canManageMembers && (
                            <TableCell align="right">
                              {!m.isLeader && (isLeader || user.role === 'admin') && (
                                <Button size="small" color="error" onClick={() => kick(m._id)}>Kick</Button>
                              )}
                              {!m.isLeader && (user.role === 'admin' || (user.role === 'communityManager' && !isLeader)) && (
                                <Button size="small" color="warning" sx={{ ml: 1 }} onClick={() => staffRemove(m._id)}>
                                  Remove
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {!visible.length && (
                        <TableRow>
                          <TableCell colSpan={canManageMembers ? 7 : 6} sx={{ border: 0 }}>
                            <AdminEmptyState
                              title={onlyInactive ? 'No inactive members' : 'No members yet'}
                              description={onlyInactive ? 'All members have been active recently.' : 'Invite riders to join this division.'}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rider</TableCell>
                  <TableCell align="right">Jobs</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Attend. (div.)</TableCell>
                  <TableCell align="right">Events (all-time)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lb.map((r) => (
                  <TableRow key={r.riderId}>
                    <TableCell>
                      {`${r.name || r.username || 'Unknown rider'}${r.inDivision === false ? ' (not in division)' : ''}`}
                    </TableCell>
                    <TableCell align="right">{r.jobs}</TableCell>
                    <TableCell align="right">{Math.round(r.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">{Math.round(r.taxContributed || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">{r.attendance ?? 0}</TableCell>
                    <TableCell align="right">{r.lifetimeEventsAttended ?? 0}</TableCell>
                  </TableRow>
                ))}
                {!lb.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No jobs yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Member investments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Total invested into division wallet: {Math.round(investmentSummary.totalInvested || 0).toLocaleString()}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell align="right">Invested total</TableCell>
                    <TableCell align="right">Entries</TableCell>
                    <TableCell>Last invested</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(investmentSummary.byRider || []).map((row) => (
                    <TableRow key={String(row.riderId)}>
                      <TableCell>
                        {row.riderName || row.riderUsername || row.riderEmployeeId || String(row.riderId)}
                      </TableCell>
                      <TableCell align="right">{Math.round(Number(row.totalInvested || 0)).toLocaleString()}</TableCell>
                      <TableCell align="right">{Number(row.investmentCount || 0).toLocaleString()}</TableCell>
                      <TableCell>{row.lastInvestedAt ? new Date(row.lastInvestedAt).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                  {!investmentSummary.byRider?.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No investments yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <DivisionWalletTransactionsPanel divisionId={id} title="Recent transactions" limit={80} dense />
            </CardContent>
          </Card>

          {canManageWallet && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 2 }}>Wallet actions</Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Autocomplete
                      options={members}
                      value={walletForm.rider}
                      onChange={(_, v) => setWalletForm((p) => ({ ...p, rider: v }))}
                      getOptionLabel={(o) => o ? `${o.name} (${o.employeeID || ''})` : ''}
                      isOptionEqualToValue={(a, b) => a?._id === b?._id}
                      sx={{ minWidth: 240, flex: 1 }}
                      renderInput={(params) => <TextField {...params} size="small" label="Member" />}
                    />
                    <TextField label="Amount" type="number" size="small" value={walletForm.amount} onChange={(e) => setWalletForm((p) => ({ ...p, amount: e.target.value }))} />
                    <TextField label="Reason" size="small" value={walletForm.reason} onChange={(e) => setWalletForm((p) => ({ ...p, reason: e.target.value }))} />
                    <Button variant="contained" onClick={distribute} disabled={!walletForm.rider || !(Number(walletForm.amount) > 0)}>
                      Distribute
                    </Button>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Split amount" type="number" size="small" value={splitForm.amount} onChange={(e) => setSplitForm((p) => ({ ...p, amount: e.target.value }))} />
                    <Autocomplete
                      multiple
                      options={members}
                      value={splitForm.recipients}
                      onChange={(_, v) => setSplitForm((p) => ({ ...p, recipients: v }))}
                      getOptionLabel={(o) => `${o.name}`}
                      isOptionEqualToValue={(a, b) => a?._id === b?._id}
                      sx={{ minWidth: 260, flex: 1 }}
                      renderInput={(params) => <TextField {...params} size="small" label="Recipients" />}
                    />
                    <Button variant="outlined" onClick={split} disabled={!splitForm.recipients?.length || !(Number(splitForm.amount) > 0)}>
                      Split equally
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {(isLeader || user.role === 'admin') && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 2 }}>Tax rate</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField label="Tax %" type="number" size="small" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
                  <Button variant="contained" onClick={saveTax}>Save tax</Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {tab === 4 && (
        <Card>
          <CardContent>
            {canManageMembers && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
                <Button variant="contained" onClick={addMember} disabled={!inviteRider?._id}>Add member</Button>
                <Button variant="outlined" onClick={sendInvite} disabled={!inviteRider?._id}>Send invite</Button>
              </Stack>
            )}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rider</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Expires</TableCell>
                  {canManageMembers && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {invites.map((i) => (
                  <TableRow key={i._id}>
                    <TableCell>{i.riderId?.name || i.riderId?._id}</TableCell>
                    <TableCell>{i.status}</TableCell>
                    <TableCell>{i.expiresAt ? new Date(i.expiresAt).toLocaleString() : '—'}</TableCell>
                    {canManageMembers && (
                      <TableCell align="right">
                        {i.status === 'pending' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={async () => {
                              try {
                                await axiosInstance.delete(`/divisions/${id}/invites/${i._id}`);
                                load();
                              } catch (e) {
                                showError(e?.response?.data?.message || 'Cancel failed');
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!invites.length && (
                  <TableRow>
                    <TableCell colSpan={canManageMembers ? 4 : 3} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No invites yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Rider applications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Riders can apply to join from this division's public page. Accept or reject their requests below.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rider</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Applied</TableCell>
                  {canManageMembers && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {joinRequests.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={r.rider?.avatar || undefined} sx={{ width: 28, height: 28 }}>
                          {r.rider?.name?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {r.rider?.name || r.riderId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.rider?.employeeID || ''}{r.rider?.employeeID && r.rider?.username ? ' · ' : ''}{r.rider?.username || ''}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" color={r.message ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
                        {r.message || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</TableCell>
                    {canManageMembers && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={async () => {
                              try {
                                await axiosInstance.post(`/divisions/${id}/join-requests/${r._id}/accept`);
                                load();
                              } catch (e) {
                                alert(e?.response?.data?.message || 'Failed to accept');
                              }
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={async () => {
                              try {
                                await axiosInstance.post(`/divisions/${id}/join-requests/${r._id}/reject`);
                                load();
                              } catch (e) {
                                alert(e?.response?.data?.message || 'Failed to reject');
                              }
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!joinRequests.length && (
                  <TableRow>
                    <TableCell colSpan={canManageMembers ? 4 : 3} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No pending applications.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 6 && (
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }} spacing={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Division fleet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trucks purchased from the division wallet. Blocked trucks freeze the division's
                  tax contribution for matching jobs until maintenance is paid.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {canStaff && (
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    component={RouterLink}
                    to={`/admin/operations/fleet-odometer?divisionId=${id}`}
                  >
                    Fix odometer…
                  </Button>
                )}
                <Button size="small" variant="outlined" onClick={loadTrucks} disabled={trucksLoading}>
                  {trucksLoading ? 'Loading…' : 'Refresh'}
                </Button>
              </Stack>
            </Stack>
            {trucksLoading && <LinearProgress sx={{ mb: 1 }} />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Truck</TableCell>
                  <TableCell align="right">Odometer</TableCell>
                  <TableCell align="right">Deliveries</TableCell>
                  <TableCell>Wear</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Purchased</TableCell>
                  {canStaff && <TableCell align="right">Admin</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {trucks.map((t) => {
                  const pct = Math.min(
                    100,
                    Math.round((Number(t.wearKm || 0) / Math.max(1, Number(t.wearThresholdKm || 1))) * 100)
                  );
                  return (
                    <TableRow key={t._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={t.image || t.brandLogo || undefined}
                            variant="rounded"
                            sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}
                          >
                            {(t.brandName || 'T')[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {t.displayName || `${t.brandName || ''} ${t.modelName || ''}`.trim()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t.brandName} · {t.modelName}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        {Math.round(Number(t.odometerKm) || 0).toLocaleString()} km
                      </TableCell>
                      <TableCell align="right">{t.deliveriesCount || 0}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={pct >= 100 ? 'error' : pct >= 70 ? 'warning' : 'success'}
                          label={`${pct}%`}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {(() => {
                          if (t.retired) return <Chip size="small" color="default" label="Retired" />;
                          const readyAt = t.maintenanceReadyAt
                            ? new Date(t.maintenanceReadyAt).getTime()
                            : 0;
                          const inService = t.blocked && readyAt > Date.now();
                          if (inService) {
                            const mins = Math.max(
                              1,
                              Math.ceil((readyAt - Date.now()) / 60000)
                            );
                            return (
                              <Chip
                                size="small"
                                color="info"
                                label={`In garage · ${mins}m left`}
                              />
                            );
                          }
                          if (t.blocked) return <Chip size="small" color="error" label="Blocked" />;
                          return <Chip size="small" color="success" label="Operational" />;
                        })()}
                      </TableCell>
                      <TableCell>
                        {t.purchasedAt ? new Date(t.purchasedAt).toLocaleDateString() : '—'}
                      </TableCell>
                      {canStaff && (
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                            {/*
                              Staff-only overrides (admin + communityManager).
                              Skip timer / Force unblock / Block are hidden
                              from everyone else and rejected at both the
                              client (patchTruck guard) and the server
                              (adminOrCommunityManagerAuth on PATCH /admin).
                            */}
                            {(() => {
                              const readyAt = t.maintenanceReadyAt
                                ? new Date(t.maintenanceReadyAt).getTime()
                                : 0;
                              const inService = t.blocked && readyAt > Date.now();
                              if (inService) {
                                return (
                                  <Tooltip title="Admin / Community Manager: finish the repair immediately without waiting for the timer">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="info"
                                      onClick={() => patchTruck(t._id, { skipMaintenance: true })}
                                    >
                                      Skip timer
                                    </Button>
                                  </Tooltip>
                                );
                              }
                              if (t.blocked) {
                                return (
                                  <Tooltip title="Admin / Community Manager: clear block without charging the wallet">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => patchTruck(t._id, { blocked: false, wearKm: 0 })}
                                    >
                                      Force unblock
                                    </Button>
                                  </Tooltip>
                                );
                              }
                              return (
                                <Tooltip title="Admin / Community Manager: force this truck into maintenance">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => patchTruck(t._id, { blocked: true })}
                                  >
                                    Block
                                  </Button>
                                </Tooltip>
                              );
                            })()}
                            <Tooltip title="Pay for maintenance from the division wallet (starts the garage timer)">
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  disabled={
                                    !t.blocked && pct < 70
                                      ? true
                                      : t.blocked &&
                                        t.maintenanceReadyAt &&
                                        new Date(t.maintenanceReadyAt).getTime() > Date.now()
                                  }
                                  onClick={() => forceMaintain(t._id)}
                                >
                                  Maintain
                                </Button>
                              </span>
                            </Tooltip>
                            {!t.retired && (
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (window.confirm('Retire this truck? It will no longer accrue odometer.')) {
                                    patchTruck(t._id, { retired: true });
                                  }
                                }}
                              >
                                Retire
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {!trucks.length && !trucksLoading && (
                  <TableRow>
                    <TableCell colSpan={canStaff ? 7 : 6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        This division does not own any trucks yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {tab === 7 && (
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Division jobs</Typography>
                <Typography variant="body2" color="text.secondary">
                  Reconcile or remove individual delivered jobs from this division's stats.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button size="small" variant="outlined" onClick={loadDivisionJobs} disabled={divisionJobsLoading}>
                  {divisionJobsLoading ? 'Loading…' : 'Refresh'}
                </Button>
                <Button
                  size="small"
                  variant={includeRemovedJobs ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => {
                    setDivisionJobsPage(1);
                    setIncludeRemovedJobs((v) => !v);
                  }}
                >
                  {includeRemovedJobs ? 'Showing removed too' : 'Show removed'}
                </Button>
              </Stack>
            </Stack>
            {divisionJobsLoading && <LinearProgress sx={{ mb: 1 }} />}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job ID</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell align="right">Distance</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell align="right">Admin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {divisionJobs.map((j) => {
                  const revenueValue = Number(j?.normalized?.revenueValue);
                  const displayRevenue = Number.isFinite(revenueValue)
                    ? revenueValue
                    : Number(j?.revenue ?? j?.income ?? 0);
                  const removed = Boolean(j?.divisionStatsManuallyExcluded);
                  return (
                    <TableRow key={j._id} hover>
                      <TableCell>{j.jobID ?? '—'}</TableCell>
                      <TableCell>{j?.driver?.username || '—'}</TableCell>
                      <TableCell>{j?.source?.city?.name || '—'} → {j?.destination?.city?.name || '—'}</TableCell>
                      <TableCell align="right">{Math.round(Number(j?.distanceDriven) || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Math.round(displayRevenue || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={removed ? 'warning' : 'success'}
                          variant={removed ? 'filled' : 'outlined'}
                          label={removed ? 'Removed from stats' : 'Included'}
                        />
                      </TableCell>
                      <TableCell>{new Date(j.completedAt || j.createdAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {removed ? (
                          <Button size="small" variant="contained" onClick={() => restoreDivisionJobToStats(j)}>
                            Restore
                          </Button>
                        ) : (
                          <Button size="small" color="warning" variant="outlined" onClick={() => removeDivisionJobFromStats(j)}>
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!divisionJobs.length && !divisionJobsLoading && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ border: 0 }}>
                      <AdminEmptyState
                        title="No jobs found"
                        description="No jobs found for this division."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Pagination
                count={Math.max(1, Math.ceil(divisionJobsTotal / divisionJobsLimit))}
                page={divisionJobsPage}
                onChange={(_, p) => setDivisionJobsPage(p)}
                shape="rounded"
                size="small"
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 8 && division && (
        <DriverPerformanceProvider divisionId={id}>
          <DriverPerformanceDashboard divisionId={id} />
        </DriverPerformanceProvider>
      )}
      </AnimatedTabPanel>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit division</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} fullWidth required />
            <TextField label="Description" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} fullWidth multiline minRows={2} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Logo URL" value={editForm.logoUrl} onChange={(e) => setEditForm((p) => ({ ...p, logoUrl: e.target.value }))} fullWidth />
              <TextField label="Banner URL" value={editForm.bannerUrl} onChange={(e) => setEditForm((p) => ({ ...p, bannerUrl: e.target.value }))} fullWidth />
            </Stack>
            {(editForm.logoUrl || editForm.bannerUrl) && (
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px dashed', borderColor: 'divider' }}>
                {editForm.bannerUrl ? (
                  <Box component="img" src={editForm.bannerUrl} alt="Banner preview" sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <Box sx={{ height: 120, bgcolor: 'action.hover' }} />
                )}
                <Avatar
                  src={editForm.logoUrl || undefined}
                  sx={{ position: 'absolute', bottom: 8, left: 16, width: 48, height: 48, border: '2px solid', borderColor: 'background.paper' }}
                >
                  {editForm.name?.[0] || 'D'}
                </Avatar>
              </Box>
            )}
            <TextField label="Max members (blank = unlimited)" type="number" value={editForm.maxMembers} onChange={(e) => setEditForm((p) => ({ ...p, maxMembers: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={!editForm.name.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Transfer leadership</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              The new leader must be an approved user that is not leading any other active division.
            </Alert>
            <Autocomplete
              options={leaderOptions}
              loading={leaderLoading}
              value={transferLeader}
              getOptionLabel={(o) => o ? `${o.username} (${o.email})` : ''}
              isOptionEqualToValue={(a, b) => a?._id === b?._id}
              onInputChange={(_, v, reason) => { if (reason === 'input') setLeaderQuery(v); }}
              onChange={(_, v) => setTransferLeader(v)}
              renderOption={(props, o) => (
                <li {...props}>
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>{o.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{o.email} · {o.role}</Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="New leader" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={transferLeadership} disabled={!transferLeader?._id}>
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete division</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will deactivate the division, detach all active members, and cancel pending invites. Wallet
              transactions and historical data are preserved.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              To confirm, type the division name: <b>{division?.name}</b>
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={division?.name || ''}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitDelete}
            disabled={deleting || !division || deleteConfirm !== division.name}
          >
            {deleting ? 'Deleting…' : 'Delete division'}
          </Button>
        </DialogActions>
      </Dialog>

      <MemberNudgeDialog
        open={nudgeOpen}
        onClose={() => setNudgeOpen(false)}
        divisionName={division?.name || 'Division'}
        inactivityDays={inactivityDays}
        inactiveMembers={members.filter((m) => m.inactive && !m.isLeader)}
      />
      <Feedback />
    </Container>
    </MagicPageShell>
  );
}
