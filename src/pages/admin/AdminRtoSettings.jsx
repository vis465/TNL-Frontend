import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { fetchRtoSettings, updateRtoSettings } from '../../services/rtoService';

export default function AdminRtoSettings() {
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchRtoSettings()
      .then(setForm)
      .catch((e) => setErr(e?.response?.data?.message || 'Load failed'));
  }, []);

  const save = async () => {
    setErr('');
    setMsg('');
    try {
      const data = await updateRtoSettings(form);
      setForm(data);
      setMsg('Settings saved');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Save failed');
    }
  };

  const fields = [
    { key: 'duplicateOffenceCooldownHours', label: 'Duplicate offence cooldown (hours)' },
    { key: 'maxChallansPerOfficerPerDay', label: 'Max challans per RTO officer / day' },
    { key: 'expiryDays', label: 'Auto-expiry days (0 = disabled)' },
    { key: 'outstandingBannerThreshold', label: 'Dashboard banner threshold (tokens)' },
    { key: 'outstandingBlockThreshold', label: 'Cargo-bid block threshold (0 = disabled)' },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        RTO settings
      </Typography>
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <Stack spacing={2} maxWidth={480}>
        {fields.map((f) => (
          <TextField
            key={f.key}
            label={f.label}
            type="number"
            value={form[f.key] ?? ''}
            onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
            fullWidth
          />
        ))}
        <Button variant="contained" onClick={save}>
          Save
        </Button>
      </Stack>
    </Box>
  );
}
