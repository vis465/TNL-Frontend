import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid, Alert, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ridersService from '../services/ridersService';

export default function RiderRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    tmpIngameName: '',
    steamId: '',
    truckershubId: '',
    truckersmpId: '',
    age: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Register auth user and rider link via /api/auth/register
      // axiosInstance already points to /api
      const res = await (await import('../utils/axios')).default.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        name: form.name,
        tmpIngameName: form.tmpIngameName,
        steamID: form.steamId,
        truckershubId: form.truckershubId,
        truckersmpId: form.truckersmpId,
        age: form.age ? Number(form.age) : undefined,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Join as a Trainee</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your details. All registrations start as trainees.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Username" name="username" value={form.username} onChange={onChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required type="email" label="Email" name="email" value={form.email} onChange={onChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required type="password" label="Password" name="password" value={form.password} onChange={onChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="Full Name" name="name" value={form.name} onChange={onChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="TMP In-game Name" name="tmpIngameName" value={form.tmpIngameName} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Steam ID" name="steamId" value={form.steamId} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="TruckersMP ID" name="truckersmpId" value={form.truckersmpId} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="TruckersHub User ID" name="truckershubId" value={form.truckershubId} onChange={onChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Age" name="age" value={form.age} onChange={onChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? 'Submitting...' : 'Register'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}


