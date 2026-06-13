import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import MilitaryTechOutlined from '@mui/icons-material/MilitaryTechOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined';
import axiosInstance from '../utils/axios';
import StatCard from '../components/DriverPerformance/StatCard';

const AUTO_AWARD_OPTIONS = [
  { value: '', label: 'Manual only (staff awards this badge)' },
  { value: 'speedScore', label: 'Driving speed score' },
  { value: 'fuelScore', label: 'Fuel economy score' },
  { value: 'onTimeScore', label: 'On-time delivery score' },
];

/** Plain-language field with optional example */
function SettingField({
  label,
  help,
  example,
  value,
  onChange,
  type = 'number',
  min,
  max,
  suffix,
  multiline,
}) {
  return (
    <TextField
      label={label}
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      fullWidth
      multiline={multiline}
      minRows={multiline ? 2 : 1}
      inputProps={type === 'number' ? { min, max } : undefined}
      InputProps={suffix ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> } : undefined}
      helperText={
        <>
          {help}
          {example ? (
            <Typography component="span" variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic', opacity: 0.85 }}>
              Example: {example}
            </Typography>
          ) : null}
        </>
      }
    />
  );
}

function SectionIntro({ title, body, icon: Icon }) {
  return (
    <Alert severity="info" icon={Icon ? <Icon /> : <HelpOutlineIcon />} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2">{body}</Typography>
    </Alert>
  );
}

function RankEditor({ rank, onChange }) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 28 }}>{rank.icon || '🏁'}</Typography>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Rank {rank.rankNumber}: {rank.name || 'Unnamed'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unlocks when a driver reaches the total distance below
            </Typography>
          </Box>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <SettingField
              label="Badge emoji"
              help="Shown next to the rank name in the app"
              value={rank.icon}
              onChange={(v) => onChange({ ...rank, icon: v })}
              type="text"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SettingField
              label="Rank name"
              help="What drivers see (e.g. Scout, Veteran)"
              value={rank.name}
              onChange={(v) => onChange({ ...rank, name: v })}
              type="text"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SettingField
              label="Total km needed (lifetime)"
              help="Minimum km driven to reach this rank"
              example="5000 means Scout at 5,000 km"
              value={rank.kmRequired}
              onChange={(v) => onChange({ ...rank, kmRequired: v })}
              suffix="km"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Badge colour"
              type="color"
              value={rank.color || '#6366f1'}
              onChange={(e) => onChange({ ...rank, color: e.target.value })}
              fullWidth
              helperText="Click the box to pick a colour for this rank"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <SettingField
              label="Rewards at this rank"
              help="One reward per line, or separate with commas. Shown to drivers as perks."
              example="5% bonus tokens, Priority job picks"
              value={typeof rank.perks === 'string' ? rank.perks : (rank.perks || []).join(', ')}
              onChange={(v) => onChange({ ...rank, perks: v })}
              type="text"
              multiline
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function SkillLevelEditor({ level, onChange }) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Level {level.levelNumber}: {level.name || 'Unnamed'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          A driver must meet all three requirements below to reach this level
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <SettingField
              label="Level name"
              value={level.name}
              onChange={(v) => onChange({ ...level, name: v })}
              type="text"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SettingField
              label="Total XP ever earned"
              help="Lifetime XP from all jobs combined"
              value={level.xpRequired}
              onChange={(v) => onChange({ ...level, xpRequired: v })}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <SettingField
              label="Jobs completed"
              help="Minimum delivered jobs"
              value={level.minJobs}
              onChange={(v) => onChange({ ...level, minJobs: v })}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <SettingField
              label="Distance driven"
              help="Minimum km on record"
              value={level.minKm}
              onChange={(v) => onChange({ ...level, minKm: v })}
              suffix="km"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SettingField
              label="XP bonus multiplier"
              help="1 = normal XP. 1.2 = 20% extra XP at this level."
              example="1.5 means 50% more XP per job"
              value={level.multiplier}
              onChange={(v) => onChange({ ...level, multiplier: v })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function CertificationEditor({ cert, onChange }) {
  const autoEnabled = Boolean(cert.autoField);
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <WorkspacePremiumOutlined color="success" />
          <Typography variant="subtitle1" fontWeight={700}>{cert.name || cert.id}</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <SettingField
              label="Certificate title"
              value={cert.name}
              onChange={(v) => onChange({ ...cert, name: v })}
              type="text"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SettingField
              label="Short description"
              help="What this badge means for drivers"
              value={cert.description}
              onChange={(v) => onChange({ ...cert, description: v })}
              type="text"
            />
          </Grid>
          <Grid item xs={12}>
            <SettingField
              label="Requirement (shown to drivers)"
              help="Plain English rule drivers can understand"
              example="Speed score of 80 or higher for recent jobs"
              value={cert.requirement}
              onChange={(v) => onChange({ ...cert, requirement: v })}
              type="text"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Automatic award</InputLabel>
              <Select
                label="Automatic award"
                value={cert.autoField || ''}
                onChange={(e) => onChange({ ...cert, autoField: e.target.value || null })}
              >
                {AUTO_AWARD_OPTIONS.map((o) => (
                  <MenuItem key={o.value || 'manual'} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                When set, the system can grant this badge automatically if the driver meets the minimum score below.
              </Typography>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SettingField
              label="Minimum score for auto-award"
              help={autoEnabled ? 'Driver needs at least this score (0–100) to earn the badge' : 'Only used when automatic award is enabled'}
              value={cert.autoMin ?? 0}
              onChange={(v) => onChange({ ...cert, autoMin: v })}
              min={0}
              max={100}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function AdminDriverProgression() {
  const [tab, setTab] = useState(0);
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const normalizeConfig = (raw) => ({
    ...raw,
    ranks: (raw?.ranks || []).map((r) => ({
      ...r,
      perks: Array.isArray(r.perks) ? r.perks.join(', ') : (r.perks || ''),
    })),
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const [cfgRes, statsRes] = await Promise.all([
        axiosInstance.get('/admin/driver-progression/config'),
        axiosInstance.get('/admin/driver-progression/stats'),
      ]);
      setConfig(normalizeConfig(cfgRes.data?.data || cfgRes.data));
      setStats(statsRes.data?.data || statsRes.data);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Could not load settings. Try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      const res = await axiosInstance.put('/admin/driver-progression/config', {
        efficiency: config.efficiency,
        xp: config.xp,
        skillLevels: config.skillLevels,
        ranks: (config.ranks || []).map((row) => ({
          ...row,
          perks: typeof row.perks === 'string'
            ? row.perks.split(/[,\n]/).map((p) => p.trim()).filter(Boolean)
            : row.perks,
        })),
        certifications: config.certifications,
      });
      setConfig(normalizeConfig(res.data?.data || res.data));
      setMsg('Your changes were saved. New jobs will use these rules immediately. Click “Refresh all driver scores” if you changed scoring weights.');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Save failed. Please check your numbers and try again.');
    } finally {
      setSaving(false);
    }
  };

  const recalculate = async () => {
    setRunning('efficiency');
    setMsg('');
    setErr('');
    try {
      const res = await axiosInstance.post('/admin/driver-progression/recalculate-efficiency');
      setMsg(`Updated efficiency scores for ${res.data?.data?.updated || 0} drivers using the last ${res.data?.data?.windowDays || 90} days of jobs.`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Could not refresh scores.');
    } finally {
      setRunning('');
    }
  };

  const backfill = async () => {
    if (!window.confirm(
      'This will rebuild every driver\'s XP and rank from job history. It can take a few minutes. Only use this if scores look wrong after a major rule change. Continue?'
    )) return;
    setRunning('backfill');
    setMsg('');
    setErr('');
    try {
      const res = await axiosInstance.post('/admin/driver-progression/backfill', { reset: true });
      const bf = res.data?.data?.backfill;
      setMsg(`Done! Processed ${bf?.jobsToProcess || 0} jobs for ${bf?.riders || 0} drivers.`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Rebuild failed.');
    } finally {
      setRunning('');
    }
  };

  const setEff = (patch) => setConfig({ ...config, efficiency: { ...config.efficiency, ...patch } });
  const setXp = (patch) => setConfig({ ...config, xp: { ...config.xp, ...patch } });

  const weightTotal = Math.round(
    ((config?.efficiency?.weightSpeed ?? 0.35)
      + (config?.efficiency?.weightFuel ?? 0.35)
      + (config?.efficiency?.weightOnTime ?? 0.3)) * 100
  );

  if (loading || !config) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Loading driver progression settings…</Typography>
        <LinearProgress />
      </Container>
    );
  }

  const eff = config.efficiency || {};
  const xp = config.xp || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Driver progression settings</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            Control how drivers earn scores, XP, distance ranks, and certificates. You do not need technical knowledge — change a value, click Save, and the site updates for everyone.
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<SaveOutlined />} onClick={save} disabled={saving} sx={{ flexShrink: 0 }}>
          {saving ? 'Saving…' : 'Save all changes'}
        </Button>
      </Stack>

      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Card sx={{ mb: 3, bgcolor: 'action.hover' }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>How this system works (simple guide)</Typography>
          <Grid container spacing={2}>
            {[
              { title: '1. Driver score', text: 'Each driver gets a 0–100 efficiency rating from recent jobs: driving speed, fuel use, and on-time delivery.' },
              { title: '2. XP & levels', text: 'Every completed job gives XP. Enough XP + jobs + km promotes them Beginner → Expert.' },
              { title: '3. Distance ranks', text: 'Total km driven unlocks ranks (Rookie → Legend) and the rewards you list for each rank.' },
              { title: '4. Certificates', text: 'Badges like “Safe Driving” can be awarded automatically when scores are high enough.' },
            ].map((item) => (
              <Grid item xs={12} sm={6} key={item.title}>
                <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.text}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Registered drivers" value={stats?.totalRiders ?? '—'} icon={SpeedOutlined} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Have a score" value={stats?.withEfficiency ?? '—'} sub={`Average score: ${stats?.avgEfficiency ?? 0}/100`} color="#3b82f6" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Average lifetime XP" value={stats?.avgXp ?? '—'} icon={MilitaryTechOutlined} color="#f59e0b" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Distance rank tiers" value={config.ranks?.length ?? 0} icon={EmojiEventsOutlined} color="#10b981" />
        </Grid>
      </Grid>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<SpeedOutlined />} iconPosition="start" label="Driver scores" />
        <Tab icon={<LocalShippingOutlined />} iconPosition="start" label="XP per job" />
        <Tab icon={<EmojiEventsOutlined />} iconPosition="start" label="Distance ranks" />
        <Tab icon={<MilitaryTechOutlined />} iconPosition="start" label="Skill levels" />
        <Tab icon={<WorkspacePremiumOutlined />} iconPosition="start" label="Certificates" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <SectionIntro
            icon={SpeedOutlined}
            title="Driver efficiency score (0–100)"
            body="This is the main rating shown on the division Performance tab. It looks at each driver’s recent jobs and combines speed, fuel, and on-time delivery. Higher is better."
          />
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Which jobs count?</Typography>
              <SettingField
                label="How many days of jobs to include"
                help="Only jobs from this many recent days are used for the score. 90 days is a good default."
                example="30 = only last month; 180 = half a year"
                value={eff.lookbackDays ?? 90}
                onChange={(v) => setEff({ lookbackDays: v })}
                suffix="days"
                min={7}
                max={365}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>What matters most in the score?</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Move the sliders so the three parts add up to 100%. These control how much each area affects the final score.
              </Typography>
              <Stack spacing={3}>
                {[
                  { key: 'weightSpeed', label: 'Safe, steady driving', color: '#3b82f6' },
                  { key: 'weightFuel', label: 'Fuel economy', color: '#10b981' },
                  { key: 'weightOnTime', label: 'Delivering on time', color: '#f59e0b' },
                ].map(({ key, label, color }) => (
                  <Box key={key}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>{label}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color }}>
                        {Math.round((eff[key] ?? 0) * 100)}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={Math.round((eff[key] ?? 0) * 100)}
                      onChange={(_, v) => setEff({ [key]: v / 100 })}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                      sx={{ color }}
                    />
                  </Box>
                ))}
              </Stack>
              <Alert severity={weightTotal === 100 ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {weightTotal === 100
                  ? 'The three parts add up to 100% — good to save.'
                  : `The three parts currently add up to ${weightTotal}%. They should total 100% for fair scoring.`}
              </Alert>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Ideal driving speed</Typography>
                  <Stack spacing={2}>
                    <SettingField
                      label="Slowest good average speed"
                      help="Drivers above this speed (in km/h) score well on speed"
                      value={eff.speedIdealMinKmh ?? 60}
                      onChange={(v) => setEff({ speedIdealMinKmh: v })}
                      suffix="km/h"
                    />
                    <SettingField
                      label="Fastest good average speed"
                      help="Driving faster than this hurts the speed score"
                      value={eff.speedIdealMaxKmh ?? 90}
                      onChange={(v) => setEff({ speedIdealMaxKmh: v })}
                      suffix="km/h"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Fuel & on-time rules</Typography>
                  <Stack spacing={2}>
                    <SettingField
                      label="Extra time allowed for “on time”"
                      help="How many extra in-game seconds after the deadline still counts as on time"
                      example="300 ≈ 5 minutes of grace"
                      value={eff.onTimeGraceSeconds ?? 300}
                      onChange={(v) => setEff({ onTimeGraceSeconds: v })}
                      suffix="sec"
                    />
                    <SettingField
                      label="Excellent fuel use (litres per 100 km)"
                      help="Below this = good fuel score"
                      value={eff.fuelGoodLPer100Km ?? 8}
                      onChange={(v) => setEff({ fuelGoodLPer100Km: v })}
                      suffix="L/100km"
                    />
                    <SettingField
                      label="Poor fuel use (litres per 100 km)"
                      help="Above this = hurts fuel score"
                      value={eff.fuelPoorLPer100Km ?? 12}
                      onChange={(v) => setEff({ fuelPoorLPer100Km: v })}
                      suffix="L/100km"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <SectionIntro
            icon={LocalShippingOutlined}
            title="XP points per completed job"
            body="Drivers earn experience (XP) after each delivery. Bonuses stack on top of the base amount when they drive well. XP unlocks skill levels on the Performance tab."
          />
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SettingField
                    label="Base XP for every job"
                    help="Minimum XP even if the job was average"
                    value={xp.basePerJob ?? 50}
                    onChange={(v) => setXp({ basePerJob: v })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SettingField
                    label="Bonus: delivered on time"
                    value={xp.onTimeBonus ?? 25}
                    onChange={(v) => setXp({ onTimeBonus: v })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SettingField
                    label="Bonus: steady speed (within ideal range)"
                    value={xp.speedBonus ?? 15}
                    onChange={(v) => setXp({ speedBonus: v })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SettingField
                    label="Bonus: good fuel economy"
                    value={xp.fuelBonus ?? 20}
                    onChange={(v) => setXp({ fuelBonus: v })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SettingField
                    label="Bonus: long distance job"
                    value={xp.distanceBonus ?? 10}
                    onChange={(v) => setXp({ distanceBonus: v })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SettingField
                    label="“Long distance” means at least"
                    help="Job distance must be this many km to get the long-haul bonus"
                    value={xp.longDistanceKm ?? 500}
                    onChange={(v) => setXp({ longDistanceKm: v })}
                    suffix="km"
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Example: a good 600 km on-time job could earn{' '}
                <b>
                  {(xp.basePerJob ?? 50) + (xp.onTimeBonus ?? 25) + (xp.speedBonus ?? 15)
                    + (xp.fuelBonus ?? 20) + (xp.distanceBonus ?? 10)} XP
                </b>{' '}
                before level multipliers.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <SectionIntro
            icon={EmojiEventsOutlined}
            title="Distance ranks (km milestones)"
            body="As drivers accumulate km, they move up ranks like Rookie → Scout → Veteran. Edit each tier below. Rewards are shown on the division Performance page."
          />
          {(config.ranks || []).map((rank, i) => (
            <RankEditor
              key={rank.rankNumber || i}
              rank={rank}
              onChange={(updated) => {
                const ranks = [...config.ranks];
                ranks[i] = updated;
                setConfig({ ...config, ranks });
              }}
            />
          ))}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <SectionIntro
            icon={MilitaryTechOutlined}
            title="Skill levels (XP progression)"
            body="Separate from distance ranks. To level up, a driver needs enough lifetime XP AND enough jobs AND enough km — all three must be met."
          />
          {(config.skillLevels || []).map((level, i) => (
            <SkillLevelEditor
              key={level.levelNumber || i}
              level={level}
              onChange={(updated) => {
                const skillLevels = [...config.skillLevels];
                skillLevels[i] = updated;
                setConfig({ ...config, skillLevels });
              }}
            />
          ))}
        </Stack>
      )}

      {tab === 4 && (
        <Stack spacing={2}>
          <SectionIntro
            icon={WorkspacePremiumOutlined}
            title="Certificates & badges"
            body="Optional awards shown on driver profiles. Use “Automatic award” if the system should grant the badge when a score is high enough."
          />
          {(config.certifications || []).map((cert, i) => (
            <CertificationEditor
              key={cert.id || i}
              cert={cert}
              onChange={(updated) => {
                const certifications = [...config.certifications];
                certifications[i] = updated;
                setConfig({ ...config, certifications });
              }}
            />
          ))}
        </Stack>
      )}

      <Accordion sx={{ mt: 4 }} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={700}>Advanced tools (staff only — use with care)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Alert severity="warning">
              Most of the time you only need <b>Save all changes</b> at the top. Use these tools only after changing scoring rules or if data looks incorrect.
            </Alert>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>Refresh all driver scores</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Recalculates the 0–100 efficiency rating for every driver using current settings and recent jobs. Do this after changing score weights or the “days to include” setting.
                </Typography>
                <Button variant="outlined" startIcon={<RestartAltOutlined />} onClick={recalculate} disabled={!!running}>
                  {running === 'efficiency' ? 'Refreshing…' : 'Refresh all driver scores'}
                </Button>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>Rebuild from all job history</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Replays every delivered job to rebuild XP and distance ranks. Slow. Only for admins when progression data needs a full reset.
                </Typography>
                <Button color="warning" variant="outlined" onClick={backfill} disabled={!!running}>
                  {running === 'backfill' ? 'Rebuilding…' : 'Rebuild all progression data'}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
