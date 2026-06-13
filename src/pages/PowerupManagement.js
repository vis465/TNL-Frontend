import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Slider,
  Stack,
  TextField,
  Alert
} from '@mui/material';
import {
  listPowerupConfigs,
  updatePowerupConfig
} from '../services/powerupAdminService';
import { PowerupBadge } from '../components/PowerupDisplay';

export default function PowerupManagement() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    try {
      const data = await listPowerupConfigs();
      setRows(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load powerup configs');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id, payload) => {
    try {
      await updatePowerupConfig(id, payload);
      setInfo('Config updated');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update config');
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Powerup Configuration</Typography>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" onClose={() => setInfo('')} sx={{ mb: 2 }}>{info}</Alert>}

      <Paper sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell width={220}>Weight</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Expiry (days)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell>
                  <PowerupBadge type={row.type} size={24} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {row.type}
                  </Typography>
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  <Slider
                    min={10}
                    max={100}
                    step={10}
                    value={Number(row.weight || 1)}
                    onChange={(_, value) => patch(row._id, { weight: Number(value) })}
                    valueLabelDisplay="auto"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={Boolean(row.enabled)}
                    onChange={(e) => patch(row._id, { enabled: e.target.checked })}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={Number(row.usageExpiryDays || 3)}
                    onChange={(e) => patch(row._id, { usageExpiryDays: Number(e.target.value) })}
                    inputProps={{ min: 1 }}
                    sx={{ width: 110 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
