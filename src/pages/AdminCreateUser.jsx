import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from '../utils/axios';

const roleOptions = [
  { label: 'Rider', value: 'rider' },
  { label: 'HR Team', value: 'hrteam' },
  { label: 'Event Team', value: 'eventteam' },
  { label: 'Finance Team', value: 'financeteam' },
  { label: 'Community Manager', value: 'communityManager' },
  { label: 'Admin', value: 'admin' },
];

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    username: '',
    email: '',
    role: 'rider',
    name: '',
    vtcName: '',
    isApproved: true,
    steamId: '',
    truckershubId: '',
    truckersmpId: '',
    tmpIngameName: '',
    age: '',
  });

  const requiresName = useMemo(() => form.role === 'rider', [form.role]);
  const isRider = form.role === 'rider';

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const fetchProfileBySteamId = async () => {
    const steamId = String(form.steamId || '').trim();
    if (!steamId) {
      setMessage({ type: 'error', text: 'Enter a Steam ID first.' });
      return;
    }
    setMessage({ type: '', text: '' });
    setFetchingProfile(true);
    try {
      const { data } = await axiosInstance.post('/auth/search-external-ids', { steamId });
      const d = data?.data || {};
      const th = d.truckershub || {};
      const tmp = d.truckersmp || {};
      setForm((p) => ({
        ...p,
        truckershubId: th.id != null ? String(th.id) : p.truckershubId,
        truckersmpId: tmp.id != null ? String(tmp.id) : p.truckersmpId,
        tmpIngameName: th.username || tmp.username || p.tmpIngameName,
        username: p.username || (th.username || tmp.username || '').toLowerCase(),
      }));
      if (d.found) {
        setMessage({ type: 'success', text: 'Profile data loaded from TruckersMP/TruckersHub.' });
      } else {
        setMessage({ type: 'warning', text: 'Steam ID not found on TruckersMP or TruckersHub. You can still create the user with manual IDs.' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to fetch profile by Steam ID.',
      });
    } finally {
      setFetchingProfile(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.username.trim() || !form.email.trim()) {
      setMessage({ type: 'error', text: 'Username and email are required.' });
      return;
    }
    if (requiresName && !form.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required for rider accounts.' });
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post('/users/admin-create', {
        username: form.username,
        email: form.email,
        role: form.role,
        name: requiresName ? form.name : undefined,
        vtcName: form.vtcName || undefined,
        isApproved: requiresName ? form.isApproved : undefined,
        steamId: form.steamId?.trim() || undefined,
        truckershubId: form.truckershubId?.trim() || undefined,
        truckersmpId: form.truckersmpId?.trim() || undefined,
        tmpIngameName: form.tmpIngameName?.trim() || undefined,
        age: form.age !== '' ? (Number(form.age) || undefined) : undefined,
      });
      setMessage({
        type: 'success',
        text: 'User created. A temporary password has been emailed to the user.',
      });
      setTimeout(() => navigate('/admin/users'), 700);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create user',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Admin • Create User</Typography>
        <Button variant="outlined" onClick={() => navigate('/admin/users')}>Back</Button>
      </Stack>

      {message.text && (
        <Alert severity={message.type || 'info'} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This creates a user with a system-generated temporary password and emails it to them. They will be prompted to change it on first login.
          </Typography>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  fullWidth
                  required
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  fullWidth
                >
                  {roleOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="VTC name (optional)"
                  name="vtcName"
                  value={form.vtcName}
                  onChange={onChange}
                  fullWidth
                />
              </Stack>

              {requiresName && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <TextField
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    fullWidth
                    required
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isApproved"
                        checked={form.isApproved}
                        onChange={onChange}
                      />
                    }
                    label="Approved"
                  />
                </Stack>
              )}

              {isRider && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    TruckersMP / TruckersHub (optional – used for jobs and leaderboard)
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                    <TextField
                      label="Steam ID (64-bit)"
                      name="steamId"
                      value={form.steamId}
                      onChange={onChange}
                      placeholder="e.g. 76561198000000000"
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={fetchProfileBySteamId}
                      disabled={fetchingProfile || !form.steamId?.trim()}
                      startIcon={fetchingProfile ? <CircularProgress size={18} /> : <SearchIcon />}
                    >
                      {fetchingProfile ? 'Fetching…' : 'Fetch profile'}
                    </Button>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="TruckersHub ID"
                      name="truckershubId"
                      value={form.truckershubId}
                      onChange={onChange}
                      fullWidth
                    />
                    <TextField
                      label="TruckersMP ID"
                      name="truckersmpId"
                      value={form.truckersmpId}
                      onChange={onChange}
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="In-game name (TMP/TH)"
                      name="tmpIngameName"
                      value={form.tmpIngameName}
                      onChange={onChange}
                      placeholder="Fetched from profile if Steam ID used"
                      fullWidth
                    />
                    <TextField
                      label="Age"
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={onChange}
                      inputProps={{ min: 1, max: 120 }}
                      fullWidth
                    />
                  </Stack>
                </>
              )}

              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Creating…' : 'Create user'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

