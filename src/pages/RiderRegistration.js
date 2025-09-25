import React, { useMemo, useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid, Alert, Box, FormControl, InputLabel, Select, MenuItem, Chip, Stack } from '@mui/material';
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
    age: '',
    gamesOwned: [],
    dlcsOwned: { ets2: [], ats: [] },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Options
  const gameOptions = useMemo(() => ([
    { value: 'ets2', label: 'Euro Truck Simulator 2' },
    { value: 'ats', label: 'American Truck Simulator' },
  ]), []);

  const ets2DlcOptions = useMemo(() => ([
    "Going East!",
    "Scandinavia",
    "Vive La France!",
    "Greece",
    "Italia",
    "Beyond the Baltic Sea",
    "Western Balkans",
    "Road to the Black Sea",
    "Iberia"
]), []);

  const atsDlcOptions = useMemo(() => ([
    "New Mexico",
    "Arizona",
    "Oregon",
    "Washington",
    "California",
    "Utah",
    "Colorado",
    "Idaho",
    "Wyoming",
    "Montana",
    "Texas"
  ]), []);

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
        gamesOwned: form.gamesOwned,
        dlcsOwned: form.dlcsOwned,
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

          {/* Games Owned */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="games-owned-label">Games you own</InputLabel>
              <Select
                labelId="games-owned-label"
                multiple
                value={form.gamesOwned}
                label="Games you own"
                onChange={(e) => {
                  const selected = e.target.value;
                  const dlcsOwned = { ...form.dlcsOwned };
                  if (!selected.includes('ets2')) dlcsOwned.ets2 = [];
                  if (!selected.includes('ats')) dlcsOwned.ats = [];
                  setForm({ ...form, gamesOwned: selected, dlcsOwned });
                }}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selected.map((v) => (
                      <Chip key={v} label={gameOptions.find(g => g.value === v)?.label || v} size="small" />
                    ))}
                  </Stack>
                )}
              >
                {gameOptions.map((g) => (
                  <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* DLCs per game (optional) */}
          {form.gamesOwned.includes('ets2') && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="ets2-dlcs-label">ETS2 DLCs you own (optional)</InputLabel>
                <Select
                  labelId="ets2-dlcs-label"
                  multiple
                  value={form.dlcsOwned.ets2}
                  label="ETS2 DLCs you own (optional)"
                  onChange={(e) => setForm({ ...form, dlcsOwned: { ...form.dlcsOwned, ets2: e.target.value } })}
                  renderValue={(selected) => (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selected.map((v) => (<Chip key={v} label={v} size="small" />))}
                    </Stack>
                  )}
                >
                  {ets2DlcOptions.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {form.gamesOwned.includes('ats') && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="ats-dlcs-label">ATS DLCs you own (optional)</InputLabel>
                <Select
                  labelId="ats-dlcs-label"
                  multiple
                  value={form.dlcsOwned.ats}
                  label="ATS DLCs you own (optional)"
                  onChange={(e) => setForm({ ...form, dlcsOwned: { ...form.dlcsOwned, ats: e.target.value } })}
                  renderValue={(selected) => (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selected.map((v) => (<Chip key={v} label={v} size="small" />))}
                    </Stack>
                  )}
                >
                  {atsDlcOptions.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
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


