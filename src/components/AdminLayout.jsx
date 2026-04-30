import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { useTheme, useMediaQuery } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import AdminSidebar from "./AdminSidebar";
import { ADMIN_SECTIONS, MY_AREA_SECTIONS, isNavPathActive } from "../config/adminNavigation";

/**
 * Shared shell: sidebar + main (Outlet). Used for member routes and /admin.
 * @param {string} [sidebarBrandTitle='Account'] — Header in sidebar / drawer
 * @param {string} [mobileBarTitle] — Sticky app bar on small screens (defaults to sidebarBrandTitle)
 */
export default function AdminLayout({
  sidebarBrandTitle = "Account",
  mobileBarTitle,
}) {
  const barTitle = mobileBarTitle ?? sidebarBrandTitle;
  const [user, setUser] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
  }, []);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const allItems = [...MY_AREA_SECTIONS, ...ADMIN_SECTIONS].flatMap((s) => s.items || []);
  const currentNav = allItems.find((item) => isNavPathActive(location.pathname, item));

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
      <AdminSidebar
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={handleMobileDrawerClose}
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        brandTitle={sidebarBrandTitle}
      />

      <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {isMobile && (
          <AppBar position="sticky" sx={{ display: { xs: "block", md: "none" } }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="start"
                onClick={handleMobileDrawerToggle}
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
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.5 }}>
              <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
                Account
              </Link>
              <Typography color="text.secondary">{currentNav?.label || barTitle}</Typography>
            </Breadcrumbs>
            <Typography variant="h6" fontWeight={800}>
              {currentNav?.label || barTitle}
            </Typography>
          </Box>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
