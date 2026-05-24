import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { isNavPathActive, userCanSeeNavItem } from '../../config/adminNavigation';

/**
 * Section shell: title, optional description, role-filtered route tabs, and nested Outlet.
 */
export default function AdminSectionTabsLayout({
  title,
  description,
  tabs,
  defaultTabTo,
}) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role;

  const visibleTabs = tabs.filter((t) => userCanSeeNavItem(role, t.roles));
  const activeTab =
    visibleTabs.find((t) => isNavPathActive(location.pathname, t)) || visibleTabs[0];

  const handleTabChange = (_, newTo) => {
    const next = visibleTabs.find((t) => t.to === newTo);
    if (next) navigate(next.to);
  };

  if (!visibleTabs.length) {
    return (
      <Typography color="text.secondary">
        You do not have access to this section.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            {description}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          mx: { xs: -1, sm: 0 },
        }}
      >
        <Tabs
          value={activeTab?.to || defaultTabTo || visibleTabs[0].to}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
          }}
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.Icon;
            return (
              <Tab
                key={tab.to}
                value={tab.to}
                label={tab.label}
                icon={Icon ? <Icon sx={{ fontSize: 18 }} /> : undefined}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Box>

      <Outlet />
    </Box>
  );
}
