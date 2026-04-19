import React, { useEffect, useState } from 'react';
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
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';

export default function MyDivision() {
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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: d } = await axiosInstance.get('/me/division');
      setData(d);
      if (d?.division?._id) {
        const [{ data: l }, { data: m }] = await Promise.all([
          axiosInstance.get(`/divisions/${d.division._id}/leaderboard`, { params: { limit: 30 } }),
          axiosInstance.get(`/divisions/${d.division._id}/members`).catch(() => ({ data: { members: [] } })),
        ]);
        setLb(l.riders || []);
        setMembers(m.members || []);
        setTaxPct(String(d.division.taxPercent ?? 0));
      } else {
        setLb([]);
        setMembers([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const div = data?.division;
  const uid = String(user.id || user._id || '');
  const leaderIdStr = String(div?.leaderId || div?.leader?._id || '');
  const isLeader = Boolean(div && uid && leaderIdStr && uid === leaderIdStr);

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

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>My division</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

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
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={`Tax ${div.taxPercent}%`} />
                    <Chip size="small" label={`Wallet ${(div.walletBalance ?? 0).toLocaleString()}`} />
                    <Chip size="small" label={`Members ${div.memberCount ?? 0}`} />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button component={RouterLink} to={`/divisions/${div.slug}`} variant="outlined">
                    Public page
                  </Button>
                  <Button variant="outlined" color="warning" onClick={leave}>Leave</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {isLeader && (() => {
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

          {isLeader && (
            <Card>
              <CardContent>
                <Typography fontWeight={700} sx={{ mb: 2 }}>Leader tools</Typography>
                <Stack spacing={2}>
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
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField label="Tax %" type="number" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} sx={{ width: 120 }} />
                    <Button variant="contained" onClick={saveTax}>Update tax</Button>
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2">Pay member from division wallet</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Autocomplete
                      options={members}
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

          <Card>
            <CardContent>
              <Typography fontWeight={700} sx={{ mb: 2 }}>Division leaderboard</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rider</TableCell>
                    <TableCell align="right">Jobs</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Tax to wallet</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lb.map((r) => (
                    <TableRow key={r.riderId}>
                      <TableCell>{r.name || r.username}</TableCell>
                      <TableCell align="right">{r.jobs}</TableCell>
                      <TableCell align="right">{Math.round(r.revenue || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">{Math.round(r.taxContributed || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {!lb.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No jobs yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
}
