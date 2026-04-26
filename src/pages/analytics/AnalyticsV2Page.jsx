import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {
  fetchV2Overview,
  fetchV2Operations,
  fetchV2Growth,
  fetchV2Fleet,
  fetchV2Financial,
} from '../../services/analyticsV2Api';
import axiosInstance from '../../utils/axios';

const LegacyAnalyticsDashboard = lazy(() => import('../AnalyticsDashboard'));

function KpiCard({ title, primary, sub }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={800}>
          {primary}
        </Typography>
        {sub != null && sub !== '' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsV2Page() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [operations, setOperations] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [fleet, setFleet] = useState(null);
  const [financial, setFinancial] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [o, op, g, f, fi] = await Promise.all([
          fetchV2Overview(),
          fetchV2Operations(),
          fetchV2Growth(),
          fetchV2Fleet(),
          fetchV2Financial(),
        ]);
        if (!cancelled) {
          setOverview(o);
          setOperations(op);
          setGrowth(g);
          setFleet(f);
          setFinancial(fi);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load analytics v2');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            KPI-first view (last 30 days vs previous 30 days). Durable job metrics use read models when enabled on
            the API.
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportApproved}>
            Approved bookings CSV
          </Button>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportSlots}>
            Event slots CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Operations" />
        <Tab label="Growth" />
        <Tab label="Fleet" />
        <Tab label="Financial" />
        <Tab label="Classic dashboard" />
      </Tabs>

      {tab === 0 && overview && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Deliveries (30d)"
              primary={overview.current?.deliveriesRecorded ?? 0}
              sub={`${overview.deltas?.deliveriesPct ?? 0}% vs prior 30d`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Revenue (30d)"
              primary={Math.round(overview.current?.totalRevenue ?? 0)}
              sub={`${overview.deltas?.revenuePct ?? 0}% vs prior 30d`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Distance km (30d)"
              primary={Math.round(overview.current?.totalDistanceKm ?? 0)}
              sub={`${overview.deltas?.distancePct ?? 0}% vs prior 30d`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Revenue / km"
              primary={overview.current?.revenuePerKm ?? 0}
              sub={`${overview.deltas?.revenuePerKmPct ?? 0}% vs prior 30d`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Riders with deliveries"
              primary={overview.current?.uniqueRiders ?? 0}
              sub={`${overview.deltas?.ridersPct ?? 0}% vs prior 30d`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Divisions with deliveries"
              primary={overview.current?.uniqueDivisions ?? 0}
              sub={`${overview.deltas?.divisionsPct ?? 0}% vs prior 30d`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="Active divisions (flagged)" primary={overview.platform?.activeDivisions ?? 0} sub="" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard title="Riders (total)" primary={overview.platform?.activeRiders ?? 0} sub="" />
          </Grid>
        </Grid>
      )}

      {tab === 1 && operations && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <KpiCard
              title="Auto-park rate"
              primary={`${operations.current?.autoParkRatePercent ?? 0}%`}
              sub={`Prior: ${operations.previous?.autoParkRatePercent ?? 0}%`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard
              title="Avg cargo damage %"
              primary={operations.current?.avgCargoDamagePercent ?? 0}
              sub={`Prior: ${operations.previous?.avgCargoDamagePercent ?? 0}`}
            />
          </Grid>
        </Grid>
      )}

      {tab === 2 && growth && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <KpiCard title="Deliveries / active rider" primary={growth.current?.deliveriesPerActiveRider ?? 0} sub="" />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard title="Active delivering riders" primary={growth.current?.activeDeliveringRiders ?? 0} sub="" />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard
              title="Active delivering divisions"
              primary={growth.current?.activeDeliveringDivisions ?? 0}
              sub=""
            />
          </Grid>
        </Grid>
      )}

      {tab === 3 && fleet && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <KpiCard
              title="Fleet km accrued (30d)"
              primary={Math.round(fleet.fleetKmAccrued?.current ?? 0)}
              sub={`Prior 30d: ${Math.round(fleet.fleetKmAccrued?.previous ?? 0)}`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard
              title="Truck models tracked (usage)"
              primary={fleet.truckDashboard?.jobUsage?.summary?.trackedTruckModels ?? 0}
              sub={`Jobs analyzed: ${fleet.truckDashboard?.jobUsage?.summary?.totalJobsAnalyzed ?? 0}`}
            />
          </Grid>
        </Grid>
      )}

      {tab === 4 && financial && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <KpiCard title="Revenue (30d)" primary={Math.round(financial.current?.totalRevenue ?? 0)} sub="" />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard title="Revenue / km" primary={financial.current?.revenuePerKm ?? 0} sub="" />
          </Grid>
          <Grid item xs={12} md={4}>
            <KpiCard
              title="Cargo rows (aggregate)"
              primary={financial.cargo?.items?.length ?? 0}
              sub={`Recorded jobs: ${financial.cargo?.totalRecordedJobs ?? 0}`}
            />
          </Grid>
        </Grid>
      )}

      {tab === 5 && (
        <Suspense fallback={<LinearProgress />}>
          <LegacyAnalyticsDashboard />
        </Suspense>
      )}
    </Container>
  );
}
