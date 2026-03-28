import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  SwipeableDrawer,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import {
  MY_AREA_SECTIONS,
  ADMIN_SECTIONS,
  STAFF_ROLES,
  userCanSeeNavItem,
  isNavPathActive,
} from "../config/adminNavigation";

function NavListItem({ item, user, onClose, collapsed }) {
  const location = useLocation();
  const active = isNavPathActive(location.pathname, item);
  if (!userCanSeeNavItem(user?.role, item.roles)) return null;
  const Icon = item.Icon;

  const button = (
    <ListItem disablePadding>
      <ListItemButton
        component={RouterLink}
        to={item.to}
        onClick={onClose}
        selected={active}
        sx={{
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 1 : 2,
          "&.Mui-selected": {
            bgcolor: "action.selected",
            "&:hover": { bgcolor: "action.hover" },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 40,
            justifyContent: "center",
            color: active ? "primary.main" : "inherit",
          }}
        >
          <Icon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ noWrap: true }} />}
      </ListItemButton>
    </ListItem>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        <span>{button}</span>
      </Tooltip>
    );
  }
  return button;
}

function SectionHeader({ label, collapsed }) {
  if (collapsed) {
    return <Divider sx={{ my: 1, mx: 1 }} />;
  }
  return (
    <Box sx={{ px: 2, py: 1.25 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: "0.06em" }}>
        {label}
      </Typography>
    </Box>
  );
}

function NavSection({ section, user, onClose, collapsed }) {
  const visible = section.items.some((item) => userCanSeeNavItem(user?.role, item.roles));
  if (!visible) return null;
  return (
    <>
      <SectionHeader label={section.label} collapsed={collapsed} />
      <List dense sx={{ pt: 0 }}>
        {section.items.map((item) => (
          <NavListItem key={`${section.id}-${item.to}`} item={item} user={user} onClose={onClose} collapsed={collapsed} />
        ))}
      </List>
    </>
  );
}

function formatRoleLabel(role) {
  if (!role) return "";
  const map = {
    rider: "Rider",
    admin: "Admin",
    eventteam: "Event team",
    hrteam: "HR team",
    financeteam: "Finance team",
  };
  return map[role] || role.replace(/team$/, " team").replace(/\b\w/g, (c) => c.toUpperCase());
}

const AdminSidebar = ({
  mobileDrawerOpen,
  handleMobileDrawerClose,
  user,
  collapsed = false,
  onToggleCollapse,
  /** Sidebar header (e.g. "Account" for members, "Staff console" for /admin) */
  brandTitle = "Account",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const hasAdminAccess = user && STAFF_ROLES.includes(user.role);
  const desktopWidth = collapsed ? 72 : 288;

  const SidebarContent = ({ isCollapsed }) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
      <Box
        sx={{
          p: isCollapsed ? 1.5 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {!isCollapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {brandTitle}
            </Typography>
            {user?.role && (
              <Chip
                size="small"
                label={formatRoleLabel(user.role)}
                variant="outlined"
                sx={{ mt: 0.75, fontWeight: 600, textTransform: "none" }}
              />
            )}
          </Box>
        )}
      </Box>
      <Divider />

      <SectionHeader label="MY AREA" collapsed={isCollapsed} />
      {MY_AREA_SECTIONS.map((section) => (
        <NavSection
          key={section.id}
          section={section}
          user={user}
          onClose={handleMobileDrawerClose}
          collapsed={isCollapsed}
        />
      ))}

      {hasAdminAccess && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <SectionHeader label="ADMIN" collapsed={isCollapsed} />
          {ADMIN_SECTIONS.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              user={user}
              onClose={handleMobileDrawerClose}
              collapsed={isCollapsed}
            />
          ))}
        </>
      )}

      <Box sx={{ flex: 1, minHeight: 24 }} />

      {!isMobile && onToggleCollapse && (
        <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
          <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
            <IconButton onClick={onToggleCollapse} size="small" sx={{ width: "100%", borderRadius: 1 }}>
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          width: desktopWidth,
          flexShrink: 0,
          flexDirection: "column",
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
          transition: theme.transitions.create("width", { duration: theme.transitions.duration.short }),
        }}
      >
        <SidebarContent isCollapsed={collapsed} />
      </Box>

      <SwipeableDrawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 320,
            maxWidth: "100vw",
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>
            {brandTitle}
          </Typography>
          <IconButton onClick={handleMobileDrawerClose} aria-label="close menu">
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <SidebarContent isCollapsed={false} />
      </SwipeableDrawer>
    </>
  );
};

export default AdminSidebar;
