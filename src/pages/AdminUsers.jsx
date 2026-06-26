import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Pagination, Chip, Tooltip
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { AdminFilterBar, AdminPageHeader, useAdminFeedback } from '../components/admin/primitives';

const roleOptions = [
  { label: 'All', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Event Team', value: 'eventteam' },
  { label: 'HR Team', value: 'hrteam' },
  { label: 'Finance Team', value: 'financeteam' },
  { label: 'Community Manager', value: 'communityManager' },
  { label: 'Rider', value: 'rider' },
];

const ROLE_BUTTONS = ['admin', 'eventteam', 'hrteam', 'financeteam', 'communityManager', 'rider'];

const canUpdateUserRole = (user) => {
  if (typeof user?.canUpdateRole === 'boolean') return user.canUpdateRole;
  return Boolean(user?.riderId || user?.linkedAccountId || user?.accountId);
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const { showSuccess, showError, Feedback } = useAdminFeedback();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchUsers = async (overrides = {}) => {
    const currentPage = overrides.page ?? page;
    const currentRole = overrides.role !== undefined ? overrides.role : role;
    const currentSearch = overrides.search !== undefined ? overrides.search : search;
    const { data } = await axiosInstance.get('/users', {
      params: {
        page: currentPage,
        limit,
        role: currentRole || undefined,
        search: currentSearch || undefined,
      },
    });
    setItems(data.items || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    fetchUsers().catch((e) => {
      showError(e?.response?.data?.message || 'Failed to load users');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const applyFilters = () => {
    setPage(1);
    fetchUsers({ page: 1, role, search }).catch((e) => {
      showError(e?.response?.data?.message || 'Failed to load users');
    });
  };

  const handleReset = () => {
    setRole('');
    setSearch('');
    setPage(1);
    fetchUsers({ page: 1, role: '', search: '' }).catch((e) => {
      showError(e?.response?.data?.message || 'Failed to load users');
    });
  };

  const updateRole = async (id, newRole) => {
    const previousRole = items.find((u) => u._id === id)?.role;
    setUpdatingRoleId(id);
    setItems((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    try {
      await axiosInstance.patch(`/users/${id}/role`, { role: newRole });
      showSuccess(`Role updated to ${newRole}`);
    } catch (e) {
      setItems((prev) => prev.map((u) => (u._id === id ? { ...u, role: previousRole } : u)));
      showError(e?.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingUserId(id);
    try {
      await axiosInstance.delete(`/users/${id}`);
      showSuccess('User deleted');
      await fetchUsers();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <AdminPageHeader
        description="Search users, update roles, and manage accounts."
        actions={<Button variant="contained" onClick={() => navigate('/admin/create-user')}>Create User</Button>}
      />

      <AdminFilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search username/email',
        }}
        onReset={handleReset}
      >
        <TextField select label="Role" size="small" value={role} onChange={(e) => setRole(e.target.value)} sx={{ width: 200 }}>
          {roleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={applyFilters}>Apply</Button>
      </AdminFilterBar>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Users</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField select size="small" label="Per page" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} sx={{ width: 120 }}>
                {[10,20,50,100].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </TextField>
              <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} shape="rounded" size="small" />
            </Stack>
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((u) => {
                  const rowBusy = updatingRoleId === u._id || deletingUserId === u._id;
                  const roleChangeAllowed = canUpdateUserRole(u);
                  return (
                    <TableRow key={u._id} hover>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={u.role}
                          color={u.role === 'admin'
                            ? 'error'
                            : (u.role === 'eventteam'
                              ? 'secondary'
                              : (u.role === 'hrteam' ? 'info' : 'default'))}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {ROLE_BUTTONS.filter((r) => r !== u.role).map((r) => (
                            <Tooltip
                              key={r}
                              title={roleChangeAllowed ? `Set role to ${r}` : 'No linked account — role cannot be changed'}
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={rowBusy || !roleChangeAllowed}
                                  onClick={() => updateRole(u._id, r)}
                                >
                                  Set {r}
                                </Button>
                              </span>
                            </Tooltip>
                          ))}
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={rowBusy}
                            onClick={() => deleteUser(u._id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">No users found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Feedback />
    </Box>
  );
}
