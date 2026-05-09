import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axios';
import DashboardHero from '../components/magicui/DashboardHero';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { BentoGrid, BentoItem } from '../components/magicui/BentoGrid';
import AnimatedTabPanel from '../components/magicui/AnimatedTabPanel';
import DivisionBrowseCard from '../components/magicui/DivisionBrowseCard';
import RevealSection from '../components/magicui/RevealSection';
import NumberTicker from '../components/magicui/NumberTicker';

export default function DivisionLeaderboard() {
  const [rows, setRows] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('uniqueEventsAttended');
  const [dir, setDir] = useState('desc');
  const [period, setPeriod] = useState('all-time');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dailyDate, setDailyDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const load = async (
    nextSort = sort,
    nextDir = dir,
    nextPeriod = period,
    nextMonth = month,
    nextDailyDate = dailyDate
  ) => {
    setLoading(true);
    setError('');
    try {
      const [lb, list] = await Promise.all([
        axiosInstance.get('/divisions/leaderboard/global', {
          params: {
            limit: 50,
            sort: nextSort,
            dir: nextDir,
            ...(nextPeriod === 'monthly' ? { period: 'monthly', month: nextMonth } : {}),
            ...(nextPeriod === 'daily' ? { period: 'daily', date: nextDailyDate } : {}),
          },
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
    if (period === 'monthly' || period === 'all-time' || period === 'daily') {
      load(sort, dir, period, month, dailyDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, month, dailyDate]);

  const toggleSort = (key) => {
    const nextDir = sort === key ? (dir === 'asc' ? 'desc' : 'asc') : 'desc';
    setSort(key);
    setDir(nextDir);
    load(key, nextDir, period, month, dailyDate);
  };

  const divBySlug = new Map(divisions.map((d) => [String(d._id), d]));
  const top = rows.slice(0, 3);
  const formatMonthLabel = (value) => {
    if (!value) return '';
    const [year, monthPart] = String(value).split('-');
    const date = new Date(`${year}-${monthPart}-01`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  };

  const formatDayLabel = (value) => {
    if (!value) return '';
    const [y, m, day] = String(value).split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(day));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const attendanceCount = (r) => Number(r?.uniqueEventsAttended ?? 0);

  return (
    <MagicPageShell>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DashboardHero
        title="Division Leaderboard"
        subtitle={
          period === 'monthly'
            ? `Monthly division rankings for ${formatMonthLabel(month)}.`
            : period === 'daily'
              ? `Daily division rankings for ${formatDayLabel(dailyDate)} (UTC day by approval time).`
              : 'Live inter-division rankings by attendance, scale, and execution. Explore top contenders or drill into the complete ecosystem.'
        }
        stats={[
          { label: 'Tracked Divisions', value: divisions.length },
          { label: 'Ranked Divisions', value: rows.length },
          { label: 'Top unique events', value: attendanceCount(rows[0]) },
          { label: 'Top Wallet', value: Number(rows[0]?.totalTaxTokens || 0) },
        ]}
      />
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <EmojiEvents sx={{ fontSize: 30, color: 'warning.main' }} />
        <Typography variant="h5" fontWeight={800}>Global standings</Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Unique attendance counts each internal event once per division (distinct event IDs), not total member marks.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, value) => value && setPeriod(value)}
          size="small"
          color="primary"
          aria-label="leaderboard period"
        >
          <ToggleButton value="all-time">All time</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="daily">Daily</ToggleButton>
        </ToggleButtonGroup>
        {period === 'monthly' && (
          <TextField
            type="month"
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ maxWidth: 200 }}
          />
        )}
        {period === 'daily' && (
          <TextField
            type="date"
            label="Day (UTC filter)"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ maxWidth: 200 }}
          />
        )}
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Top divisions" />
        <Tab label="All divisions" />
      </Tabs>

      <AnimatedTabPanel panelKey={`division-lb-${tab}`}>
      {tab === 0 && (
        <>
          {!!top.length && (
            <BentoGrid minItemWidth={280} gap={2} sx={{ mb: 4, position: 'relative', zIndex: 2, overflow: 'visible' }}>
              {top.map((r, idx) => {
                const d = divBySlug.get(String(r.divisionId));
                return (
                  <BentoItem key={r.divisionId}>
                    <DivisionBrowseCard
                      division={{
                        _id: d?._id || r.divisionId,
                        slug: d?.slug || '',
                        name: r.name,
                        logoUrl: d?.logoUrl,
                        bannerUrl: d?.bannerUrl,
                        description: d?.description || `Rank #${idx + 1} division`,
                        memberCount: r.memberCount,
                        taxPercent: d?.taxPercent ?? 0,
                      }}
                      stats={r}
                      compact
                    />
                    <Paper sx={{ mt: 1, p: 1.25, borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">Rank #{idx + 1}</Typography>
                        <Typography variant="body2" fontWeight={800}>
                          <NumberTicker value={Math.round(attendanceCount(r))} /> events
                        </Typography>
                      </Stack>
                    </Paper>
                  </BentoItem>
                );
              })}
            </BentoGrid>
          )}

          <RevealSection>
          <Card component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} sx={{ position: 'relative', zIndex: 1 }}>
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
                    <TableCell align="right" sortDirection={sort === 'uniqueEventsAttended' ? dir : false}>
                      <TableSortLabel
                        active={sort === 'uniqueEventsAttended'}
                        direction={sort === 'uniqueEventsAttended' ? dir : 'desc'}
                        onClick={() => toggleSort('uniqueEventsAttended')}
                      >
                        Unique attendance
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
                      <TableRow key={r.divisionId} hover component={motion.tr} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: idx * 0.012 }}>
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
                        <TableCell align="right">{Math.round(attendanceCount(r)).toLocaleString()}</TableCell>
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
          </RevealSection>
        </>
      )}

      {tab === 1 && (
        <BentoGrid minItemWidth={260} gap={2}>
          {divisions.map((d) => (
            <BentoItem key={d._id}>
              <DivisionBrowseCard division={d} stats={null} compact />
            </BentoItem>
          ))}
          {!divisions.length && !loading && (
            <BentoItem span={2}>
              <Card variant="outlined"><CardContent><Typography color="text.secondary">No divisions yet.</Typography></CardContent></Card>
            </BentoItem>
          )}
        </BentoGrid>
      )}
      </AnimatedTabPanel>
    </Container>
    </MagicPageShell>
  );
}
