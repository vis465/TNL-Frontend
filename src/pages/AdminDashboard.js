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
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import {
  ADMIN_DASHBOARD_CARDS,
  ADMIN_DASHBOARD_GROUP_ORDER,
  userCanSeeNavItem,
} from '../config/adminNavigation';

function formatStaffRole(role) {
  if (!role) return '';
  const map = {
    admin: 'Admin',
    eventteam: 'Event team',
    hrteam: 'HR team',
    financeteam: 'Finance team',
  };
  return map[role] || role;
}

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

  const allowedCards = ADMIN_DASHBOARD_CARDS.filter((c) => userCanSeeNavItem(role, c.roles));
  const byGroup = ADMIN_DASHBOARD_GROUP_ORDER.reduce((acc, group) => {
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
          alignItems: 'flex-start',
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
            Admin dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
            Shortcuts match your role. Use the sidebar for the full menu (personal tools under{' '}
            <strong>My area</strong>, staff tools by section).
          </Typography>
        </Box>
        {user && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={user.username}
              size="medium"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
            {role && (
              <Chip
                label={formatStaffRole(role)}
                size="medium"
                color="primary"
                variant="filled"
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
            )}
          </Stack>
        )}
      </Box>

      {ADMIN_DASHBOARD_GROUP_ORDER.map((group) => {
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
