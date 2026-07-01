import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { getBreadcrumbTrail, getNavItemByPath, isNavPathActive } from '../../config/adminNavigation';
import { ADMIN_RTO_TABS } from '../../config/adminRtoNav';

export default function AdminBreadcrumbs({ brandTitle = 'Staff console' }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isAdmin = pathname.startsWith('/admin');

  if (!isAdmin) {
    const navItem = getNavItemByPath(pathname);
    return (
      <Box sx={{ mb: 0.5 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
            Account
          </Link>
          <Typography color="text.secondary">{navItem?.label || brandTitle}</Typography>
        </Breadcrumbs>
      </Box>
    );
  }

  const trail = getBreadcrumbTrail(pathname);
  const rtoTab = ADMIN_RTO_TABS.find((item) => isNavPathActive(pathname, item));
  const currentNav = getNavItemByPath(pathname);
  const pageTitle = rtoTab ? `RTO — ${rtoTab.label}` : currentNav?.label || brandTitle;

  return (
    <Box sx={{ mb: 0.5 }}>
      <Breadcrumbs aria-label="breadcrumb">
        {trail.map((crumb, idx) => {
          const isLast = idx === trail.length - 1;
          if (isLast) {
            return (
              <Typography key={crumb.to} color="text.secondary" fontWeight={600}>
                {crumb.label}
              </Typography>
            );
          }
          return (
            <Link key={crumb.to} component={RouterLink} to={crumb.to} underline="hover" color="inherit">
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>
      <Typography variant="h6" fontWeight={800} sx={{ mt: 0.25 }}>
        {pageTitle}
      </Typography>
    </Box>
  );
}
