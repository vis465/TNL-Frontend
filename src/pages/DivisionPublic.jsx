import React, { useEffect, useState } from 'react';
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
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import LocalAtmOutlined from '@mui/icons-material/LocalAtmOutlined';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';

export default function DivisionPublic() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myDivision, setMyDivision] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyBusy, setApplyBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const user = getItemWithExpiry('user');
  const isAuthed = Boolean(user?.token || user?.id || user?._id);

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
    try {
      const [divRes, reqRes] = await Promise.all([
        axiosInstance.get('/me/division').catch(() => ({ data: { division: null } })),
        axiosInstance.get('/me/division/join-requests').catch(() => ({ data: { requests: [] } })),
      ]);
      setMyDivision(divRes.data?.division || null);
      setMyRequests(reqRes.data?.requests || []);
    } catch (_) {
      /* ignored for public page */
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (error || !data?.division) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>{error || 'Division not found.'}</Alert>
        <Button component={RouterLink} to="/division-leaderboard">Back to divisions</Button>
      </Container>
    );
  }

  const { division, members, leaderboard, recentJobs = [] } = data;

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 180, sm: 260, md: 320 },
          backgroundImage: division.bannerUrl ? `url(${division.bannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          background: division.bannerUrl ? undefined : (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})`,
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.1))' }} />
      </Box>

      <Container maxWidth="lg">
        <Card variant="outlined" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
              <Avatar
                src={division.logoUrl || undefined}
                sx={{ width: 96, height: 96, border: '4px solid', borderColor: 'background.paper', boxShadow: 4 }}
              >
                {division.name?.[0] || 'D'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h4" fontWeight={800}>{division.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  {division.description || 'A division in our community.'}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip icon={<GroupsOutlined />} label={`${division.memberCount ?? members.length} members`} />
                  <Chip icon={<AccountBalanceWalletOutlined />} label={`Wallet ${(division.walletBalance ?? 0).toLocaleString()}`} />
                  <Chip icon={<LocalAtmOutlined />} label={`Tax ${division.taxPercent ?? 0}%`} />
                  {division.leader && (
                    <Chip
                      avatar={
                        <Avatar
                          src={division.leader.avatar || undefined}
                          sx={{ width: 24, height: 24 }}
                        >
                          {(division.leader.name || division.leader.username || '?')[0]}
                        </Avatar>
                      }
                      label={`Led by ${division.leader.name || division.leader.username}${
                        division.leader.name && division.leader.username && division.leader.name !== division.leader.username
                          ? ` (@${division.leader.username})`
                          : ''
                      }`}
                    />
                  )}
                </Stack>
              </Box>
              <Stack direction="column" spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
                {(() => {
                  const divId = String(data?.division?._id || '');
                  const inThisDivision = myDivision && String(myDivision._id) === divId;
                  const inAnotherDivision = myDivision && !inThisDivision;
                  const pendingForThis = myRequests.some((r) => String(r.divisionId?._id || r.divisionId) === divId);

                  if (!isAuthed) {
                    return (
                      <Button
                        component={RouterLink}
                        to={`/login?next=/divisions/${division.slug}`}
                        variant="contained"
                        startIcon={<PersonAddOutlined />}
                      >
                        Sign in to apply
                      </Button>
                    );
                  }
                  if (inThisDivision) {
                    return (
                      <Button component={RouterLink} to="/division" variant="contained" color="success">
                        Your division
                      </Button>
                    );
                  }
                  if (inAnotherDivision) {
                    return (
                      <Chip label={`Member of ${myDivision.name}`} color="default" variant="outlined" />
                    );
                  }
                  if (pendingForThis) {
                    return <Chip label="Application pending" color="warning" variant="outlined" />;
                  }
                  return (
                    <Button
                      onClick={() => setApplyOpen(true)}
                      variant="contained"
                      startIcon={<PersonAddOutlined />}
                    >
                      Apply to join
                    </Button>
                  );
                })()}
                <Button component={RouterLink} to="/division-leaderboard" variant="outlined" size="small">
                  All divisions
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {recentJobs.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <LocalAtmOutlined sx={{ color: 'success.main' }} />
                <Typography variant="h6" fontWeight={700}>Latest jobs</Typography>
                <Chip size="small" label={`${recentJobs.length}`} sx={{ ml: 1 }} />
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rider</TableCell>
                    <TableCell>Cargo</TableCell>
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
                          <Typography variant="body2" fontWeight={600}>{j.riderName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{j.cargo || '—'}</TableCell>
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
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <EmojiEvents sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={700}>Top members</Typography>
                </Stack>
                <Divider sx={{ mb: 1 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Rider</TableCell>
                      <TableCell align="right">Jobs</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Distance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(leaderboard || []).map((r, idx) => (
                      <TableRow key={r.riderId} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar src={r.avatar || undefined} sx={{ width: 28, height: 28 }}>{r.name?.[0]}</Avatar>
                            <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{r.jobs}</TableCell>
                        <TableCell align="right">{r.revenue?.toLocaleString() || 0}</TableCell>
                        <TableCell align="right">{r.distance?.toLocaleString() || 0} km</TableCell>
                      </TableRow>
                    ))}
                    {!leaderboard?.length && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            No jobs logged yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Members ({members.length})</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.25} sx={{ maxHeight: 520, overflow: 'auto', pr: 1 }}>
                  {members.map((m) => (
                    <Stack
                      key={m._id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: m.isLeader ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Avatar src={m.avatar || undefined} sx={{ width: 36, height: 36 }}>{m.name?.[0]}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={600} noWrap>{m.name}</Typography>
                          {m.isLeader && <Chip size="small" color="primary" label="Leader" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {m.employeeID || m.username} {m.country ? `· ${m.country}` : ''}
                        </Typography>
                      </Box>
                      {m.totalJobs != null && (
                        <Chip size="small" label={`${m.totalJobs} jobs`} />
                      )}
                    </Stack>
                  ))}
                  {!members.length && (
                    <Typography color="text.secondary" variant="body2">No members yet.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={applyOpen} onClose={() => !applyBusy && setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply to join {division.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Leave a short note so the leader knows why you'd like to join. The leader or a community manager will review your request.
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
          <Button onClick={() => setApplyOpen(false)} disabled={applyBusy}>Cancel</Button>
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
  );
}
