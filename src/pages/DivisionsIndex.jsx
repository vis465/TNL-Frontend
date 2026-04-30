import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import MagicPageShell from '../components/magicui/MagicPageShell';
import DivisionBrowseCard from '../components/magicui/DivisionBrowseCard';
import RevealSection from '../components/magicui/RevealSection';
import { staggerContainer, staggerItem } from '../components/magicui/motionPresets';

export default function DivisionsIndex() {
  const user = getItemWithExpiry('user');
  const isAuthed = Boolean(user?.token || user?.id || user?._id);
  const [divisions, setDivisions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [listRes, lbRes] = await Promise.all([
          axiosInstance.get('/divisions/public/list'),
          axiosInstance
            .get('/divisions/leaderboard/global', { params: { limit: 200 } })
            .catch(() => ({ data: { divisions: [] } })),
        ]);
        setDivisions(listRes.data?.divisions || []);
        setLeaderboard(lbRes.data?.divisions || []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load divisions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statsBySlug = useMemo(() => {
    const map = new Map();
    (leaderboard || []).forEach((row) => {
      if (row.divisionId) map.set(String(row.divisionId), row);
    });
    return map;
  }, [leaderboard]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return divisions;
    return divisions.filter(
      (d) =>
        String(d.name || '').toLowerCase().includes(q) ||
        String(d.slug || '').toLowerCase().includes(q) ||
        String(d.description || '').toLowerCase().includes(q)
    );
  }, [divisions, query]);

  return (
    <MagicPageShell>
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 9 },
        }}
      >
        <Container maxWidth="lg">
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <GroupsOutlined sx={{ fontSize: 34 }} />
              <Typography variant="h3" fontWeight={900}>Divisions</Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
              Browse every division, compare activity, and jump into public profiles with smoother card browsing.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
              <Button component={RouterLink} to="/division-leaderboard" variant="contained" startIcon={<EmojiEventsOutlined />}>
                Leaderboard
              </Button>
              <Button component={RouterLink} to={isAuthed ? '/division' : '/login?next=/division'} variant="outlined">
                {isAuthed ? 'My division' : 'Sign in'}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <RevealSection sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search divisions by name, slug, or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </RevealSection>

        {!loading && filtered.length > 0 && (
          <RevealSection sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`${filtered.length} visible`} size="small" />
              <Chip label={`${divisions.length} total`} size="small" variant="outlined" />
              <Chip label="Public profiles + stats" size="small" variant="outlined" />
            </Stack>
          </RevealSection>
        )}

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid
            container
            spacing={2.5}
            component={motion.div}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((d) => {
              const stats = statsBySlug.get(String(d._id));
              return (
                <Grid item xs={12} sm={6} md={4} key={d._id} component={motion.div} variants={staggerItem}>
                  <DivisionBrowseCard division={d} stats={stats} />
                </Grid>
              );
            })}
            {!filtered.length && (
              <Grid item xs={12}>
                <Alert severity="info">No divisions match your search.</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
    </MagicPageShell>
  );
}
