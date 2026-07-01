import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import axiosInstance from '../../utils/axios';
import { AdminPageHeader, useAdminFeedback } from '../../components/admin/primitives';

const TABS = ['toll', 'insurance', 'levy', 'license', 'accident'];

function defaultEconomy() {
  return {
    toll: {
      enabled: true,
      vignettePriceTokens: 25000,
      vignetteDays: 30,
      ratePerKm: 0.5,
      borderCrossingFee: 200,
      insufficientBalanceFallback: 'job_deduction',
      tollCountries: [{ code: 'DE', multiplier: 1.5 }],
    },
    fleetInsurance: {
      enabled: true,
      billingPeriodDays: 30,
      graceDays: 3,
      defaultAutoRenew: true,
      tiers: [
        {
          id: 'third_party',
          label: 'Third-party',
          monthlyPremiumTokens: 2000,
          damageCoveragePercent: 50,
          autoparkReductionPercent: 0,
          maintenanceDiscountPercent: 0,
          active: true,
          sortOrder: 1,
        },
        {
          id: 'comprehensive',
          label: 'Comprehensive',
          monthlyPremiumTokens: 5000,
          damageCoveragePercent: 100,
          autoparkReductionPercent: 50,
          maintenanceDiscountPercent: 0,
          active: true,
          sortOrder: 2,
        },
        {
          id: 'fleet_plus',
          label: 'Fleet+',
          monthlyPremiumTokens: 10000,
          damageCoveragePercent: 100,
          autoparkReductionPercent: 100,
          maintenanceDiscountPercent: 10,
          active: true,
          sortOrder: 3,
        },
      ],
    },
    operatingLevy: {
      enabled: true,
      baseWeekly: 5000,
      perMember: 500,
      perTruck: 1000,
      arrearsBlockThreshold: 15000,
      tollPenaltyMultiplierWhenInArrears: 1.5,
    },
    driverPass: {
      enabled: true,
      passTypes: [
        { id: 'day', label: '1 Day Pass', durationDays: 1, priceTokens: 800, active: true, sortOrder: 1 },
        { id: 'week', label: '1 Week Pass', durationDays: 7, priceTokens: 4500, active: true, sortOrder: 2 },
        { id: 'month', label: '1 Month Pass', durationDays: 30, priceTokens: 12000, active: true, sortOrder: 3 },
      ],
    },
    riderAccidentCover: {
      enabled: true,
      monthlyPremium: 1500,
      rtoFineReductionPercent: 25,
      contractPenaltyCapTokens: 5000,
    },
  };
}

function mergeEconomy(data) {
  const base = defaultEconomy();
  if (!data || typeof data !== 'object') return base;
  return {
    toll: { ...base.toll, ...data.toll, tollCountries: data.toll?.tollCountries || base.toll.tollCountries },
    fleetInsurance: {
      ...base.fleetInsurance,
      ...data.fleetInsurance,
      tiers: data.fleetInsurance?.tiers?.length ? data.fleetInsurance.tiers : base.fleetInsurance.tiers,
    },
    operatingLevy: { ...base.operatingLevy, ...data.operatingLevy },
    driverPass: {
      ...base.driverPass,
      ...data.driverPass,
      passTypes: data.driverPass?.passTypes?.length ? data.driverPass.passTypes : base.driverPass.passTypes,
    },
    riderAccidentCover: { ...base.riderAccidentCover, ...data.riderAccidentCover },
  };
}

function numField(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function AdminEconomy() {
  const { showSuccess, showError, Feedback } = useAdminFeedback();
  const [tab, setTab] = useState(0);
  const [economy, setEconomy] = useState(defaultEconomy);
  const [previewTrucks, setPreviewTrucks] = useState(4);
  const [previewTierId, setPreviewTierId] = useState('comprehensive');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/cargo-rates/economy');
      const merged = mergeEconomy(data);
      setEconomy(merged);
      const active = merged.fleetInsurance.tiers.find((t) => t.active);
      if (active) setPreviewTierId(active.id);
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load economy settings');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const activeTiers = useMemo(
    () => (economy.fleetInsurance.tiers || []).filter((t) => t.active),
    [economy.fleetInsurance.tiers]
  );

  const insurancePreview = useMemo(() => {
    const tier = economy.fleetInsurance.tiers.find((t) => t.id === previewTierId);
    if (!tier) return 0;
    const trucks = Math.max(0, Math.floor(Number(previewTrucks) || 0));
    return trucks * Math.floor(Number(tier.monthlyPremiumTokens) || 0);
  }, [economy.fleetInsurance.tiers, previewTierId, previewTrucks]);

  const save = async () => {
    if (economy.fleetInsurance.enabled && !activeTiers.length) {
      showError('Enable at least one active fleet insurance tier.');
      return;
    }
    const activePasses = (economy.driverPass.passTypes || []).filter((t) => t.active);
    if (economy.driverPass.enabled && !activePasses.length) {
      showError('Enable at least one active driver pass type.');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.patch('/admin/cargo-rates/revenue-config', economy);
      showSuccess('Economy settings saved.');
      await load();
    } catch (e) {
      showError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const patchToll = (patch) => setEconomy((p) => ({ ...p, toll: { ...p.toll, ...patch } }));
  const patchInsurance = (patch) =>
    setEconomy((p) => ({ ...p, fleetInsurance: { ...p.fleetInsurance, ...patch } }));
  const patchLevy = (patch) =>
    setEconomy((p) => ({ ...p, operatingLevy: { ...p.operatingLevy, ...patch } }));
  const patchDriverPass = (patch) =>
    setEconomy((p) => ({ ...p, driverPass: { ...p.driverPass, ...patch } }));
  const patchAccident = (patch) =>
    setEconomy((p) => ({ ...p, riderAccidentCover: { ...p.riderAccidentCover, ...patch } }));

  const updatePassType = (index, patch) => {
    setEconomy((p) => {
      const passTypes = [...p.driverPass.passTypes];
      passTypes[index] = { ...passTypes[index], ...patch };
      return { ...p, driverPass: { ...p.driverPass, passTypes } };
    });
  };

  const addPassType = () => {
    const id = `pass_${Date.now().toString(36)}`;
    setEconomy((p) => ({
      ...p,
      driverPass: {
        ...p.driverPass,
        passTypes: [
          ...(p.driverPass.passTypes || []),
          {
            id,
            label: 'New pass',
            durationDays: 7,
            priceTokens: 1000,
            active: true,
            sortOrder: (p.driverPass.passTypes?.length || 0) + 1,
          },
        ],
      },
    }));
  };

  const removePassType = (index) => {
    setEconomy((p) => {
      const passTypes = [...p.driverPass.passTypes];
      passTypes.splice(index, 1);
      return { ...p, driverPass: { ...p.driverPass, passTypes } };
    });
  };

  const updateTier = (index, patch) => {
    setEconomy((p) => {
      const tiers = [...p.fleetInsurance.tiers];
      tiers[index] = { ...tiers[index], ...patch };
      return { ...p, fleetInsurance: { ...p.fleetInsurance, tiers } };
    });
  };

  const addTier = () => {
    const id = `tier_${Date.now().toString(36)}`;
    setEconomy((p) => ({
      ...p,
      fleetInsurance: {
        ...p.fleetInsurance,
        tiers: [
          ...p.fleetInsurance.tiers,
          {
            id,
            label: 'New tier',
            monthlyPremiumTokens: 1000,
            damageCoveragePercent: 0,
            autoparkReductionPercent: 0,
            maintenanceDiscountPercent: 0,
            active: true,
            sortOrder: p.fleetInsurance.tiers.length + 1,
          },
        ],
      },
    }));
  };

  const removeTier = (index) => {
    setEconomy((p) => {
      const tiers = p.fleetInsurance.tiers.filter((_, i) => i !== index);
      return { ...p, fleetInsurance: { ...p.fleetInsurance, tiers } };
    });
  };

  const updateCountry = (index, patch) => {
    setEconomy((p) => {
      const tollCountries = [...(p.toll.tollCountries || [])];
      tollCountries[index] = { ...tollCountries[index], ...patch };
      return { ...p, toll: { ...p.toll, tollCountries } };
    });
  };

  const addCountry = () => {
    setEconomy((p) => ({
      ...p,
      toll: {
        ...p.toll,
        tollCountries: [...(p.toll.tollCountries || []), { code: '', multiplier: 1 }],
      },
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <AdminPageHeader
        title="Economy settings"
        description="Token sinks: tolls, fleet insurance, operating levy, driver pass types, and accident cover."
      />
      <Feedback />
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={save} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save all'}
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Tolls" />
          <Tab label="Fleet insurance" />
          <Tab label="Operating levy" />
          <Tab label="Driver pass" />
          <Tab label="Accident cover" />
        </Tabs>
        <Divider />
        <CardContent>
          {tab === 0 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={economy.toll.enabled}
                    onChange={(e) => patchToll({ enabled: e.target.checked })}
                  />
                }
                label="Tolls enabled"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Vignette price (tokens)"
                    type="number"
                    value={economy.toll.vignettePriceTokens}
                    onChange={(e) => patchToll({ vignettePriceTokens: numField(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Vignette days"
                    type="number"
                    value={economy.toll.vignetteDays}
                    onChange={(e) => patchToll({ vignetteDays: numField(e.target.value, 30) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Rate per km (tokens)"
                    type="number"
                    inputProps={{ step: 0.01 }}
                    value={economy.toll.ratePerKm}
                    onChange={(e) => patchToll({ ratePerKm: numField(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Border crossing fee"
                    type="number"
                    value={economy.toll.borderCrossingFee}
                    onChange={(e) => patchToll({ borderCrossingFee: numField(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Insufficient balance fallback"
                    value={economy.toll.insufficientBalanceFallback}
                    onChange={(e) => patchToll({ insufficientBalanceFallback: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="job_deduction">Deduct from rider job payout</option>
                    <option value="bank_forfeit">Forfeit to bank</option>
                  </TextField>
                </Grid>
              </Grid>
              <Typography variant="subtitle2" fontWeight={600}>
                Country multipliers
              </Typography>
              {(economy.toll.tollCountries || []).map((c, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Country code"
                    size="small"
                    value={c.code}
                    onChange={(e) => updateCountry(i, { code: e.target.value.toUpperCase() })}
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Multiplier"
                    size="small"
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={c.multiplier}
                    onChange={(e) => updateCountry(i, { multiplier: numField(e.target.value, 1) })}
                    sx={{ width: 120 }}
                  />
                </Stack>
              ))}
              <Button startIcon={<AddOutlined />} onClick={addCountry} size="small">
                Add country
              </Button>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={economy.fleetInsurance.enabled}
                    onChange={(e) => patchInsurance({ enabled: e.target.checked })}
                  />
                }
                label="Fleet insurance enabled"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Billing period (days)"
                    type="number"
                    value={economy.fleetInsurance.billingPeriodDays}
                    onChange={(e) => patchInsurance({ billingPeriodDays: numField(e.target.value, 30) })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Grace days after expiry"
                    type="number"
                    value={economy.fleetInsurance.graceDays}
                    onChange={(e) => patchInsurance({ graceDays: numField(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={economy.fleetInsurance.defaultAutoRenew}
                        onChange={(e) => patchInsurance({ defaultAutoRenew: e.target.checked })}
                      />
                    }
                    label="Default auto-renew"
                  />
                </Grid>
              </Grid>

              <Alert severity="info">
                Live preview: division with{' '}
                <TextField
                  size="small"
                  type="number"
                  value={previewTrucks}
                  onChange={(e) => setPreviewTrucks(e.target.value)}
                  sx={{ width: 72, mx: 0.5, verticalAlign: 'middle' }}
                  inputProps={{ min: 0 }}
                />
                trucks on{' '}
                <TextField
                  size="small"
                  select
                  value={previewTierId}
                  onChange={(e) => setPreviewTierId(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ width: 160, mx: 0.5, verticalAlign: 'middle' }}
                >
                  {economy.fleetInsurance.tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </TextField>{' '}
                ≈ <strong>{insurancePreview.toLocaleString()}</strong> tokens / billing period
              </Alert>

              {economy.fleetInsurance.tiers.map((tier, index) => (
                <Card key={tier.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={600}>{tier.label || tier.id}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={tier.active}
                              onChange={(e) => updateTier(index, { active: e.target.checked })}
                            />
                          }
                          label="Active"
                        />
                        <IconButton size="small" color="error" onClick={() => removeTier(index)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tier ID"
                          value={tier.id}
                          onChange={(e) => updateTier(index, { id: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Label"
                          value={tier.label}
                          onChange={(e) => updateTier(index, { label: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Premium / period"
                          type="number"
                          value={tier.monthlyPremiumTokens}
                          onChange={(e) =>
                            updateTier(index, { monthlyPremiumTokens: numField(e.target.value) })
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Damage cover %"
                          type="number"
                          value={tier.damageCoveragePercent}
                          onChange={(e) =>
                            updateTier(index, { damageCoveragePercent: numField(e.target.value) })
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Autopark reduction %"
                          type="number"
                          value={tier.autoparkReductionPercent}
                          onChange={(e) =>
                            updateTier(index, { autoparkReductionPercent: numField(e.target.value) })
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Maint. discount %"
                          type="number"
                          value={tier.maintenanceDiscountPercent}
                          onChange={(e) =>
                            updateTier(index, { maintenanceDiscountPercent: numField(e.target.value) })
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Sort order"
                          type="number"
                          value={tier.sortOrder}
                          onChange={(e) => updateTier(index, { sortOrder: numField(e.target.value, 1) })}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Card>
              ))}
              <Button startIcon={<AddOutlined />} onClick={addTier}>
                Add tier
              </Button>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={economy.operatingLevy.enabled}
                    onChange={(e) => patchLevy({ enabled: e.target.checked })}
                  />
                }
                label="Operating levy enabled"
              />
              <Grid container spacing={2}>
                {[
                  ['baseWeekly', 'Base weekly (tokens)'],
                  ['perMember', 'Per active member'],
                  ['perTruck', 'Per fleet truck'],
                  ['arrearsBlockThreshold', 'Arrears block threshold'],
                  ['tollPenaltyMultiplierWhenInArrears', 'Toll penalty multiplier when in arrears'],
                ].map(([key, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <TextField
                      fullWidth
                      label={label}
                      type="number"
                      inputProps={{ step: key.includes('Multiplier') ? 0.1 : 1 }}
                      value={economy.operatingLevy[key]}
                      onChange={(e) => patchLevy({ [key]: numField(e.target.value) })}
                    />
                  </Grid>
                ))}
              </Grid>
              <Typography variant="body2" color="text.secondary">
                Weekly levy = base + (members × per member) + (trucks × per truck). Collected Mondays (IST) via
                economy scheduler.
              </Typography>
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={economy.driverPass.enabled}
                    onChange={(e) => patchDriverPass({ enabled: e.target.checked })}
                  />
                }
                label="Driver pass required for job tokens & km"
              />
              <Alert severity="info">
                Without a valid pass, deliveries are recorded only — no tokens, km stats, fleet odometer, or
                progression. Riders buy passes from their Wallet page (per-person).
              </Alert>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Pass types</Typography>
                <Button size="small" startIcon={<AddOutlined />} onClick={addPassType}>
                  Add pass type
                </Button>
              </Stack>
              {(economy.driverPass.passTypes || []).map((pt, index) => (
                <Card key={pt.id || index} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pt.active !== false}
                            onChange={(e) => updatePassType(index, { active: e.target.checked })}
                          />
                        }
                        label={pt.label || pt.id}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePassType(index)}
                        aria-label="Remove pass type"
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="ID (slug)"
                          value={pt.id}
                          onChange={(e) => updatePassType(index, { id: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Display label"
                          value={pt.label}
                          onChange={(e) => updatePassType(index, { label: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          fullWidth
                          label="Duration (days)"
                          type="number"
                          value={pt.durationDays}
                          onChange={(e) => updatePassType(index, { durationDays: numField(e.target.value, 1) })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          fullWidth
                          label="Price (tokens)"
                          type="number"
                          value={pt.priceTokens}
                          onChange={(e) => updatePassType(index, { priceTokens: numField(e.target.value) })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          fullWidth
                          label="Sort order"
                          type="number"
                          value={pt.sortOrder}
                          onChange={(e) => updatePassType(index, { sortOrder: numField(e.target.value, 1) })}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}

          {tab === 4 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={economy.riderAccidentCover.enabled}
                    onChange={(e) => patchAccident({ enabled: e.target.checked })}
                  />
                }
                label="Personal accident cover enabled"
              />
              <Grid container spacing={2}>
                {[
                  ['monthlyPremium', 'Monthly premium (tokens)'],
                  ['rtoFineReductionPercent', 'RTO fine reduction %'],
                  ['contractPenaltyCapTokens', 'Contract penalty cap (tokens)'],
                ].map(([key, label]) => (
                  <Grid item xs={12} sm={4} key={key}>
                    <TextField
                      fullWidth
                      label={label}
                      type="number"
                      value={economy.riderAccidentCover[key]}
                      onChange={(e) => patchAccident({ [key]: numField(e.target.value) })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
