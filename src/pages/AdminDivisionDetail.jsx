import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
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

export default function AdminDivisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [division, setDivision] = useState(null);
  const [members, setMembers] = useState([]);
  const [lb, setLb] = useState([]);
  const [txns, setTxns] = useState([]);
  const [invites, setInvites] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [inactivityDays, setInactivityDays] = useState(14);
  const [onlyInactive, setOnlyInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    setError('');
    try {
      const { data } = await axiosInstance.get(`/divisions/${id}`);
      setDivision(data.division);
      setTaxPct(String(data.division?.taxPercent ?? 0));
      const [m, l, t, inv, jr] = await Promise.all([
        axiosInstance.get(`/divisions/${id}/members`),
        axiosInstance.get(`/divisions/${id}/leaderboard`),
        axiosInstance.get(`/divisions/${id}/wallet/transactions`),
        axiosInstance.get(`/divisions/${id}/invites`),
        axiosInstance.get(`/divisions/${id}/join-requests`).catch(() => ({ data: { requests: [] } })),
      ]);
      setMembers(m.data.members || []);
      setInactivityDays(Number(m.data.inactivityDays) || 14);
      setLb(l.data.riders || []);
      setTxns(t.data.transactions || []);
      setInvites(inv.data.invites || []);
      setJoinRequests(jr.data.requests || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
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
        const { data } = await axiosInstance.get('/divisions/eligible-leaders', {
          params: { q: leaderQuery || undefined, excludeDivisionId: id },
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
      setError(e?.response?.data?.message || 'Save failed');
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
      setError(e?.response?.data?.message || 'Invite failed');
    }
  };

  const saveTax = async () => {
    try {
      await axiosInstance.patch(`/divisions/${id}/tax`, { taxPercent: Number(taxPct) });
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Tax update failed');
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
      setError(e?.response?.data?.message || 'Distribute failed');
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
      setError(e?.response?.data?.message || 'Split failed');
    }
  };

  const kick = async (riderId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axiosInstance.post(`/divisions/${id}/members/${riderId}/kick`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Kick failed');
    }
  };

  const staffRemove = async (riderId) => {
    if (!window.confirm('Remove this member as staff?')) return;
    try {
      await axiosInstance.post(`/divisions/${id}/members/${riderId}/remove`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Remove failed');
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
      setError(e?.response?.data?.message || 'Transfer failed');
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
      setError(e?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const memberById = useMemo(() => new Map(members.map((m) => [String(m._id), m])), [members]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={RouterLink} to="/admin/divisions" sx={{ mb: 2 }}>
        Back to divisions
      </Button>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {division && (
        <Card sx={{ mb: 3, overflow: 'hidden' }} variant="outlined">
          {division.bannerUrl ? (
            <CardMedia component="img" image={division.bannerUrl} alt="banner" sx={{ height: 180, objectFit: 'cover' }} />
          ) : (
            <Box sx={{ height: 140, background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})` }} />
          )}
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
                  <Chip size="small" label={`Leader: ${division.leader?.username || '—'}`} />
                </Stack>
              </Box>
              <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
                <Tooltip title="Open public page">
                  <IconButton component={RouterLink} to={`/divisions/${division.slug}`} target="_blank" rel="noopener">
                    <OpenInNewOutlined />
                  </IconButton>
                </Tooltip>
                {canEditSettings && (
                  <>
                    <Button size="small" startIcon={<EditOutlined />} onClick={openEdit} variant="outlined">
                      Edit
                    </Button>
                    <Button size="small" startIcon={<SwapHorizOutlined />} onClick={() => setTransferOpen(true)} variant="outlined">
                      Transfer leader
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Members" />
        <Tab label="Leaderboard" />
        <Tab label="Wallet" />
        <Tab label="Invites" />
        <Tab
          label={`Requests${joinRequests.length ? ` (${joinRequests.length})` : ''}`}
        />
      </Tabs>

      {tab === 0 && division && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexWrap="wrap">
              <Box><Typography variant="caption" color="text.secondary">Members</Typography><Typography variant="h6">{division.memberCount ?? 0}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Wallet balance</Typography><Typography variant="h6">{(division.walletBalance ?? 0).toLocaleString()} tokens</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Tax rate</Typography><Typography variant="h6">{division.taxPercent ?? 0}%</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Leader</Typography><Typography variant="h6">{division.leader?.username || '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Created</Typography><Typography variant="h6">{new Date(division.createdAt).toLocaleDateString()}</Typography></Box>
            </Stack>
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
                    <Button
                      size="small"
                      variant={onlyInactive ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => setOnlyInactive((v) => !v)}
                    >
                      {onlyInactive ? 'Showing inactive only' : 'Filter inactive'}
                    </Button>
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Activity</TableCell>
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
                          <TableCell align="right">{(m.balance ?? 0).toLocaleString()}</TableCell>
                          {canManageMembers && (
                            <TableCell align="right">
                              {!m.isLeader && (isLeader || user.role === 'admin') && (
                                <Button size="small" color="error" onClick={() => kick(m._id)}>Kick</Button>
                              )}
                              {!m.isLeader && user.role === 'communityManager' && !isLeader && (
                                <Button size="small" color="warning" sx={{ ml: 1 }} onClick={() => staffRemove(m._id)}>
                                  Staff remove
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {!visible.length && (
                        <TableRow>
                          <TableCell colSpan={canManageMembers ? 5 : 4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                              {onlyInactive ? 'No inactive members.' : 'No members yet.'}
                            </Typography>
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
              <Typography fontWeight={700} sx={{ mb: 1 }}>Recent transactions</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Title</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {txns.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{t.type} / {t.source?.kind}</TableCell>
                      <TableCell align="right">{t.amount?.toLocaleString?.() ?? t.amount}</TableCell>
                      <TableCell>{t.title}</TableCell>
                    </TableRow>
                  ))}
                  {!txns.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No transactions yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                <Button variant="contained" onClick={sendInvite} disabled={!inviteRider?._id}>Send invite</Button>
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
                                setError(e?.response?.data?.message || 'Cancel failed');
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
    </Container>
  );
}
