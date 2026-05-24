import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { fetchActiveOffences, issueChallan, searchRiders } from '../../services/rtoService';

export default function RtoIssueChallan() {
  const [offences, setOffences] = useState([]);
  const [riderQuery, setRiderQuery] = useState('');
  const [riderOptions, setRiderOptions] = useState([]);
  const [accused, setAccused] = useState(null);
  const [offenceId, setOffenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofType, setProofType] = useState('image');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchActiveOffences().then(setOffences).catch(() => {});
  }, []);

  useEffect(() => {
    if (riderQuery.length < 2) {
      setRiderOptions([]);
      return;
    }
    const t = setTimeout(() => {
      searchRiders(riderQuery).then(setRiderOptions).catch(() => setRiderOptions([]));
    }, 300);
    return () => clearTimeout(t);
  }, [riderQuery]);

  const submit = async () => {
    setErr('');
    setMsg('');
    try {
      const challan = await issueChallan({
        accusedRiderId: accused?._id,
        offenceId,
        notes,
        proofs: proofUrl ? [{ type: proofType, url: proofUrl }] : [],
      });
      setMsg(`Issued ${challan.challanNumber}`);
      setNotes('');
      setProofUrl('');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Issue failed');
    }
  };

  return (
    <Box maxWidth={640}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Issue challan
      </Typography>
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Stack spacing={2}>
        <Autocomplete
          options={riderOptions}
          getOptionLabel={(o) => `${o.name || o.tmpIngameName} (${o.employeeID || '—'})`}
          onInputChange={(_, v) => setRiderQuery(v)}
          onChange={(_, v) => setAccused(v)}
          renderInput={(params) => <TextField {...params} label="Search rider" />}
        />
        <TextField
          select
          label="Offence"
          value={offenceId}
          onChange={(e) => setOffenceId(e.target.value)}
          fullWidth
        >
          {offences.filter((o) => o.active !== false).map((o) => (
            <MenuItem key={o._id} value={o._id}>
              {o.code} — {o.title} ({o.fineAmount} tokens)
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Notes" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth />
        <Stack direction="row" spacing={2}>
          <TextField select label="Proof type" value={proofType} onChange={(e) => setProofType(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="image">image</MenuItem>
            <MenuItem value="video">video</MenuItem>
          </TextField>
          <TextField label="Proof URL" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} fullWidth />
        </Stack>
        <Button variant="contained" disabled={!accused || !offenceId} onClick={submit}>
          Issue challan
        </Button>
      </Stack>
    </Box>
  );
}
