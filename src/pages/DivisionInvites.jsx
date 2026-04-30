import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import MagicPageShell from '../components/magicui/MagicPageShell';
import RevealSection from '../components/magicui/RevealSection';

export default function DivisionInvites() {
  const [invites, setInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, reqRes] = await Promise.all([
        axiosInstance.get('/me/division/invites'),
        axiosInstance.get('/me/division/join-requests').catch(() => ({ data: { requests: [] } })),
      ]);
      setInvites(invRes.data.invites || []);
      setRequests(reqRes.data.requests || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    setMsg('');
    try {
      await axiosInstance.post(`/me/division/invites/${id}/accept`);
      setMsg('Joined division!');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Accept failed');
    }
  };

  const decline = async (id) => {
    setMsg('');
    try {
      await axiosInstance.post(`/me/division/invites/${id}/decline`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Decline failed');
    }
  };

  const cancelRequest = async (id) => {
    setMsg('');
    try {
      await axiosInstance.delete(`/me/division/join-requests/${id}`);
      setMsg('Request cancelled');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <MagicPageShell>
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button component={RouterLink} to="/dashboard">Back to dashboard</Button>
        <Button component={RouterLink} to="/division" variant="outlined">My division</Button>
      </Stack>
      <RevealSection>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Division invitations</Typography>
      </RevealSection>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Invites from division leaders
      </Typography>
      {!invites.length && !loading && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>No pending invitations.</Typography>
      )}

      <Stack spacing={2}>
        <AnimatePresence>
        {invites.map((inv) => {
          const d = inv.divisionId;
          return (
            <Card
              key={inv._id}
              component={motion.div}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CardContent>
                <Typography fontWeight={700}>{d?.name || 'Division'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tax: {d?.taxPercent ?? 0}% · Members: {d?.memberCount ?? 0}
                  {d?.maxMembers != null ? ` / max ${d.maxMembers}` : ''}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                  Expires {new Date(inv.expiresAt).toLocaleString()}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={() => accept(inv._id)}>Accept</Button>
                  <Button variant="outlined" onClick={() => decline(inv._id)}>Decline</Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
        </AnimatePresence>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Your applications
      </Typography>
      {!requests.length && !loading && (
        <Typography color="text.secondary">
          You haven't applied to any division.{' '}
          <Button component={RouterLink} to="/division-leaderboard" size="small">Browse divisions</Button>
        </Typography>
      )}

      <Stack spacing={2}>
        <AnimatePresence>
        {requests.map((r) => {
          const d = r.divisionId || {};
          return (
            <Card
              key={r._id}
              variant="outlined"
              component={motion.div}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={d.logoUrl || undefined}>{d.name?.[0] || 'D'}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700}>{d.name || 'Division'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applied {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                    </Typography>
                    {r.message && (
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        "{r.message}"
                      </Typography>
                    )}
                  </Box>
                  <Chip label="Pending" color="warning" size="small" />
                  {d.slug && (
                    <Button component={RouterLink} to={`/divisions/${d.slug}`} size="small">View</Button>
                  )}
                  <Button size="small" color="error" onClick={() => cancelRequest(r._id)}>Cancel</Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
        </AnimatePresence>
      </Stack>
    </Container>
    </MagicPageShell>
  );
}
