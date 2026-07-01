/**
 * Single source for admin sidebar, dashboard cards, command palette, and breadcrumbs.
 * Keep `roles` in sync with `PrivateRoute` `allowedRoles` in App.js.
 */

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import Event from '@mui/icons-material/Event';
import StarsOutlined from '@mui/icons-material/StarsOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import AnalyticsOutlined from '@mui/icons-material/AnalyticsOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import GarageOutlined from '@mui/icons-material/GarageOutlined';
import People from '@mui/icons-material/People';
import PersonAdd from '@mui/icons-material/PersonAdd';
import HowToReg from '@mui/icons-material/HowToReg';
import TimelineOutlined from '@mui/icons-material/TimelineOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import Group from '@mui/icons-material/Group';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import LeaderboardOutlined from '@mui/icons-material/LeaderboardOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import ConfirmationNumberOutlined from '@mui/icons-material/ConfirmationNumberOutlined';
import GavelOutlined from '@mui/icons-material/GavelOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import RequestQuoteOutlined from '@mui/icons-material/RequestQuoteOutlined';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import FolderSharedOutlined from '@mui/icons-material/FolderSharedOutlined';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import SensorsOutlined from '@mui/icons-material/SensorsOutlined';

/** Staff roles that can open /admin (matches App.js admin layout gate). */
export const STAFF_ROLES = ['admin', 'eventteam', 'hrteam', 'financeteam', 'communityManager'];

/** Hub definitions — order controls sidebar and dashboard. */
export const ADMIN_HUBS = [
  {
    id: 'events-ops',
    label: 'Events & operations',
    description: 'Events, jobs, analytics, and truck catalogue.',
    Icon: Event,
    color: 'primary',
  },
  {
    id: 'people-hr',
    label: 'People & HR',
    description: 'Users, attendance, achievements, and progression.',
    Icon: People,
    color: 'secondary',
  },
  {
    id: 'economy',
    label: 'Economy',
    description: 'Cargo rates, fuel, coupons, divisions, and economy sinks.',
    Icon: AttachMoneyOutlined,
    color: 'success',
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Bank, contracts, loans, and EMI tracking.',
    Icon: PaymentsOutlined,
    color: 'warning',
  },
  {
    id: 'operations',
    label: 'Operations',
    description: 'Maintenance tools, queues, and system diagnostics.',
    Icon: BuildOutlined,
    color: 'info',
  },
  {
    id: 'rto',
    label: 'RTO & fines',
    description: 'Challans, offences, and RTO settings.',
    Icon: GavelOutlined,
    color: 'error',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    description: 'Driving challenge configuration.',
    Icon: EmojiEventsOutlined,
    color: 'secondary',
  },
];

export const ADMIN_HUB_MAP = Object.fromEntries(ADMIN_HUBS.map((h) => [h.id, h]));

/** Primary hub shown first on role home. */
export const ROLE_PRIMARY_HUB = {
  admin: null,
  eventteam: 'events-ops',
  hrteam: 'people-hr',
  financeteam: 'finance',
  communityManager: 'operations',
};

/**
 * Canonical admin nav items. Sidebar, dashboard cards, palette, and breadcrumbs derive from here.
 * @typedef {object} AdminNavItem
 * @property {string} id
 * @property {string} to
 * @property {string} label
 * @property {string} [title]
 * @property {string} [description]
 * @property {import('@mui/icons-material').SvgIconComponent} Icon
 * @property {string[]|null} roles
 * @property {string|null} hub
 * @property {string[]} [keywords]
 * @property {string} [color]
 * @property {boolean} [matchExact]
 * @property {boolean} [dashboard] — false to hide from hub/dashboard cards
 */
export const ADMIN_NAV_ITEMS = [
  {
    id: 'admin-home',
    to: '/admin',
    label: 'Admin home',
    title: 'Admin home',
    description: 'Role home with hubs, recents, and quick search.',
    Icon: AdminPanelSettings,
    roles: STAFF_ROLES,
    hub: null,
    keywords: ['home', 'dashboard', 'staff'],
    color: 'primary',
    matchExact: true,
    dashboard: false,
  },
  // —— Events & operations ——
  {
    id: 'events',
    to: '/admin/events',
    label: 'Event management',
    title: 'Event management',
    description: 'Events, slots, bookings and special events.',
    Icon: Event,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['calendar', 'bookings', 'slots'],
    color: 'primary',
  },
  {
    id: 'special-events',
    to: '/admin/special-events',
    label: 'Special events',
    title: 'Special events',
    description: 'Route-based slot requests, per-route capacity, and allocation inbox.',
    Icon: StarsOutlined,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['routes', 'allocation', 'slots'],
    color: 'secondary',
  },
  {
    id: 'external-attendance',
    to: '/admin/external-attendance',
    label: 'External attendance',
    title: 'External attendance',
    description: 'TruckersMP external events and slot attendance.',
    Icon: PublicOutlined,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['truckersmp', 'tmp', 'external'],
    color: 'info',
  },
  {
    id: 'convoy-reminders',
    to: '/admin/convoy-reminders',
    label: 'Convoy reminders',
    title: 'Convoy reminders',
    description: 'Discord reminders for external convoys and hosted calendar events.',
    Icon: CampaignOutlined,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['discord', 'reminder', 'convoy'],
    color: 'warning',
  },
  {
    id: 'jobs',
    to: '/admin/jobs',
    label: 'Job management',
    title: 'Job management',
    description: 'Browse and manage jobs from TruckersHub.',
    Icon: DirectionsCar,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['truckershub', 'deliveries'],
    color: 'warning',
  },
  {
    id: 'analytics',
    to: '/admin/analytics',
    label: 'Analytics',
    title: 'Analytics',
    description: 'Event, attendance, and engagement analytics.',
    Icon: AnalyticsOutlined,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['stats', 'reports', 'metrics'],
    color: 'info',
  },
  {
    id: 'audit-logs',
    to: '/admin/audit-logs',
    label: 'Audit logs',
    title: 'Audit logs',
    description: 'Track staff/API changes with actor, endpoint, status, and latency.',
    Icon: HistoryOutlined,
    roles: STAFF_ROLES,
    hub: 'events-ops',
    keywords: ['api', 'changes', 'history'],
    color: 'info',
  },
  {
    id: 'trucks',
    to: '/admin/trucks',
    label: 'Truck catalogue',
    title: 'Truck catalogue',
    description: 'Create, edit, and delete marketplace trucks.',
    Icon: GarageOutlined,
    roles: ['admin', 'eventteam'],
    hub: 'events-ops',
    keywords: ['marketplace', 'vehicles'],
    color: 'secondary',
  },
  // —— People & HR ——
  {
    id: 'users',
    to: '/admin/users',
    label: 'User management',
    title: 'User management',
    description: 'Accounts, roles, and access.',
    Icon: People,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['accounts', 'roles', 'members'],
    color: 'primary',
  },
  {
    id: 'create-user',
    to: '/admin/create-user',
    label: 'Create user',
    title: 'Create user',
    description: 'Onboard a new account.',
    Icon: PersonAdd,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['onboard', 'register', 'new'],
    color: 'secondary',
  },
  {
    id: 'user-approvals',
    to: '/admin/user-approvals',
    label: 'User approvals',
    title: 'User approvals',
    description: 'Approve pending registrations.',
    Icon: HowToReg,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['pending', 'registration'],
    color: 'primary',
  },
  {
    id: 'attendance',
    to: '/admin/attendance',
    label: 'Attendance management',
    title: 'Attendance management',
    description: 'HR attendance, streak events, and reports.',
    Icon: TimelineOutlined,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['streak', 'hr', 'rewards'],
    color: 'success',
  },
  {
    id: 'vtc-monthly-stats',
    to: '/admin/vtc-monthly-stats',
    label: 'VTC monthly stats',
    title: 'VTC monthly stats',
    description: 'TruckersHub monthly VTC performance with cached fallback.',
    Icon: BarChartOutlined,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['truckershub', 'performance'],
    color: 'info',
  },
  {
    id: 'powerups',
    to: '/admin/powerups',
    label: 'Streak reward settings',
    title: 'Streak reward settings',
    description: 'Configure streak milestone rewards, random weights, expiry, and manual grants.',
    Icon: AutoAwesomeOutlined,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['powerups', 'streak', 'rewards'],
    color: 'secondary',
  },
  {
    id: 'riders',
    to: '/admin/riders',
    label: 'Riders',
    title: 'Riders',
    description: 'Rider profiles, IDs, and wallet links.',
    Icon: Group,
    roles: ['admin', 'eventteam', 'hrteam'],
    hub: 'people-hr',
    keywords: ['profiles', 'drivers'],
    color: 'info',
  },
  {
    id: 'achievements',
    to: '/admin/achievements',
    label: 'Achievements',
    title: 'Achievements',
    description: 'Issue and manage rider achievements.',
    Icon: MilitaryTech,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['badges', 'awards'],
    color: 'warning',
  },
  {
    id: 'driver-progression',
    to: '/admin/driver-progression',
    label: 'Driver progression',
    title: 'Driver progression',
    description: 'Driver scores, XP, distance ranks, and certificates.',
    Icon: SpeedOutlined,
    roles: ['admin', 'hrteam'],
    hub: 'people-hr',
    keywords: ['xp', 'ranks', 'certificates'],
    color: 'primary',
  },
  // —— Economy ——
  {
    id: 'economy-settings',
    to: '/admin/economy',
    label: 'Economy settings',
    title: 'Economy settings',
    description: 'Tolls, fleet insurance, operating levy, and driver pass types.',
    Icon: TuneOutlined,
    roles: ['admin'],
    hub: 'economy',
    keywords: ['tolls', 'insurance', 'levy', 'driver pass', 'fleet insurance', 'sinks'],
    color: 'primary',
  },
  {
    id: 'cargo-rates',
    to: '/admin/cargo-rates',
    label: 'Cargo market rates',
    title: 'Cargo market rates',
    description: 'Configure revenue normalization and division policy caps.',
    Icon: LocalOfferOutlined,
    roles: ['admin'],
    hub: 'economy',
    keywords: ['cargo', 'rates', 'revenue', 'normalization'],
    color: 'secondary',
  },
  {
    id: 'fuel-market',
    to: '/admin/fuel-market',
    label: 'Division fuel pricing',
    title: 'Division fuel pricing',
    description: 'Global standard and premium token prices, coverage, and delivery grace.',
    Icon: LocalGasStation,
    roles: ['admin'],
    hub: 'economy',
    keywords: ['fuel', 'pricing', 'premium', 'standard'],
    color: 'info',
  },
  {
    id: 'coupons',
    to: '/admin/coupons',
    label: 'Marketplace coupons',
    title: 'Marketplace coupons',
    description: 'Create and manage discount codes for truck marketplace purchases.',
    Icon: ConfirmationNumberOutlined,
    roles: ['admin'],
    hub: 'economy',
    keywords: ['discount', 'codes', 'promo'],
    color: 'success',
  },
  {
    id: 'divisions',
    to: '/admin/divisions',
    label: 'Divisions',
    title: 'Divisions',
    description: 'Create divisions, assign leaders, and oversee members.',
    Icon: GroupsOutlined,
    roles: ['admin', 'communityManager'],
    hub: 'economy',
    keywords: ['leaders', 'members', 'wallets'],
    color: 'primary',
  },
  {
    id: 'division-leaderboard',
    to: '/division-leaderboard',
    label: 'Division leaderboard',
    title: 'Division leaderboard',
    description: 'See how every division ranks by revenue, jobs, and wallets.',
    Icon: LeaderboardOutlined,
    roles: STAFF_ROLES,
    hub: 'economy',
    keywords: ['rankings', 'revenue', 'leaderboard'],
    color: 'warning',
  },
  // —— Finance ——
  {
    id: 'bank',
    to: '/admin/bank',
    label: 'Bank',
    title: 'Bank',
    description: 'Central bank balance and transactions.',
    Icon: AttachMoneyOutlined,
    roles: ['admin', 'financeteam'],
    hub: 'finance',
    keywords: ['treasury', 'ledger', 'balance'],
    color: 'success',
  },
  {
    id: 'contracts',
    to: '/admin/contracts',
    label: 'Admin contracts',
    title: 'Admin contracts',
    description: 'Contract templates and admin tools.',
    Icon: AssignmentOutlined,
    roles: ['admin', 'eventteam', 'financeteam'],
    hub: 'finance',
    keywords: ['templates', 'marketplace'],
    color: 'secondary',
  },
  {
    id: 'loans',
    to: '/admin/loans',
    label: 'Loan management',
    title: 'Loan management',
    description: 'Loans, approvals, and deductions.',
    Icon: RequestQuoteOutlined,
    roles: ['admin', 'financeteam'],
    hub: 'finance',
    keywords: ['emi', 'credit', 'borrow'],
    color: 'warning',
  },
  {
    id: 'emis',
    to: '/admin/emis',
    label: 'EMI tracking',
    title: 'EMI tracking',
    description: 'Installments and repayment status.',
    Icon: PaymentsOutlined,
    roles: ['admin', 'financeteam'],
    hub: 'finance',
    keywords: ['installments', 'repayment'],
    color: 'info',
  },
  // —— Operations ——
  {
    id: 'operations',
    to: '/admin/operations',
    label: 'Maintenance tools',
    title: 'Maintenance tools',
    description: 'System overview, job workflow debugger, queue inspector, and fleet odometer backfill.',
    Icon: BuildOutlined,
    roles: ['admin', 'communityManager'],
    hub: 'operations',
    keywords: ['debugger', 'queue', 'backfill', 'system'],
    color: 'warning',
  },
  // —— RTO ——
  {
    id: 'rto-challans',
    to: '/admin/rto/challans',
    label: 'RTO challans',
    title: 'RTO challans',
    description: 'All issued fines, appeals, CSV export, and admin waive/cancel.',
    Icon: ReceiptLongOutlined,
    roles: ['admin', 'eventteam', 'financeteam', 'rto'],
    hub: 'rto',
    keywords: ['fines', 'challans', 'appeals'],
    color: 'warning',
    matchExact: true,
  },
  {
    id: 'rto-offences',
    to: '/admin/rto/offences',
    label: 'RTO offences',
    title: 'RTO offences',
    description: 'Create and maintain offence codes and default fine amounts.',
    Icon: GavelOutlined,
    roles: ['admin', 'eventteam', 'rto'],
    hub: 'rto',
    keywords: ['offences', 'codes', 'fines'],
    color: 'error',
    matchExact: true,
  },
  {
    id: 'rto-settings',
    to: '/admin/rto/settings',
    label: 'RTO settings',
    title: 'RTO settings',
    description: 'Cooldowns, daily caps, expiry, and outstanding banner thresholds.',
    Icon: SettingsOutlined,
    roles: ['admin', 'eventteam', 'rto'],
    hub: 'rto',
    keywords: ['cooldown', 'caps', 'config'],
    color: 'secondary',
    matchExact: true,
  },
  // —— Challenges ——
  {
    id: 'challenges',
    to: '/admin/challenges',
    label: 'Challenge management',
    title: 'Challenge management',
    description: 'Create and configure driving challenges.',
    Icon: EmojiEventsOutlined,
    roles: ['admin', 'eventteam', 'hrteam', 'financeteam'],
    hub: 'challenges',
    keywords: ['driving', 'competition'],
    color: 'secondary',
  },
];

/** Sidebar: personal shortcuts while using the admin shell. */
export const MY_AREA_SECTIONS = [
  {
    id: 'account',
    label: 'Account',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: DashboardOutlined, roles: null },
    ],
  },
  {
    id: 'community',
    label: 'Events & Attendence',
    items: [
      { to: '/calendar', label: 'Event calendar', Icon: CalendarMonthOutlined, roles: null },
      { to: '/attendance', label: 'Attendance leaderboard', Icon: EventAvailableOutlined, roles: null },
      { to: '/attendance/me', label: 'Attendance & rewards', Icon: AutoAwesomeOutlined, roles: null },
    ],
  },
  {
    id: 'divisions-my',
    label: 'Divisions',
    items: [
      { to: '/division', label: 'My division', Icon: GroupsOutlined, roles: null },
      { to: '/fleet', label: 'Fleet', Icon: GarageOutlined, roles: null },
      { to: '/division/invites', label: 'Invitations', Icon: HowToReg, roles: null },
      { to: '/division-leaderboard', label: 'Division leaderboard', Icon: LeaderboardOutlined, roles: null },
    ],
  },
  {
    id: 'driving',
    label: 'Challenges & jobs',
    items: [
      { to: '/challenges', label: 'Challenges', Icon: AssignmentTurnedInOutlined, roles: null },
      { to: '/contracts/me', label: 'My contracts', Icon: FolderSharedOutlined, roles: null, matchExact: true },
      { to: '/jobs', label: 'VTC jobs', Icon: LocalShippingOutlined, roles: null },
      { to: '/telemetry', label: 'Live Rider status', Icon: SensorsOutlined, roles: null },
    ],
  },
  {
    id: 'economy-my',
    label: 'Economy',
    items: [
      { to: '/wallet', label: 'Wallet', Icon: AccountBalanceWalletOutlined, roles: null },
      { to: '/rto/my-challans', label: 'RTO fines', Icon: GavelOutlined, roles: null },
      { to: '/rto/issue', label: 'Issue challan', Icon: GavelOutlined, roles: ['rto', 'admin'] },
      { to: '/trucks/marketplace', label: 'Truck marketplace', Icon: StorefrontOutlined, roles: null, matchExact: true },
      { to: '/contracts', label: 'Contract marketplace', Icon: AssignmentOutlined, roles: null, matchExact: true },
      { to: '/loans', label: 'Loans', Icon: RequestQuoteOutlined, roles: null },
    ],
  },
];

function toSidebarItem(item) {
  return {
    to: item.to,
    label: item.label,
    Icon: item.Icon,
    roles: item.roles,
    matchExact: item.matchExact,
    hub: item.hub,
    id: item.id,
    keywords: item.keywords,
  };
}

function hubHasVisibleItems(hubId, userRole) {
  return ADMIN_NAV_ITEMS.some(
    (item) => item.hub === hubId && item.dashboard !== false && userCanSeeNavItem(userRole, item.roles),
  );
}

/** Build admin sidebar sections for a role (hub-grouped). */
export function buildAdminSections(userRole) {
  const overviewItems = ADMIN_NAV_ITEMS.filter(
    (item) => item.hub === null && userCanSeeNavItem(userRole, item.roles),
  ).map(toSidebarItem);

  const sections = [
    {
      id: 'admin-overview',
      label: 'Admin overview',
      hub: null,
      items: overviewItems,
    },
  ];

  ADMIN_HUBS.forEach((hub) => {
    const items = ADMIN_NAV_ITEMS.filter(
      (item) =>
        item.hub === hub.id &&
        item.dashboard !== false &&
        userCanSeeNavItem(userRole, item.roles),
    ).map(toSidebarItem);

    if (!items.length && !hubHasVisibleItems(hub.id, userRole)) return;

    sections.push({
      id: hub.id,
      label: hub.label,
      hub: hub.id,
      hubRoute: `/admin/hub/${hub.id}`,
      items,
    });
  });

  return sections;
}

/** @deprecated Use buildAdminSections(role) — kept for backward compatibility. */
export const ADMIN_SECTIONS = buildAdminSections('admin');

export const ADMIN_DASHBOARD_GROUP_ORDER = ADMIN_HUBS.map((h) => h.label);

export const ADMIN_DASHBOARD_CARDS = ADMIN_NAV_ITEMS.filter((item) => item.dashboard !== false && item.hub)
  .map((item) => ({
    group: ADMIN_HUB_MAP[item.hub]?.label || item.hub,
    hub: item.hub,
    title: item.title || item.label,
    description: item.description,
    to: item.to,
    icon: item.Icon,
    color: item.color || 'primary',
    roles: item.roles,
    keywords: item.keywords,
    id: item.id,
  }));

export function userCanSeeNavItem(userRole, roles) {
  if (!roles || !roles.length) return Boolean(userRole);
  return Boolean(userRole && roles.includes(userRole));
}

export function isNavPathActive(pathname, item) {
  if (item.matchExact) return pathname === item.to;
  if (pathname === item.to) return true;
  if (item.to === '/admin') return false;
  return pathname.startsWith(`${item.to}/`);
}

export function getNavItemByPath(pathname) {
  const exact = ADMIN_NAV_ITEMS.find((item) => isNavPathActive(pathname, item));
  if (exact) return exact;

  const hubMatch = pathname.match(/^\/admin\/hub\/([^/]+)/);
  if (hubMatch) {
    const hub = ADMIN_HUB_MAP[hubMatch[1]];
    if (hub) {
      return {
        id: `hub-${hub.id}`,
        to: `/admin/hub/${hub.id}`,
        label: hub.label,
        title: hub.label,
        description: hub.description,
        Icon: hub.Icon,
        hub: hub.id,
        roles: STAFF_ROLES,
      };
    }
  }

  return null;
}

export function getHubRoute(hubId) {
  return `/admin/hub/${hubId}`;
}

export function getVisibleHubs(userRole) {
  return ADMIN_HUBS.filter((hub) => hubHasVisibleItems(hub.id, userRole));
}

export function getHubCards(hubId, userRole) {
  return ADMIN_DASHBOARD_CARDS.filter(
    (card) => card.hub === hubId && userCanSeeNavItem(userRole, card.roles),
  );
}

export function getRoleQuickActions(userRole, limit = 5) {
  const primaryHub = ROLE_PRIMARY_HUB[userRole];
  const pool = primaryHub
    ? getHubCards(primaryHub, userRole)
    : ADMIN_DASHBOARD_CARDS.filter((c) => userCanSeeNavItem(userRole, c.roles));
  return pool.slice(0, limit);
}

export function formatStaffRole(role) {
  if (!role) return '';
  const map = {
    admin: 'Admin',
    eventteam: 'Event team',
    hrteam: 'HR team',
    financeteam: 'Finance team',
    communityManager: 'Community manager',
    rto: 'RTO officer',
  };
  return map[role] || role;
}

/** Fuzzy score for command palette (higher = better match). */
export function scoreNavSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const tokens = q.split(/\s+/).filter(Boolean);
  const haystack = [
    item.label,
    item.title,
    item.description,
    ...(item.keywords || []),
    item.hub ? ADMIN_HUB_MAP[item.hub]?.label : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  tokens.forEach((token) => {
    if (haystack.includes(token)) score += 10;
    if (item.label?.toLowerCase().startsWith(token)) score += 8;
    if (item.to?.toLowerCase().includes(token)) score += 4;
  });

  return score;
}

export function searchAdminNav(query, userRole, { limit = 12 } = {}) {
  const q = query.trim();
  if (!q) return [];

  return ADMIN_NAV_ITEMS.filter((item) => userCanSeeNavItem(userRole, item.roles) && item.dashboard !== false)
    .map((item) => ({ item, score: scoreNavSearch(item, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getBreadcrumbTrail(pathname) {
  const trail = [{ label: 'Admin', to: '/admin' }];

  const hubMatch = pathname.match(/^\/admin\/hub\/([^/]+)/);
  if (hubMatch) {
    const hub = ADMIN_HUB_MAP[hubMatch[1]];
    if (hub) {
      trail.push({ label: hub.label, to: getHubRoute(hub.id) });
    }
    return trail;
  }

  const navItem = getNavItemByPath(pathname);
  if (!navItem) return trail;

  if (navItem.hub && ADMIN_HUB_MAP[navItem.hub]) {
    const hub = ADMIN_HUB_MAP[navItem.hub];
    trail.push({ label: hub.label, to: getHubRoute(hub.id) });
  }

  if (pathname !== '/admin') {
    trail.push({ label: navItem.label || navItem.title, to: navItem.to });
  }

  return trail;
}

/** All searchable nav entries for palette (admin items + my area). */
export function getAllSearchableItems(userRole) {
  const adminItems = ADMIN_NAV_ITEMS.filter(
    (item) => userCanSeeNavItem(userRole, item.roles) && item.dashboard !== false,
  );
  const myItems = MY_AREA_SECTIONS.flatMap((s) => s.items || []).filter((item) =>
    userCanSeeNavItem(userRole, item.roles),
  );
  return [...adminItems, ...myItems];
}
