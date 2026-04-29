import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import DashboardHero from '../components/magicui/DashboardHero';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { BentoGrid, BentoItem } from '../components/magicui/BentoGrid';

export default function DivisionLeaderboard() {
  const [rows, setRows] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('totalRevenue');
  const [dir, setDir] = useState('desc');

  const load = async (nextSort = sort, nextDir = dir) => {
    setLoading(true);
    setError('');
    try {
      const [lb, list] = await Promise.all([
        axiosInstance.get('/divisions/leaderboard/global', {
          params: { limit: 50, sort: nextSort, dir: nextDir },
        }),
        axiosInstance.get('/divisions/public/list').catch(() => ({ data: { divisions: [] } })),
      ]);
      setRows(lb.data.divisions || []);
      setDivisions(list.data.divisions || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSort = (key) => {
    const nextDir = sort === key ? (dir === 'asc' ? 'desc' : 'asc') : 'desc';
    setSort(key);
    setDir(nextDir);
    load(key, nextDir);
  };

  const divBySlug = new Map(divisions.map((d) => [String(d._id), d]));
  const top = rows.slice(0, 3);

  return (
    <MagicPageShell>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DashboardHero
        title="Division Leaderboard"
        subtitle="Live inter-division rankings by revenue, scale, and execution. Explore top contenders or drill into the complete ecosystem."
        stats={[
          { label: 'Tracked Divisions', value: divisions.length },
          { label: 'Ranked Divisions', value: rows.length },
          { label: 'Top Revenue', value: Number(rows[0]?.totalRevenue || 0) },
          { label: 'Top Wallet', value: Number(rows[0]?.totalTaxTokens || 0) },
        ]}
      />
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <EmojiEvents sx={{ fontSize: 30, color: 'warning.main' }} />
        <Typography variant="h5" fontWeight={800}>Global standings</Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Inter-division ranking by total revenue generated from normalized job data.
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Top divisions" />
        <Tab label="All divisions" />
      </Tabs>

      {tab === 0 && (
        <>
          {!!top.length && (
            <BentoGrid minItemWidth={280} gap={2} sx={{ mb: 3 }}>
              {top.map((r, idx) => {
                const medal = ['#FFD700', '#C0C0C0', '#CD7F32'][idx];
                const d = divBySlug.get(String(r.divisionId));
                return (
                  <BentoItem key={r.divisionId}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: medal,
                        borderWidth: 2,
                        overflow: 'hidden',
                        height: '100%',
                      }}
                    >
                      <CardActionArea component={RouterLink} to={d?.slug ? `/divisions/${d.slug}` : '#'}>
                        <Box sx={{ width: '100%', aspectRatio: '1920 / 500', bgcolor: 'common.black', overflow: 'hidden' }}>
                          {d?.bannerUrl ? (
                            <Box
                              component="img"
                              src={d.bannerUrl}
                              alt="banner"
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                            />
                          ) : (
                            <Box sx={{ width: '100%', height: '100%', background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})` }} />
                          )}
                        </Box>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar src={d?.logoUrl || undefined} sx={{ width: 56, height: 56, mt: -5, border: '3px solid', borderColor: medal }}>
                              {r.name?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="overline" sx={{ color: medal }}>Rank #{idx + 1}</Typography>
                              <Typography variant="h6" fontWeight={800} noWrap>{r.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {r.memberCount} members · {r.totalJobs} jobs
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                            <Chip size="small" label={`Wallet ${Math.round(r.totalTaxTokens || 0).toLocaleString()}`} />
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </BentoItem>
                );
              })}
            </BentoGrid>
          )}

          <Card>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell sortDirection={sort === 'name' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'name'}
                        direction={sort === 'name' ? dir : 'asc'}
                        onClick={() => toggleSort('name')}
                      >
                        Division
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sort === 'memberCount' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'memberCount'}
                        direction={sort === 'memberCount' ? dir : 'desc'}
                        onClick={() => toggleSort('memberCount')}
                      >
                        Members
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sort === 'totalJobs' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'totalJobs'}
                        direction={sort === 'totalJobs' ? dir : 'desc'}
                        onClick={() => toggleSort('totalJobs')}
                      >
                        Jobs
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sort === 'totalDistance' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'totalDistance'}
                        direction={sort === 'totalDistance' ? dir : 'desc'}
                        onClick={() => toggleSort('totalDistance')}
                      >
                        Distance (km)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sort === 'totalRevenue' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'totalRevenue'}
                        direction={sort === 'totalRevenue' ? dir : 'desc'}
                        onClick={() => toggleSort('totalRevenue')}
                      >
                        Revenue
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sort === 'totalTaxTokens' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'totalTaxTokens'}
                        direction={sort === 'totalTaxTokens' ? dir : 'desc'}
                        onClick={() => toggleSort('totalTaxTokens')}
                      >
                        Wallet tokens
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, idx) => {
                    const d = divBySlug.get(String(r.divisionId));
                    return (
                      <TableRow key={r.divisionId} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar src={d?.logoUrl || undefined} sx={{ width: 28, height: 28 }}>{r.name?.[0]}</Avatar>
                            <Box>
                              <Typography
                                component={RouterLink}
                                to={d?.slug ? `/divisions/${d.slug}` : '#'}
                                variant="body2"
                                fontWeight={600}
                                sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                              >
                                {r.name}
                              </Typography>
                              {d?.slug && (
                                <Typography variant="caption" color="text.secondary">/{d.slug}</Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{r.memberCount}</TableCell>
                        <TableCell align="right">{r.totalJobs}</TableCell>
                        <TableCell align="right">{Math.round(r.totalDistance || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">{Math.round(r.totalRevenue || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">{Math.round(r.totalTaxTokens || 0).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!rows.length && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No division activity yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {tab === 1 && (
        <BentoGrid minItemWidth={260} gap={2}>
          {divisions.map((d) => (
            <BentoItem key={d._id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea component={RouterLink} to={`/divisions/${d.slug}`}>
                  <Box sx={{ width: '100%', aspectRatio: '1920 / 500', bgcolor: 'common.black', overflow: 'hidden' }}>
                    {d.bannerUrl ? (
                      <Box
                        component="img"
                        src={d.bannerUrl}
                        alt="banner"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})` }} />
                    )}
                  </Box>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={d.logoUrl || undefined} sx={{ width: 40, height: 40, mt: -4, border: '2px solid', borderColor: 'background.paper' }}>
                        {d.name?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{d.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.memberCount ?? 0} members</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {d.description || 'No description yet.'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </BentoItem>
          ))}
          {!divisions.length && !loading && (
            <BentoItem span={2}>
              <Card variant="outlined"><CardContent><Typography color="text.secondary">No divisions yet.</Typography></CardContent></Card>
            </BentoItem>
          )}
        </BentoGrid>
      )}
    </Container>
    </MagicPageShell>
  );
}
