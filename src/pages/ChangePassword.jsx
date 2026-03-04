import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      const refreshed = await axiosInstance.get('/auth/profile');
      const token = localStorage.getItem('token');
      if (token) login(refreshed.data, token);

      setMessage({ type: 'success', text: 'Password updated. Redirecting…' });
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', px: 3, py: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {user?.mustChangePassword
              ? 'For security, you must change your temporary password before continuing.'
              : 'Update your password.'}
          </Typography>

          {message.text && (
            <Alert severity={message.type || 'info'} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Current password"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={onChange}
                required
                fullWidth
              />
              <TextField
                label="New password"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={onChange}
                required
                fullWidth
              />
              <TextField
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving…' : 'Update password'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

