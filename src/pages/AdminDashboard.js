import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
} from '@mui/material';
import {
  DirectionsCar,
  People,
  Analytics,
  Assignment,
  Timeline,
  AccountBalance,
  MilitaryTech,
  HowToReg,
  PersonAdd,
  Group,
  Event,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const cardConfig = [
  {
    group: 'Events & Jobs',
    title: 'Event Management',
    description: 'Manage events, slots, bookings and special events.',
    to: '/admin/events',
    icon: Event,
    color: 'primary',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'Events & Jobs',
    title: 'Job Management',
    description: 'Browse and manage jobs from TruckersHub.',
    to: '/admin/jobs',
    icon: DirectionsCar,
    color: 'warning',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'Events & Jobs',
    title: 'Analytics',
    description: 'Event and engagement analytics.',
    to: '/admin/analytics',
    icon: Analytics,
    color: 'info',
    roles: ['admin', 'eventteam'],
  },
  {
    group: 'People & HR',
    title: 'User Management',
    description: 'Manage user accounts and roles.',
    to: '/admin/users',
    icon: People,
    color: 'primary',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Create User',
    description: 'Create a new user account.',
    to: '/admin/create-user',
    icon: PersonAdd,
    color: 'secondary',
    roles: ['admin'],
  },
  {
    group: 'People & HR',
    title: 'User Approvals',
    description: 'Review and approve pending registrations.',
    to: '/admin/user-approvals',
    icon: HowToReg,
    color: 'primary',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Attendance',
    description: 'Member attendance and reports.',
    to: '/admin/attendance',
    icon: Timeline,
    color: 'success',
    roles: ['admin', 'hrteam'],
  },
  {
    group: 'People & HR',
    title: 'Riders',
    description: 'Manage rider profiles and data.',
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
    title: 'Challenge Management',
    description: 'Create and manage driving challenges.',
    to: '/admin/challenges',
    icon: EmojiEvents,
    color: 'secondary',
    roles: ['admin', 'eventteam', 'hrteam', 'financeteam'],
  },
  {
    group: 'Finance',
    title: 'Bank',
    description: 'Bank balance, transactions and payouts.',
    to: '/admin/bank',
    icon: AccountBalance,
    color: 'success',
    roles: ['admin', 'financeteam'],
  },
  {
    group: 'Finance',
    title: 'Contracts',
    description: 'Contract templates and management.',
    to: '/admin/contracts',
    icon: Assignment,
    color: 'secondary',
    roles: ['admin', 'eventteam', 'financeteam'],
  },
];

const groupOrder = ['Events & Jobs', 'People & HR', 'Challenges', 'Finance'];

function AdminCard({ item, color, theme }) {
  const Icon = item.icon;
  const isDark = theme.palette.mode === 'dark';
  const colorMain = theme.palette[color]?.main || theme.palette.primary.main;
  const bg = alpha(colorMain, isDark ? 0.15 : 0.08);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: colorMain,
          boxShadow: `0 8px 24px ${alpha(colorMain, 0.2)}`,
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={item.to}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: bg,
              color: colorMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {item.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const role = user?.role;

  const allowedCards = cardConfig.filter((c) => role && c.roles.includes(role));
  const byGroup = groupOrder.reduce((acc, group) => {
    acc[group] = allowedCards.filter((c) => c.group === group);
    return acc;
  }, {});

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h1"
            fontWeight={700}
            gutterBottom
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quick access to management tools
          </Typography>
        </Box>
        {user && (
          <Chip
            label={user.username}
            size="medium"
            variant="outlined"
            sx={{ fontWeight: 500, textTransform: 'capitalize' }}
          />
        )}
      </Box>

      {groupOrder.map((group) => {
        const items = byGroup[group];
        if (!items?.length) return null;
        return (
          <Box key={group} sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
                display: 'block',
                mb: 1.5,
              }}
            >
              {group}
            </Typography>
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.to}>
                  <AdminCard item={item} color={item.color} theme={theme} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default AdminDashboard;
