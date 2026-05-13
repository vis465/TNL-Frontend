import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Typography,
  Badge,
  Tooltip,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import LocalGasStationOutlined from '@mui/icons-material/LocalGasStationOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import DirectionsBusOutlined from '@mui/icons-material/DirectionsBusOutlined';
import LeaderboardOutlined from '@mui/icons-material/LeaderboardOutlined';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import AddCircleOutlineOutlined from '@mui/icons-material/AddCircleOutlineOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import MonetizationOnOutlined from '@mui/icons-material/MonetizationOnOutlined';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import { getDivisionTrucks } from '../services/fleetService';
import {
  createDivisionLoan,
  getDivisionLoanInstallments,
  getDivisionLoanPlans,
  getDivisionLoans,
} from '../services/loanService';
import DivisionGlobalBanner from '../components/DivisionGlobalBanner';
import MagicPageShell from '../components/magicui/MagicPageShell';

// ─── design tokens ───────────────────────────────────────────────────────────
const T = {
  surfaceAlt: '#1a1e27',
  surfaceElevated: '#1f2430',
  border: '#252a35',
  borderStrong: '#343c4d',
  borderGlow: 'rgba(79,142,247,0.3)',
  text: '#e8eaf0',
  textMuted: '#7b8494',
  textDim: '#4a5165',
  accent: '#4f8ef7',
  accentDim: 'rgba(79,142,247,0.12)',
  accentGlow: 'rgba(79,142,247,0.25)',
  warn: '#f59e0b',
  warnDim: 'rgba(245,158,11,0.12)',
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.12)',
  info: '#38bdf8',
  infoDim: 'rgba(56,189,248,0.12)',
  premium: '#facc15',
  premiumDim: 'rgba(250,204,21,0.10)',
  mono: '"Montserrat", "Helvetica", sans-serif',
  sans: '"DM Sans", "Nunito", system-ui, sans-serif',
};

// ─── keyframe injection ───────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('mydivision-styles')) return;
  const style = document.createElement('style');
  style.id = 'mydivision-styles';
  style.textContent = `
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(79,142,247,0); }
      50%       { box-shadow: 0 0 14px 3px rgba(79,142,247,0.18); }
    }
    @keyframes tankFill {
      from { height: 0%; }
    }
    @keyframes dotPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.6); opacity: 0.5; }
    }
    @keyframes scanLine {
      0%   { transform: translateY(0%); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(100%); opacity: 0; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes borderPulse {
      0%, 100% { border-color: rgba(239,68,68,0.3); }
      50%       { border-color: rgba(239,68,68,0.7); }
    }
    .anim-fade-up { animation: fadeSlideUp 0.45s cubic-bezier(.22,1,.36,1) both; }
    .anim-fade-in { animation: fadeSlideIn 0.4s cubic-bezier(.22,1,.36,1) both; }
    .stagger-1 { animation-delay: 0.05s; }
    .stagger-2 { animation-delay: 0.10s; }
    .stagger-3 { animation-delay: 0.15s; }
    .stagger-4 { animation-delay: 0.20s; }
    .stagger-5 { animation-delay: 0.25s; }
    .stagger-6 { animation-delay: 0.30s; }
    .card-hover {
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    }
    .card-hover:hover {
      border-color: ${T.borderStrong} !important;
      box-shadow: 0 4px 24px rgba(0,0,0,0.35);
      transform: translateY(-1px);
    }
    .tab-panel-enter {
      animation: fadeSlideUp 0.3s cubic-bezier(.22,1,.36,1) both;
    }
    .blocked-pulse {
      animation: borderPulse 2s ease-in-out infinite;
    }
    .stat-count { animation: countUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  `;
  document.head.appendChild(style);
};

// ─── sx helpers ──────────────────────────────────────────────────────────────
const sx = {
  card: {
    bgcolor: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 2,
    boxShadow: 'none',
    overflow: 'hidden',
  },
  cardAlt: {
    bgcolor: T.surfaceAlt,
    border: `1px solid ${T.border}`,
    borderRadius: 2,
    boxShadow: 'none',
  },
  label: {
    fontFamily: T.mono,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: T.textMuted,
  },
  value: {
    fontFamily: T.mono,
    fontWeight: 700,
    fontSize: '22px',
    color: T.text,
    lineHeight: 1,
  },
  sectionTitle: {
    fontFamily: T.mono,
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.textMuted,
  },
  pill: (color = T.accentDim, text = T.accent) => ({
    px: 1.25,
    py: 0.4,
    borderRadius: '6px',
    bgcolor: color,
    color: text,
    fontFamily: T.mono,
    fontSize: '10px',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  }),
};

// ─── Animated stat tile ──────────────────────────────────────────────────────
const StatTile = ({ label, value, accent, icon: Icon, sub, delay = 0 }) => {
  return (
    <Box
      className={`anim-fade-up card-hover`}
      style={{ animationDelay: `${delay}s` }}
      sx={{
        bgcolor: T.surfaceAlt,
        border: `1px solid ${T.border}`,
        borderRadius: 2,
        p: 2,
        flex: 1,
        minWidth: 130,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${accent || T.accent}, transparent)`,
          opacity: 0,
          transition: 'opacity 0.3s',
        },
        '&:hover::before': { opacity: 1 },
      }}
    >
      {Icon && (
        <Icon sx={{ position: 'absolute', right: 12, top: 12, fontSize: 30, color: accent || T.textDim, opacity: 0.15, transition: 'opacity 0.2s', '.card-hover:hover &': { opacity: 0.3 } }} />
      )}
      <Typography sx={{ ...sx.label, mb: 1 }}>{label}</Typography>
      <Typography className="stat-count" sx={{ ...sx.value, color: accent || T.text, fontSize: '24px' }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted, mt: 0.75, lineHeight: 1.4 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
};

// ─── Status indicator ────────────────────────────────────────────────────────
const StatusDot = ({ status }) => {
  const map = { ok: T.success, warn: T.warn, error: T.danger, info: T.info };
  const color = map[status] || T.textMuted;
  return (
    <Box sx={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      {status === 'ok' && (
        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: color, animation: 'dotPulse 2.5s ease-in-out infinite', opacity: 0.5 }} />
      )}
    </Box>
  );
};

// ─── Section header ──────────────────────────────────────────────────────────
const SectionHeader = ({ label, right, icon: Icon }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      {Icon && <Icon sx={{ fontSize: 15, color: T.textMuted }} />}
      <Typography sx={sx.sectionTitle}>{label}</Typography>
    </Stack>
    {right}
  </Stack>
);

// ─── Vertical fuel tank ──────────────────────────────────────────────────────
const TankBar = ({ label, liters, pct, color, borderColor }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography sx={{ ...sx.label, color, mb: 1.25 }}>{label}</Typography>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ position: 'relative', width: 40, height: 80, borderRadius: '20px', border: `2px solid ${borderColor}`, bgcolor: T.bg, overflow: 'hidden', flexShrink: 0, boxShadow: `0 0 12px ${color}22` }}>
        <Box
          sx={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: `${Math.max(4, Math.min(100, pct))}%`,
            background: `linear-gradient(180deg, ${color}cc 0%, ${color} 100%)`,
            animation: 'tankFill 1.2s cubic-bezier(.22,1,.36,1) both',
            transition: 'height .4s cubic-bezier(.4,0,.2,1)',
          }}
        />
        {/* Scan line */}
        {pct > 10 && (
          <Box sx={{ position: 'absolute', left: 0, right: 0, height: '2px', bgcolor: `${color}88`, animation: 'scanLine 3s linear infinite', animationDelay: '1.5s' }} />
        )}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: T.mono, fontWeight: 800, fontSize: '18px', color: T.text }}>
          {liters.toLocaleString()} L
        </Typography>
        <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted, mt: 0.25 }}>
          {pct}% capacity
        </Typography>
        <Box sx={{ mt: 1, width: 80, height: 3, borderRadius: 2, bgcolor: T.border, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 2, transition: 'width 1s cubic-bezier(.22,1,.36,1)' }} />
        </Box>
      </Box>
    </Stack>
  </Box>
);

// ─── Truck card ──────────────────────────────────────────────────────────────
const TruckCard = ({ truck }) => {
  const now = Date.now();
  const wearPct = Math.min(100, Math.round((Number(truck.wearKm || 0) / Math.max(1, Number(truck.wearThresholdKm || 1))) * 100));
  const readyAt = truck.maintenanceReadyAt ? new Date(truck.maintenanceReadyAt).getTime() : 0;
  const inMaintenance = Boolean(truck.blocked && readyAt > now);
  const needsMaintenance = Boolean(truck.blocked && !inMaintenance);
  const status = needsMaintenance ? 'error' : inMaintenance ? 'info' : 'ok';
  const statusLabel = needsMaintenance ? 'Needs maintenance' : inMaintenance ? 'In maintenance' : 'Operational';
  const wearColor = wearPct >= 90 ? T.danger : wearPct >= 70 ? T.warn : T.success;

  return (
    <Stack
      className="card-hover"
      direction="row" spacing={1.5} alignItems="center"
      sx={{
        p: 1.5, borderRadius: 1.5,
        bgcolor: T.surfaceAlt,
        border: `1px solid ${needsMaintenance ? `${T.danger}44` : inMaintenance ? `${T.info}44` : T.border}`,
        cursor: 'default',
      }}
    >
      <Avatar src={truck.image || truck.brandLogo || undefined} variant="rounded"
        sx={{ width: 34, height: 34, bgcolor: T.bg, fontSize: '14px', border: `1px solid ${T.border}` }}>
        {(truck.brandName || truck.displayName || 'T')[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: T.mono, fontSize: '11px', fontWeight: 700, color: T.text }} noWrap>
          {truck.displayName || `${truck.brandName || ''} ${truck.modelName || ''}`.trim() || 'Truck'}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.4 }}>
          <StatusDot status={status} />
          <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: status === 'error' ? T.danger : status === 'info' ? T.info : T.success }}>
            {statusLabel}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: T.border, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${wearPct}%`, bgcolor: wearColor, borderRadius: 2 }} />
          </Box>
          <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted, flexShrink: 0 }}>
            {wearPct}%
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

// ─── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, actions }) => (
  <Box className="anim-fade-up" sx={{ textAlign: 'center', py: 6, px: 3 }}>
    {Icon && (
      <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: T.surfaceAlt, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
        <Icon sx={{ fontSize: 26, color: T.textMuted }} />
      </Box>
    )}
    <Typography sx={{ fontFamily: T.sans, fontWeight: 700, fontSize: '16px', color: T.text, mb: 0.75 }}>{title}</Typography>
    {description && <Typography sx={{ color: T.textMuted, fontSize: '13px', mb: 3, maxWidth: 320, mx: 'auto' }}>{description}</Typography>}
    {actions && <Stack direction="row" spacing={1.5} justifyContent="center">{actions}</Stack>}
  </Box>
);

// ─── constants ────────────────────────────────────────────────────────────────
const DIVISION_FUEL_CAPACITY_L = 20_000;
const TAB_KEYS = ['overview', 'people', 'fleet', 'leaderboard'];
const TAB_INDEX_BY_KEY = TAB_KEYS.reduce((acc, key, index) => { acc[key] = index; return acc; }, {});
const LEADER_TOOL_KEYS = ['access', 'requests', 'finance'];
const LEADER_TOOL_INDEX_BY_KEY = LEADER_TOOL_KEYS.reduce((acc, key, index) => { acc[key] = index; return acc; }, {});

// ─── shared sx presets ───────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: T.bg,
    color: T.text,
    fontFamily: T.mono,
    fontSize: '13px',
    borderRadius: '8px',
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderStrong },
    '&.Mui-focused fieldset': { borderColor: T.accent },
  },
  '& .MuiInputLabel-root': { color: T.textMuted, fontSize: '12px', fontFamily: T.mono },
  '& .MuiInputLabel-root.Mui-focused': { color: T.accent },
};

const btnSx = {
  primary: {
    bgcolor: T.accent,
    color: '#fff',
    fontFamily: T.mono,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderRadius: '8px',
    boxShadow: `0 0 0 0 ${T.accentGlow}`,
    transition: 'all 0.2s',
    '&:hover': { bgcolor: '#3a7de8', boxShadow: `0 4px 16px ${T.accentGlow}` },
    '&.Mui-disabled': { bgcolor: T.textDim, color: T.textMuted },
  },
  outlined: {
    color: T.textMuted,
    borderColor: T.border,
    fontFamily: T.mono,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderRadius: '8px',
    transition: 'all 0.2s',
    '&:hover': { borderColor: T.borderStrong, color: T.text, bgcolor: T.surfaceAlt },
  },
  danger: {
    color: T.danger,
    borderColor: `${T.danger}44`,
    fontFamily: T.mono,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderRadius: '8px',
    transition: 'all 0.2s',
    '&:hover': { borderColor: T.danger, bgcolor: T.dangerDim },
  },
  success: {
    bgcolor: T.success,
    color: '#000',
    fontFamily: T.mono,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderRadius: '8px',
    '&:hover': { bgcolor: '#16a34a' },
  },
};

const tabsSx = {
  '& .MuiTab-root': {
    fontFamily: T.mono,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: T.textMuted,
    minHeight: 44,
    transition: 'color 0.2s',
    '&.Mui-selected': { color: T.accent },
  },
  '& .MuiTabs-indicator': { bgcolor: T.accent, height: 2, borderRadius: '2px 2px 0 0' },
  borderBottom: `1px solid ${T.border}`,
  mb: 0,
};

const tableSx = {
  '& .MuiTableCell-head': {
    fontFamily: T.mono,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: T.textMuted,
    bgcolor: T.bg,
    borderBottom: `1px solid ${T.border}`,
    py: 1.25,
  },
  '& .MuiTableCell-body': {
    fontFamily: T.mono,
    fontSize: '12px',
    color: T.text,
    borderBottom: `1px solid ${T.border}`,
    py: 1,
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-body': { borderBottom: 'none' },
  '& .MuiTableSortLabel-root': { color: `${T.textMuted} !important` },
  '& .MuiTableSortLabel-root.Mui-active': { color: `${T.accent} !important` },
  '& .MuiTableSortLabel-icon': { color: `${T.accent} !important` },
  '& .MuiTableRow-root:hover .MuiTableCell-body': { bgcolor: T.surfaceAlt },
};

// ─── main component ───────────────────────────────────────────────────────────
export default function MyDivision() {
  useEffect(() => { injectStyles(); }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [lb, setLb] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletForm, setWalletForm] = useState({ rider: null, amount: '', reason: '' });
  const [taxPct, setTaxPct] = useState('');
  const user = getItemWithExpiry('user') || {};

  const [inviteRider, setInviteRider] = useState(null);
  const [inviteOptions, setInviteOptions] = useState([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [fleetTrucks, setFleetTrucks] = useState([]);
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [leaderQueuesLoading, setLeaderQueuesLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState('');
  const [lbSortKey, setLbSortKey] = useState('jobs');
  const [lbSortDir, setLbSortDir] = useState('desc');
  const [coLeaders, setCoLeaders] = useState([]);
  const [divisionLoanPrincipal, setDivisionLoanPrincipal] = useState('10000');
  const [divisionLoanPlans, setDivisionLoanPlans] = useState([]);
  const [divisionLoanTenure, setDivisionLoanTenure] = useState(3);
  const [divisionLoans, setDivisionLoans] = useState([]);
  const [selectedDivisionLoanId, setSelectedDivisionLoanId] = useState('');
  const [selectedDivisionLoanInstallments, setSelectedDivisionLoanInstallments] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [myInvestedTotal, setMyInvestedTotal] = useState(0);
  const [investmentSummary, setInvestmentSummary] = useState([]);
  const [investAmount, setInvestAmount] = useState('');
  const [investNote, setInvestNote] = useState('');
  const [leaderToolTab, setLeaderToolTab] = useState(0);
  const [tabKey, setTabKey] = useState(0); // for re-mount animation

  const sortedLb = useMemo(() => {
    const rows = [...lb];
    rows.sort((a, b) => {
      const av = Number(a?.[lbSortKey] ?? 0);
      const bv = Number(b?.[lbSortKey] ?? 0);
      return lbSortDir === 'asc' ? av - bv : bv - av;
    });
    return rows;
  }, [lb, lbSortDir, lbSortKey]);

  const toggleLbSort = (key) => {
    if (lbSortKey === key) { setLbSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc')); return; }
    setLbSortKey(key);
    setLbSortDir('desc');
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: d } = await axiosInstance.get('/me/division');
      let resolvedDivision = d?.division || null;
      let leaderDivisionId = user?.leadsDivision?._id || null;

      if (!leaderDivisionId) {
        try {
          const { data: profile } = await axiosInstance.get('/auth/profile');
          leaderDivisionId = profile?.leadsDivision?._id || null;
        } catch (_) { leaderDivisionId = null; }
      }

      let isLeaderFromApi = d?.isLeader;
      if (!resolvedDivision && leaderDivisionId) {
        try {
          const { data: leaderDivisionRes } = await axiosInstance.get(`/divisions/${leaderDivisionId}`);
          resolvedDivision = leaderDivisionRes?.division || null;
          if (typeof leaderDivisionRes?.isLeader === 'boolean') isLeaderFromApi = leaderDivisionRes.isLeader;
        } catch (_) { resolvedDivision = null; }
      }

      const resolvedData = { ...(d || {}), division: resolvedDivision, isLeader: isLeaderFromApi };
      setData(resolvedData);

      if (resolvedDivision?._id) {
        const [{ data: l }, { data: m }, fleet, divisionLoansRes, mineInvestmentsRes, summaryRes] = await Promise.all([
          axiosInstance.get(`/divisions/${resolvedDivision._id}/leaderboard`, { params: { limit: 30 } }),
          axiosInstance.get(`/divisions/${resolvedDivision._id}/members`).catch(() => ({ data: { members: [] } })),
          getDivisionTrucks(resolvedDivision._id).catch(() => ({ trucks: [] })),
          getDivisionLoans(resolvedDivision._id).catch(() => []),
          axiosInstance.get(`/divisions/${resolvedDivision._id}/investments/me`).catch(() => ({ data: { items: [], totalInvested: 0 } })),
          axiosInstance.get(`/divisions/${resolvedDivision._id}/investments/summary`).catch(() => ({ data: { byRider: [] } })),
        ]);
        setLb(l.riders || []);
        setMembers(m.members || []);
        setFleetTrucks(Array.isArray(fleet?.trucks) ? fleet.trucks : []);
        setTaxPct(String(resolvedDivision.taxPercent ?? 0));
        setDivisionLoans(Array.isArray(divisionLoansRes) ? divisionLoansRes : []);
        setMyInvestments(Array.isArray(mineInvestmentsRes?.data?.items) ? mineInvestmentsRes.data.items : []);
        setMyInvestedTotal(Number(mineInvestmentsRes?.data?.totalInvested) || 0);
        setInvestmentSummary(Array.isArray(summaryRes?.data?.byRider) ? summaryRes.data.byRider : []);
        setSelectedDivisionLoanId((prev) =>
          prev && (divisionLoansRes || []).some((x) => String(x._id) === String(prev))
            ? prev
            : divisionLoansRes?.[0]?._id || ''
        );
      } else {
        setLb([]); setMembers([]); setFleetTrucks([]); setJoinRequests([]); setSentInvites([]);
        setDivisionLoans([]); setSelectedDivisionLoanId(''); setMyInvestments([]);
        setMyInvestedTotal(0); setInvestmentSummary([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderQueues = async (divisionId) => {
    if (!divisionId || !isLeader) { setJoinRequests([]); setSentInvites([]); return; }
    setLeaderQueuesLoading(true);
    try {
      const [reqsRes, invitesRes] = await Promise.all([
        axiosInstance.get(`/divisions/${divisionId}/join-requests`).catch(() => ({ data: { requests: [] } })),
        axiosInstance.get(`/divisions/${divisionId}/invites`).catch(() => ({ data: { invites: [] } })),
      ]);
      setJoinRequests(reqsRes?.data?.requests || []);
      setSentInvites(invitesRes?.data?.invites || []);
    } finally { setLeaderQueuesLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const div = data?.division;
  const attendanceSummary = data?.attendanceSummary;
  const uid = String(user.id || user._id || '');
  const leaderIdStr = String(div?.leaderId || div?.leader?._id || '');
  const isLeader = data?.isLeader === true || Boolean(div && uid && leaderIdStr && uid === leaderIdStr);
  const isAdmin = user?.role === 'admin';
  const coLeaderIds = Array.isArray(div?.coLeaderUserIds) ? div.coLeaderUserIds.map((x) => String(x)) : [];
  const isCoLeader = Boolean(uid && coLeaderIds.includes(uid));
  const canManageFuel = isLeader || isCoLeader || isAdmin || user?.role === 'communityManager';

  const fleetSummary = useMemo(() => {
    const total = fleetTrucks.length;
    const blocked = fleetTrucks.filter((t) => t.blocked).length;
    const maintenanceCost = fleetTrucks.filter((t) => t.blocked).reduce((sum, t) => sum + (Number(t.maintenanceCost) || 0), 0);
    const wearHigh = fleetTrucks.filter((t) => {
      const pct = (Number(t.wearKm || 0) / Math.max(1, Number(t.wearThresholdKm || 1))) * 100;
      return pct >= 70 && !t.blocked;
    }).length;
    const fleetKm = fleetTrucks.reduce((s, t) => s + (Number(t.odometerKm) || 0), 0);
    return { total, blocked, wearHigh, fleetKm, maintenanceCost };
  }, [fleetTrucks]);

  const premiumFuel = Math.max(0, Number(div?.fuelTankPremiumLiters) || 0);
  const standardFuel = Math.max(0, Number(div?.fuelTankNormalLiters ?? div?.fuelTankLiters) || 0);
  const totalFuel = premiumFuel + standardFuel;
  const totalFuelBurned = Math.max(0, Number(div?.stats?.totalFuelBurned) || 0);
  const avgFuelPerJob = (Number(div?.stats?.totalJobs) || 0) > 0 ? totalFuelBurned / Math.max(1, Number(div?.stats?.totalJobs) || 0) : 0;
  const capacityPct = Math.max(0, Math.min(100, Math.round((totalFuel / DIVISION_FUEL_CAPACITY_L) * 100)));
  const premiumPct = Math.max(0, Math.min(100, Math.round((premiumFuel / DIVISION_FUEL_CAPACITY_L) * 100)));
  const standardPct = Math.max(0, Math.min(100, Math.round((standardFuel / DIVISION_FUEL_CAPACITY_L) * 100)));
  const remainingFuelCapacity = Math.max(0, DIVISION_FUEL_CAPACITY_L - totalFuel);

  const peopleRows = useMemo(() => {
    const base = Array.isArray(members) ? [...members] : [];
    const leaderObj = div?.leader || null;
    const leaderId = String(div?.leaderId || leaderObj?._id || '');
    if (!leaderId) return base;
    const hasLeader = base.some((m) => String(m?._id || m?.riderId || '') === leaderId);
    if (!hasLeader) {
      base.unshift({ _id: leaderId, name: leaderObj?.name || leaderObj?.username || 'Division Leader', username: leaderObj?.username || '', employeeID: leaderObj?.employeeID || '', avatar: leaderObj?.avatar || '', isLeader: true, totalJobs: null });
    }
    return base;
  }, [members, div]);

  const coLeaderCandidateMembers = useMemo(
    () => peopleRows.filter((m) => !m.isLeader && String(m._id || m.riderId || '').trim()),
    [peopleRows]
  );

  useEffect(() => {
    const coIds = Array.isArray(div?.coLeaderUserIds) ? div.coLeaderUserIds.map((x) => String(x)) : [];
    if (!coIds.length) { setCoLeaders([]); return; }
    const selected = coLeaderCandidateMembers.filter((m) => coIds.includes(String(m.userId || '')));
    setCoLeaders(selected);
  }, [div?.coLeaderUserIds, coLeaderCandidateMembers]);

  const effectiveMemberCount = peopleRows.length || Number(div?.memberCount || 0);
  const currentMemberByUserId = peopleRows.find((m) => String(m?.userId || '') === uid);
  const canInvest = Boolean(isLeader || (currentMemberByUserId && !currentMemberByUserId?.inactive));

  useEffect(() => {
    if (!isLeader || !div?._id) return;
    const t = setTimeout(async () => {
      setInviteLoading(true);
      try {
        const { data: r } = await axiosInstance.get(`/divisions/${div._id}/eligible-invitees`, { params: { q: inviteQuery || undefined } });
        setInviteOptions(r.riders || []);
      } catch (_) { setInviteOptions([]); } finally { setInviteLoading(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [isLeader, div?._id, inviteQuery]);

  useEffect(() => { loadLeaderQueues(div?._id); }, [div?._id, isLeader]);

  useEffect(() => {
    const loadPlans = async () => {
      const p = Number(divisionLoanPrincipal);
      if (!Number.isFinite(p) || p <= 0) { setDivisionLoanPlans([]); return; }
      try {
        const data = await getDivisionLoanPlans(p);
        const plans = data?.items || [];
        setDivisionLoanPlans(plans);
        if (plans.length && !plans.some((x) => Number(x.tenureMonths) === Number(divisionLoanTenure))) {
          setDivisionLoanTenure(Number(plans[0].tenureMonths));
        }
      } catch (_) { setDivisionLoanPlans([]); }
    };
    if (isLeader && div?._id) loadPlans();
  }, [divisionLoanPrincipal, divisionLoanTenure, div?._id, isLeader]);

  useEffect(() => {
    const loadInstallments = async () => {
      if (!div?._id || !selectedDivisionLoanId) { setSelectedDivisionLoanInstallments([]); return; }
      try {
        const data = await getDivisionLoanInstallments(div._id, selectedDivisionLoanId);
        setSelectedDivisionLoanInstallments(data?.installments || []);
      } catch (_) { setSelectedDivisionLoanInstallments([]); }
    };
    loadInstallments();
  }, [div?._id, selectedDivisionLoanId]);

  useEffect(() => {
    const tabKey = String(searchParams.get('tab') || '').toLowerCase();
    const nextIndex = TAB_INDEX_BY_KEY[tabKey];
    if (nextIndex == null || nextIndex === activeTab) return;
    setActiveTab(nextIndex);
  }, [searchParams]);

  useEffect(() => {
    const leaderKey = String(searchParams.get('leader') || '').toLowerCase();
    const nextIndex = LEADER_TOOL_INDEX_BY_KEY[leaderKey];
    if (nextIndex == null || nextIndex === leaderToolTab) return;
    setLeaderToolTab(nextIndex);
  }, [searchParams]);

  const setTabAndSyncQuery = (tabIndex) => {
    setActiveTab(tabIndex);
    setTabKey((k) => k + 1);
    const next = new URLSearchParams(searchParams);
    if (tabIndex <= 0) next.delete('tab'); else next.set('tab', TAB_KEYS[tabIndex]);
    setSearchParams(next, { replace: true });
  };

  const setLeaderTabAndSyncQuery = (tabIndex) => {
    setLeaderToolTab(tabIndex);
    const next = new URLSearchParams(searchParams);
    if (tabIndex <= 0) next.delete('leader'); else next.set('leader', LEADER_TOOL_KEYS[tabIndex]);
    setSearchParams(next, { replace: true });
  };

  const leave = async () => {
    if (!window.confirm('Leave this division?')) return;
    try { await axiosInstance.post('/me/division/leave'); load(); }
    catch (e) { setError(e?.response?.data?.message || 'Leave failed'); }
  };

  const invite = async () => {
    if (!inviteRider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${div._id}/invites`, { riderId: inviteRider._id });
      setInviteRider(null); setInviteQuery(''); load();
    } catch (e) { setError(e?.response?.data?.message || 'Invite failed'); }
  };

  const saveTax = async () => {
    try {
      await axiosInstance.patch(`/divisions/${div._id}/tax`, { taxPercent: Number(taxPct) });
      setTaxDialogOpen(false); load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to update tax'); }
  };

  const saveCoLeaders = async () => {
    try {
      await axiosInstance.patch(`/divisions/${div._id}/co-leaders`, { coLeaderUserIds: coLeaders.map((m) => m.userId || m._id).filter(Boolean) });
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to update co-leaders'); }
  };

  const createDivisionLoanAction = async () => {
    try {
      const principal = Number(divisionLoanPrincipal);
      if (!Number.isFinite(principal) || principal <= 0) return;
      await createDivisionLoan({ divisionId: div._id, principal, tenureMonths: Number(divisionLoanTenure), metadata: { source: 'division_ui' } });
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to create division loan'); }
  };

  const investInDivision = async () => {
    try {
      const amount = Math.floor(Number(investAmount) || 0);
      if (amount <= 0) return;
      await axiosInstance.post(`/divisions/${div._id}/investments`, { amount, note: investNote });
      setInvestAmount(''); setInvestNote(''); await load();
    } catch (e) { setError(e?.response?.data?.message || 'Failed to create investment'); }
  };

  const distribute = async () => {
    if (!walletForm.rider?._id) return;
    try {
      await axiosInstance.post(`/divisions/${div._id}/wallet/distribute`, { riderId: walletForm.rider._id, amount: Number(walletForm.amount), reason: walletForm.reason });
      setWalletForm({ rider: null, amount: '', reason: '' }); load();
    } catch (e) { setError(e?.response?.data?.message || 'Payout failed'); }
  };

  const acceptJoinRequest = async (reqId) => {
    try { await axiosInstance.post(`/divisions/${div._id}/join-requests/${reqId}/accept`); load(); }
    catch (e) { setError(e?.response?.data?.message || 'Failed to accept request'); }
  };

  const rejectJoinRequest = async (reqId) => {
    try { await axiosInstance.post(`/divisions/${div._id}/join-requests/${reqId}/reject`); load(); }
    catch (e) { setError(e?.response?.data?.message || 'Failed to reject request'); }
  };

  const cancelInvite = async (inviteId) => {
    try { await axiosInstance.delete(`/divisions/${div._id}/invites/${inviteId}`); load(); }
    catch (e) { setError(e?.response?.data?.message || 'Failed to cancel invite'); }
  };

  const removeMember = async (member) => {
    const memberId = String(member?._id || member?.riderId || '');
    if (!memberId || !div?._id || member?.isLeader) return;
    if (!window.confirm(`Remove ${member?.name || member?.username || 'this member'} from the division?`)) return;
    setRemovingMemberId(memberId);
    try { await axiosInstance.post(`/divisions/${div._id}/members/${memberId}/kick`); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Failed to remove member'); }
    finally { setRemovingMemberId(''); }
  };

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <MagicPageShell>
      <Box sx={{ bgcolor: T.bg, minHeight: '100vh', fontFamily: T.sans }}>

        {/* ── Loading bar ── */}
        {loading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
            <LinearProgress sx={{ height: 2, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: T.accent } }} />
          </Box>
        )}

        <Container maxWidth="xl" sx={{ py: 3 }}>

          {/* ── Page header ── */}
          <Box className="anim-fade-up" sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.textDim, mb: 0.5 }}>
                  Division command center
                </Typography>
                <Typography sx={{ fontFamily: T.sans, fontWeight: 800, fontSize: '26px', color: T.text, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  My Division
                </Typography>
              </Box>
              {div && (
                <Button variant="outlined" size="small" onClick={leave} sx={btnSx.danger}>
                  Leave Division
                </Button>
              )}
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" className="anim-fade-up"
              sx={{ mb: 2, bgcolor: T.dangerDim, color: T.danger, border: `1px solid ${T.danger}44`, fontFamily: T.mono, fontSize: '12px', borderRadius: 2 }}
              onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <DivisionGlobalBanner globalAnnouncement={data?.globalAnnouncement} />

          {/* ── Not in a division ── */}
          {!div && !loading && (
            <Box className="anim-fade-up" sx={{ ...sx.card, mt: 4 }}>
              <EmptyState
                icon={LocalShippingOutlined}
                title="You're not in a division yet"
                description="Check your invitations or browse available divisions to join one."
                actions={<>
                  <Button component={RouterLink} to="/division/invites" sx={btnSx.primary}>View invitations</Button>
                  <Button component={RouterLink} to="/division-leaderboard" variant="outlined" sx={btnSx.outlined}>Browse divisions</Button>
                </>}
              />
            </Box>
          )}

          {div && (
            <Grid container spacing={2.5} alignItems="flex-start">
              {/* ── Main column ── */}
              <Grid item xs={12} lg={8.5}>
                <Stack spacing={2.5}>

                  {/* ── Division identity ── */}
                  <Box className="anim-fade-up stagger-1" sx={{ ...sx.card }}>
                    {div.bannerUrl ? (
                      <Box sx={{ height: 130, overflow: 'hidden', position: 'relative' }}>
                        <CardMedia component="img" image={div.bannerUrl} alt="banner"
                          sx={{ height: 130, objectFit: 'cover', filter: 'brightness(0.5)' }} />
                        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(13,15,18,0.9) 100%)' }} />
                      </Box>
                    ) : (
                      <Box sx={{ height: 60, background: `linear-gradient(135deg, ${T.surfaceAlt} 0%, ${T.bg} 100%)`, borderBottom: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.015) 20px, rgba(255,255,255,0.015) 21px)' }} />
                      </Box>
                    )}
                    <Box sx={{ p: 2.5 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                        <Avatar
                          src={div.logoUrl || undefined}
                          sx={{
                            width: 56, height: 56,
                            mt: div.bannerUrl ? -5 : 0,
                            border: `2px solid ${T.border}`,
                            bgcolor: T.surfaceAlt,
                            fontFamily: T.mono,
                            fontWeight: 800,
                            fontSize: '22px',
                            boxShadow: `0 4px 16px rgba(0,0,0,0.4)`,
                          }}>
                          {div.name?.[0] || 'D'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '20px', color: T.text, fontFamily: T.sans, letterSpacing: '-0.01em' }}>
                              {div.name}
                            </Typography>
                            <Tooltip title="Edit tax rate" arrow>
                              <Box
                                sx={{ ...sx.pill(T.accentDim, T.accent), cursor: isLeader ? 'pointer' : 'default' }}
                                onClick={isLeader ? () => { setTaxPct(String(div.taxPercent ?? 0)); setTaxDialogOpen(true); } : undefined}
                              >
                                <MonetizationOnOutlined sx={{ fontSize: 11 }} />
                                Tax {div.taxPercent}%
                                {isLeader && <EditOutlined sx={{ fontSize: 10, ml: 0.25 }} />}
                              </Box>
                            </Tooltip>
                          </Stack>
                          {div.description && (
                            <Typography sx={{ color: T.textMuted, fontSize: '13px', mb: 1.5, lineHeight: 1.6 }}>
                              {div.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                            <Box sx={sx.pill(T.successDim, T.success)}>
                              <PeopleOutlined sx={{ fontSize: 11 }} /> {effectiveMemberCount} members
                            </Box>
                            <Box sx={sx.pill(T.infoDim, T.info)}>
                              <AccountBalanceWalletOutlined sx={{ fontSize: 11 }} /> {(div.walletBalance ?? 0).toLocaleString()} tokens
                            </Box>
                            {attendanceSummary && (
                              <>
                                <Box sx={sx.pill(T.accentDim, T.accent)}>
                                  {attendanceSummary?.uniqueEventsAttended ?? '—'} unique events
                                </Box>
                                <Box sx={sx.pill()}>
                                  {attendanceSummary?.totalAttendancesRecorded ?? div.stats?.totalEventsAttended ?? 0} attendances
                                </Box>
                              </>
                            )}
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button component={RouterLink} to={`/divisions/${div.slug}`} variant="outlined" size="small" sx={btnSx.outlined} endIcon={<OpenInNewOutlined sx={{ fontSize: 12 }} />}>
                            Public page
                          </Button>
                          {isLeader && (
                            <>
                              <Button variant="outlined" size="small" onClick={() => setTabAndSyncQuery(2)} sx={btnSx.outlined}>
                                Fleet
                              </Button>
                              <Button component={RouterLink} to="/trucks/marketplace" size="small" sx={btnSx.primary}>
                                Buy truck
                              </Button>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>

                  {/* ── Stat tiles ── */}
                  <Stack className="anim-fade-up stagger-2" direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <StatTile label="Members" value={effectiveMemberCount} icon={PeopleOutlined} accent={T.accent} delay={0.05} />
                    <StatTile label="Wallet balance" value={(div.walletBalance ?? 0).toLocaleString()} icon={AccountBalanceWalletOutlined} accent={T.success} delay={0.1} />
                    <StatTile label="My invested" value={Math.round(myInvestedTotal).toLocaleString()} icon={TrendingUpOutlined} accent={T.info} delay={0.15} />
                    <StatTile
                      label="Blocked trucks"
                      value={fleetSummary.blocked}
                      icon={WarningAmberOutlined}
                      accent={fleetSummary.blocked ? T.warn : T.success}
                      sub={fleetSummary.blocked ? `${Math.round(fleetSummary.maintenanceCost).toLocaleString()} tokens due` : 'All clear'}
                      delay={0.2}
                    />
                    <StatTile
                      label="Fuel burned"
                      value={`${Math.round(totalFuelBurned).toLocaleString()} L`}
                      icon={LocalGasStationOutlined}
                      accent={T.textMuted}
                      sub={`avg ${avgFuelPerJob.toFixed(1)} L / job`}
                      delay={0.25}
                    />
                    <StatTile
                      label="Truck rent (members)"
                      value={Math.round(Number(div?.stats?.totalTruckRentTokens) || 0).toLocaleString()}
                      icon={TrendingDownOutlined}
                      accent={T.textMuted}
                      sub="tokens to bank · marketplace-truck jobs"
                      delay={0.28}
                    />
                  </Stack>

                  {/* ── Fuel status ── */}
                  <Box className="anim-fade-up stagger-3" sx={sx.card}>
                    <Box sx={{ p: 2.5 }}>
                      <SectionHeader
                        label="Fuel status"
                        icon={LocalGasStationOutlined}
                        right={
                          <Stack direction="row" spacing={1}>
                            <Button component={RouterLink} to="/division/fuel" size="small"
                              sx={canManageFuel ? btnSx.primary : btnSx.outlined}>
                              {canManageFuel ? 'Fuel marketplace' : 'Fuel market'}
                            </Button>
                            <Button component={RouterLink} to="/division?tab=people&leader=finance" size="small" variant="outlined" sx={btnSx.outlined}>
                              Loans
                            </Button>
                          </Stack>
                        }
                      />
                      <Box sx={{ p: 2.5, borderRadius: 1.5, bgcolor: T.bg, border: `1px solid ${T.border}` }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ ...sx.label, mb: 1.5 }}>Shared fuel tank</Typography>
                          <Typography sx={{ fontFamily: T.mono, fontSize: '18px', fontWeight: 800, color: T.text, mb: 1 }}>
                            {totalFuel.toLocaleString()} / {DIVISION_FUEL_CAPACITY_L.toLocaleString()} L total
                          </Typography>
                          <Typography sx={{ fontFamily: T.mono, fontSize: '12px', color: T.textMuted, mb: 2 }}>
                            {capacityPct}% filled · {Math.round(remainingFuelCapacity).toLocaleString()} L remaining
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
                            {/* Fuel Tank Visualization */}
                            <Box sx={{ position: 'relative', width: 80, height: 200, flexShrink: 0 }}>
                              {/* Tank outline */}
                              <Box sx={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '16px 16px 12px 12px',
                                border: `4px solid ${T.borderStrong}`,
                                bgcolor: T.surfaceAlt,
                                boxShadow: `inset 0 4px 12px rgba(0,0,0,0.2), 0 3px 12px rgba(0,0,0,0.15)`,
                              }} />

                              {/* Tank body details */}
                              <Box sx={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                right: 10,
                                bottom: 10,
                                borderRadius: '10px 10px 6px 6px',
                                border: `1px solid ${T.border}`,
                                opacity: 0.4,
                              }} />

                              {/* Measurement markings */}
                              {[20, 40, 60, 80].map((mark) => (
                                <Box key={mark} sx={{
                                  position: 'absolute',
                                  left: -10,
                                  right: -10,
                                  top: `${100 - mark}%`,
                                  height: '2px',
                                  bgcolor: T.border,
                                  opacity: 0.7,
                                }} />
                              ))}

                              {/* Fuel level */}
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: `${capacityPct}%`,
                                borderRadius: '10px 10px 6px 6px',
                                overflow: 'hidden',
                                transition: 'height 1.5s cubic-bezier(.22,1,.36,1)',
                                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.3)`,
                              }}>
                                {/* Premium fuel (bottom layer) */}
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: `${totalFuel > 0 ? (premiumFuel / totalFuel) * 100 : 0}%`,
                                  background: `linear-gradient(180deg, ${T.premium}ee 0%, ${T.premium} 100%)`,
                                  boxShadow: `inset 0 2px 0 rgba(255,255,255,0.4)`,
                                }} />
                                {/* Standard fuel (top layer) */}
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: `${totalFuel > 0 ? (premiumFuel / totalFuel) * 100 : 0}%`,
                                  left: 0,
                                  right: 0,
                                  height: `${totalFuel > 0 ? (standardFuel / totalFuel) * 100 : 0}%`,
                                  background: `linear-gradient(180deg, ${T.accent}ee 0%, ${T.accent} 100%)`,
                                  boxShadow: `inset 0 2px 0 rgba(255,255,255,0.4)`,
                                }} />
                              </Box>

                              {/* Tank cap */}
                              <Box sx={{
                                position: 'absolute',
                                top: -10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 32,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: T.borderStrong,
                                border: `3px solid ${T.border}`,
                                boxShadow: `0 2px 6px rgba(0,0,0,0.3)`,
                              }} />

                              {/* Fill level indicator */}
                              <Box sx={{
                                position: 'absolute',
                                right: -40,
                                top: `${100 - capacityPct}%`,
                                transform: 'translateY(-50%)',
                                fontFamily: T.mono,
                                fontSize: '12px',
                                fontWeight: 900,
                                color: T.text,
                                bgcolor: T.surface,
                                px: 1,
                                py: 0.75,
                                borderRadius: 1.5,
                                border: `2px solid ${T.border}`,
                                whiteSpace: 'nowrap',
                                boxShadow: `0 3px 8px rgba(0,0,0,0.15)`,
                              }}>
                                {capacityPct}%
                              </Box>
                            </Box>

                            {/* Tank details */}
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontFamily: T.mono, fontSize: '16px', fontWeight: 700, color: T.text, mb: 1 }}>
                                Fuel Tank Status
                              </Typography>
                              <Typography sx={{ fontFamily: T.mono, fontSize: '13px', color: T.textMuted, mb: 0.5 }}>
                                Current: {Math.round(totalFuel).toLocaleString()} L
                              </Typography>
                              <Typography sx={{ fontFamily: T.mono, fontSize: '13px', color: T.textMuted, mb: 0.5 }}>
                                Capacity: {DIVISION_FUEL_CAPACITY_L.toLocaleString()} L
                              </Typography>
                              <Typography sx={{ fontFamily: T.mono, fontSize: '13px', color: T.textMuted }}>
                                Available: {Math.round(remainingFuelCapacity).toLocaleString()} L
                              </Typography>
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={3} alignItems="center">
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: T.premium, opacity: 0.9 }} />
                              <Typography sx={{ fontFamily: T.mono, fontSize: '11px', color: T.textMuted }}>
                                Premium: {Math.round(premiumFuel).toLocaleString()} L
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: T.accent, opacity: 0.9 }} />
                              <Typography sx={{ fontFamily: T.mono, fontSize: '11px', color: T.textMuted }}>
                                Standard: {Math.round(standardFuel).toLocaleString()} L
                              </Typography>
                            </Stack>
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                            <Box sx={{ ...sx.pill(T.premiumDim, T.premium), fontSize: '10px' }}>
                              <BoltOutlined sx={{ fontSize: 10 }} /> Premium consumed first
                            </Box>
                            <Box sx={{ ...sx.pill(T.accentDim, T.accent), fontSize: '10px' }}>
                              <SpeedOutlined sx={{ fontSize: 10 }} /> Premium = longer coverage
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* ── Workspace tabs ── */}
                  <Box className="anim-fade-up stagger-4" sx={sx.card}>
                    {/* Tab header */}
                    <Box sx={{ px: 2.5, pt: 2, pb: 0, borderBottom: `1px solid ${T.border}` }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 1.5 }}>
                        <Typography sx={{ ...sx.sectionTitle, flex: 1 }}>Division workspace</Typography>
                        {isLeader && (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {joinRequests.length > 0 && (
                              <Box sx={sx.pill(T.warnDim, T.warn)}>
                                <WarningAmberOutlined sx={{ fontSize: 11 }} /> {joinRequests.length} pending
                              </Box>
                            )}
                            {fleetSummary.blocked > 0 && (
                              <Box sx={sx.pill(T.dangerDim, T.danger)}>
                                <ErrorOutlined sx={{ fontSize: 11 }} /> {fleetSummary.blocked} blocked
                              </Box>
                            )}
                          </Stack>
                        )}
                      </Stack>
                      <Tabs value={activeTab} onChange={(_, v) => setTabAndSyncQuery(v)} sx={{ ...tabsSx, borderBottom: 'none', mb: 0 }} variant="scrollable" scrollButtons="auto">
                        <Tab label="Overview" icon={<DashboardOutlined sx={{ fontSize: 14 }} />} iconPosition="start" />
                        <Tab
                          label={`People · ${peopleRows.length}`}
                          icon={
                            <Badge badgeContent={joinRequests.length} color="warning" max={9}>
                              <GroupOutlined sx={{ fontSize: 14 }} />
                            </Badge>
                          }
                          iconPosition="start"
                        />
                        <Tab
                          label={`Fleet${fleetSummary.blocked ? ` · ${fleetSummary.blocked}` : ''}`}
                          icon={
                            <Badge badgeContent={fleetSummary.blocked || 0} color="error" max={9}>
                              <DirectionsBusOutlined sx={{ fontSize: 14 }} />
                            </Badge>
                          }
                          iconPosition="start"
                        />
                        <Tab label={`Leaderboard · ${lb.length}`} icon={<LeaderboardOutlined sx={{ fontSize: 14 }} />} iconPosition="start" />
                      </Tabs>
                    </Box>

                    {/* Tab content */}
                    <Box key={`tab-${activeTab}-${tabKey}`} className="tab-panel-enter" sx={{ p: 2.5 }}>

                      {/* ── OVERVIEW ── */}
                      {activeTab === 0 && (
                        <Stack spacing={2.5}>
                          {isAdmin && (
                            <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${T.infoDim}`, bgcolor: T.infoDim }}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                                  <AdminPanelSettingsOutlined sx={{ fontSize: 18, color: T.info }} />
                                  <Box>
                                    <Typography sx={{ ...sx.sectionTitle, color: T.info, mb: 0.25 }}>Admin mode</Typography>
                                    <Typography sx={{ color: T.textMuted, fontSize: '12px' }}>
                                      Open admin console for deeper moderation and controls.
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  {div?._id && <Button component={RouterLink} to={`/admin/divisions/${div._id}`} size="small" sx={btnSx.outlined}>Admin console</Button>}
                                  <Button size="small" variant="outlined" onClick={() => setTabAndSyncQuery(1)} sx={btnSx.outlined}>People</Button>
                                  <Button size="small" variant="outlined" onClick={() => setTabAndSyncQuery(2)} sx={btnSx.outlined}>Fleet</Button>
                                </Stack>
                              </Stack>
                            </Box>
                          )}

                          {isLeader && (() => {
                            const inactiveMembers = members.filter((m) => m.inactive && !m.isLeader);
                            if (!inactiveMembers.length) return null;
                            return (
                              <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${T.warnDim}`, bgcolor: T.warnDim }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                                  <WarningAmberOutlined sx={{ fontSize: 16, color: T.warn }} />
                                  <Typography sx={{ ...sx.sectionTitle, color: T.warn }}>Attention needed</Typography>
                                  <Box sx={sx.pill(T.warnDim, T.warn)}>{inactiveMembers.length} inactive</Box>
                                </Stack>
                                <Typography sx={{ color: T.textMuted, fontSize: '12px', mb: 1.5 }}>
                                  These members haven't logged a job recently.
                                </Typography>
                                <Stack spacing={0.75}>
                                  {inactiveMembers.slice(0, 8).map((m) => (
                                    <Stack key={m._id} direction="row" spacing={1.5} alignItems="center"
                                      sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                      <Avatar src={m.avatar || undefined} sx={{ width: 26, height: 26, fontSize: '12px', bgcolor: T.surfaceAlt }}>
                                        {m.name?.[0]}
                                      </Avatar>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '12px', fontWeight: 700, color: T.text }} noWrap>{m.name}</Typography>
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted }}>
                                          {m.lastJobAt ? `Last job ${m.daysSinceLastJob}d ago` : 'No jobs since joining'}
                                        </Typography>
                                      </Box>
                                      <Box sx={sx.pill(T.warnDim, T.warn)}>Inactive</Box>
                                    </Stack>
                                  ))}
                                  {inactiveMembers.length > 8 && (
                                    <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted }}>
                                      +{inactiveMembers.length - 8} more
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            );
                          })()}

                          {/* Investment section */}
                          <Box sx={{ p: 2.5, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: T.bg }}>
                            <SectionHeader label="Member investment" icon={TrendingUpOutlined} />
                            <Typography sx={{ color: T.textMuted, fontSize: '12px', mb: 2 }}>
                              Transfer tokens from your personal wallet into the division wallet.
                            </Typography>
                            {!canInvest && (
                              <Alert severity="info" sx={{ mb: 1.5, bgcolor: T.infoDim, color: T.info, border: `1px solid ${T.infoDim}`, fontFamily: T.mono, fontSize: '11px', borderRadius: 1.5 }}>
                                Only active division members can invest.
                              </Alert>
                            )}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mb: 2 }}>
                              <TextField size="small" type="number" label="Amount (tokens)" value={investAmount}
                                onChange={(e) => setInvestAmount(e.target.value)} sx={{ ...inputSx, width: 180 }} />
                              <TextField size="small" label="Note (optional)" value={investNote}
                                onChange={(e) => setInvestNote(e.target.value)} sx={{ ...inputSx, minWidth: 200, flex: 1 }} />
                              <Button sx={btnSx.primary} onClick={investInDivision}
                                disabled={!canInvest || !(Number(investAmount) > 0)}
                                startIcon={<AddCircleOutlineOutlined sx={{ fontSize: 14 }} />}>
                                Invest
                              </Button>
                            </Stack>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5, p: 1.25, borderRadius: 1, bgcolor: T.surfaceAlt }}>
                              <TrendingUpOutlined sx={{ fontSize: 14, color: T.info }} />
                              <Typography sx={{ fontFamily: T.mono, fontSize: '11px', color: T.textMuted }}>Your total invested:</Typography>
                              <Typography sx={{ fontFamily: T.mono, fontSize: '14px', fontWeight: 800, color: T.info }}>{Math.round(myInvestedTotal).toLocaleString()}</Typography>
                            </Stack>
                            <Box sx={{ overflowX: 'auto' }}>
                              <Table size="small" sx={tableSx}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Note</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {myInvestments.slice(0, 10).map((it) => (
                                    <TableRow key={it._id}>
                                      <TableCell>{new Date(it.createdAt).toLocaleString()}</TableCell>
                                      <TableCell align="right">{Number(it.amount || 0).toLocaleString()}</TableCell>
                                      <TableCell sx={{ color: `${T.textMuted} !important` }}>{it.note || '—'}</TableCell>
                                    </TableRow>
                                  ))}
                                  {!myInvestments.length && (
                                    <TableRow>
                                      <TableCell colSpan={3} sx={{ color: `${T.textMuted} !important`, textAlign: 'center', py: 2 }}>
                                        No investments yet.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Box>

                            {(isLeader || isAdmin) && (
                              <>
                                <Divider sx={{ borderColor: T.border, my: 2 }} />
                                <Typography sx={{ ...sx.sectionTitle, mb: 1.5 }}>All member investments</Typography>
                                <Box sx={{ overflowX: 'auto' }}>
                                  <Table size="small" sx={tableSx}>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Member</TableCell>
                                        <TableCell align="right">Total invested</TableCell>
                                        <TableCell align="right">Entries</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {investmentSummary.slice(0, 10).map((row) => (
                                        <TableRow key={row.riderId}>
                                          <TableCell>{row.riderName || row.riderUsername || row.riderEmployeeId || 'Member'}</TableCell>
                                          <TableCell align="right">{Number(row.totalInvested || 0).toLocaleString()}</TableCell>
                                          <TableCell align="right">{Number(row.investmentCount || 0).toLocaleString()}</TableCell>
                                        </TableRow>
                                      ))}
                                      {!investmentSummary.length && (
                                        <TableRow>
                                          <TableCell colSpan={3} sx={{ color: `${T.textMuted} !important`, textAlign: 'center', py: 2 }}>
                                            No member investments yet.
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </>
                            )}
                          </Box>

                          {isLeader && (
                            <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${T.border}`, bgcolor: T.bg, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Box sx={{ flex: 1, minWidth: 200 }}>
                                <Typography sx={{ ...sx.sectionTitle, mb: 0.5 }}>Division loan manager</Typography>
                                <Typography sx={{ color: T.textMuted, fontSize: '12px' }}>
                                  Create loans and review EMI schedule in leader finance tools.
                                </Typography>
                              </Box>
                              <Button sx={btnSx.primary} onClick={() => { setTabAndSyncQuery(1); setLeaderTabAndSyncQuery(2); }}>
                                Open loan manager
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      )}

                      {/* ── PEOPLE ── */}
                      {activeTab === 1 && (
                        <Stack spacing={2.5}>
                          {isLeader && (
                            <Box sx={{ border: `1px solid ${T.border}`, borderRadius: 1.5, overflow: 'hidden' }}>
                              <Box sx={{ px: 2.5, pt: 2, pb: 0, bgcolor: T.bg }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                  <SecurityOutlined sx={{ fontSize: 14, color: T.textMuted }} />
                                  <Typography sx={sx.sectionTitle}>Leader tools</Typography>
                                </Stack>
                                <Tabs value={leaderToolTab} onChange={(_, v) => setLeaderTabAndSyncQuery(v)}
                                  sx={{ ...tabsSx, borderBottom: 'none' }} variant="scrollable" scrollButtons="auto">
                                  <Tab label="Access control" icon={<SecurityOutlined sx={{ fontSize: 13 }} />} iconPosition="start" />
                                  <Tab
                                    label={`Applications · ${joinRequests.length}`}
                                    icon={
                                      <Badge badgeContent={joinRequests.length} color="warning" max={9}>
                                        <AssignmentOutlined sx={{ fontSize: 13 }} />
                                      </Badge>
                                    }
                                    iconPosition="start"
                                  />
                                  <Tab label="Finance" icon={<MonetizationOnOutlined sx={{ fontSize: 13 }} />} iconPosition="start" />
                                </Tabs>
                              </Box>
                              <Box sx={{ p: 2.5, bgcolor: T.surfaceAlt }}>
                                {leaderToolTab === 0 && (
                                  <Stack spacing={2.5}>
                                    <Box>
                                      <Typography sx={{ ...sx.label, mb: 1.25 }}>Co-leaders — fuel purchase rights</Typography>
                                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                                        <Autocomplete
                                          multiple
                                          options={coLeaderCandidateMembers}
                                          value={coLeaders}
                                          getOptionLabel={(o) => o ? `${o.name} (${o.employeeID || o.username || ''})` : ''}
                                          isOptionEqualToValue={(a, b) => String(a?._id || a?.riderId) === String(b?._id || b?.riderId)}
                                          onChange={(_, v) => setCoLeaders(v || [])}
                                          renderInput={(params) => <TextField {...params} label="Select co-leaders" sx={inputSx} />}
                                          sx={{ flex: 1, minWidth: 260 }}
                                        />
                                        <Button sx={btnSx.outlined} variant="outlined" onClick={saveCoLeaders}>Save</Button>
                                      </Stack>
                                    </Box>
                                    <Divider sx={{ borderColor: T.border }} />
                                    <Box>
                                      <Typography sx={{ ...sx.label, mb: 1.25 }}>Invite a rider</Typography>
                                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                                        <Autocomplete
                                          options={inviteOptions}
                                          value={inviteRider}
                                          loading={inviteLoading}
                                          getOptionLabel={(o) => o ? `${o.name} (${o.employeeID || o.username || ''})` : ''}
                                          isOptionEqualToValue={(a, b) => a?._id === b?._id}
                                          onInputChange={(_, v, reason) => { if (reason === 'input') setInviteQuery(v); }}
                                          onChange={(_, v) => setInviteRider(v)}
                                          renderOption={(props, o) => (
                                            <li {...props}>
                                              <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar src={o.avatar || undefined} sx={{ width: 26, height: 26, bgcolor: T.surfaceAlt }}>{o.name?.[0]}</Avatar>
                                                <Box>
                                                  <Typography sx={{ fontFamily: T.mono, fontSize: '12px', fontWeight: 700 }}>{o.name}</Typography>
                                                  <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted }}>{o.employeeID} · {o.username}</Typography>
                                                </Box>
                                              </Stack>
                                            </li>
                                          )}
                                          renderInput={(params) => <TextField {...params} label="Search rider to invite" sx={inputSx} />}
                                          sx={{ flex: 1, minWidth: 260 }}
                                        />
                                        <Button sx={btnSx.primary} onClick={invite} disabled={!inviteRider?._id}>Send invite</Button>
                                      </Stack>
                                    </Box>
                                  </Stack>
                                )}

                                {leaderToolTab === 1 && (
                                  <Stack spacing={2}>
                                    {leaderQueuesLoading && <LinearProgress sx={{ bgcolor: T.border, '& .MuiLinearProgress-bar': { bgcolor: T.accent } }} />}
                                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                                      <Box sx={sx.pill(joinRequests.length ? T.warnDim : T.surfaceAlt, joinRequests.length ? T.warn : T.textMuted)}>
                                        {joinRequests.length} pending applications
                                      </Box>
                                      <Box sx={sx.pill(sentInvites.filter((i) => i.status === 'pending').length ? T.infoDim : T.surfaceAlt, sentInvites.filter((i) => i.status === 'pending').length ? T.info : T.textMuted)}>
                                        {sentInvites.filter((i) => i.status === 'pending').length} pending invites
                                      </Box>
                                    </Stack>
                                    {joinRequests.length > 0 && (
                                      <Stack spacing={0.75}>
                                        <Typography sx={{ ...sx.label, mb: 0.75 }}>Join applications</Typography>
                                        {joinRequests.slice(0, 8).map((r) => (
                                          <Stack key={r._id} direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}
                                            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: T.bg, border: `1px solid ${T.border}` }}>
                                            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                              <Avatar src={r.rider?.avatar || undefined} sx={{ width: 30, height: 30, bgcolor: T.surfaceAlt }}>
                                                {r.rider?.name?.[0] || '?'}
                                              </Avatar>
                                              <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontFamily: T.mono, fontSize: '12px', fontWeight: 700, color: T.text }} noWrap>
                                                  {r.rider?.name || r.riderId}
                                                </Typography>
                                                <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted }}>
                                                  {r.rider?.employeeID || ''} {r.rider?.username ? `· ${r.rider.username}` : ''}
                                                </Typography>
                                              </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={1}>
                                              <Button size="small" sx={btnSx.success} onClick={() => acceptJoinRequest(r._id)}>Accept</Button>
                                              <Button size="small" variant="outlined" sx={btnSx.danger} onClick={() => rejectJoinRequest(r._id)}>Reject</Button>
                                            </Stack>
                                          </Stack>
                                        ))}
                                      </Stack>
                                    )}
                                    {sentInvites.length > 0 && (
                                      <Stack spacing={0.75}>
                                        <Typography sx={{ ...sx.label, mb: 0.75 }}>Sent invites</Typography>
                                        {sentInvites.slice(0, 8).map((inv) => (
                                          <Stack key={inv._id} direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}
                                            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: T.bg, border: `1px solid ${T.border}` }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <Typography sx={{ fontFamily: T.mono, fontSize: '12px', fontWeight: 700, color: T.text }} noWrap>
                                                {inv.riderId?.name || inv.riderId || 'Rider'}
                                              </Typography>
                                              <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted }}>
                                                {inv.status} · Expires {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}
                                              </Typography>
                                            </Box>
                                            {inv.status === 'pending' && (
                                              <Button size="small" variant="outlined" sx={btnSx.danger} onClick={() => cancelInvite(inv._id)}>Cancel</Button>
                                            )}
                                          </Stack>
                                        ))}
                                      </Stack>
                                    )}
                                    {!joinRequests.length && !sentInvites.length && (
                                      <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <CheckCircleOutlined sx={{ fontSize: 28, color: T.success, mb: 1 }} />
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '12px', color: T.textMuted }}>No pending applications or invites</Typography>
                                      </Box>
                                    )}
                                  </Stack>
                                )}

                                {leaderToolTab === 2 && (
                                  <Stack spacing={2.5}>
                                    <Box>
                                      <Typography sx={{ ...sx.label, mb: 1.25 }}>Pay member from division wallet</Typography>
                                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} flexWrap="wrap" useFlexGap>
                                        <Autocomplete
                                          options={peopleRows}
                                          value={walletForm.rider}
                                          onChange={(_, v) => setWalletForm((p) => ({ ...p, rider: v }))}
                                          getOptionLabel={(o) => o ? `${o.name} (${o.employeeID || ''})` : ''}
                                          isOptionEqualToValue={(a, b) => a?._id === b?._id}
                                          sx={{ minWidth: 220, flex: 1 }}
                                          renderInput={(params) => <TextField {...params} label="Select member" sx={inputSx} />}
                                        />
                                        <TextField label="Amount" type="number" value={walletForm.amount}
                                          onChange={(e) => setWalletForm((p) => ({ ...p, amount: e.target.value }))}
                                          size="small" sx={{ ...inputSx, width: 140 }} />
                                        <TextField label="Reason" value={walletForm.reason}
                                          onChange={(e) => setWalletForm((p) => ({ ...p, reason: e.target.value }))}
                                          size="small" sx={{ ...inputSx, minWidth: 180 }} />
                                        <Button sx={btnSx.primary} onClick={distribute}
                                          disabled={!walletForm.rider || !(Number(walletForm.amount) > 0)}>
                                          Distribute
                                        </Button>
                                      </Stack>
                                    </Box>
                                    <Divider sx={{ borderColor: T.border }} />
                                    <Box>
                                      <Typography sx={{ ...sx.label, mb: 1.25 }}>Division loan</Typography>
                                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mb: 1.5 }}>
                                        <TextField label="Principal amount" type="number" value={divisionLoanPrincipal}
                                          onChange={(e) => setDivisionLoanPrincipal(e.target.value)}
                                          size="small" sx={{ ...inputSx, width: 180 }} />
                                        <TextField select label="Loan tenure" value={divisionLoanTenure}
                                          onChange={(e) => setDivisionLoanTenure(Number(e.target.value))}
                                          size="small" sx={{ ...inputSx, minWidth: 220 }}>
                                          {divisionLoanPlans.map((p) => (
                                            <MenuItem key={p.tenureMonths} value={p.tenureMonths}
                                              sx={{ fontFamily: T.mono, fontSize: '12px' }}>
                                              {p.tenureMonths} months · EMI {p.emiAmount}
                                            </MenuItem>
                                          ))}
                                        </TextField>
                                        <Button sx={btnSx.primary} onClick={createDivisionLoanAction}
                                          disabled={!divisionLoanPlans.length}>
                                          Create loan
                                        </Button>
                                      </Stack>
                                      {!!divisionLoans.length && (
                                        <TextField select label="View loan installments" value={selectedDivisionLoanId}
                                          onChange={(e) => setSelectedDivisionLoanId(e.target.value)}
                                          size="small" sx={{ ...inputSx, minWidth: 320 }}>
                                          {divisionLoans.map((loan) => (
                                            <MenuItem key={loan._id} value={loan._id}
                                              sx={{ fontFamily: T.mono, fontSize: '12px' }}>
                                              {loan.loanNumber || loan._id} · outstanding {Number(loan.outstandingAmount || 0).toLocaleString()}
                                            </MenuItem>
                                          ))}
                                        </TextField>
                                      )}
                                      {!!selectedDivisionLoanInstallments.length && (
                                        <Box sx={{ mt: 1.5, overflowX: 'auto' }}>
                                          <Table size="small" sx={tableSx}>
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Due date</TableCell>
                                                <TableCell align="right">Due</TableCell>
                                                <TableCell align="right">Paid</TableCell>
                                                <TableCell align="right">Carry</TableCell>
                                                <TableCell>Status</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {selectedDivisionLoanInstallments.map((it) => (
                                                <TableRow key={it._id}>
                                                  <TableCell>{it.installmentNo}</TableCell>
                                                  <TableCell>{new Date(it.dueDate).toLocaleDateString()}</TableCell>
                                                  <TableCell align="right">{Number(it.dueAmount || 0).toLocaleString()}</TableCell>
                                                  <TableCell align="right">{Number(it.paidAmount || 0).toLocaleString()}</TableCell>
                                                  <TableCell align="right">{Number(it.carryForwardAmount || 0).toLocaleString()}</TableCell>
                                                  <TableCell>
                                                    <Box sx={sx.pill(
                                                      it.status === 'paid' ? T.successDim : it.status === 'overdue' ? T.dangerDim : T.accentDim,
                                                      it.status === 'paid' ? T.success : it.status === 'overdue' ? T.danger : T.accent
                                                    )}>
                                                      {it.status}
                                                    </Box>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      )}
                                    </Box>
                                  </Stack>
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Members list */}
                          <Box>
                            <SectionHeader label={`Members · ${peopleRows.length}`} icon={PeopleOutlined} />
                            {!peopleRows.length && (
                              <Typography sx={{ color: T.textMuted, fontSize: '12px', fontFamily: T.mono }}>No members listed yet.</Typography>
                            )}
                            <Stack spacing={0.75}>
                              {peopleRows.map((m, i) => {
                                const memberId = String(m._id || m.riderId || '');
                                const canRemove = isLeader && !m.isLeader && memberId && memberId !== uid;
                                const isRemoving = removingMemberId === memberId;
                                return (
                                  <Stack
                                    key={m._id || m.riderId || m.username || m.name}
                                    className="anim-fade-in"
                                    style={{ animationDelay: `${i * 0.03}s` }}
                                    direction="row" spacing={1.5} alignItems="center"
                                    sx={{
                                      p: 1.5, borderRadius: 1.5,
                                      bgcolor: T.surfaceAlt,
                                      border: `1px solid ${m.isLeader ? T.accentDim : T.border}`,
                                      transition: 'border-color 0.2s, background-color 0.2s',
                                      '&:hover': { bgcolor: T.surfaceElevated, borderColor: T.borderStrong },
                                    }}
                                  >
                                    <Avatar src={m.avatar || undefined}
                                      sx={{ width: 32, height: 32, fontSize: '13px', bgcolor: T.bg, border: `1px solid ${T.border}` }}>
                                      {m.name?.[0] || m.username?.[0] || '?'}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '12px', fontWeight: 700, color: T.text }} noWrap>
                                          {m.name || m.username || 'Member'}
                                        </Typography>
                                        {m.isLeader && <Box sx={sx.pill(T.accentDim, T.accent)}>Leader</Box>}
                                      </Stack>
                                      <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted }}>
                                        {m.employeeID || m.username || '—'}
                                      </Typography>
                                    </Box>
                                    {Number.isFinite(Number(m.totalJobs)) && (
                                      <Box sx={sx.pill()}>{Number(m.totalJobs)} jobs</Box>
                                    )}
                                    {canRemove && (
                                      <Button size="small" variant="outlined" sx={btnSx.danger} disabled={isRemoving} onClick={() => removeMember(m)}>
                                        {isRemoving ? 'Removing…' : 'Remove'}
                                      </Button>
                                    )}
                                  </Stack>
                                );
                              })}
                            </Stack>
                          </Box>

                          {!isLeader && (
                            <Alert severity="info" sx={{ bgcolor: T.infoDim, color: T.info, border: `1px solid ${T.infoDim}`, fontFamily: T.mono, fontSize: '11px', borderRadius: 1.5 }}>
                              Member management is only available for division leaders.
                            </Alert>
                          )}
                        </Stack>
                      )}

                      {/* ── FLEET ── */}
                      {activeTab === 2 && (
                        <Stack spacing={2.5}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                              <LocalShippingOutlined sx={{ color: T.accent, fontSize: 18 }} />
                              <Typography sx={{ ...sx.sectionTitle }}>Division fleet</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="outlined" component={RouterLink} to="/fleet" sx={btnSx.outlined}>
                                Open fleet
                              </Button>
                              {isLeader && (
                                <Button size="small" component={RouterLink} to="/trucks/marketplace" sx={btnSx.primary}>
                                  Buy truck
                                </Button>
                              )}
                            </Stack>
                          </Stack>

                          {/* Fleet summary pills */}
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Box sx={sx.pill()}>{fleetSummary.total} trucks total</Box>
                            <Box sx={sx.pill(fleetSummary.blocked ? T.dangerDim : T.successDim, fleetSummary.blocked ? T.danger : T.success)}>
                              <BuildOutlined sx={{ fontSize: 11 }} />
                              {fleetSummary.blocked ? `${fleetSummary.blocked} blocked` : 'All operational'}
                            </Box>
                            {fleetSummary.wearHigh > 0 && (
                              <Box sx={sx.pill(T.warnDim, T.warn)}>{fleetSummary.wearHigh} high wear</Box>
                            )}
                            {fleetSummary.blocked > 0 && (
                              <Box sx={sx.pill(T.warnDim, T.warn)}>
                                {Math.round(fleetSummary.maintenanceCost).toLocaleString()} tokens maintenance due
                              </Box>
                            )}
                            <Box sx={sx.pill()}>{Math.round(fleetSummary.fleetKm).toLocaleString()} km total</Box>
                          </Stack>

                          {/* Fleet grid */}
                          {fleetTrucks.length > 0 ? (
                            <Stack spacing={0.75}>
                              {fleetTrucks.map((t, idx) => (
                                <TruckCard key={t._id || t.divisionTruckId || idx} truck={t} />
                              ))}
                            </Stack>
                          ) : (
                            <Box sx={{ p: 3, borderRadius: 1.5, border: `1px dashed ${T.border}`, bgcolor: T.bg, textAlign: 'center' }}>
                              <LocalShippingOutlined sx={{ fontSize: 32, color: T.textDim, mb: 1 }} />
                              <Typography sx={{ fontFamily: T.mono, fontSize: '12px', color: T.textMuted }}>No trucks in fleet yet.</Typography>
                              {isLeader && (
                                <Button component={RouterLink} to="/trucks/marketplace" sx={{ ...btnSx.primary, mt: 2 }}>
                                  Buy first truck
                                </Button>
                              )}
                            </Box>
                          )}

                          {fleetSummary.blocked > 0 && isLeader && (
                            <Alert severity="warning"
                              sx={{ bgcolor: T.warnDim, color: T.warn, border: `1px solid ${T.warn}44`, fontFamily: T.mono, fontSize: '11px', borderRadius: 1.5 }}>
                              {fleetSummary.blocked} truck{fleetSummary.blocked === 1 ? '' : 's'} need maintenance — fleet deliveries won't attach until back online. Pay in Fleet management.
                            </Alert>
                          )}
                        </Stack>
                      )}

                      {/* ── LEADERBOARD ── */}
                      {activeTab === 3 && (
                        <Box>
                          <SectionHeader label="Division leaderboard" icon={LeaderboardOutlined} />
                          <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={tableSx}>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Rider</TableCell>
                                  <TableCell>Latest route</TableCell>
                                  {['jobs', 'distance', 'revenue', 'fuelBurned', 'attendance', 'lifetimeEventsAttended'].map((key) => (
                                    <TableCell key={key} align="right" sortDirection={lbSortKey === key ? lbSortDir : false}>
                                      <TableSortLabel
                                        active={lbSortKey === key}
                                        direction={lbSortKey === key ? lbSortDir : 'desc'}
                                        onClick={() => toggleLbSort(key)}>
                                        {{ jobs: 'Jobs', distance: 'Dist', revenue: 'Revenue', fuelBurned: 'Fuel', attendance: 'Attend.', lifetimeEventsAttended: 'Events' }[key]}
                                      </TableSortLabel>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sortedLb.map((r, i) => (
                                  <TableRow key={r.riderId}
                                    className="anim-fade-in"
                                    style={{ animationDelay: `${i * 0.02}s` }}
                                    sx={{ '&:hover': { bgcolor: `${T.surfaceAlt} !important` } }}>
                                    <TableCell>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: i < 3 ? T.premium : T.textDim, fontWeight: i < 3 ? 800 : 400, width: 18 }}>
                                          {i + 1}
                                        </Typography>
                                        <Avatar sx={{ width: 22, height: 22, fontSize: '10px', bgcolor: T.surfaceAlt, border: `1px solid ${T.border}` }}>
                                          {(r.name || r.username || '?')[0]}
                                        </Avatar>
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '12px', fontWeight: 700, color: T.text }}>
                                          {r.name || r.username || 'Unknown'}
                                          {r.inDivision === false && <span style={{ color: T.textMuted, fontWeight: 400 }}> (left)</span>}
                                        </Typography>
                                      </Stack>
                                    </TableCell>
                                    <TableCell sx={{ color: `${T.textMuted} !important`, maxWidth: 180 }}>
                                      {(r.startCity || r.destinationCity) ? (
                                        <Typography sx={{ fontFamily: T.mono, fontSize: '11px', color: T.textMuted }} noWrap>
                                          {r.startCity || '—'} → {r.destinationCity || '—'}
                                        </Typography>
                                      ) : '—'}
                                    </TableCell>
                                    <TableCell align="right">{r.jobs}</TableCell>
                                    <TableCell align="right">{Math.round(r.distance || 0).toLocaleString()}</TableCell>
                                    <TableCell align="right">{Math.round(r.revenue || 0).toLocaleString()}</TableCell>
                                    <TableCell align="right">{Math.round(r.fuelBurned || 0).toLocaleString()}</TableCell>
                                    <TableCell align="right">{r.attendance ?? 0}</TableCell>
                                    <TableCell align="right">{r.lifetimeEventsAttended ?? 0}</TableCell>
                                  </TableRow>
                                ))}
                                {!lb.length && (
                                  <TableRow>
                                    <TableCell colSpan={8} align="center"
                                      sx={{ color: `${T.textMuted} !important`, py: 5, fontFamily: T.mono, fontSize: '12px' }}>
                                      No jobs logged yet.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Box>
                      )}

                    </Box>
                  </Box>

                </Stack>
              </Grid>

              {/* ── Sidebar ── */}
              <Grid item xs={12} lg={3.5}>
                <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
                  <Stack spacing={2}>

                    {/* Fleet sidebar card */}
                    <Box className="anim-fade-up stagger-3" sx={sx.card}>
                      <Box sx={{ p: 2 }}>
                        <SectionHeader
                          label="Fleet"
                          icon={LocalShippingOutlined}
                          right={
                            <Stack direction="row" spacing={1} alignItems="center">
                              {fleetSummary.blocked > 0 && (
                                <Box sx={sx.pill(T.dangerDim, T.danger)}>
                                  {fleetSummary.blocked} blocked
                                </Box>
                              )}
                            </Stack>
                          }
                        />

                        {/* Quick stats */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Box sx={{ flex: 1, p: 1.25, borderRadius: 1, bgcolor: T.bg, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: T.mono, fontWeight: 800, fontSize: '18px', color: T.text }}>{fleetSummary.total}</Typography>
                            <Typography sx={{ ...sx.label, fontSize: '9px' }}>Total</Typography>
                          </Box>
                          <Box sx={{ flex: 1, p: 1.25, borderRadius: 1, bgcolor: fleetSummary.blocked ? T.dangerDim : T.successDim, border: `1px solid ${fleetSummary.blocked ? T.danger + '33' : T.success + '33'}`, textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: T.mono, fontWeight: 800, fontSize: '18px', color: fleetSummary.blocked ? T.danger : T.success }}>{fleetSummary.blocked}</Typography>
                            <Typography sx={{ ...sx.label, fontSize: '9px', color: fleetSummary.blocked ? T.danger : T.success }}>Blocked</Typography>
                          </Box>
                          <Box sx={{ flex: 1, p: 1.25, borderRadius: 1, bgcolor: fleetSummary.wearHigh ? T.warnDim : T.bg, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: T.mono, fontWeight: 800, fontSize: '18px', color: fleetSummary.wearHigh ? T.warn : T.textMuted }}>{fleetSummary.wearHigh}</Typography>
                            <Typography sx={{ ...sx.label, fontSize: '9px' }}>High wear</Typography>
                          </Box>
                        </Stack>

                        {/* Truck list */}
                        <Stack spacing={0.75}>
                          {fleetTrucks.slice(0, 8).map((t) => (
                            <TruckCard key={t._id || t.divisionTruckId} truck={t} />
                          ))}
                          {!fleetTrucks.length && (
                            <Typography sx={{ fontFamily: T.mono, fontSize: '11px', color: T.textMuted, textAlign: 'center', py: 2 }}>
                              No trucks in fleet yet.
                            </Typography>
                          )}
                          {fleetTrucks.length > 8 && (
                            <Typography sx={{ fontFamily: T.mono, fontSize: '10px', color: T.textMuted, textAlign: 'center', py: 0.5 }}>
                              +{fleetTrucks.length - 8} more trucks
                            </Typography>
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button size="small" variant="outlined" onClick={() => setTabAndSyncQuery(2)} sx={{ ...btnSx.outlined, flex: 1 }}>
                            Fleet tab
                          </Button>
                          {isLeader && (
                            <Button size="small" component={RouterLink} to="/trucks/marketplace" sx={{ ...btnSx.primary, flex: 1 }}>
                              Buy truck
                            </Button>
                          )}
                        </Stack>

                        {isAdmin && div?._id && (
                          <Button size="small" component={RouterLink} to={`/admin/divisions/${div._id}`}
                            sx={{ ...btnSx.outlined, mt: 1, width: '100%' }} variant="outlined"
                            startIcon={<AdminPanelSettingsOutlined sx={{ fontSize: 13 }} />}>
                            Admin division tools
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* Quick navigation card */}
                    <Box className="anim-fade-up stagger-4" sx={sx.card}>
                      <Box sx={{ p: 2 }}>
                        <Typography sx={{ ...sx.sectionTitle, mb: 1.5 }}>Quick navigate</Typography>
                        <Stack spacing={0.75}>
                          {[
                            { label: 'Overview', tab: 0, icon: DashboardOutlined },
                            { label: 'People', tab: 1, icon: GroupOutlined },
                            { label: 'Fleet', tab: 2, icon: DirectionsBusOutlined },
                            { label: 'Leaderboard', tab: 3, icon: LeaderboardOutlined },
                          ].map(({ label, tab, icon: Icon }) => (
                            <Button
                              key={tab}
                              onClick={() => setTabAndSyncQuery(tab)}
                              startIcon={<Icon sx={{ fontSize: 14 }} />}
                              sx={{
                                justifyContent: 'flex-start',
                                fontFamily: T.mono,
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: activeTab === tab ? T.accent : T.textMuted,
                                bgcolor: activeTab === tab ? T.accentDim : 'transparent',
                                borderRadius: '8px',
                                px: 1.5,
                                py: 0.75,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: T.surfaceAlt, color: T.text },
                              }}
                            >
                              {label}
                              {tab === 1 && joinRequests.length > 0 && (
                                <Box sx={{ ...sx.pill(T.warnDim, T.warn), ml: 'auto', fontSize: '9px' }}>{joinRequests.length}</Box>
                              )}
                              {tab === 2 && fleetSummary.blocked > 0 && (
                                <Box sx={{ ...sx.pill(T.dangerDim, T.danger), ml: 'auto', fontSize: '9px' }}>{fleetSummary.blocked}</Box>
                              )}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    </Box>

                  </Stack>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* ── Tax dialog ── */}
          <Dialog open={taxDialogOpen} onClose={() => setTaxDialogOpen(false)} maxWidth="xs" fullWidth
            PaperProps={{ sx: { bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 2, backdropFilter: 'blur(12px)' } }}>
            <DialogTitle sx={{ fontFamily: T.mono, fontWeight: 800, fontSize: '13px', color: T.text, letterSpacing: '0.08em', textTransform: 'uppercase', pb: 1, borderBottom: `1px solid ${T.border}` }}>
              Division tax rate
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography sx={{ color: T.textMuted, fontSize: '12px', mb: 2.5, fontFamily: T.mono, lineHeight: 1.6 }}>
                Job revenue tax % credited to the division wallet. Must be within server maximum.
              </Typography>
              <TextField autoFocus fullWidth label="Tax %" type="number" value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.5 }} sx={inputSx} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button onClick={() => setTaxDialogOpen(false)} sx={btnSx.outlined} variant="outlined">Cancel</Button>
              <Button sx={btnSx.primary} onClick={saveTax} disabled={!div?._id}>Save</Button>
            </DialogActions>
          </Dialog>

        </Container>
      </Box>
    </MagicPageShell>
  );
}