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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DashboardOutlined,
  AssignmentTurnedInOutlined,
  LeaderboardOutlined,
  Assignment,
  AccountBalanceWallet,
  LocalShippingOutlined,
  Event,
  AdminPanelSettings,
  People,
  EmojiEventsOutlined,
  AttachMoneyOutlined,
  Timeline,
  Close,
  VerifiedUserOutlined,
  PersonAdd,
  Group,
  MilitaryTech,
  ChevronLeft,
  ChevronRight,
  WifiTethering,
} from "@mui/icons-material";

const navItem = (to, label, icon, allowedRoles) => ({ to, label, icon, allowedRoles });

// My area (user dashboard) – shown to all authenticated
const myAreaItems = [
  navItem("/dashboard", "Overview", <DashboardOutlined />, null),
  navItem("/challenges", "Challenges", <AssignmentTurnedInOutlined />, null),
  navItem("/leaderboard", "Leaderboards", <LeaderboardOutlined />, null),
  navItem("/contracts", "Contracts", <Assignment />, null),
  navItem("/wallet", "Wallet", <AccountBalanceWallet />, null),
  navItem("/jobs", "Jobs", <LocalShippingOutlined />, null),
  navItem("/validate-job", "Validate Job", <VerifiedUserOutlined />, null),
  navItem("/online-riders", "Online Riders", <WifiTethering />, null),
  navItem("/attendance", "Attendance", <Event />, null),
];

// Admin home
const adminHome = navItem("/admin", "Admin Dashboard", <AdminPanelSettings />, ["admin", "eventteam", "hrteam", "financeteam"]);

// Events & jobs
const eventsAndJobsItems = [
  navItem("/admin/jobs", "Job Management", <LocalShippingOutlined />, ["admin", "eventteam"]),
  navItem("/admin/events", "Event Management", <Event />, ["admin", "eventteam"]),
  navItem("/admin/analytics", "Analytics", <Timeline />, ["admin", "eventteam"]),
];

// People & HR
const peopleItems = [
  navItem("/admin/users", "User Management", <People />, ["admin", "hrteam"]),
  navItem("/admin/create-user", "Create User", <PersonAdd />, ["admin", "hrteam"]),
  navItem("/admin/user-approvals", "User Approvals", <VerifiedUserOutlined />, ["admin", "hrteam"]),
  navItem("/admin/attendance", "Attendance Management", <Event />, ["admin", "hrteam"]),
  navItem("/admin/riders", "Riders", <Group />, ["admin", "eventteam", "hrteam"]),
  navItem("/admin/achievements", "Achievements", <EmojiEventsOutlined />, ["admin", "hrteam"]),
];

// Challenges
const challengesItems = [
  navItem("/admin/challenges", "Challenge Management", <AssignmentTurnedInOutlined />, ["admin", "eventteam", "hrteam", "financeteam"]),
];

// Finance
const financeItems = [
  navItem("/admin/bank", "Bank", <AttachMoneyOutlined />, ["admin", "financeteam"]),
  navItem("/admin/contracts", "Contract Management", <Assignment />, ["admin", "eventteam", "financeteam"]),
];

function canSee(userRole, allowedRoles) {
  if (!allowedRoles) return true;
  return userRole && allowedRoles.includes(userRole);
}

function NavListItem({ item, user, onClose, collapsed }) {
  const location = useLocation();
  const active = location.pathname === item.to;
  if (!canSee(user?.role, item.allowedRoles)) return null;
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
          {item.icon}
        </ListItemIcon>
        {!collapsed && <ListItemText primary={item.label} />}
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
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: "0.05em" }}>
        {label}
      </Typography>
    </Box>
  );
}

const AdminSidebar = ({
  mobileDrawerOpen,
  handleMobileDrawerClose,
  user,
  collapsed = false,
  onToggleCollapse,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const hasAdminAccess = user && ["admin", "eventteam", "hrteam", "financeteam"].includes(user.role);
  const desktopWidth = collapsed ? 72 : 280;

  const SidebarContent = ({ isCollapsed }) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "auto" }}>
      <Box sx={{ p: isCollapsed ? 1.5 : 2, display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between" }}>
        {!isCollapsed && (
          <Typography variant="subtitle1" fontWeight={700}>
            Menu
          </Typography>
        )}
      </Box>
      <Divider />

      <SectionHeader label="MY AREA" collapsed={isCollapsed} />
      <List dense sx={{ pt: 0 }}>
        {myAreaItems.map((item) => (
          <NavListItem key={item.to} item={item} user={user} onClose={handleMobileDrawerClose} collapsed={isCollapsed} />
        ))}
      </List>

      {hasAdminAccess && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <SectionHeader label="ADMIN" collapsed={isCollapsed} />
          <List dense sx={{ pt: 0 }}>
            <NavListItem item={adminHome} user={user} onClose={handleMobileDrawerClose} collapsed={isCollapsed} />
          </List>

          {eventsAndJobsItems.some((i) => canSee(user?.role, i.allowedRoles)) && (
            <>
              <SectionHeader label="EVENTS & JOBS" collapsed={isCollapsed} />
              <List dense sx={{ pt: 0 }}>
                {eventsAndJobsItems.map((item) => (
                  <NavListItem key={item.to} item={item} user={user} onClose={handleMobileDrawerClose} collapsed={isCollapsed} />
                ))}
              </List>
            </>
          )}

          {peopleItems.some((i) => canSee(user?.role, i.allowedRoles)) && (
            <>
              <SectionHeader label="PEOPLE & HR" collapsed={isCollapsed} />
              <List dense sx={{ pt: 0 }}>
                {peopleItems.map((item) => (
                  <NavListItem key={item.to} item={item} user={user} onClose={handleMobileDrawerClose} collapsed={isCollapsed} />
                ))}
              </List>
            </>
          )}

          {challengesItems.some((i) => canSee(user?.role, i.allowedRoles)) && (
            <>
              <SectionHeader label="CHALLENGES" collapsed={isCollapsed} />
              <List dense sx={{ pt: 0 }}>
                {challengesItems.map((item) => (
                  <NavListItem key={item.to} item={item} user={user} onClose={handleMobileDrawerClose} collapsed={isCollapsed} />
                ))}
              </List>
            </>
          )}

          {financeItems.some((i) => canSee(user?.role, i.allowedRoles)) && (
            <>
              <SectionHeader label="FINANCE" collapsed={isCollapsed} />
              <List dense sx={{ pt: 0 }}>
                {financeItems.map((item) => (
                  <NavListItem key={item.to} item={item} user={user} onClose={handleMobileDrawerClose} collapsed={isCollapsed} />
                ))}
              </List>
            </>
          )}
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
      {/* Desktop: in-flow sidebar (below navbar), collapsible */}
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
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>
            Menu
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
