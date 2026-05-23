import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getMyBids } from '../services/cargoBidsService';
import { bidStatusChipColor } from '../utils/cargoBidUi';

export default function CargoBidMyBids() {
  const [bids, setBids] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyBids()
      .then(setBids)
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/cargo-bids" size="small" sx={{ mb: 2 }}>
        ← Auctions
      </Button>
      <Typography variant="h5" gutterBottom>
        My bids
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!bids.length && !error && <Alert severity="info">No bids yet.</Alert>}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Cargo</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Escrow</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((b) => (
            <TableRow key={b._id}>
              <TableCell>{b.lot?.cargoName || '—'}</TableCell>
              <TableCell align="right">{b.amountTokens}</TableCell>
              <TableCell>
                <Chip size="small" label={b.status} color={bidStatusChipColor(b.status)} />
              </TableCell>
              <TableCell align="right">{b.escrowLockedTokens || 0}</TableCell>
              <TableCell align="right">
                {b.lotId && (
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/cargo-bids/lots/${b.lotId}`}
                  >
                    View
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
