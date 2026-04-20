import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import LocalAtmOutlined from '@mui/icons-material/LocalAtmOutlined';
import axiosInstance from '../utils/axios';

export default function DivisionsIndex() {
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
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 10 },
         
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <GroupsOutlined sx={{ fontSize: 40 }} />
            <Typography variant="h3" fontWeight={800}>
              Divisions
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 720 }}>
            Explore every division in the community. Join a division to share
            wallet funds, trucks, and compete together on the leaderboard.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
            <Button
              component={RouterLink}
              to="/division-leaderboard"
              variant="contained"
              color="warning"
              startIcon={<EmojiEventsOutlined />}
            >
              Leaderboard
            </Button>
            <Button
              component={RouterLink}
              to="/division"
              variant="outlined"
              sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              My division
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
          sx={{ mb: 3 }}
        />

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map((d) => {
              const stats = statsBySlug.get(String(d._id));
              return (
                <Grid item xs={12} sm={6} md={4} key={d._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    }}
                  >
                    <CardActionArea component={RouterLink} to={`/divisions/${d.slug}`}>
                      <Box
                        sx={{
                          height: 120,
                          backgroundImage: d.bannerUrl ? `url(${d.bannerUrl})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          background: d.bannerUrl
                            ? undefined
                            : (t) =>
                                `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))',
                          }}
                        />
                      </Box>
                      <CardContent sx={{ pt: 3, position: 'relative' }}>
                        <Avatar
                          src={d.logoUrl || undefined}
                          sx={{
                            width: 56,
                            height: 56,
                            border: '3px solid',
                            borderColor: 'background.paper',
                            mt: -7,
                            boxShadow: 2,
                          }}
                        >
                          {d.name?.[0]}
                        </Avatar>
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                          {d.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /{d.slug}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            minHeight: 40,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {d.description || 'A division in our community.'}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ mt: 1.5 }}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Chip
                            size="small"
                            icon={<GroupsOutlined sx={{ fontSize: 16 }} />}
                            label={`${d.memberCount ?? 0}`}
                          />
                          {stats && (
                            <>
                              <Chip
                                size="small"
                                icon={<LocalAtmOutlined sx={{ fontSize: 16 }} />}
                                label={`${Math.round(stats.totalRevenue || 0).toLocaleString()}`}
                                color="success"
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`${stats.totalJobs || 0} jobs`}
                                variant="outlined"
                              />
                            </>
                          )}
                          <Chip size="small" label={`Tax ${d.taxPercent ?? 0}%`} variant="outlined" />
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
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
  );
}
