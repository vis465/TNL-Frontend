import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Pagination, Chip
} from '@mui/material';
import axiosInstance from '../utils/axios';

const roleOptions = [
  { label: 'All', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Event Team', value: 'eventteam' },
  { label: 'HR Team', value: 'hrteam' },
  { label: 'Rider', value: 'rider' },
];

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchUsers = async () => {
    const { data } = await axiosInstance.get('/users', {
      params: { page, limit, role: role || undefined, search: search || undefined },
    });
    setItems(data.items || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const applyFilters = () => { setPage(1); fetchUsers(); };

  const updateRole = async (id, newRole) => {
    await axiosInstance.patch(`/users/${id}/role`, { role: newRole });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
    if (!confirmed) return;
    await axiosInstance.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Admin • Users & Roles</Typography>
      </Stack>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Role" size="small" value={role} onChange={(e) => setRole(e.target.value)} sx={{ width: 200 }}>
              {roleOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField label="Search username/email" size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ maxWidth: 300 }} />
            <Button variant="contained" onClick={applyFilters}>Apply</Button>
            <Button variant="outlined" onClick={() => { setRole(''); setSearch(''); setPage(1); }}>Reset</Button>
          </Stack>
        </CardContent>
      </Card>

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
                {items.map((u) => (
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
                      <Stack direction="row" spacing={1}>
                        {['admin','eventteam','hrteam','rider'].filter(r => r !== u.role).map((r) => (
                          <Button
                            key={r}
                            size="small"
                            variant="outlined"
                            onClick={() => updateRole(u._id, r)}
                          >
                            Set {r}
                          </Button>
                        ))}
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => deleteUser(u._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
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
    </Box>
  );
}


