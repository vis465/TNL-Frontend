import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import LocalAtmOutlined from '@mui/icons-material/LocalAtmOutlined';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import { motion } from 'framer-motion';
import { Landmark, Receipt, Sparkles, Users, WalletCards } from 'lucide-react';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import DivisionGlobalBanner from '../components/DivisionGlobalBanner';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { alpha, useTheme } from '@mui/material/styles';

export default function DivisionPublic() {
  const theme = useTheme();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myStateLoading, setMyStateLoading] = useState(false);
  const [myDivision, setMyDivision] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyBusy, setApplyBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [memberSort, setMemberSort] = useState('revenue');
  const [memberDir, setMemberDir] = useState('desc');

  const leaderboard = data?.leaderboard;
  const sortedLeaderboard = useMemo(() => {
    const rows = [...(leaderboard || [])];
    rows.sort((a, b) => {
      if (memberSort === 'name') {
        return memberDir === 'asc'
          ? String(a.name || '').localeCompare(String(b.name || ''))
          : String(b.name || '').localeCompare(String(a.name || ''));
      }
      const av = Number(a[memberSort] || 0);
      const bv = Number(b[memberSort] || 0);
      return memberDir === 'asc' ? av - bv : bv - av;
    });
    return rows;
  }, [leaderboard, memberSort, memberDir]);

  const toggleMemberSort = (key) => {
    setMemberDir((prev) => (memberSort === key ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'));
    setMemberSort(key);
  };

  const user = getItemWithExpiry('user');
  const isAuthed = Boolean(user?.token || user?.id || user?._id);
  const leadsDivision = user?.leadsDivision || null;
  const userId = String(user?.id || user?._id || '');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: d } = await axiosInstance.get(`/divisions/public/${slug}`);
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.message || 'Division not found');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadMyState = async () => {
    if (!isAuthed) return;
    setMyStateLoading(true);
    try {
      const [divRes, reqRes] = await Promise.all([
        axiosInstance.get('/me/division').catch(() => ({ data: { division: null } })),
        axiosInstance.get('/me/division/join-requests').catch(() => ({ data: { requests: [] } })),
      ]);
      setMyDivision(divRes.data?.division || null);
      setMyRequests(reqRes.data?.requests || []);
    } catch (_) {
      /* ignored for public page */
    } finally {
      setMyStateLoading(false);
    }
  };

  useEffect(() => {
    if (slug) load();
  }, [slug]);

  useEffect(() => {
    loadMyState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const submitApply = async () => {
    if (!data?.division?._id) return;
    setApplyBusy(true);
    try {
      await axiosInstance.post(`/divisions/${data.division._id}/join-requests`, {
        message: applyMessage.trim(),
      });
      setApplyOpen(false);
      setApplyMessage('');
      setToast({ open: true, message: 'Request sent. You will be notified when a leader responds.', severity: 'success' });
      loadMyState();
    } catch (e) {
      setToast({
        open: true,
        message: e?.response?.data?.message || 'Failed to send request',
        severity: 'error',
      });
    } finally {
      setApplyBusy(false);
    }
  };

  const renderDivisionActions = (divisionLocal) => {
    const divId = String(data?.division?._id || '');
    const inThisDivision = myDivision && String(myDivision._id) === divId;
    const inAnotherDivision = myDivision && !inThisDivision;
    const leaderId = String(data?.division?.leader?._id || data?.division?.leaderId || '');
    const leadsThisDivision = Boolean(
      (leadsDivision && String(leadsDivision._id || '') === divId) ||
        (userId && leaderId && userId === leaderId)
    );
    const leadsAnotherDivision = leadsDivision && !leadsThisDivision;
    const pendingForThis = myRequests.some((r) => String(r.divisionId?._id || r.divisionId) === divId);

    if (!isAuthed) {
      return (
        <Button
          component={RouterLink}
          to={`/login?next=/divisions/${divisionLocal.slug}`}
          variant="contained"
          size="large"
          startIcon={<PersonAddOutlined />}
          fullWidth
          sx={{ maxWidth: 320 }}
        >
          Sign in to apply
        </Button>
      );
    }
    if (inThisDivision) {
      return (
        <Button component={RouterLink} to="/division" variant="contained" color="success" size="large" fullWidth sx={{ maxWidth: 320 }}>
          Your division
        </Button>
      );
    }
    if (leadsThisDivision) {
      return (
        <Button component={RouterLink} to="/division" variant="contained" color="warning" size="large" fullWidth sx={{ maxWidth: 320 }}>
          Manage your division
        </Button>
      );
    }
    if (leadsAnotherDivision) {
      return <Chip label={`Leader of ${leadsDivision.name}`} color="warning" variant="outlined" />;
    }
    if (inAnotherDivision) {
      return <Chip label={`Member of ${myDivision.name}`} color="default" variant="outlined" />;
    }
    if (pendingForThis) {
      return <Chip label="Application pending" color="warning" variant="outlined" />;
    }
    if (myStateLoading) {
      return <Chip label="Checking membership..." variant="outlined" />;
    }
    return (
      <Button onClick={() => setApplyOpen(true)} variant="contained" size="large" fullWidth sx={{ maxWidth: 320 }} startIcon={<PersonAddOutlined />}>
        Apply to join
      </Button>
    );
  };

  if (loading) {
    return (
      <MagicPageShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading division…</Typography>
        </Container>
      </MagicPageShell>
    );
  }

  if (error || !data?.division) {
    return (
      <MagicPageShell>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error || 'Division not found.'}
          </Alert>
          <Button component={RouterLink} to="/division-leaderboard">
            Back to divisions
          </Button>
        </Container>
      </MagicPageShell>
    );
  }

  const { division, members, recentJobs = [] } = data;
  const effectiveMemberCount = Math.max(Number(division.memberCount || 0), members.length || 0);
  const p = theme.palette.primary.main;

  return (
    <MagicPageShell>
      <Box sx={{ minHeight: '100vh', pb: { xs: 4, md: 6 } }}>
        <DivisionGlobalBanner globalAnnouncement={data.globalAnnouncement} variant="fullBleed" />

        {/* ── Banner-first hero (max visual priority) ── */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: { xs: '4/3', sm: '16/9', md: '2.35/1' },
              maxHeight: { md: 520 },
              minHeight: { xs: 240, sm: 320 },
              bgcolor: 'common.black',
              overflow: 'hidden',
            }}
          >
            {division.bannerUrl ? (
              <Box
                component="img"
                src={division.bannerUrl}
                alt=""
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.secondary.dark} 100%)`,
                }}
              />
            )}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)',
              }}
            />
            <Container
              maxWidth="xl"
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: { xs: 16, md: 28 },
                zIndex: 1,
              }}
            >
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    icon={<VerifiedOutlined sx={{ fontSize: 18 }} />}
                    label="Official division profile"
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.45)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: 700,
                    }}
                  />
                  {division.slug ? (
                    <Chip
                      size="small"
                      label={`/divisions/${division.slug}`}
                      sx={{
                        bgcolor: alpha(p, 0.88),
                        color: theme.palette.primary.contrastText,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    />
                  ) : null}
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    color: '#fff',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    textShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  {division.name}
                </Typography>
              </motion.div>
            </Container>
          </Box>

          {/* Glass identity strip + logo overlapping banner ── */}
          <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
              <Paper
                elevation={0}
                sx={{
                  mt: { xs: -6, md: -9 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha(p, theme.palette.mode === 'dark' ? 0.4 : 0.35),
                  background:
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(160deg, rgba(20,20,20,0.96) 0%, rgba(12,12,12,0.92) 100%)'
                      : 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.96) 100%)',
                  backdropFilter: 'blur(14px)',
                  boxShadow: `0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px ${alpha(p, 0.06)} inset`,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    height: 4,
                    width: '100%',
                    background: `linear-gradient(90deg, ${p} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}
                />
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} sm="auto">
                      <Avatar
                        src={division.logoUrl || undefined}
                        variant="rounded"
                        sx={{
                          width: { xs: 100, sm: 120 },
                          height: { xs: 100, sm: 120 },
                          border: `3px solid ${alpha(p, 0.55)}`,
                          boxShadow: `0 12px 40px ${alpha(p, 0.25)}`,
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          bgcolor: alpha(p, 0.12),
                          color: 'primary.main',
                        }}
                      >
                        {division.name?.[0] || 'D'}
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} sm>
                      <Stack spacing={1.25}>
                        <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.15 }}>
                          {division.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 880 }}>
                          {division.description || 'A division in our community.'}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                          <Chip
                            variant="outlined"
                            icon={<GroupsOutlined />}
                            label={`${effectiveMemberCount} members`}
                          />
                          <Chip
                            variant="outlined"
                            icon={<AccountBalanceWalletOutlined />}
                            label={`Wallet ${(division.walletBalance ?? 0).toLocaleString()} tokens`}
                          />
                          <Chip variant="outlined" icon={<LocalAtmOutlined />} label={`Division tax ${division.taxPercent ?? 0}%`} />
                          <Chip variant="outlined" icon={<EmojiEvents />} label={`${recentJobs.length} recent jobs shown`} />
                          {division.leader ? (
                            <Chip
                              variant="filled"
                              color="primary"
                              avatar={
                                <Avatar src={division.leader.avatar || undefined} sx={{ width: 24, height: 24 }}>
                                  {(division.leader.name || division.leader.username || '?')[0]}
                                </Avatar>
                              }
                              label={`Leader: ${division.leader.name || division.leader.username}${
                                division.leader.username && division.leader.name !== division.leader.username
                                  ? ` · @${division.leader.username}`
                                  : ''
                              }`}
                              sx={{ fontWeight: 700 }}
                            />
                          ) : null}
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={12} md="auto">
                      <Stack spacing={1.5} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
                        {renderDivisionActions(division)}
                        <Button component={RouterLink} to="/division-leaderboard" variant="outlined" size="medium" sx={{ alignSelf: { md: 'flex-end' } }}>
                          Explore all divisions
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </motion.div>

            {/* Lucide-assisted stat spotlight (compact, scannable) */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              {[
                { icon: Users, label: 'Members', value: effectiveMemberCount, sub: 'enrolled roster' },
                {
                  icon: WalletCards,
                  label: 'Division wallet',
                  value: `${(division.walletBalance ?? 0).toLocaleString()}`,
                  sub: 'tokens',
                },
                { icon: Landmark, label: 'Tax setting', value: `${division.taxPercent ?? 0}%`, sub: 'on division jobs' },
                { icon: Receipt, label: 'Recent activity', value: `${recentJobs.length}`, sub: 'completed jobs sampled' },
              ].map(({ icon: Icon, label, value, sub }) => (
                <Grid item xs={6} md={3} key={label}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      borderColor: alpha(p, 0.25),
                      background: alpha(p, theme.palette.mode === 'dark' ? 0.06 : 0.04),
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 14px 32px ${alpha(p, 0.12)}`,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: alpha(p, 0.15),
                          color: 'primary.main',
                          display: 'flex',
                        }}
                      >
                        <Icon size={22} strokeWidth={2.2} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {label}
                        </Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2, mt: 0.25 }}>
                          {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sub}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Section: recent jobs — MUI Table */}
          

            {/* Leaderboard + member list */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 2.5 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <EmojiEvents sx={{ color: 'warning.main' }} />
                      <Typography variant="h6" fontWeight={700}>
                        Top members
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell sortDirection={memberSort === 'name' ? memberDir : false}>
                              <TableSortLabel
                                active={memberSort === 'name'}
                                direction={memberSort === 'name' ? memberDir : 'asc'}
                                onClick={() => toggleMemberSort('name')}
                              >
                                Rider
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sortDirection={memberSort === 'jobs' ? memberDir : false}>
                              <TableSortLabel
                                active={memberSort === 'jobs'}
                                direction={memberSort === 'jobs' ? memberDir : 'desc'}
                                onClick={() => toggleMemberSort('jobs')}
                              >
                                Jobs
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sortDirection={memberSort === 'revenue' ? memberDir : false}>
                              <TableSortLabel
                                active={memberSort === 'revenue'}
                                direction={memberSort === 'revenue' ? memberDir : 'desc'}
                                onClick={() => toggleMemberSort('revenue')}
                              >
                                Revenue
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sortDirection={memberSort === 'distance' ? memberDir : false}>
                              <TableSortLabel
                                active={memberSort === 'distance'}
                                direction={memberSort === 'distance' ? memberDir : 'desc'}
                                onClick={() => toggleMemberSort('distance')}
                              >
                                Distance
                              </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sortDirection={memberSort === 'attendance' ? memberDir : false}>
                              <TableSortLabel
                                active={memberSort === 'attendance'}
                                direction={memberSort === 'attendance' ? memberDir : 'desc'}
                                onClick={() => toggleMemberSort('attendance')}
                              >
                                Attendance
                              </TableSortLabel>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedLeaderboard.map((r, idx) => (
                            <TableRow key={r.riderId} hover>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Avatar src={r.avatar || undefined} sx={{ width: 28, height: 28 }}>
                                    {r.name?.[0]}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight={600}>
                                    {r.name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">{r.jobs}</TableCell>
                              <TableCell align="right">{r.revenue?.toLocaleString() || 0}</TableCell>
                              <TableCell align="right">{r.distance?.toLocaleString() || 0} km</TableCell>
                              <TableCell align="right">
                                <Chip
                                  size="small"
                                  color={r.attendance > 0 ? 'success' : 'default'}
                                  variant={r.attendance > 0 ? 'filled' : 'outlined'}
                                  label={`${r.attendance || 0} event${r.attendance === 1 ? '' : 's'}`}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          {!leaderboard?.length && (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                  No jobs logged yet.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 2.5, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      Members ({effectiveMemberCount})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1.25} sx={{ maxHeight: 520, overflow: 'auto', pr: 1 }}>
                      {members.map((m) => (
                        <Stack
                          key={m._id}
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: m.isLeader ? 'action.selected' : 'transparent',
                            border: '1px solid',
                            borderColor: m.isLeader ? alpha(p, 0.35) : 'transparent',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Avatar src={m.avatar || undefined} sx={{ width: 36, height: 36 }}>
                            {m.name?.[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {m.name}
                              </Typography>
                              {m.isLeader && <Chip size="small" color="primary" label="Leader" />}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {m.employeeID || m.username} {m.country ? `· ${m.country}` : ''}
                            </Typography>
                          </Box>
                          {m.totalJobs != null && <Chip size="small" label={`${m.totalJobs} jobs`} />}
                        </Stack>
                      ))}
                      {!members.length && (
                        <Typography color="text.secondary" variant="body2">
                          No members yet.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
  {recentJobs.length > 0 && (
              <Card sx={{ mt: 4, borderRadius: 2.5, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      background: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.12 : 0.08),
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Sparkles size={22} color={theme.palette.primary.main} />
                      <Typography variant="h6" fontWeight={800}>
                        Latest jobs
                      </Typography>
                      <Chip size="small" label={recentJobs.length} color="primary" variant="outlined" />
                    </Stack>
                  </Box>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Rider</TableCell>
                          <TableCell>Cargo</TableCell>
                          <TableCell>Route</TableCell>
                          <TableCell align="right">Distance</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">When</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentJobs.map((j, idx) => (
                          <TableRow key={(j.jobId || '') + idx} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar src={j.riderAvatar || undefined} sx={{ width: 28, height: 28 }}>
                                  {j.riderName?.[0] || '?'}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>
                                  {j.riderName}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{j.cargo || '—'}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {j.sourceCity && j.sourceCompany ? `${j.sourceCity} - ${j.sourceCompany}` : '—'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {j.destinationCity && j.destinationCompany
                                  ? `${j.destinationCity} - ${j.destinationCompany}`
                                  : ''}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{(j.distanceKm || 0).toLocaleString()} km</TableCell>
                            <TableCell align="right">{(j.revenue || 0).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" color="text.secondary">
                                {j.completedAt ? new Date(j.completedAt).toLocaleString() : '—'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            )}
        <Dialog open={applyOpen} onClose={() => !applyBusy && setApplyOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Apply to join {division.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Leave a short note so the leader knows why you&apos;d like to join. The leader or a community manager will review your request.
              </Typography>
              <TextField
                multiline
                minRows={3}
                maxRows={8}
                autoFocus
                fullWidth
                placeholder="Tell them about your playstyle, availability, etc. (optional)"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value.slice(0, 500))}
                helperText={`${applyMessage.length}/500`}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyOpen(false)} disabled={applyBusy}>
              Cancel
            </Button>
            <Button onClick={submitApply} variant="contained" disabled={applyBusy}>
              {applyBusy ? 'Sending…' : 'Send application'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={4500}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </MagicPageShell>
  );
}
