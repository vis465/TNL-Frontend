import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import { useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';
import AdminBreadcrumbs from './admin/AdminBreadcrumbs';
import AdminCommandPalette from './admin/AdminCommandPalette';
import {
  getSidebarCollapsed,
  recordAdminRecent,
  setSidebarCollapsed,
} from '../utils/adminNavStorage';

/**
 * Shared shell: sidebar + main (Outlet). Used for member routes and /admin.
 */
export default function AdminLayout({
  sidebarBrandTitle = 'Account',
  mobileBarTitle,
}) {
  const barTitle = mobileBarTitle ?? sidebarBrandTitle;
  const [user, setUser] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => getSidebarCollapsed());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      recordAdminRecent(location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      setSidebarCollapsed(next);
      return next;
    });
  }, []);

  const openSearch = useCallback(() => setPaletteOpen(true), []);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <AdminSidebar
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={() => setMobileDrawerOpen(false)}
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        brandTitle={sidebarBrandTitle}
        onOpenSearch={openSearch}
      />

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="start"
                onClick={() => setMobileDrawerOpen((o) => !o)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                {barTitle}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            px: { xs: 1, sm: 2, md: 3 },
            pt: { xs: 2, sm: 3 },
            pb: 3,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <AdminBreadcrumbs brandTitle={barTitle} />
          </Box>
          <Outlet context={{ onOpenSearch: openSearch }} />
        </Container>
      </Box>

      <AdminCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  );
}
