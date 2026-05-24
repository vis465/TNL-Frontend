import GavelOutlined from '@mui/icons-material/GavelOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';

/** Tabs under /admin/rto — keep roles in sync with App.js PrivateRoute. */
export const ADMIN_RTO_TABS = [
  {
    to: '/admin/rto/challans',
    label: 'Challans',
    description: 'Review, export, waive, and manage appeals.',
    Icon: ReceiptLongOutlined,
    roles: ['admin', 'eventteam', 'financeteam'],
    matchExact: true,
  },
  {
    to: '/admin/rto/offences',
    label: 'Offences',
    description: 'Offence catalog and fine amounts for RTO officers.',
    Icon: GavelOutlined,
    roles: ['admin', 'eventteam'],
    matchExact: true,
  },
  {
    to: '/admin/rto/settings',
    label: 'Settings',
    description: 'Cooldowns, caps, expiry, and outstanding thresholds.',
    Icon: SettingsOutlined,
    roles: ['admin', 'eventteam'],
    matchExact: true,
  },
];

export const ADMIN_RTO_HOME = '/admin/rto/challans';
