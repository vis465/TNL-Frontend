import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  Collapse,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "./ui/sidebar";

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
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (!collapsed) setOpen(false);
  }, [collapsed]);
  if (!visible) return null;

  if (collapsed) {
    return (
      <List dense sx={{ pt: 0 }}>
        {section.items.map((item) => (
          <NavListItem key={`${section.id}-${item.to}`} item={item} user={user} onClose={onClose} collapsed={collapsed} />
        ))}
      </List>
    );
  }

  return (
    <>
      <ListItem disablePadding sx={{ px: 1 }}>
        <ListItemButton
          onClick={() => setOpen((p) => !p)}
          sx={{
            borderRadius: 1,
            mb: 0.25,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemText
            primary={section.label}
            primaryTypographyProps={{
              variant: "body2",
              fontWeight: 700,
              color: "text.secondary",
              sx: { letterSpacing: "0.04em", textTransform: "uppercase" },
            }}
          />
          <ChevronRight
            fontSize="small"
            style={{
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 180ms ease",
            }}
          />
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout={180} unmountOnExit>
        <List dense sx={{ pt: 0 }}>
          {section.items.map((item) => (
            <NavListItem key={`${section.id}-${item.to}`} item={item} user={user} onClose={onClose} collapsed={collapsed} />
          ))}
        </List>
      </Collapse>
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
    communityManager: "Community manager",
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

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => onToggleCollapse?.(!open)}
      openMobile={mobileDrawerOpen}
      onOpenMobileChange={(open) => {
        if (!open) handleMobileDrawerClose?.();
      }}
    >
      <Sidebar
        collapsible="icon"
        widthExpanded={288}
        widthCollapsed={72}
        mobileWidth={320}
        sx={{}}
      >
        <SidebarHeader>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!collapsed && (
              <Typography variant="h6" fontWeight={700}>
                {brandTitle}
              </Typography>
            )}
            {isMobile && (
              <IconButton onClick={handleMobileDrawerClose} aria-label="close menu">
                <Close />
              </IconButton>
            )}
          </Box>
        </SidebarHeader>
        <SidebarContent>
          <SidebarContentInner
            user={user}
            isCollapsed={collapsed}
            isMobile={isMobile}
            onToggleCollapse={onToggleCollapse}
            handleMobileDrawerClose={handleMobileDrawerClose}
            hasAdminAccess={hasAdminAccess}
            brandTitle={brandTitle}
          />
        </SidebarContent>
        <SidebarFooter>
          {!isMobile && onToggleCollapse && (
            <Box sx={{ p: 1 }}>
              <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
                <IconButton onClick={onToggleCollapse} size="small" sx={{ width: "100%", borderRadius: 1 }}>
                  {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

function SidebarContentInner({
  user,
  isCollapsed,
  isMobile,
  onToggleCollapse,
  handleMobileDrawerClose,
  hasAdminAccess,
  brandTitle,
}) {
  return (
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
      <SidebarGroup>
        {!isCollapsed ? <SidebarGroupLabel>MY AREA</SidebarGroupLabel> : <SectionHeader label="MY AREA" collapsed={isCollapsed} />}
        <SidebarMenu>
          {MY_AREA_SECTIONS.map((section) => (
            <NavSection
              key={section.id}
              section={section}
              user={user}
              onClose={handleMobileDrawerClose}
              collapsed={isCollapsed}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      {hasAdminAccess && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <SidebarGroup>
            {!isCollapsed ? <SidebarGroupLabel>ADMIN</SidebarGroupLabel> : <SectionHeader label="ADMIN" collapsed={isCollapsed} />}
            <SidebarMenu>
              {ADMIN_SECTIONS.map((section) => (
                <NavSection
                  key={section.id}
                  section={section}
                  user={user}
                  onClose={handleMobileDrawerClose}
                  collapsed={isCollapsed}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </>
      )}
      <Box sx={{ flex: 1, minHeight: 24 }} />
    </Box>
  );
}

export default AdminSidebar;
