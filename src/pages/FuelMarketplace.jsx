import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalGasStationOutlined from '@mui/icons-material/LocalGasStationOutlined';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from 'recharts';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import DashboardHero from '../components/magicui/DashboardHero';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { BentoGrid, BentoItem } from '../components/magicui/BentoGrid';
import RevealSection from '../components/magicui/RevealSection';
import SkeletonShell from '../components/magicui/SkeletonShell';
import PurchaseSidebar from '../components/magicui/PurchaseSidebar';

const DIVISION_FUEL_CAPACITY_L = 20_000;

function formatDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function FuelMarketplace() {
  const [market, setMarket] = useState(null);
  const [premiumPerks, setPremiumPerks] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [divisionPayload, setDivisionPayload] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyLiters, setBuyLiters] = useState('100');
  const [buyType, setBuyType] = useState('normal');
  const [buying, setBuying] = useState(false);
  const [buyDrawerOpen, setBuyDrawerOpen] = useState(false);

  const user = getItemWithExpiry('user') || {};
  const uid = String(user.id || user._id || '');
  const div = divisionPayload?.division;
  const leaderIdStr = String(div?.leaderId || '');
  const isLeader =
    divisionPayload?.isLeader === true || Boolean(div && uid && leaderIdStr && uid === leaderIdStr);

  const reloadDivisionAndHistory = async () => {
    const dRes = await axiosInstance.get('/me/division');
    let resolved = dRes.data;
    if (!resolved?.division && user?.leadsDivision?._id) {
      try {
        const r2 = await axiosInstance.get(`/divisions/${user.leadsDivision._id}`);
        resolved = { ...resolved, division: r2.data?.division, isLeader: r2.data?.isLeader };
      } catch (_) {
        /* ignore */
      }
    }
    setDivisionPayload(resolved);
    const d = resolved?.division;
    const uidLocal = String(user.id || user._id || '');
    const canSeeHistory =
      d?._id && (resolved?.isLeader === true || String(d.leaderId) === uidLocal);
    if (canSeeHistory) {
      try {
        const h = await axiosInstance.get(`/divisions/${d._id}/fuel/history`, { params: { limit: 200 } });
        setHistory(h.data?.items || []);
      } catch (_) {
        setHistory([]);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [mRes, phRes, dRes] = await Promise.all([
          axiosInstance.get('/fuel-market'),
          axiosInstance.get('/fuel-market/price-history', { params: { limit: 120 } }),
          axiosInstance.get('/me/division').catch(() => ({ data: null })),
        ]);
        if (cancelled) return;
        setMarket(mRes.data?.fuelMarket || null);
        setPremiumPerks(Array.isArray(mRes.data?.premiumPerks) ? mRes.data.premiumPerks : []);
        const ph = phRes.data?.items || [];
        setPriceHistory(
          ph.map((row) => ({
            ...row,
            label: row.at
              ? new Date(row.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '',
          }))
        );
        let resolved = dRes.data;
        if (!resolved?.division && user?.leadsDivision?._id) {
          try {
            const r2 = await axiosInstance.get(`/divisions/${user.leadsDivision._id}`);
            resolved = { ...resolved, division: r2.data?.division, isLeader: r2.data?.isLeader };
          } catch (_) {
            /* ignore */
          }
        }
        setDivisionPayload(resolved);
        const d = resolved?.division;
        const leaderish =
          resolved?.isLeader === true || (d && uid && String(d.leaderId) === uid);
        if (d?._id && leaderish) {
          try {
            const h = await axiosInstance.get(`/divisions/${d._id}/fuel/history`, { params: { limit: 200 } });
            if (!cancelled) setHistory(h.data?.items || []);
          } catch (_) {
            if (!cancelled) setHistory([]);
          }
        } else if (!cancelled) {
          setHistory([]);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load fuel market');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    const byDay = new Map();
    for (const row of history) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      const prev = byDay.get(key) || {
        dateKey: key,
        label: formatDay(row.createdAt),
        cost: 0,
        liters: 0,
        premiumL: 0,
        normalL: 0,
      };
      prev.cost += Number(row.amount) || 0;
      const L = Number(row.metadata?.liters) || 0;
      prev.liters += L;
      if (row.metadata?.fuelType === 'premium') prev.premiumL += L;
      else prev.normalL += L;
      byDay.set(key, prev);
    }
    return Array.from(byDay.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [history]);

  const tier = market?.[buyType];
  const estCost = tier && buyLiters ? Math.ceil(Math.max(0, Number(buyLiters) || 0) * tier.pricePerLiter) : 0;
  const walletBal = Number(div?.walletBalance) || 0;

  const normalTank = Number(div?.fuelTankNormalLiters ?? div?.fuelTankLiters ?? 0) || 0;
  const premiumTank = Number(div?.fuelTankPremiumLiters ?? 0) || 0;
  const totalTank = Math.max(0, normalTank + premiumTank);
  const remainingCapacity = Math.max(0, DIVISION_FUEL_CAPACITY_L - totalTank);
  const buyLitersFloor = Math.max(0, Math.floor(Number(buyLiters) || 0));
  const buyOverCapacity = buyLitersFloor > remainingCapacity;

  const buy = async () => {
    if (!div?._id || !isLeader) return;
    setBuying(true);
    setError('');
    try {
      await axiosInstance.post(`/divisions/${div._id}/fuel/buy`, {
        liters: buyLitersFloor,
        fuelType: buyType,
      });
      await reloadDivisionAndHistory();
    } catch (e) {
      setError(e?.response?.data?.message || 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  return (
    <MagicPageShell>
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <DashboardHero
        title="Division Fuel Marketplace"
        subtitle="Track standard and premium pricing, estimate orders, and protect wallet balance while keeping tank capacity ready for job demand."
        stats={[
          { label: 'Wallet', value: walletBal },
          { label: 'Tank Fill (L)', value: totalTank },
          { label: 'Capacity Left', value: remainingCapacity },
          { label: 'Est. Order Cost', value: estCost },
        ]}
      />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <LocalGasStationOutlined color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Fuel planning and purchase
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Fuel prices are the same for every division (set by admins). Your division keeps two supplies: standard and premium.
        Premium is always used first when a job completes, and each liter goes further than standard. If the tanks cannot cover
        a job’s fuel, that job’s division payout goes to the bank instead of your division wallet.
      </Typography>

      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ mb: 1.5 }} />
          <SkeletonShell cards={2} chart />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {div && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 2,
            borderColor: 'primary.main',
            borderWidth: 2,
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(25, 118, 210, 0.06)'),
          }}
        >
          <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={0.5}>
            Division wallet — verify balance before purchasing
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'baseline' }} sx={{ mt: 0.5 }}>
            <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.15 }}>
              {walletBal.toLocaleString()}
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                tokens
              </Typography>
            </Typography>
          </Stack>
          {isLeader && tier && (
            <Typography
              variant="body2"
              sx={{ mt: 1.5, maxWidth: 560 }}
              color={estCost > walletBal ? 'error.main' : 'text.secondary'}
            >
              Order preview: about {estCost.toLocaleString()} tokens for {buyType} ·{' '}
              {Math.max(0, Math.floor(Number(buyLiters) || 0)).toLocaleString()} L
              {estCost > walletBal ? ' — balance too low for this order' : ''}
            </Typography>
          )}
        </Paper>
      )}

      {priceHistory.length > 0 && (
        <RevealSection>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography fontWeight={700} gutterBottom>
              Global token price history
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Admin changes to fuel prices create new points. Synthetic point may appear until the first saved change.
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={priceHistory} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="normalPrice" name="Standard tokens/L" stroke="#1976d2" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="premiumPrice" name="Premium tokens/L" stroke="#9c27b0" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        </RevealSection>
      )}

      <BentoGrid minItemWidth={320} gap={2}>
        <BentoItem>
          <RevealSection>
          <Card variant="outlined">
          <CardContent>
            <Typography fontWeight={700} gutterBottom>
              Global prices & benefits
            </Typography>
            {market ? (
              <Stack spacing={2}>
                {(['premium', 'normal']).map((key) => {
                  const t = market[key];
                  if (!t) return null;
                  return (
                    <Paper key={key} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography fontWeight={700}>
                        {t.label} ({key})
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ my: 0.5 }}>
                        {t.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>{t.pricePerLiter}</strong> tokens per liter you add to the tank.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {key === 'normal'
                          ? Math.abs(Number(t.coveragePerLiter) - 1) < 0.001
                            ? 'Simple math: one liter in the tank covers the same “trip fuel” as one liter on the job.'
                            : `Each liter in the tank counts like about ${Number(t.coveragePerLiter)} units of trip fuel.`
                          : (() => {
                              const base = Number(market?.normal?.coveragePerLiter) || 1;
                              const pc = Number(t.coveragePerLiter) || 1;
                              const mult = base > 0 ? pc / base : pc;
                              const m = Number.isFinite(mult) ? String(Number(mult.toFixed(2))) : String(pc);
                              return `Each liter stretches about ${m}× as far as standard on the same trip.`;
                            })()}
                      </Typography>
                      {key === 'premium' && t.deliveryGraceBurn > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          Extra help: if premium is still in the tank when the job finishes, up to{' '}
                          <strong>{t.deliveryGraceBurn} L</strong> of that job’s fuel might not be taken out of your tanks.
                        </Typography>
                      )}
                      {key === 'premium' && premiumPerks.length > 0 && (
                        <Box component="ul" sx={{ pl: 2.25, mb: 0, mt: 1.25 }}>
                          {premiumPerks.map((perk, i) => (
                            <li key={i}>
                              <Typography variant="body2" sx={{ display: 'block', py: 0.25 }}>
                                {perk}
                              </Typography>
                            </li>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Typography color="text.secondary">No market data.</Typography>
            )}
          </CardContent>
          </Card>
          </RevealSection>
        </BentoItem>

        <BentoItem>
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
          <Card variant="outlined">
          <CardContent>
            <Typography fontWeight={700} gutterBottom>
              Your division tanks
            </Typography>
            {!div ? (
              <Typography color="text.secondary">
                Join a division to see balances.{' '}
                <Button component={RouterLink} to="/division-leaderboard" size="small">
                  Browse divisions
                </Button>
              </Typography>
            ) : (
              <>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  <ChipStat label="Premium tank" value={`${premiumTank.toLocaleString()} L`} />
                  <ChipStat label="Standard tank" value={`${normalTank.toLocaleString()} L`} />
                  <ChipStat label="Capacity" value={`${DIVISION_FUEL_CAPACITY_L.toLocaleString()} L`} />
                  <ChipStat label="Available space" value={`${remainingCapacity.toLocaleString()} L`} />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Wallet balance is shown above for quick verification.
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                {isLeader ? (
                  <>
                    <Typography fontWeight={600} gutterBottom>Buy fuel (division wallet)</Typography>
                    <Button variant="contained" onClick={() => setBuyDrawerOpen(true)} disabled={!tier || remainingCapacity <= 0}>
                      Open purchase
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Only the division leader can purchase fuel. Wallet funds come from division job share and bank transfers.
                  </Typography>
                )}
                <Button component={RouterLink} to="/division" variant="outlined" size="small" sx={{ mt: 2 }}>
                  Back to my division
                </Button>
              </>
            )}
          </CardContent>
          </Card>
          </Box>
        </BentoItem>
      </BentoGrid>

      {!!chartData.length && (
        <RevealSection>
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography fontWeight={700} gutterBottom>
              Purchase history (division wallet spend)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Daily totals from your division&apos;s fuel purchases. Bars = liters; line = tokens debited.
            </Typography>
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="liters" name="Liters" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="cost" name="Tokens" stroke="#ff7300" strokeWidth={2} dot />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        </RevealSection>
      )}

      {!!chartData.length && chartData.some((d) => d.premiumL > 0 || d.normalL > 0) && (
        <RevealSection>
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography fontWeight={700} gutterBottom>
              Liters by grade (stacked)
            </Typography>
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="premiumL" name="Premium L" stackId="a" fill="#9c27b0" />
                  <Bar dataKey="normalL" name="Standard L" stackId="a" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        </RevealSection>
      )}

      {!loading && isLeader && !chartData.length && div && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          No fuel purchases recorded yet — charts appear after the first buy.
        </Typography>
      )}
    </Container>
    <PurchaseSidebar
      open={buyDrawerOpen}
      onClose={() => !buying && setBuyDrawerOpen(false)}
      title="Fuel purchase"
      subtitle="Buy fuel directly from division wallet with live capacity and cost checks."
      width={420}
    >
      <Stack spacing={1.5}>
        <FormControl size="small" fullWidth>
          <InputLabel id="fuel-type-label">Fuel type</InputLabel>
          <Select labelId="fuel-type-label" label="Fuel type" value={buyType} onChange={(e) => setBuyType(e.target.value)}>
            <MenuItem value="normal">{market?.normal?.label || 'Standard'} (normal)</MenuItem>
            <MenuItem value="premium">{market?.premium?.label || 'Premium'} (premium)</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Liters"
          type="number"
          value={buyLiters}
          onChange={(e) => setBuyLiters(e.target.value)}
          inputProps={{ min: 1, max: Math.max(1, Math.floor(remainingCapacity)), step: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          Estimated cost: <strong>{estCost.toLocaleString()}</strong> tokens
        </Typography>
        {buyOverCapacity ? (
          <Alert severity="warning">
            Requested liters exceed capacity. Max: <strong>{Math.floor(remainingCapacity).toLocaleString()} L</strong>.
          </Alert>
        ) : null}
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" fullWidth onClick={() => setBuyDrawerOpen(false)} disabled={buying}>Cancel</Button>
          <Button variant="contained" fullWidth onClick={buy} disabled={buying || !tier || buyOverCapacity || remainingCapacity <= 0}>
            {buying ? 'Processing…' : 'Purchase'}
          </Button>
        </Stack>
      </Stack>
    </PurchaseSidebar>
    </MagicPageShell>
  );
}

function ChipStat({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Paper>
  );
}
