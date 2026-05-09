import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import axiosInstance from '../../../utils/axios';

const FLAG_KEYS = [
  'showdownWeekendEnabled',
  'heatMapEnabled',
  'convoyBonusEnabled',
  'marketSaturationEnabled',
];

export default function ShowdownAdminDashboard() {
  const [flags, setFlags] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/showdown/flags');
      setFlags(data.flags || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const map = Object.fromEntries(flags.map((f) => [f.key, f.enabled]));

  const toggle = async (key, enabled) => {
    try {
      await axiosInstance.put(`/admin/showdown/flags/${key}`, { enabled });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Feature flags</Typography>
      {err && <Alert severity="error">{err}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          {FLAG_KEYS.map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={Boolean(map[key])}
                  onChange={(_, v) => toggle(key, v)}
                />
              }
              label={key}
            />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
