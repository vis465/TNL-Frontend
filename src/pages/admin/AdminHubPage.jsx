import React, { useMemo } from 'react';
import { Link as RouterLink, useParams, Navigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  alpha,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import {
  ADMIN_HUB_MAP,
  getHubCards,
} from '../../config/adminNavigation';

function HubCard({ item, theme }) {
  const Icon = item.icon;
  const color = item.color || 'primary';
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
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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

export default function AdminHubPage() {
  const { hubId } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const role = user?.role;
  const hub = ADMIN_HUB_MAP[hubId];

  const cards = useMemo(() => (hub ? getHubCards(hub.id, role) : []), [hub, role]);

  if (!hub) {
    return <Navigate to="/admin" replace />;
  }

  const canAccess = cards.length > 0;
  if (!canAccess) {
    return <Navigate to="/admin" replace />;
  }

  const HubIcon = hub.Icon;

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" underline="hover" color="inherit">
          Admin
        </Link>
        <Typography color="text.secondary">{hub.label}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette[hub.color || 'primary']?.main || t.palette.primary.main, 0.12),
            color: `${hub.color || 'primary'}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HubIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {hub.label}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
            {hub.description}
          </Typography>
        </Box>
      </Box>

      {!cards.length ? (
        <Typography color="text.secondary">No tools available in this hub for your role.</Typography>
      ) : (
        <Grid container spacing={2}>
          {cards.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.to}>
              <HubCard item={item} theme={theme} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}