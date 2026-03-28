/**
 * Single source for admin sidebar + admin dashboard cards.
 * Keep `roles` in sync with `PrivateRoute` `allowedRoles` in App.js.
 */

import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import LockResetOutlined from '@mui/icons-material/LockResetOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import GarageOutlined from '@mui/icons-material/GarageOutlined';
import WifiTethering from '@mui/icons-material/WifiTethering';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import FolderSharedOutlined from '@mui/icons-material/FolderSharedOutlined';
import RequestQuoteOutlined from '@mui/icons-material/RequestQuoteOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import LeaderboardOutlined from '@mui/icons-material/LeaderboardOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';

import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import Event from '@mui/icons-material/Event';
import AnalyticsOutlined from '@mui/icons-material/AnalyticsOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import People from '@mui/icons-material/People';
import PersonAdd from '@mui/icons-material/PersonAdd';
import HowToReg from '@mui/icons-material/HowToReg';
import TimelineOutlined from '@mui/icons-material/TimelineOutlined';
import Group from '@mui/icons-material/Group';
import MilitaryTech from '@mui/icons-material/MilitaryTech';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import DirectionsCar from '@mui/icons-material/DirectionsCar';

/** Staff roles that can open /admin (matches App.js admin layout gate). */
export const STAFF_ROLES = ['admin', 'eventteam', 'hrteam', 'financeteam'];

/**
 * Sidebar: personal shortcuts while using the admin shell.
 * roles: null → show for any staff role using this layout.
 */
export const MY_AREA_SECTIONS = [
  {
    id: 'account',
    label: 'Account',
    items: [
      { to: '/dashboard', label: 'Overview', Icon: DashboardOutlined, roles: null },
    ],
  },
  {
    id: 'driving',
    label: 'Driving & jobs',
    items: [
      { to: '/jobs', label: 'VTC jobs', Icon: LocalShippingOutlined, roles: null },
      { to: '/validate-job', label: 'Validate job', Icon: VerifiedUserOutlined, roles: null },
      
      { to: '/fleet', label: 'Fleet', Icon: GarageOutlined, roles: null },
      { to: '/online-riders', label: 'Online riders', Icon: WifiTethering, roles: null },
    ],
  },
  {
    id: 'economy',
    label: 'Economy',
    items: [
      { to: '/wallet', label: 'Wallet', Icon: AccountBalanceWalletOutlined, roles: null },
      {
        to: '/contracts',
        label: 'Contract marketplace',
        Icon: AssignmentOutlined,
        roles: null,
        matchExact: true,
      },
      {
        to: '/contracts/me',
        label: 'My contracts',
        Icon: FolderSharedOutlined,
        roles: null,
        matchExact: true,
      },
      { to: '/loans', label: 'Loans', Icon: RequestQuoteOutlined, roles: null },
    ],
  },
  {
    id: 'community',
    label: 'Community & events',
    items: [
      { to: '/challenges', label: 'Challenges', Icon: AssignmentTurnedInOutlined, roles: null },
      // { to: '/goals', label: 'Personal goals', Icon: FlagOutlined, roles: null },
      { to: '/attendance', label: 'My attendance', Icon: EventAvailableOutlined, roles: null },
      { to: '/calendar', label: 'Event calendar', Icon: CalendarMonthOutlined, roles: null },
    ],
  },
];

/**
 * Admin sidebar sections (RBAC per item; section hidden if no visible items).
 */
export const ADMIN_SECTIONS = [
  {
    id: 'admin-overview',
    label: 'Admin overview',
    items: [
      {
        to: '/admin',
        label: 'Admin home',
        Icon: AdminPanelSettings,
        roles: STAFF_ROLES,
        matchExact: true,
      },
    ],
  },
  {
    id: 'events-ops',
    label: 'Events & operations',
    items: [
      { to: '/admin/events', label: 'Event management', Icon: Event, roles: ['admin', 'eventteam'] },
      {
        to: '/admin/external-attendance',
        label: 'External attendance',
        Icon: PublicOutlined,
        roles: ['admin', 'eventteam'],
      },
      {
        to: '/admin/jobs',
        label: 'Job management',
        Icon: LocalShippingOutlined,
        roles: ['admin', 'eventteam'],
      },
      {
        to: '/admin/analytics',
        label: 'Analytics',
        Icon: AnalyticsOutlined,
        roles: ['admin', 'eventteam'],
      },
    ],
  },
  {
    id: 'people',
    label: 'People & HR',
    items: [
      { to: '/admin/users', label: 'User management', Icon: People, roles: ['admin', 'hrteam'] },
      { to: '/admin/create-user', label: 'Create user', Icon: PersonAdd, roles: ['admin', 'hrteam'] },
      { to: '/admin/user-approvals', label: 'User approvals', Icon: HowToReg, roles: ['admin', 'hrteam'] },
      {
        to: '/admin/attendance',
        label: 'Attendance management',
        Icon: TimelineOutlined,
        roles: ['admin', 'hrteam'],
      },
      // { to: '/admin/riders', label: 'Riders', Icon: Group, roles: ['admin', 'eventteam', 'hrteam'] },
      { to: '/admin/achievements', label: 'Achievements', Icon: MilitaryTech, roles: ['admin', 'hrteam'] },
    ],
  },
  {
    id: 'challenges',
    label: 'Challenges',
    items: [
      {
        to: '/admin/challenges',
        label: 'Challenge management',
        Icon: EmojiEventsOutlined,
        roles: ['admin', 'eventteam', 'hrteam', 'financeteam'],
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    items: [
      { to: '/admin/bank', label: 'Bank', Icon: AttachMoneyOutlined, roles: ['admin', 'financeteam'] },
      {
        to: '/admin/contracts',
        label: 'Admin contracts',
        Icon: AssignmentOutlined,
        roles: ['admin', 'eventteam', 'financeteam'],
      },
      { to: '/admin/loans', label: 'Loan management', Icon: RequestQuoteOutlined, roles: ['admin', 'financeteam'] },
      { to: '/admin/emis', label: 'EMI tracking', Icon: PaymentsOutlined, roles: ['admin', 'financeteam'] },
    ],
  },
];

/** Admin dashboard (/admin) cards — same RBAC as routes. */
export const ADMIN_DASHBOARD_GROUP_ORDER = [
  'Events & operations',
  'People & HR',
  'Challenges',
  'Finance',
];

export const ADMIN_DASHBOARD_CARDS = [
  {
    group: 'Events & operations',
    title: 'Event management',
    description: 'Events, slots, bookings and special events.',
    to: '/admin/events',
    icon: Event,
    color: 'primary',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'Events & operations',
    title: 'External attendance',
    description: 'TruckersMP external events and slot attendance.',
    to: '/admin/external-attendance',
    icon: PublicOutlined,
    color: 'info',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'Events & operations',
    title: 'Job management',
    description: 'Browse and manage jobs from TruckersHub.',
    to: '/admin/jobs',
    icon: DirectionsCar,
    color: 'warning',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'Events & operations',
    title: 'Analytics',
    description: 'Event, attendance, and engagement analytics.',
    to: '/admin/analytics',
    icon: AnalyticsOutlined,
    color: 'info',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'People & HR',
    title: 'User management',
    description: 'Accounts, roles, and access.',
    to: '/admin/users',
    icon: People,
    color: 'primary',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Create user',
    description: 'Onboard a new account.',
    to: '/admin/create-user',
    icon: PersonAdd,
    color: 'secondary',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'User approvals',
    description: 'Approve pending registrations.',
    to: '/admin/user-approvals',
    icon: HowToReg,
    color: 'primary',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Attendance management',
    description: 'HR attendance and reports.',
    to: '/admin/attendance',
    icon: TimelineOutlined,
    color: 'success',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Riders',
    description: 'Rider profiles, IDs, and wallet links.',
    to: '/admin/riders',
    icon: Group,
    color: 'info',
    roles: ['admin', 'eventteam', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Achievements',
    description: 'Issue and manage rider achievements.',
    to: '/admin/achievements',
    icon: MilitaryTech,
    color: 'warning',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'Challenges',
    title: 'Challenge management',
    description: 'Create and configure driving challenges.',
    to: '/admin/challenges',
    icon: EmojiEventsOutlined,
    color: 'secondary',
    roles: ['admin', 'eventteam', 'hrteam', 'financeteam'],
  },
  {
    group: 'Finance',
    title: 'Bank',
    description: 'Central bank balance and transactions.',
    to: '/admin/bank',
    icon: AttachMoneyOutlined,
    color: 'success',
    roles: ['admin', 'financeteam'],
  },
  {
    group: 'Finance',
    title: 'Admin contracts',
    description: 'Contract templates and admin tools.',
    to: '/admin/contracts',
    icon: AssignmentOutlined,
    color: 'secondary',
    roles: ['admin', 'eventteam', 'financeteam'],
  },
  {
    group: 'Finance',
    title: 'Loan management',
    description: 'Loans, approvals, and deductions.',
    to: '/admin/loans',
    icon: RequestQuoteOutlined,
    color: 'warning',
    roles: ['admin', 'financeteam'],
  },
  {
    group: 'Finance',
    title: 'EMI tracking',
    description: 'Installments and repayment status.',
    to: '/admin/emis',
    icon: PaymentsOutlined,
    color: 'info',
    roles: ['admin', 'financeteam'],
  },
];

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
