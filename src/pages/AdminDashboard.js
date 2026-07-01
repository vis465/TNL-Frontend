import React, { useMemo } from 'react';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
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
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useAuth } from '../contexts/AuthContext';
import {
  formatStaffRole,
  getHubRoute,
  getNavItemByPath,
  getRoleQuickActions,
  getVisibleHubs,
  ROLE_PRIMARY_HUB,
  userCanSeeNavItem,
} from '../config/adminNavigation';
import { getAdminRecents } from '../utils/adminNavStorage';

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

function HubLinkCard({ hub, theme, primary = false }) {
  const Icon = hub.Icon;
  const color = hub.color || 'primary';
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
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: colorMain, boxShadow: `0 6px 20px ${alpha(colorMain, 0.18)}` },
      }}
    >
      <CardActionArea component={RouterLink} to={getHubRoute(hub.id)} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: bg,
                color: colorMain,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {hub.label}
                {primary && (
                  <Chip
                    label="Your area"
                    size="small"
                    color="primary"
                    sx={{ ml: 1, verticalAlign: 'middle', height: 20 }}
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {hub.description}
              </Typography>
            </Box>
            <ChevronRight color="action" />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const AdminDashboard = () => {
  const { onOpenSearch } = useOutletContext() || {};
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const role = user?.role;

  const visibleHubs = useMemo(() => getVisibleHubs(role), [role]);
  const quickActions = useMemo(() => getRoleQuickActions(role, 5), [role]);
  const recents = useMemo(() => {
    return getAdminRecents()
      .map((path) => getNavItemByPath(path))
      .filter((item) => item && userCanSeeNavItem(role, item.roles))
      .slice(0, 6);
  }, [role]);

  const sortedHubs = useMemo(() => {
    const primaryHubId = ROLE_PRIMARY_HUB[role];
    if (!primaryHubId) return visibleHubs;
    const primary = visibleHubs.find((h) => h.id === primaryHubId);
    const rest = visibleHubs.filter((h) => h.id !== primaryHubId);
    return primary ? [primary, ...rest] : visibleHubs;
  }, [visibleHubs, role]);

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
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" fontWeight={700} gutterBottom>
            Staff home
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
            Jump into your hub, use quick actions, or press{' '}
            <Box component="kbd" sx={{ px: 0.75, py: 0.25, borderRadius: 0.5, bgcolor: 'action.hover', fontSize: '0.85em' }}>
              Ctrl+K
            </Box>{' '}
            to search any admin page.
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

      <Button
        variant="outlined"
        startIcon={<SearchIcon />}
        onClick={() => onOpenSearch?.()}
        fullWidth={isMobile}
        sx={{ mb: 3, justifyContent: 'flex-start', py: 1.25, borderStyle: 'dashed' }}
      >
        Search admin pages… (Ctrl+K)
      </Button>

      {quickActions.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, mb: 1.5, display: 'block' }}>
            Quick actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.to}>
                <AdminCard item={item} color={item.color} theme={theme} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, mb: 1.5, display: 'block' }}>
          Hubs
        </Typography>
        <Grid container spacing={2}>
          {sortedHubs.map((hub) => (
            <Grid item xs={12} sm={6} md={4} key={hub.id}>
              <HubLinkCard
                hub={hub}
                theme={theme}
                primary={hub.id === ROLE_PRIMARY_HUB[role]}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {recents.length > 0 && (
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, mb: 1, display: 'block' }}>
            Recent
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <List dense disablePadding>
              {recents.map((item) => {
                const Icon = item.Icon;
                return (
                  <ListItemButton key={item.to} component={RouterLink} to={item.to}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <HistoryOutlined fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item.label || item.title} secondary={item.description} />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
