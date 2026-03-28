import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import TruckThumbAvatar from '../components/TruckThumbAvatar';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import { getTruckMarketplaceCatalog, purchaseTruckModel } from '../services/truckMarketplaceService';
import { getOwnedTrucksFleet } from '../services/fleetService';
import { getMyWallet } from '../services/walletService';

const T = {
  surface: '#111113',
  border: '#27272A',
  text: '#FAFAFA',
  textMuted: '#71717A',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.08)',
  success: '#22C55E',
  info: '#38BDF8'
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 2,
  boxShadow: 'none',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

function tabProps(index) {
  return { id: `truck-market-tab-${index}`, 'aria-controls': `truck-market-tabpanel-${index}` };
}

export default function TruckMarketplace() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [brands, setBrands] = useState([]);
  const [ownedTrucks, setOwnedTrucks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [confirmModel, setConfirmModel] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseOk, setPurchaseOk] = useState('');

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
      const [cat, owned, w] = await Promise.all([
        getTruckMarketplaceCatalog({ preferApi: false }),
        getOwnedTrucksFleet().catch(() => ({ ownedTrucks: [] })),
        getMyWallet().catch(() => null)
      ]);
      setBrands(Array.isArray(cat?.brands) ? cat.brands : []);
      setSourceLabel(cat?.source || '');
      setOwnedTrucks(owned?.ownedTrucks || []);
      setWallet(w);
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

  const balance = Number(wallet?.balance ?? 0);

  const isOwned = useCallback(
    (brandId, model) => {
      if (model?.itemId && ownedItemIds.has(String(model.itemId))) return true;
      return (ownedTrucks || []).some(
        (t) =>
          !t.truckItemId &&
          String(t.brandId || '') === String(brandId) &&
          String(t.modelId || '') === String(model.id)
      );
    },
    [ownedItemIds, ownedTrucks]
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
        )
      }))
      .filter((b) => (b.models || []).length > 0);
  }, [brands, search]);

  const displayBrands = useMemo(() => {
    if (tab === 0) return filteredBrands;
    const b = filteredBrands[tab - 1];
    return b ? [b] : [];
  }, [filteredBrands, tab]);

  const tabBrandList = useMemo(() => [{ id: '_all', name: 'All brands' }, ...brands], [brands]);

  const handlePurchase = async () => {
    if (!confirmModel) return;
    const { brandId, model } = confirmModel;
    setPurchaseLoading(true);
    setPurchaseError('');
    try {
      await purchaseTruckModel(brandId, model.id);
      setPurchaseOk(`Purchased ${model.name}.`);
      setConfirmModel(null);
      await loadAll();
    } catch (e) {
      setPurchaseError(e.response?.data?.message || 'Purchase failed.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: T.accentDim,
                color: T.accent
              }}
            >
              <StorefrontOutlinedIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Truck marketplace
            </Typography>
          </Stack>
          <Typography sx={{ color: T.textMuted, maxWidth: 640, fontSize: '0.95rem' }}>
            Buy truck models with wallet tokens. Owned trucks appear in{' '}
            <Link component={RouterLink} to="/fleet" underline="hover" sx={{ color: T.info, fontWeight: 600 }}>
              Fleet
            </Link>{' '}
            and can accrue odometer from matched deliveries.
          </Typography>
          {sourceLabel ? (
            <Typography variant="caption" sx={{ color: T.textMuted, display: 'block', mt: 0.5 }}>
              Catalogue source: {sourceLabel}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<AccountBalanceWalletOutlined sx={{ fontSize: '18px !important' }} />}
            label={`Balance: ${balance.toLocaleString()}`}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => loadAll()}>
            Refresh
          </Button>
        </Stack>
      </Stack>

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
              )
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
              <Grid container spacing={2}>
                {(brand.models || []).map((model) => {
                  const price = Math.max(0, Number(model.purchasePriceTokens) || 0);
                  const rent = Math.max(0, Number(model.rentPerJobTokens) || 0);
                  const owned = isOwned(brand.id, model);
                  const canAfford = price <= balance;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={`${brand.id}-${model.id}`}>
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
                            {rent > 0 ? (
                              <Chip size="small" variant="outlined" label={`${rent}/job rent`} />
                            ) : null}
                            {Number(model.stock) > 0 ? (
                              <Chip size="small" variant="outlined" label={`Stock ${model.stock}`} />
                            ) : null}
                          </Stack>
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={owned || !canAfford}
                            onClick={() => {
                              setPurchaseError('');
                              setConfirmModel({ brandId: brand.id, brandName: brand.name, model });
                            }}
                          >
                            {owned ? 'Owned' : !canAfford ? 'Insufficient balance' : 'Purchase'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </>
      )}

      <Dialog open={Boolean(confirmModel)} onClose={() => !purchaseLoading && setConfirmModel(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm purchase</DialogTitle>
        <DialogContent>
          {confirmModel && (
            <Typography variant="body2" color="text.secondary">
              Buy <strong>{confirmModel.model.name}</strong> ({confirmModel.brandName}) for{' '}
              <strong>{Math.max(0, Number(confirmModel.model.purchasePriceTokens) || 0).toLocaleString()}</strong> tokens?
            </Typography>
          )}
          {purchaseError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {purchaseError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModel(null)} disabled={purchaseLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handlePurchase} disabled={purchaseLoading}>
            {purchaseLoading ? 'Processing…' : 'Buy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
