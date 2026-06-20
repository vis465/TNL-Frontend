import React from 'react';
import {
  Box, Card, CardContent, Typography, LinearProgress, Stack, Grid, Chip, CircularProgress, Divider, IconButton, Tooltip,
} from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import LocalGasStationOutlined from '@mui/icons-material/LocalGasStationOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import { useDriverPerformance } from '../../contexts/DriverPerformanceContext';
import StatCard from './StatCard';
import DriverTable from './DriverTable';
import Leaderboards from './Leaderboards';
import PerksCertifications from './PerksCertifications';
import TrendChart from './TrendChart';
import { scoreColor } from './EfficiencyRing';

export default function DriverPerformanceDashboard({ divisionId }) {
  const { state, actions } = useDriverPerformance();
  const drivers = state?.drivers || [];
  const totals = state?.leaderboards?.totals || {};

  const earnedCertIds = new Set();
  for (const d of drivers) {
    for (const c of d.certifications || []) earnedCertIds.add(c);
  }
  const earnedCerts = (state?.certifications || []).filter((c) => earnedCertIds.has(c.id));

  const topDriver = drivers[0];
  const avgEff = totals.avgEfficiency ?? (drivers.length
    ? Math.round(drivers.reduce((s, d) => s + (d.efficiency?.overall || 0), 0) / drivers.length)
    : 0);

  if (state?.loading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={800}>Driver Performance</Typography>
          <Typography variant="body2" color="text.secondary">
            Efficiency, XP progression, KM ranks, and certifications for this division.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => actions?.refresh?.()} size="small">
            <RefreshOutlined />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Avg efficiency" value={avgEff} sub="Last 90 days" color={scoreColor(avgEff)} icon={SpeedOutlined} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Active drivers" value={drivers.length} sub={`${totals.memberCount || drivers.length} members tracked`} icon={GroupsOutlined} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Top performer"
            value={topDriver ? Math.round(topDriver.efficiency?.overall || 0) : '—'}
            sub={topDriver?.name || 'No data'}
            color="#10b981"
            icon={EmojiEventsOutlined}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Division KM"
            value={Math.round(totals.totalKm || 0).toLocaleString()}
            sub="Rank-tracked distance"
            icon={LocalGasStationOutlined}
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>All drivers</Typography>
          <DriverTable drivers={drivers} />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <TrendingUpOutlined color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>Rank progress</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">Average progress to next KM rank</Typography>
              <Box sx={{ mt: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="caption">Division average</Typography>
                  <Typography variant="caption" fontWeight={700}>{Math.round(state?.divisionProgress || 0)}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={Math.min(100, state?.divisionProgress || 0)} sx={{ height: 10, borderRadius: 2 }} />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">Efficiency trend (top drivers)</Typography>
              <Box sx={{ mt: 1 }}>
                <TrendChart data={state?.trends?.division || []} height={60} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <PerksCertifications perks={state?.perks || []} certs={earnedCerts} />
        </Grid>

        {state?.rankMilestones?.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Rank milestones</Typography>
                <Stack spacing={1}>
                  {state.rankMilestones.map((m) => (
                    <Stack key={m.rankNumber} direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: 18 }}>{m.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(m.totalKmRequired || 0).toLocaleString()} km
                        </Typography>
                      </Box>
                      <Chip size="small" label={`#${m.rankNumber}`} variant="outlined" />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Leaderboards boards={state?.leaderboards || {}} ranks={state?.ranks || []} />
        </Grid>
      </Grid>
    </Stack>
  );
}
