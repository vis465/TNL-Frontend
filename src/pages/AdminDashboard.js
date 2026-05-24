import React, { useMemo, useState } from 'react';
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
  Tab,
  Tabs,
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
    communityManager: 'Community manager',
    rto: 'RTO officer',
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
  const [activeGroup, setActiveGroup] = useState('all');

  const allowedCards = useMemo(
    () => ADMIN_DASHBOARD_CARDS.filter((c) => userCanSeeNavItem(role, c.roles)),
    [role],
  );

  const visibleGroups = useMemo(
    () =>
      ADMIN_DASHBOARD_GROUP_ORDER.filter((group) =>
        allowedCards.some((c) => c.group === group),
      ),
    [allowedCards],
  );

  const filteredCards = useMemo(() => {
    if (activeGroup === 'all') return allowedCards;
    return allowedCards.filter((c) => c.group === activeGroup);
  }, [activeGroup, allowedCards]);

  const cardsByGroup = useMemo(() => {
    const groups = activeGroup === 'all' ? visibleGroups : [activeGroup];
    return groups.reduce((acc, group) => {
      acc[group] = filteredCards.filter((c) => c.group === group);
      return acc;
    }, {});
  }, [activeGroup, filteredCards, visibleGroups]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          mb: 3,
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
            Shortcuts for your role. Filter by area below, or use the sidebar for the full menu.
          </Typography>
        </Box>
        {user && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={user.username} size="medium" variant="outlined" sx={{ fontWeight: 500 }} />
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

      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeGroup}
          onChange={(_, v) => setActiveGroup(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ minHeight: 44, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
        >
          <Tab value="all" label={`All (${allowedCards.length})`} />
          {visibleGroups.map((group) => {
            const count = allowedCards.filter((c) => c.group === group).length;
            return <Tab key={group} value={group} label={`${group} (${count})`} />;
          })}
        </Tabs>
      </Box>

      {Object.entries(cardsByGroup).map(([group, items]) => {
        if (!items?.length) return null;
        return (
          <Box key={group} sx={{ mb: 4 }}>
            {activeGroup === 'all' && (
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
            )}
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

      {!filteredCards.length && (
        <Typography color="text.secondary">No tools available for your role in this area.</Typography>
      )}
    </Box>
  );
};

export default AdminDashboard;
