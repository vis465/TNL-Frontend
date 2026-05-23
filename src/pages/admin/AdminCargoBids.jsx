import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { adminListSessions } from '../../services/cargoBidsService';
import { getSessionPhaseLabel } from '../../utils/cargoBidUi';

export default function AdminCargoBids() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminListSessions()
      .then(setSessions)
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Cargo auctions</Typography>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/admin/cargo-bids/config" variant="outlined">
            Settings
          </Button>
          <Button component={RouterLink} to="/admin/cargo-bids/sessions/new" variant="contained">
            New session
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Phase</TableCell>
              <TableCell>Lots</TableCell>
              <TableCell>Bidding window</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{s.title}</TableCell>
                <TableCell>
                  <Chip size="small" label={s.status} />
                </TableCell>
                <TableCell>{getSessionPhaseLabel(s.phase)}</TableCell>
                <TableCell>{s.lotCount}</TableCell>
                <TableCell>
                  {s.biddingStartsAt
                    ? `${new Date(s.biddingStartsAt).toLocaleString()} – ${new Date(s.biddingEndsAt).toLocaleString()}`
                    : '—'}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" component={RouterLink} to={`/admin/cargo-bids/sessions/${s._id}`}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/admin/cargo-bids/sessions/${s._id}/analytics`}
                  >
                    Analytics
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {!sessions.length && !error && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No sessions yet.</Typography>
        </Box>
      )}
    </Container>
  );
}
