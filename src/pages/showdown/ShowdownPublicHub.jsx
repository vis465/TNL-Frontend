import React, { useCallback, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Link as RouterLink } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import axiosInstance from '../../utils/axios';
import ShowdownLayout from '../../components/showdown/ShowdownLayout';
import LiveFeedPanel from '../../components/showdown/LiveFeedPanel';
import MultiplierChip from '../../components/showdown/MultiplierChip';

const POLL_MS = 20000;

function formatDt(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export default function ShowdownPublicHub() {
  const [status, setStatus] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const live = status?.flags?.showdownWeekendEnabled;

  const loadAll = useCallback(async () => {
    try {
      setErr('');
      const [s, f] = await Promise.all([
        axiosInstance.get('/showdown/status'),
        axiosInstance.get('/showdown/feed?limit=30'),
      ]);
      setStatus(s.data);
      setFeed(f.data?.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      if (cancel) return;
      await loadAll();
    })();

    const t = setInterval(() => {
      if (document.hidden) return;
      loadAll();
    }, POLL_MS);

    const onVis = () => {
      if (!document.hidden) loadAll();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancel = true;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadAll]);

  const sum = status?.summary || {};

  return (
    <ShowdownLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Typography variant="h4" component="h1">
              Showdown Weekend
            </Typography>
            <Chip
              label={live ? 'LIVE' : 'Offline'}
              color={live ? 'primary' : 'default'}
              size="small"
              variant={live ? 'filled' : 'outlined'}
            />
          </Stack>

          {/* Quick guide */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              What is this?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1.5 }}>
              <strong>Showdown Weekend</strong> is a limited-time event: selected cities and routes
              can earn <strong>bonus job revenue</strong> (and sometimes cheaper division fuel) on
              qualifying deliveries. Your normal job stats stay in the system; bonuses are applied on
              top when the event rules match your job.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1.5 }}>
              <strong>What&apos;s hot</strong> lists rules that are <em>live now</em>,{' '}
              <em>starting soon</em>, or <em>recently ended</em> (last 7 days). Counts update
              automatically every few seconds. If a rule&apos;s time window passes, staff may rotate
              &quot;hot&quot; cities—check the <strong>Live wire</strong> for announcements.
            </Typography>
            <Button variant="outlined" size="small" onClick={() => setGuideOpen(true)}>
              How to read everything (full details)
            </Button>
          </Paper>

          {loading && !status && <Typography color="text.secondary">Loading…</Typography>}
          {err && <Alert severity="warning">{err}</Alert>}

          {!loading && status && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                What&apos;s hot
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Live</strong>: {sum.activeCityModifiers ?? 0} city ·{' '}
                {sum.activeRouteModifiers ?? 0} route &nbsp;·&nbsp;
                <strong>Starting soon</strong>: {sum.scheduledCityModifiers ?? 0} city ·{' '}
                {sum.scheduledRouteModifiers ?? 0} route &nbsp;·&nbsp;
                <strong>Ended (7d)</strong>: {sum.recentlyEndedCityModifiers ?? 0} city ·{' '}
                {sum.recentlyEndedRouteModifiers ?? 0} route
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                If live counts are 0 but you see &quot;starting soon&quot; or &quot;recently ended&quot;,
                rules may be scheduled for later or have just expired—Live wire still shows staff
                activity.
              </Typography>

              {(status.activeCityModifiers?.length > 0 || status.activeRouteModifiers?.length > 0) && (
                <>
                  <Typography variant="overline" color="primary" fontWeight={700} display="block">
                    Live now
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2, pl: 0.5 }}>
                    {(status.activeCityModifiers || []).map((m) => (
                      <Stack
                        key={`live-c-${m.code}`}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Chip size="small" label="City" variant="outlined" />
                        <Typography variant="body2" fontWeight={600}>
                          {m.cityName}
                        </Typography>
                        <MultiplierChip value={m.revenueMultiplier} />
                        <Typography variant="caption" color="text.secondary">
                          until {formatDt(m.expiresAt)}
                        </Typography>
                        {m.cargoNameBonus && (
                          <Typography variant="caption" color="text.secondary">
                            cargo contains: {m.cargoNameBonus}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                    {(status.activeRouteModifiers || []).map((m) => (
                      <Stack
                        key={`live-r-${m.code}`}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Chip size="small" label="Route" variant="outlined" color="secondary" />
                        <Typography variant="body2">
                          {m.sourceCityName} → {m.destCityName}
                        </Typography>
                        <MultiplierChip value={m.revenueMultiplier} />
                        <Typography variant="caption" color="text.secondary">
                          until {formatDt(m.expiresAt)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}

              {(status.scheduledCityModifiers?.length > 0 ||
                status.scheduledRouteModifiers?.length > 0) && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="overline" color="text.secondary" fontWeight={700} display="block">
                    Starting soon
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2, pl: 0.5 }}>
                    {(status.scheduledCityModifiers || []).map((m) => (
                      <Stack
                        key={`sch-c-${m.code}`}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Chip size="small" label="City" variant="outlined" />
                        <Typography variant="body2" fontWeight={600}>
                          {m.cityName}
                        </Typography>
                        <MultiplierChip value={m.revenueMultiplier} />
                        <Typography variant="caption" color="text.secondary">
                          starts {formatDt(m.startsAt)}
                        </Typography>
                      </Stack>
                    ))}
                    {(status.scheduledRouteModifiers || []).map((m) => (
                      <Stack
                        key={`sch-r-${m.code}`}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Chip size="small" label="Route" variant="outlined" color="secondary" />
                        <Typography variant="body2">
                          {m.sourceCityName} → {m.destCityName}
                        </Typography>
                        <MultiplierChip value={m.revenueMultiplier} />
                        <Typography variant="caption" color="text.secondary">
                          starts {formatDt(m.startsAt)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}

              {(status.recentlyEndedCityModifiers?.length > 0 ||
                status.recentlyEndedRouteModifiers?.length > 0) && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="overline" sx={{ opacity: 0.85 }} fontWeight={700} display="block">
                    Recently ended (last 7 days)
                  </Typography>
                  <Stack spacing={0.75} sx={{ pl: 0.5 }}>
                    {(status.recentlyEndedCityModifiers || []).map((m) => (
                      <Typography key={`end-c-${m.code}-${m.endedAt}`} variant="caption" color="text.secondary">
                        City {m.cityName} (×{m.revenueMultiplier}) — ended {formatDt(m.endedAt)}
                      </Typography>
                    ))}
                    {(status.recentlyEndedRouteModifiers || []).map((m) => (
                      <Typography key={`end-r-${m.code}-${m.endedAt}`} variant="caption" color="text.secondary">
                        Route {m.sourceCityName}→{m.destCityName} (×{m.revenueMultiplier}) — ended{' '}
                        {formatDt(m.endedAt)}
                      </Typography>
                    ))}
                  </Stack>
                </>
              )}

              {!status.activeCityModifiers?.length &&
                !status.activeRouteModifiers?.length &&
                !status.scheduledCityModifiers?.length &&
                !status.scheduledRouteModifiers?.length &&
                !status.recentlyEndedCityModifiers?.length &&
                !status.recentlyEndedRouteModifiers?.length && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No city or route rules in the last 7 days. When staff add or schedule bonuses,
                    they will appear here.
                  </Typography>
                )}
            </Paper>
          )}

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Live wire
            </Typography>
            <LiveFeedPanel items={feed} loading={loading && !feed.length} error="" />
          </Paper>
        </Stack>
      </Container>

      <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>Showdown — how to read this page</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                LIVE / Offline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>LIVE</strong> means the master Showdown switch is on at the VTC. Your jobs can
                receive bonuses when rules apply. <strong>Offline</strong> means the event layer is
                disabled platform-wide (no bonuses), even if you still see old feed messages.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Multiplier (×)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Example ×2.5 means eligible revenue for that rule is multiplied after your normal job
                calculation. Several rules may chain; your job receipt may list modifier codes staff
                configured.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                City vs route
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>City</strong> bonuses apply when the job touches that city (pickup or delivery),
                subject to cargo rules if shown. <strong>Route</strong> bonuses need the exact
                origin→destination pair. If both match, both can apply in sequence.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Starting soon / Recently ended
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rules with a future start time appear under <em>Starting soon</em>. When a window
                closes, automation may mark a rule ended—those show under <em>Recently ended</em> for
                about a week so you can see what changed.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Live wire
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Short announcements (rotations, new hot cities, milestones). Not every delivery creates
                a line—this is a highlights feed, not a full job log.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Staff / planning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Event staff manage rules in the admin area; detailed payout analytics for planning are on
                the staff <strong>Admin dashboard</strong> (authorized roles only).
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button component={RouterLink} to="/dashboard" sx={{ mr: 'auto' }}>
            Back to dashboard
          </Button>
          <Button onClick={() => setGuideOpen(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </ShowdownLayout>
  );
}
