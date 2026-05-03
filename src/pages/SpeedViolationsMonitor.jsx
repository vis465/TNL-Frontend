/**
 * Speed Violations — MUI shell
 */

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmber';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { useTelemetryRealtime } from '../context/TelemetryRealtimeContext';

export default function SpeedViolationsMonitor() {
  const theme = useTheme();
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    today: 0,
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const { subscribe, dashboardConnected } = useTelemetryRealtime();

  useEffect(() => {
    return subscribe((message) => {
      if (message.type === 'SPEED_VIOLATION') addViolation(message.data);
    });
  }, [subscribe]);

  const addViolation = (data) => {
    const violation = {
      id: `${data.riderId}-${Date.now()}`,
      riderId: data.riderId,
      displayName: data.displayName || null,
      employeeID: data.employeeID || null,
      violation: data.violation,
      timestamp: new Date(),
      severity: getSeverity(data.violation),
    };

    setViolations((prev) => [violation, ...prev.slice(0, 99)]);

    setStats((prev) => ({
      total: prev.total + 1,
      critical: violation.severity === 'critical' ? prev.critical + 1 : prev.critical,
      warning: violation.severity === 'warning' ? prev.warning + 1 : prev.warning,
      today: prev.today + 1,
    }));
  };

  const getSeverity = (violation) => {
    const excess = violation?.excess || 0;
    if (excess > 25) return 'critical';
    if (excess > 15) return 'warning';
    return 'minor';
  };

  const getFilteredViolations = () => {
    let filtered = violations;

    if (filter !== 'all') {
      filtered = violations.filter((v) => {
        if (filter === 'critical') return v.severity === 'critical';
        if (filter === 'warning') return v.severity === 'critical' || v.severity === 'warning';
        return true;
      });
    }

    if (sortBy === 'recent') {
      filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'severity') {
      const severityOrder = { critical: 3, warning: 2, minor: 1 };
      filtered = [...filtered].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    } else if (sortBy === 'speed') {
      filtered = [...filtered].sort((a, b) => (b.violation?.excess || 0) - (a.violation?.excess || 0));
    }

    return filtered;
  };

  const filteredViolations = getFilteredViolations();

  const statPaper = {
    elevation: 0,
    sx: {
      p: 2,
      borderRadius: 2,
      border: `1px solid ${theme.palette.grey[300]}`,
      height: '100%',
    },
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningAmberOutlinedIcon color="error" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Speed violations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Streamed via backend when telemetry crosses limits.
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={<SensorsOutlinedIcon />}
          label={dashboardConnected ? 'Listening' : 'Reconnecting'}
          size="small"
          sx={{
            fontWeight: 600,
            alignSelf: 'flex-start',
            bgcolor: dashboardConnected
              ? alpha(theme.palette.success.main, 0.12)
              : alpha(theme.palette.warning.main, 0.15),
          }}
        />
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <Paper {...statPaper}>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper {...statPaper}>
            <Typography variant="caption" color="error">
              Critical
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.critical}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper {...statPaper}>
            <Typography variant="caption" color="warning.dark">
              Warning tier
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.warning}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper {...statPaper}>
            <Typography variant="caption" color="text.secondary">
              This session
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.today}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${theme.palette.grey[300]}` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Typography variant="body2" fontWeight={700}>
            Filters
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {['all', 'critical', 'warning'].map((f) => (
              <Button
                key={f}
                size="small"
                variant={filter === f ? 'contained' : 'outlined'}
                onClick={() => setFilter(f)}
                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
              >
                {f}
              </Button>
            ))}
          </Stack>
          <Box sx={{ flex: 1 }} />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="vio-sort-label">Sort</InputLabel>
            <Select
              labelId="vio-sort-label"
              label="Sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="recent">Most recent</MenuItem>
              <MenuItem value="severity">Severity</MenuItem>
              <MenuItem value="speed">Excess speed</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {filteredViolations.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: `1px dashed ${theme.palette.grey[400]}` }}>
          <TimelineOutlinedIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
          <Typography color="text.secondary">No violations for this filter.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {filteredViolations.map((violation) => (
            <ViolationCard key={violation.id} violation={violation} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function ViolationCard({ violation }) {
  const theme = useTheme();
  const timeAgo = getTimeAgo(violation.timestamp);
  const v = violation.violation || {};
  const severity = violation.severity;
  const border =
    severity === 'critical'
      ? theme.palette.error.main
      : severity === 'warning'
        ? theme.palette.warning.dark
        : theme.palette.grey[600];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.grey[300]}`,
        borderLeft: `6px solid ${border}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography variant="subtitle2" fontWeight={700} textTransform="capitalize">
          {violation.severity} severity
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {timeAgo}
        </Typography>
      </Stack>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">
            Speed
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {v.currentSpeed ?? '—'} km/h
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">
            Limit
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {v.speedLimit ?? '—'} km/h
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">
            Excess
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            +{v.excess ?? '—'} km/h
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="body2" fontWeight={600}>
        {violation.displayName || 'Unknown rider'}
        {violation.employeeID ? (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            Emp {violation.employeeID}
          </Typography>
        ) : null}
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', display: 'block' }}>
        Rider {violation.riderId}
      </Typography>
    </Paper>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleTimeString();
}
