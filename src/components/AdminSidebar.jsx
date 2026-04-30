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
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import Close from "@mui/icons-material/Close";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import StarBorder from "@mui/icons-material/StarBorder";
import Star from "@mui/icons-material/Star";
import {
  MY_AREA_SECTIONS,
  ADMIN_SECTIONS,
  STAFF_ROLES,
  userCanSeeNavItem,
  isNavPathActive,
} from "../config/adminNavigation";
import axiosInstance from "../utils/axios";
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

function NavListItem({ item, user, onClose, collapsed, badgeCount = 0, favorite = false, onToggleFavorite }) {
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
          py: 0.75,
          mx: 0.5,
          borderRadius: 1.25,
          transition: "all 180ms ease",
          border: "1px solid transparent",
          "&:hover": {
            bgcolor: "action.hover",
            borderColor: "divider",
            transform: "translateX(1px)",
          },
          "&.Mui-selected": {
            bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.18 : 0.12),
            borderColor: (t) => alpha(t.palette.primary.main, 0.45),
            boxShadow: (t) => `inset 3px 0 0 ${t.palette.primary.main}`,
            "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.22 : 0.16) },
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
        {!collapsed && badgeCount > 0 && (
          <Chip
            size="small"
            label={badgeCount}
            sx={{ mr: 0.5, minWidth: 24, height: 20, fontWeight: 700, borderRadius: 1, bgcolor: "primary.main", color: "primary.contrastText" }}
          />
        )}
        {!collapsed && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(item.to);
            }}
            sx={{ ml: 0.25, opacity: favorite ? 1 : 0.65, "&:hover": { opacity: 1, bgcolor: "action.hover" } }}
          >
            {favorite ? <Star fontSize="small" color="warning" /> : <StarBorder fontSize="small" />}
          </IconButton>
        )}
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
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: "0.06em" }}>
        {label}
      </Typography>
    </Box>
  );
}

function NavSection({ section, user, onClose, collapsed, query = "", favorites = [], onToggleFavorite, badges = {} }) {
  const q = query.trim().toLowerCase();
  const filteredItems = section.items.filter((item) => {
    if (!userCanSeeNavItem(user?.role, item.roles)) return false;
    if (!q) return true;
    return item.label.toLowerCase().includes(q);
  });
  const visible = filteredItems.length > 0;
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (!collapsed) setOpen(true);
  }, [collapsed, query]);
  if (!visible) return null;

  if (collapsed) {
    return (
      <List dense sx={{ pt: 0 }}>
        {filteredItems.map((item) => (
          <NavListItem
            key={`${section.id}-${item.to}`}
            item={item}
            user={user}
            onClose={onClose}
            collapsed={collapsed}
            badgeCount={badges[item.to] || 0}
            favorite={favorites.includes(item.to)}
            onToggleFavorite={onToggleFavorite}
          />
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
            py: 0.75,
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
      <Collapse in={open} timeout={220} unmountOnExit>
        <List dense sx={{ pt: 0 }}>
          {filteredItems.map((item) => (
            <NavListItem
              key={`${section.id}-${item.to}`}
              item={item}
              user={user}
              onClose={onClose}
              collapsed={collapsed}
              badgeCount={badges[item.to] || 0}
              favorite={favorites.includes(item.to)}
              onToggleFavorite={onToggleFavorite}
            />
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
  const [query, setQuery] = React.useState("");
  const [favorites, setFavorites] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin-sidebar-favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [badges, setBadges] = React.useState({});
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    localStorage.setItem("admin-sidebar-favorites", JSON.stringify(favorites));
  }, [favorites]);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const [inv, att] = await Promise.all([
          axiosInstance.get("/me/division/invites").catch(() => ({ data: { invites: [] } })),
          axiosInstance.get("/attendance-events/active/me").catch(() => ({ data: [] })),
        ]);
        setBadges({
          "/division/invites": (inv.data?.invites || []).length,
          "/attendance": Array.isArray(att.data) ? att.data.length : 0,
        });
      } catch {
        setBadges({});
      }
    })();
  }, []);

  const toggleFavorite = (to) => {
    setFavorites((prev) => (prev.includes(to) ? prev.filter((x) => x !== to) : [...prev, to]));
  };

  const allSections = [...MY_AREA_SECTIONS, ...(hasAdminAccess ? ADMIN_SECTIONS : [])];
  const favoriteItems = allSections
    .flatMap((s) => s.items || [])
    .filter((item) => favorites.includes(item.to) && userCanSeeNavItem(user?.role, item.roles))
    .filter((item) => (query.trim() ? item.label.toLowerCase().includes(query.trim().toLowerCase()) : true));

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
        sx={{
          bgcolor: "background.paper",
          borderRightColor: "divider",
        }}
      >
        <SidebarHeader>
          <Box
            sx={{
              p: 2,
              background: (t) =>
                `linear-gradient(180deg, ${alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.1 : 0.08)} 0%, transparent 100%)`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            {!collapsed && (
              <TextField
                inputRef={searchRef}
                size="small"
                fullWidth
                placeholder="Search menu (Ctrl/Cmd+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ mt: 1.25 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>
        </SidebarHeader>
        <SidebarContent>
          <SidebarContentInner
            user={user}
            isCollapsed={collapsed}
            isMobile={isMobile}
            handleMobileDrawerClose={handleMobileDrawerClose}
            hasAdminAccess={hasAdminAccess}
            brandTitle={brandTitle}
            query={query}
            favorites={favorites}
            favoriteItems={favoriteItems}
            onToggleFavorite={toggleFavorite}
            badges={badges}
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
  handleMobileDrawerClose,
  hasAdminAccess,
  brandTitle,
  query,
  favorites,
  favoriteItems,
  onToggleFavorite,
  badges,
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
      {favoriteItems.length > 0 && (
        <SidebarGroup>
          {!isCollapsed ? <SidebarGroupLabel>FAVORITES</SidebarGroupLabel> : <SectionHeader label="FAVORITES" collapsed={isCollapsed} />}
          <SidebarMenu>
            <List dense sx={{ pt: 0 }}>
              {favoriteItems.map((item) => (
                <NavListItem
                  key={`fav-${item.to}`}
                  item={item}
                  user={user}
                  onClose={handleMobileDrawerClose}
                  collapsed={isCollapsed}
                  badgeCount={badges[item.to] || 0}
                  favorite={favorites.includes(item.to)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </List>
          </SidebarMenu>
          <Divider sx={{ my: 0.5 }} />
        </SidebarGroup>
      )}
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
              query={query}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              badges={badges}
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
                  query={query}
                  favorites={favorites}
                  onToggleFavorite={onToggleFavorite}
                  badges={badges}
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
