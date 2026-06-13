import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import {
  listPowerupConfigs,
  updatePowerupConfig,
  grantPowerup,
} from '../services/powerupAdminService';
import { PowerupBadge, getPowerupDisplay } from '../components/PowerupDisplay';
import ridersService from '../services/ridersService';

const POWERUP_TYPES = [
  'restore_streak',
  'reveal_next_milestone',
  'streak_protection',
  'wallet_tokens',
  'double_streak',
];

const TAB_KEYS = ['settings', 'grant', 'guide'];

function SettingsTab({ rows, onPatch, savingId }) {
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        These settings control which rewards can appear when riders hit streak milestones. Higher weight means
        that reward is more likely when the system picks randomly. Turn a reward off if you do not want it offered.
      </Alert>

      <Grid container spacing={2}>
        {rows.map((row) => {
          const meta = getPowerupDisplay(row.type);
          return (
            <Grid item xs={12} md={6} key={row._id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                      <PowerupBadge type={row.type} size={40} showDescription />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(row.enabled)}
                            onChange={(e) => onPatch(row._id, { enabled: e.target.checked })}
                            disabled={savingId === row._id}
                          />
                        }
                        label={row.enabled ? 'Available' : 'Disabled'}
                      />
                    </Stack>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        How often this reward is picked (weight)
                      </Typography>
                      <Slider
                        min={10}
                        max={100}
                        step={10}
                        value={Number(row.weight || 10)}
                        onChangeCommitted={(_, value) => onPatch(row._id, { weight: Number(value) })}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 10, label: 'Low' },
                          { value: 50, label: 'Medium' },
                          { value: 100, label: 'High' },
                        ]}
                        disabled={savingId === row._id}
                      />
                    </Box>

                    <TextField
                      key={`${row._id}-${row.usageExpiryDays}`}
                      label="Days before an unused reward expires"
                      type="number"
                      size="small"
                      fullWidth
                      defaultValue={Number(row.usageExpiryDays || 3)}
                      onBlur={(e) => onPatch(row._id, { usageExpiryDays: Number(e.target.value) || 3 })}
                      inputProps={{ min: 1, max: 30 }}
                      helperText="After this many days in inventory, the rider loses the unused reward."
                      disabled={savingId === row._id}
                    />

                    {meta.description && (
                      <Typography variant="body2" color="text.secondary">
                        {meta.description}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {!rows.length && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No reward types configured yet.</Typography>
        </Paper>
      )}
    </Stack>
  );
}

function GrantTab({ onGrant, busy }) {
  const [riderQuery, setRiderQuery] = useState('');
  const [riderOptions, setRiderOptions] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [powerupType, setPowerupType] = useState('restore_streak');
  const [tokenValue, setTokenValue] = useState(100);

  useEffect(() => {
    let cancelled = false;
    const q = riderQuery.trim();
    if (q.length < 2) {
      setRiderOptions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await ridersService.search(q, 12);
        if (!cancelled) setRiderOptions(Array.isArray(results) ? results : []);
      } catch {
        if (!cancelled) setRiderOptions([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [riderQuery]);

  const submit = async () => {
    if (!selectedRider?._id) return;
    const payload = {
      riderId: selectedRider._id,
      type: powerupType,
    };
    if (powerupType === 'wallet_tokens') payload.value = Number(tokenValue) || 0;
    await onGrant(payload);
  };

  return (
    <Stack spacing={2} maxWidth={640}>
      <Alert severity="warning">
        Manual grants are for support or special cases. Most riders should earn rewards through attendance streaks.
      </Alert>

      <Autocomplete
        options={riderOptions}
        filterOptions={(x) => x}
        getOptionLabel={(o) => `${o.name || o.username || 'Rider'}${o.employeeID ? ` · ${o.employeeID}` : ''}`}
        value={selectedRider}
        onChange={(_, v) => setSelectedRider(v)}
        onInputChange={(_, v) => setRiderQuery(v)}
        renderInput={(params) => (
          <TextField {...params} label="Search rider" placeholder="Name, username, or employee ID" />
        )}
      />

      <TextField
        select
        label="Reward type"
        value={powerupType}
        onChange={(e) => setPowerupType(e.target.value)}
        fullWidth
      >
        {POWERUP_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {getPowerupDisplay(type).label}
          </MenuItem>
        ))}
      </TextField>

      {powerupType === 'wallet_tokens' && (
        <TextField
          label="Token amount"
          type="number"
          value={tokenValue}
          onChange={(e) => setTokenValue(e.target.value)}
          inputProps={{ min: 1 }}
          fullWidth
        />
      )}

      <Button
        variant="contained"
        startIcon={<CardGiftcardOutlined />}
        onClick={submit}
        disabled={busy || !selectedRider?._id}
      >
        {busy ? 'Granting…' : 'Grant reward to rider'}
      </Button>
    </Stack>
  );
}

function GuideTab() {
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Streak rewards motivate consistent event attendance. Riders build a streak when HR approves their
        attendance. At certain streak counts they unlock milestones — each milestone can grant one of the
        configured powerups below.
      </Alert>

      <Grid container spacing={2}>
        {POWERUP_TYPES.map((type) => {
          const meta = getPowerupDisplay(type);
          return (
            <Grid item xs={12} md={6} key={type}>
              <Card variant="outlined">
                <CardContent>
                  <PowerupBadge type={type} size={36} showDescription />
                  {meta.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                      {meta.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={700}>For HR staff — daily workflow</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography variant="body2">1. Create attendance events in HR Dashboard or Attendance management.</Typography>
            <Typography variant="body2">2. Approve rider attendance after each event — this grows their streak.</Typography>
            <Typography variant="body2">3. Riders claim milestone rewards from Attendance & rewards → Streak & Milestones.</Typography>
            <Typography variant="body2">4. Adjust reward availability and weights here if rewards feel too common or too rare.</Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

export default function PowerupManagement() {
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [savingId, setSavingId] = useState('');
  const [grantBusy, setGrantBusy] = useState(false);

  const load = async () => {
    try {
      const data = await listPowerupConfigs();
      setRows(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load reward settings');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id, payload) => {
    setSavingId(id);
    setError('');
    setInfo('');
    try {
      await updatePowerupConfig(id, payload);
      setInfo('Settings saved');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingId('');
    }
  };

  const onGrant = async (payload) => {
    setGrantBusy(true);
    setError('');
    setInfo('');
    try {
      await grantPowerup(payload);
      setInfo('Reward granted to rider');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to grant reward');
    } finally {
      setGrantBusy(false);
    }
  };

  const enabledCount = useMemo(() => rows.filter((r) => r.enabled).length, [rows]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Streak reward settings
          </Typography>
          <Typography color="text.secondary" maxWidth={720}>
            Configure attendance streak rewards — what riders can win, how often each reward is chosen, and manual
            grants for support cases.
          </Typography>
        </Box>
        <Chip
          icon={<AutoAwesomeOutlined />}
          label={`${enabledCount} of ${rows.length || POWERUP_TYPES.length} rewards active`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" onClose={() => setInfo('')} sx={{ mb: 2 }}>{info}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<AutoAwesomeOutlined />} iconPosition="start" label="Reward settings" />
        <Tab icon={<CardGiftcardOutlined />} iconPosition="start" label="Grant to rider" />
        <Tab icon={<HelpOutlineOutlined />} iconPosition="start" label="How it works" />
      </Tabs>

      {tab === 0 && <SettingsTab rows={rows} onPatch={patch} savingId={savingId} />}
      {tab === 1 && <GrantTab onGrant={onGrant} busy={grantBusy} />}
      {tab === 2 && <GuideTab />}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Tab key: {TAB_KEYS[tab]} · Changes apply to future milestone rolls; existing rider inventory is not removed.
      </Typography>
    </Box>
  );
}
