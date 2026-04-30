import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Link,
  Divider,
} from '@mui/material';
import TruckThumbAvatar from '../components/TruckThumbAvatar';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  getTruckMarketplaceCatalog,
  purchaseDivisionTruck,
  previewCoupon,
} from '../services/truckMarketplaceService';
import { getOwnedTrucksFleet } from '../services/fleetService';
import axiosInstance from '../utils/axios';
import DashboardHero from '../components/magicui/DashboardHero';
import MagicPageShell from '../components/magicui/MagicPageShell';
import { BentoGrid, BentoItem } from '../components/magicui/BentoGrid';
import PurchaseSidebar from '../components/magicui/PurchaseSidebar';

const T = {
  surface: '#111113',
  border: '#27272A',
  text: '#FAFAFA',
  textMuted: '#71717A',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.08)',
  success: '#22C55E',
  info: '#38BDF8',
  warn: '#F59E0B',
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 2,
  boxShadow: 'none',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

function tabProps(index) {
  return { id: `truck-market-tab-${index}`, 'aria-controls': `truck-market-tabpanel-${index}` };
}

/**
 * Truck marketplace.
 *
 * - Catalogue is public, but purchases require the caller to be a division
 *   leader (secondary role); the buy button is disabled otherwise.
 * - Price is paid from the division wallet (not the rider's personal wallet).
 * - Optional coupon code is previewed before confirmation.
 */
export default function TruckMarketplace() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [brands, setBrands] = useState([]);
  const [ownedTrucks, setOwnedTrucks] = useState([]);
  const [myDivisionInfo, setMyDivisionInfo] = useState(null); // { division, isLeader }
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);

  const [confirmModel, setConfirmModel] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseOk, setPurchaseOk] = useState('');

  const divisionId = myDivisionInfo?.division?._id || null;
  const isLeader = Boolean(myDivisionInfo?.isLeader);
  const divisionBalance = Number(myDivisionInfo?.division?.walletBalance || 0);

  const ownedItemIds = useMemo(() => {
    const s = new Set();
    for (const t of ownedTrucks || []) {
      if (t?.truckItemId) s.add(String(t.truckItemId));
    }
    return s;
  }, [ownedTrucks]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    setPurchaseOk('');
    try {
      const [cat, owned, div] = await Promise.all([
        getTruckMarketplaceCatalog({ preferApi: false }),
        getOwnedTrucksFleet().catch(() => ({ ownedTrucks: [] })),
        axiosInstance.get('/me/division').then((r) => r.data).catch(() => null),
      ]);
      setBrands(Array.isArray(cat?.brands) ? cat.brands : []);
      setSourceLabel(cat?.source || '');
      setOwnedTrucks(owned?.ownedTrucks || []);
      setMyDivisionInfo(div || null);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load truck marketplace.');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isOwned = useCallback(
    (model) => model?.itemId && ownedItemIds.has(String(model.itemId)),
    [ownedItemIds]
  );

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands
      .map((b) => ({
        ...b,
        models: (b.models || []).filter(
          (m) =>
            String(m.name || '').toLowerCase().includes(q) ||
            String(b.name || '').toLowerCase().includes(q)
        ),
      }))
      .filter((b) => (b.models || []).length > 0);
  }, [brands, search]);

  const displayBrands = useMemo(() => {
    if (tab === 0) return filteredBrands;
    const b = filteredBrands[tab - 1];
    return b ? [b] : [];
  }, [filteredBrands, tab]);

  const tabBrandList = useMemo(() => [{ id: '_all', name: 'All brands' }, ...brands], [brands]);

  const openConfirm = (brand, model) => {
    setPurchaseError('');
    setCouponCode('');
    setCouponPreview(null);
    setConfirmModel({ brandId: brand.id, brandName: brand.name, model });
  };

  const closeConfirm = () => {
    if (purchaseLoading) return;
    setConfirmModel(null);
    setCouponCode('');
    setCouponPreview(null);
  };

  const handleCouponCheck = async () => {
    if (!confirmModel) return;
    const trimmed = String(couponCode || '').trim();
    if (!trimmed) {
      setCouponPreview(null);
      return;
    }
    setCouponChecking(true);
    try {
      const p = await previewCoupon(trimmed, confirmModel.model.itemId);
      setCouponPreview(p);
    } catch (e) {
      setCouponPreview({
        valid: false,
        reason: e.response?.data?.message || 'INVALID',
        effectivePrice: Number(confirmModel.model.purchasePriceTokens) || 0,
        discount: 0,
      });
    } finally {
      setCouponChecking(false);
    }
  };

  const handlePurchase = async () => {
    if (!confirmModel || !divisionId || !isLeader) return;
    setPurchaseLoading(true);
    setPurchaseError('');
    try {
      const res = await purchaseDivisionTruck(
        divisionId,
        confirmModel.model.itemId,
        couponPreview?.valid ? couponCode.trim() : ''
      );
      setPurchaseOk(
        `Purchased ${confirmModel.model.name} for ${Number(res.effectivePrice || 0).toLocaleString()} tokens.`
      );
      setConfirmModel(null);
      setCouponCode('');
      setCouponPreview(null);
      await loadAll();
    } catch (e) {
      setPurchaseError(e.response?.data?.message || 'Purchase failed.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const basePrice = Math.max(0, Number(confirmModel?.model?.purchasePriceTokens) || 0);
  const payable = couponPreview?.valid ? Number(couponPreview.effectivePrice) : basePrice;
  const canAffordConfirm = divisionId && payable <= divisionBalance;

  return (
    <MagicPageShell>
    <Box sx={{ py: 2 }}>
      <DashboardHero
        title="Truck Marketplace"
        subtitle="Compare models, validate affordability, and expand your shared fleet. Purchased trucks become available to division members in Fleet."
        stats={[
          { label: 'Brands', value: brands.length },
          { label: 'Owned Trucks', value: ownedTrucks.length },
          { label: 'Division Wallet', value: divisionBalance },
          { label: 'Leader Access', value: isLeader ? 1 : 0 },
        ]}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <StorefrontOutlinedIcon sx={{ color: T.accent }} />
          <Typography sx={{ color: T.textMuted, maxWidth: 640, fontSize: '0.95rem' }}>
            Division leaders buy trucks for the entire division from here. Purchased trucks show up in{' '}
            <Link component={RouterLink} to="/fleet" underline="hover" sx={{ color: T.info, fontWeight: 600 }}>
              Fleet
            </Link>
            .
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {sourceLabel ? (
            <Chip label={`Source: ${sourceLabel}`} size="small" variant="outlined" />
          ) : null}
          {divisionId ? (
            <Chip
              icon={<AccountBalanceWalletOutlined sx={{ fontSize: '18px !important' }} />}
              label={`Wallet: ${divisionBalance.toLocaleString()}`}
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          ) : null}
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => loadAll()}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {!loading && !divisionId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You're not part of a division yet. Join or create one to view your division's fleet. You can still browse the
          catalogue below.
        </Alert>
      )}
      {!loading && divisionId && !isLeader && (
        <Alert severity="info" icon={<LockOutlinedIcon />} sx={{ mb: 2 }}>
          Only your division leader can buy trucks. You can still browse the catalogue and see what your division
          already owns.
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {purchaseOk && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPurchaseOk('')}>
          {purchaseOk}
        </Alert>
      )}

      {!loading && !error && !brands.length && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No trucks are listed yet. Ask an admin to add vehicles in the admin truck catalogue.
        </Alert>
      )}

      {brands.length > 0 && (
        <>
          <TextField
            size="small"
            placeholder="Search brand or model"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {tabBrandList.map((b, i) => (
              <Tab key={b.id || i} label={b.name} {...tabProps(i)} />
            ))}
          </Tabs>

          {filteredBrands.length === 0 && search.trim() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No models match &quot;{search.trim()}&quot;.
            </Alert>
          )}

          {displayBrands.map((brand) => (
            <Box key={brand.id} sx={{ mb: 4 }}>
              {tab === 0 && (
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  {brand.name}
                </Typography>
              )}
              <BentoGrid minItemWidth={270} gap={2}>
                {(brand.models || []).map((model) => {
                  const price = Math.max(0, Number(model.purchasePriceTokens) || 0);
                  const rent = Math.max(0, Number(model.rentPerJobTokens) || 0);
                  const owned = isOwned(model);
                  const canBuy = isLeader && !!divisionId;
                  const canAfford = price <= divisionBalance;
                  return (
                    <BentoItem key={`${brand.id}-${model.id}`}>
                      <Card sx={sxCard}>
                        <CardContent sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                            <TruckThumbAvatar
                              image={model.image}
                              bannerImage={model.bannerImage}
                              brandLogo={brand.logo}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={700} noWrap>
                                {model.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {brand.name}
                              </Typography>
                            </Box>
                            {owned && (
                              <Chip
                                size="small"
                                icon={<CheckCircleOutlineIcon sx={{ fontSize: '16px !important' }} />}
                                label="Owned"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={`${price.toLocaleString()} tokens`} sx={{ fontWeight: 600 }} />
                            {rent > 0 ? <Chip size="small" variant="outlined" label={`${rent}/job rent`} /> : null}
                            {Number(model.stock) > 0 ? (
                              <Chip size="small" variant="outlined" label={`Stock ${model.stock}`} />
                            ) : null}
                          </Stack>
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={!canBuy || !canAfford}
                            onClick={() => openConfirm(brand, model)}
                          >
                            {!canBuy
                              ? 'Leader only'
                              : !canAfford
                              ? 'Division wallet low'
                              : 'Buy for division'}
                          </Button>
                        </CardActions>
                      </Card>
                    </BentoItem>
                  );
                })}
              </BentoGrid>
            </Box>
          ))}
        </>
      )}

      <PurchaseSidebar
        open={Boolean(confirmModel)}
        onClose={closeConfirm}
        title="Confirm division purchase"
        subtitle={
          confirmModel
            ? `Buying ${confirmModel.model.name} (${confirmModel.brandName}) for ${myDivisionInfo?.division?.name || 'your division'}.`
            : ''
        }
        width={460}
      >
        {confirmModel && (
          <Box>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Base price</Typography>
                <Typography variant="body2">{basePrice.toLocaleString()} tokens</Typography>
              </Stack>
              <Divider />
              <TextField
                size="small"
                label="Coupon code (optional)"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponPreview(null);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" disabled={!couponCode.trim() || couponChecking} onClick={handleCouponCheck}>
                  {couponChecking ? 'Checking…' : 'Apply coupon'}
                </Button>
                {couponPreview?.valid ? <Chip size="small" color="success" label={`-${Number(couponPreview.discount).toLocaleString()} tokens`} /> : null}
                {couponPreview && !couponPreview.valid ? <Chip size="small" color="warning" label={couponPreview.reason || 'INVALID'} /> : null}
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700}>Division pays</Typography>
                <Typography variant="body2" fontWeight={700}>{payable.toLocaleString()} tokens</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: T.textMuted }}>
                Division wallet balance: {divisionBalance.toLocaleString()} tokens
              </Typography>
              {!canAffordConfirm ? <Alert severity="warning">Insufficient division wallet balance for this purchase.</Alert> : null}
              {purchaseError ? <Alert severity="error">{purchaseError}</Alert> : null}
              <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                <Button onClick={closeConfirm} disabled={purchaseLoading} variant="outlined" fullWidth>Cancel</Button>
                <Button variant="contained" onClick={handlePurchase} disabled={purchaseLoading || !canAffordConfirm || !isLeader} fullWidth>
                  {purchaseLoading ? 'Processing…' : 'Buy'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </PurchaseSidebar>
    </Box>
    </MagicPageShell>
  );
}
