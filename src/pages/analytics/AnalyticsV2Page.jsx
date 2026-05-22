import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchV2Summary } from '../../services/analyticsV2Api';
import axiosInstance from '../../utils/axios';

const PERIODS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const FOCUS_OPTIONS = [
  { id: 'all', label: 'All insights' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'divisions', label: 'Divisions' },
  { id: 'quality', label: 'Job quality' },
  { id: 'community', label: 'Events & HR' },
  { id: 'fleet', label: 'Fleet & cargo' },
];

const CHART_COLORS = ['#5B8DEF', '#3DD68C', '#F5A524', '#F97066', '#9B8AFB', '#38BDF8'];
const BOOKING_COLORS = { approved: '#3DD68C', pending: '#F5A524', rejected: '#F97066', cancelled: '#94A3B8' };

function formatNum(n, opts = {}) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  if (opts.compact && v >= 1000) {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  }
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: opts.decimals ?? 0 }).format(v);
}

function DeltaBadge({ value }) {
  const v = Number(value);
  if (!Number.isFinite(v) || v === 0) {
    return (
      <Chip
        size="small"
        icon={<RemoveIcon sx={{ fontSize: 14 }} />}
        label="0%"
        sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'action.hover' }}
      />
    );
  }
  const up = v > 0;
  return (
    <Chip
      size="small"
      icon={up ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
      label={`${up ? '+' : ''}${v}%`}
      color={up ? 'success' : 'error'}
      variant="outlined"
      sx={{ height: 22, fontSize: '0.7rem' }}
    />
  );
}

function KpiTile({ label, value, sub, delta, accent }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        borderColor: 'divider',
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.5 }}>
        <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
          {value}
        </Typography>
        {delta != null && <DeltaBadge value={delta} />}
      </Stack>
      {sub && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

function Section({ title, description, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Paper variant="outlined" sx={{ mb: 2, overflow: 'hidden', borderColor: 'divider' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          bgcolor: 'action.hover',
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        <IconButton size="small" aria-label={open ? 'Collapse' : 'Expand'}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ p: 2, pt: 1 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
}

function ChartShell({ height = 280, children, empty }) {
  if (empty) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        <Typography color="text.secondary">No data for this period</Typography>
      </Box>
    );
  }
  return <Box sx={{ width: '100%', height }}>{children}</Box>;
}

export default function AnalyticsV2Page() {
  const [days, setDays] = useState(30);
  const [focus, setFocus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const summary = await fetchV2Summary(days);
      setData(summary);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const show = (id) => focus === 'all' || focus === id;

  const overview = data?.overview;
  const operations = data?.operations;
  const growth = data?.growth;
  const fleet = data?.fleet;
  const financial = data?.financial;
  const engagement = data?.engagement;
  const divisions = data?.divisions;
  const timeSeries = data?.timeSeries || [];
  const fuelTrend = divisions?.fuel?.trendByDay || [];

  const bookingPie = useMemo(() => {
    const b = engagement?.bookings;
    if (!b) return [];
    return [
      { name: 'Approved', value: b.approved, key: 'approved' },
      { name: 'Pending', value: b.pending, key: 'pending' },
      { name: 'Rejected', value: b.rejected, key: 'rejected' },
      { name: 'Cancelled', value: b.cancelled, key: 'cancelled' },
    ].filter((x) => x.value > 0);
  }, [engagement]);

  const exportApproved = async () => {
    const response = await axiosInstance.get('/analytics/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'approved-bookings.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportSlots = async () => {
    const response = await axiosInstance.get('/analytics/export-event-slots', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'event-slot-bookings.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const priorLabel = `vs prior ${days}d`;

  return (
    <Container maxWidth="xl" sx={{ py: 3, pb: 6 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
            Platform health at a glance. Compare the selected window to the previous period of equal length (UTC).
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <ToggleButtonGroup
            value={days}
            exclusive
            size="small"
            onChange={(_, v) => v != null && setDays(v)}
          >
            {PERIODS.map((p) => (
              <ToggleButton key={p.days} value={p.days}>
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <IconButton onClick={load} disabled={loading} aria-label="Refresh">
            {loading ? <CircularProgress size={22} /> : <RefreshIcon />}
          </IconButton>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportApproved}>
            Bookings CSV
          </Button>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportSlots}>
            Slots CSV
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {FOCUS_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            label={opt.label}
            onClick={() => setFocus(opt.id)}
            color={focus === opt.id ? 'primary' : 'default'}
            variant={focus === opt.id ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {loading && !data && <LinearProgress sx={{ mb: 2 }} />}

      {data && (
        <>
          {(show('deliveries') || show('all')) && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <KpiTile
                  label="Deliveries"
                  value={formatNum(overview?.current?.deliveriesRecorded)}
                  delta={overview?.deltas?.deliveriesPct}
                  sub={priorLabel}
                  accent="#5B8DEF"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <KpiTile
                  label="Revenue"
                  value={formatNum(overview?.current?.totalRevenue, { compact: true })}
                  delta={overview?.deltas?.revenuePct}
                  sub={priorLabel}
                  accent="#3DD68C"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <KpiTile
                  label="Distance"
                  value={`${formatNum(overview?.current?.totalDistanceKm, { compact: true })} km`}
                  delta={overview?.deltas?.distancePct}
                  sub={priorLabel}
                  accent="#38BDF8"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <KpiTile
                  label="Revenue / km"
                  value={formatNum(overview?.current?.revenuePerKm, { decimals: 2 })}
                  delta={overview?.deltas?.revenuePerKmPct}
                  sub={priorLabel}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <KpiTile
                  label="Active riders"
                  value={formatNum(overview?.current?.uniqueRiders)}
                  delta={overview?.deltas?.ridersPct}
                  sub={`${formatNum(overview?.platform?.activeRiders)} registered`}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3} lg={2}>
                <KpiTile
                  label="Active divisions"
                  value={formatNum(overview?.current?.uniqueDivisions)}
                  delta={overview?.deltas?.divisionsPct}
                  sub={`${formatNum(overview?.platform?.activeDivisions)} flagged active`}
                />
              </Grid>
            </Grid>
          )}

          {show('deliveries') && (
            <Section
              title="Delivery trend"
              description="Daily deliveries and revenue from durable KPI buckets"
              defaultOpen
            >
              <ChartShell height={300} empty={!timeSeries.length}>
                <ResponsiveContainer>
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="deliveries"
                      name="Deliveries"
                      fill="#5B8DEF"
                      fillOpacity={0.25}
                      stroke="#5B8DEF"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#3DD68C"
                      dot={false}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartShell>
            </Section>
          )}

          {show('divisions') && divisions && (
            <Section
              title="Divisions"
              description="Division wallets, fuel tanks, fleet trucks, and leaderboard activity in the selected window"
              defaultOpen={focus === 'divisions'}
            >
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Division jobs"
                    value={formatNum(divisions.periodTotals?.jobs)}
                    delta={divisions.deltas?.jobsPct}
                    sub={priorLabel}
                    accent="#9B8AFB"
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Division revenue"
                    value={formatNum(divisions.periodTotals?.revenue, { compact: true })}
                    delta={divisions.deltas?.revenuePct}
                    sub={priorLabel}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Fuel burned"
                    value={`${formatNum(divisions.fuel?.burnedInPeriod, { compact: true })} L`}
                    delta={divisions.fuel?.burnedDeltaPct}
                    sub={`${formatNum(divisions.fuel?.purchaseLiters)} L purchased`}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Division tax (tokens)"
                    value={formatNum(divisions.periodTotals?.taxTokens, { compact: true })}
                    delta={divisions.deltas?.taxTokensPct}
                    sub={priorLabel}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Wallet balances"
                    value={formatNum(divisions.platform?.totalWalletBalance, { compact: true })}
                    sub={`${formatNum(divisions.platform?.activeDivisions)} active divisions`}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Fuel in tanks"
                    value={`${formatNum(
                      (divisions.platform?.fuelNormalLiters || 0) +
                        (divisions.platform?.fuelPremiumLiters || 0),
                      { compact: true }
                    )} L`}
                    sub={`${formatNum(divisions.platform?.fuelNormalLiters)} std · ${formatNum(divisions.platform?.fuelPremiumLiters)} prem`}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Division trucks"
                    value={formatNum(divisions.platform?.divisionTrucks)}
                    sub={`${formatNum(divisions.platform?.trucksBlocked)} blocked · ${formatNum(divisions.fleetPeriod?.kmApplied, { compact: true })} km applied`}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <KpiTile
                    label="Fleet odometer (all)"
                    value={`${formatNum(divisions.platform?.fleetOdometerKm, { compact: true })} km`}
                    sub={`${formatNum(divisions.fleetPeriod?.ledgerDeliveries)} ledger deliveries in window`}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Fuel burned per day (divisions)
                  </Typography>
                  <ChartShell height={240} empty={!fuelTrend.length}>
                    <ResponsiveContainer>
                      <ComposedChart data={fuelTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="fuelBurned"
                          name="Fuel (L)"
                          fill="#F5A524"
                          fillOpacity={0.2}
                          stroke="#F5A524"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Top divisions by jobs
                  </Typography>
                  <ChartShell height={240} empty={!(divisions.topDivisions || []).length}>
                    <ResponsiveContainer>
                      <BarChart
                        data={divisions.topDivisions || []}
                        layout="vertical"
                        margin={{ left: 8, right: 12 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="jobs" name="Jobs" fill="#9B8AFB" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </Grid>
              </Grid>
              {(divisions.topDivisions || []).length > 0 && (
                <Box sx={{ mt: 2, overflowX: 'auto' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Division detail (period)
                  </Typography>
                  <Grid container spacing={1}>
                    {divisions.topDivisions.map((d) => (
                      <Grid item xs={12} sm={6} md={4} key={d.divisionId}>
                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {d.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatNum(d.jobs)} jobs · {formatNum(d.revenue, { compact: true })} rev ·{' '}
                            {formatNum(d.fuelBurned)} L fuel
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Wallet {formatNum(d.walletBalance, { compact: true })} · {formatNum(d.memberCount)}{' '}
                            members
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Section>
          )}

          {show('quality') && (
            <Section
              title="Job quality"
              description="Penalty rates derived from delivered jobs in the window"
              defaultOpen={focus === 'quality'}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiTile
                    label="Auto-park rate"
                    value={`${operations?.current?.autoParkRatePercent ?? 0}%`}
                    delta={operations?.deltas?.autoParkRatePct}
                    sub={`Prior: ${operations?.previous?.autoParkRatePercent ?? 0}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiTile
                    label="Avg cargo damage"
                    value={`${operations?.current?.avgCargoDamagePercent ?? 0}%`}
                    delta={operations?.deltas?.avgCargoDamagePct}
                    sub={`Prior: ${operations?.previous?.avgCargoDamagePercent ?? 0}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiTile
                    label="Deliveries / rider"
                    value={formatNum(growth?.current?.deliveriesPerActiveRider, { decimals: 2 })}
                    delta={growth?.deltas?.deliveriesPerRiderPct}
                    sub={`${formatNum(growth?.current?.activeDeliveringRiders)} delivering riders`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KpiTile
                    label="Fleet km accrued"
                    value={`${formatNum(fleet?.fleetKmAccrued?.current, { compact: true })} km`}
                    delta={fleet?.fleetKmDeltaPct}
                    sub={priorLabel}
                  />
                </Grid>
              </Grid>
            </Section>
          )}

          {show('community') && (
            <Section
              title="Events, attendance & bookings"
              description="Live platform engagement (not limited to the delivery window)"
              defaultOpen={focus === 'community'}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="Slot bookings"
                        value={formatNum(engagement?.bookings?.total)}
                        sub={`${engagement?.bookings?.approvalRatePercent ?? 0}% approved`}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="Pending bookings"
                        value={formatNum(engagement?.bookings?.pending)}
                        sub="Needs staff action"
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="HR attendance events"
                        value={formatNum(engagement?.hrAttendance?.eventsTotal)}
                        sub={`${formatNum(engagement?.hrAttendance?.eventsOpen)} open for marking`}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="Approved HR marks"
                        value={formatNum(engagement?.hrAttendance?.approvedEntries)}
                        sub="All-time approved entries"
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="External convoys"
                        value={formatNum(engagement?.externalAttendance?.total)}
                        sub={`${formatNum(engagement?.externalAttendance?.upcoming)} upcoming`}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="Contracts"
                        value={formatNum(engagement?.contracts?.active)}
                        sub={`${formatNum(engagement?.contracts?.completed)} completed · ${formatNum(engagement?.contracts?.failed)} failed`}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <KpiTile
                        label="Active challenges"
                        value={formatNum(engagement?.activeChallenges)}
                        sub="Challenge programs running"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Booking mix
                  </Typography>
                  <ChartShell height={220} empty={!bookingPie.length}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={bookingPie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {bookingPie.map((entry) => (
                            <Cell key={entry.key} fill={BOOKING_COLORS[entry.key] || CHART_COLORS[0]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </Grid>
              </Grid>
            </Section>
          )}

          {show('fleet') && (
            <Section
              title="Fleet & cargo"
              description="Division fleet inventory, job truck usage, and top cargo types"
              defaultOpen={focus === 'fleet'}
            >
              {divisions?.platform && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <KpiTile
                      label="Owned division trucks"
                      value={formatNum(divisions.platform.divisionTrucks)}
                      sub={`${formatNum(divisions.platform.trucksBlocked)} in maintenance`}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <KpiTile
                      label="Km applied (period)"
                      value={formatNum(divisions.fleetPeriod?.kmApplied, { compact: true })}
                      sub="Fleet odometer accrual"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <KpiTile
                      label="Lifetime fleet km"
                      value={formatNum(divisions.platform.fleetOdometerKm, { compact: true })}
                      sub={`Wear ${formatNum(divisions.platform.fleetWearKm, { compact: true })} km`}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <KpiTile
                      label="Fleet deliveries"
                      value={formatNum(divisions.platform.fleetLifetimeDeliveries)}
                      sub="All-time on division trucks"
                    />
                  </Grid>
                </Grid>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Top truck models (job usage)
                  </Typography>
                  <ChartShell height={260} empty={!(fleet?.topTrucks || []).length}>
                    <ResponsiveContainer>
                      <BarChart
                        data={fleet?.topTrucks || []}
                        layout="vertical"
                        margin={{ left: 8, right: 16 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="jobs" name="Jobs" fill="#5B8DEF" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartShell>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {formatNum(fleet?.truckModelsTracked)} models · {formatNum(fleet?.jobsAnalyzed)} jobs in usage
                    sample
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Top cargo types
                  </Typography>
                  <ChartShell height={260} empty={!(financial?.topCargo || []).length}>
                    <ResponsiveContainer>
                      <BarChart
                        data={financial?.topCargo || []}
                        layout="vertical"
                        margin={{ left: 8, right: 16 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="jobs" name="Jobs" fill="#3DD68C" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartShell>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {formatNum(financial?.cargoJobsRecorded)} cargo deliveries recorded (deduped)
                  </Typography>
                </Grid>
              </Grid>
            </Section>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Last updated {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}
          </Typography>
        </>
      )}
    </Container>
  );
}
