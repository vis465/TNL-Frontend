import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  Tooltip,
  Fade,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  People,
  Event,
  AdminPanelSettings,
  Menu as MenuIcon,
  Close,
  Home,
  Work,
  ContactMail,
  Login,
  FireTruckOutlined,
  Brightness4,
  Brightness7,
  Dashboard,
  CalendarMonth,
  AccountBalanceWallet,
  GarageOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import { ThemeContext } from '../App';
import logo from '../img/tnllogo.jpg';
import { getMyWallet } from '../services/walletService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.92)'
    : 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(12px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 1px 0 0 rgba(255,255,255,0.08)'
    : '0 1px 0 0 rgba(0,0,0,0.06)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

const LogoBrand = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: 'inherit',
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '8px 14px',
  margin: '0 2px',
  textTransform: 'none',
  fontWeight: 500,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const hasStaffRole = user && ['admin', 'eventteam', 'hrteam', 'financeteam'].includes(user.role);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyWallet()
      .then((w) => setWalletBalance(w?.balance))
      .catch(() => {});
  }, [isAuthenticated]);

  const handleUserMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);
  const handleMobileDrawerToggle = () => setMobileDrawerOpen((o) => !o);
  const handleMobileDrawerClose = () => setMobileDrawerOpen(false);

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    handleMobileDrawerClose();
    navigate('/login');
  };

  const navItems = !isAuthenticated
    ? [
        { label: 'Home', path: '/', icon: <Home /> },
        { label: 'Our Team', path: '/team', icon: <People /> },
        { label: 'Events', path: '/events', icon: <Event /> },
        { label: 'Apply', path: '/apply', icon: <Work /> },
        { label: 'Servers', path: '/servers', icon: <FireTruckOutlined /> },
        { label: 'Contact', path: '/contact', icon: <ContactMail /> },
        { label: 'Login', path: '/login', icon: <Login /> },
      ]
    : [
        { label: 'Home', path: '/', icon: <Home /> },
        { label: 'Events', path: '/events', icon: <Event /> },
        { label: 'Servers', path: '/servers', icon: <FireTruckOutlined /> },
        { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        { label: 'Fleet', path: '/fleet', icon: <GarageOutlined /> },
        { label: 'Event calendar', path: '/calendar', icon: <CalendarMonth /> },
        ...(hasStaffRole ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> }] : []),
      ];

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mr: 2,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img src={logo} alt="TNL" style={{ width: 32, height: 32, borderRadius: 6 }} />
            <LogoBrand variant="h6" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Tamilnadu Logistics
            </LogoBrand>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
                size="small"
              >
                {item.label}
              </NavButton>
            ))}

           

            {isAuthenticated && (
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  sx={{ ml: 0.5 }}
                  aria-label="account menu"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Avatar
                    sx={{ width: 36, height: 36 }}
                    src={user?.riderId?.avatar}
                    alt={user?.name || user?.username}
                  >
                    {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Mobile: menu button only (drawer has nav + user) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton
              aria-label="open menu"
              onClick={handleMobileDrawerToggle}
              color="inherit"
              edge="end"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Desktop user dropdown */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        TransitionComponent={Fade}
        PaperProps={{ sx: { minWidth: 200, mt: 1.5 } }}
      >
        <MenuItem
          component={RouterLink}
          to="/dashboard"
          onClick={handleUserMenuClose}
          sx={{ gap: 1.5 }}
        >
          <AccountCircle fontSize="small" />
          Dashboard
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/fleet"
          onClick={handleUserMenuClose}
          sx={{ gap: 1.5 }}
        >
          <GarageOutlined fontSize="small" />
          Fleet
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
          <Logout fontSize="small" />
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile drawer */}
      <SwipeableDrawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        onOpen={() => setMobileDrawerOpen(true)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 300, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoBrand variant="h6">Menu</LogoBrand>
          <IconButton onClick={handleMobileDrawerClose} aria-label="close menu">
            <Close />
          </IconButton>
        </Box>
        <Divider />

        {isAuthenticated && (
          <>
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mx: 2, my: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48 }} src={user?.riderId?.avatar}>
                  {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || <AccountCircle />}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {user?.name || user?.username}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip label={user?.role} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                    {walletBalance != null && (
                      <Chip
                        icon={<AccountBalanceWallet sx={{ fontSize: 16 }} />}
                        label={walletBalance}
                        size="small"
                        variant="filled"
                        color="primary"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        <List dense sx={{ px: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={handleMobileDrawerClose}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <List dense sx={{ px: 1 }}>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }} color="error">
                  <ListItemIcon sx={{ minWidth: 40 }}><Logout /></ListItemIcon>
                  <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </SwipeableDrawer>
    </StyledAppBar>
  );
};

export default Navbar;
