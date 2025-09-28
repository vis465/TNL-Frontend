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
  Container,
  Avatar,
  Tooltip,
  Fade,
  useMediaQuery,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import { 
  AccountCircle, 
  Dashboard, 
  DirectionsCar, 
  Logout, 
  PersonAdd,
  People as PeopleIcon,
  Speed,
  Notifications,
  FireTruckOutlined,
  EmojiEvents,
  Brightness4,
  Brightness7,
  Event,
  AdminPanelSettings,
  MenuIcon,
  Menu as MenuMui,
  Close,
  Home,
  Work,
  ContactMail,
  Login,
  AttachMoney,
} from '@mui/icons-material';
import EventIcon from '@mui/icons-material/Event';
import { useAuth } from '../contexts/AuthContext';
import { styled, keyframes } from '@mui/material/styles';
import { ThemeContext } from '../App';
import logo from '../img/tnllogo.jpg';
import { getMyWallet } from '../services/walletService';

// Animation keyframes
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgb(255, 255, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgb(255, 255, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(255, 255, 0, 0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const glow = keyframes`
  0% {
    text-shadow: 0 0 5px rgba(255, 255, 0, 0.5), 0 0 10px rgba(255, 255, 0, 0.3);
  }
  50% {
    text-shadow: 0 0 10px rgba(255, 255, 0, 0.5), 0 0 10px rgba(255, 255, 0, 0.3);
  }
  100% {
    text-shadow: 0 0 5px rgba(255, 255, 0, 0.5), 0 0 10px rgba(255, 255, 0, 0.3);
  }
`;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 30, 0.9)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 30px rgba(0, 0, 0, 0.3)'
    : '0 4px 30px rgba(0, 0, 0, 0.1)',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'}`,
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
  textShadow: theme.palette.mode === 'dark' 
    ? '0 0 10px rgba(255, 255, 255, 0.3)' 
    : '0 0 10px rgba(0, 0, 0, 0.1)',
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '6px 16px',
  margin: '0 5px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 15px rgba(255, 255, 255, 0.1)'
      : '0 4px 15px rgba(0, 0, 0, 0.1)',
    '&:before': {
      opacity: 0.1,
    },
  },
}));

const AnimatedIcon = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${float} 3s ease-in-out infinite`,
}));

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [walletBalance, setWalletBalance] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getMyWallet().then(w => setWalletBalance(w.balance)).catch(() => {});
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    handleMobileClose();
    handleMobileDrawerClose();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isEventTeam = user?.role === 'eventteam' || isAdmin;
  const isHR = user?.role === 'hrteam' || isAdmin;

  // Navigation items based on user role and authentication status
  const getNavItems = () => {
    // If user is not authenticated, show public navigation
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/', icon: <Home />, shortLabel: 'Home' },
        { label: 'Our Team', path: '/team', icon: <PersonAdd />, shortLabel: 'Team' },
        { label: 'Events', path: '/events', icon: <Event />, shortLabel: 'Events' },
        { label: 'Apply', path: '/apply', icon: <Work />, shortLabel: 'Apply' },
        { label: 'VTC Jobs', path: '/jobs', icon: <Speed />, shortLabel: 'Jobs' },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined />, shortLabel: 'Servers' },
        { label: 'Contact', path: '/contact', icon: <ContactMail />, shortLabel: 'Contact' },
        { label: 'Login', path: '/login', icon: <Login />, shortLabel: 'Login' },
      ];
    }

    // For authenticated users, show role-based navigation
    if (isAdmin) {
      return [
        { label: 'Admin', path: '/admin', icon: <Dashboard />, shortLabel: 'Admin' },
        { label: 'Users', path: '/admin/users', icon: <PeopleIcon />, shortLabel: 'Users' },
        { label: 'VTC Jobs', path: '/jobs', icon: <Speed />, shortLabel: 'Jobs' },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined />, shortLabel: 'Servers' },
        { label: 'Events', path: '/events', icon: <Event />, shortLabel: 'Events' },
      ];
    } else if (isEventTeam) {
      return [
        { label: 'Admin', path: '/admin', icon: <Dashboard />, shortLabel: 'Admin' },
        { label: 'VTC Jobs', path: '/jobs', icon: <Speed />, shortLabel: 'Jobs' },
        { label: 'Events', path: '/events', icon: <Event />, shortLabel: 'Events' },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined />, shortLabel: 'Servers' },
      ];
    } else if (isHR) {
      return [
        { label: 'Admin', path: '/admin', icon: <Dashboard />, shortLabel: 'Admin' },
        { label: 'Events', path: '/events', icon: <Event />, shortLabel: 'Events' },
        { label: 'VTC Jobs', path: '/jobs', icon: <Speed />, shortLabel: 'Jobs' },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined />, shortLabel: 'Servers' },
      ];
    } else {
      // For authenticated regular users (riders)
      return [
        { label: 'Home', path: '/', icon: <Home />, shortLabel: 'Home' },
        { label: 'Our Team', path: '/team', icon: <PersonAdd />, shortLabel: 'Team' },
        { label: 'Events', path: '/events', icon: <Event />, shortLabel: 'Events' },
        { label: 'VTC Jobs', path: '/jobs', icon: <Speed />, shortLabel: 'Jobs' },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined />, shortLabel: 'Servers' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <StyledAppBar 
      position="fixed" 
      elevation={scrolled ? 4 : 0}
      sx={{
        background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <AnimatedIcon sx={{ mr: 2 }}>
            <img src={logo} alt="logo" style={{ width: '28px', height: '28px' }} />
          </AnimatedIcon>
          
          {/* Logo Text */}
          <LogoText
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Tamilnadu Logistics
          </LogoText>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
              >
                {item.label}
              </NavButton>
            ))}
            {walletBalance != null && (
              <NavButton component={RouterLink} to="/contracts/me">
                <AttachMoney sx={{ mr: 1 }} />
                {walletBalance}
              </NavButton>
            )}
            
            {/* User Menu for Desktop */}
            {isAuthenticated && (
              <Tooltip title="Account">
                <IconButton
                  onClick={handleMenu}
                  sx={{ ml: 1 }}
                  size="large"
                  aria-label="account of current user"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.name?.[0]?.toUpperCase() || <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            {walletBalance != null && (
              <Badge badgeContent={walletBalance} color="primary" sx={{ mr: 1 }}>
                <AttachMoney color="inherit" />
              </Badge>
            )}
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleMobileDrawerToggle}
              color="inherit"
            >
              <MenuMui />
            </IconButton>
          </Box>

          {/* Desktop User Menu */}
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            TransitionComponent={Fade}
          >
            <MenuItem onClick={handleClose}>
            <RouterLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </RouterLink>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          {/* Mobile Drawer */}
          <SwipeableDrawer
            anchor="right"
            open={mobileDrawerOpen}
            onClose={handleMobileDrawerClose}
            onOpen={handleMobileDrawerToggle}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
              },
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>
                Menu
              </Typography>
              <IconButton onClick={handleMobileDrawerClose}>
                <Close />
              </IconButton>
            </Box>
            <Divider />
            
            {/* User Info */}
            {isAuthenticated && (
              <>
                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {user?.name?.[0]?.toUpperCase() || <AccountCircle />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name || user?.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
              </>
            )}

            {/* Navigation Items */}
            <List>
              {navItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton 
                    component={RouterLink} 
                    to={item.path} 
                    onClick={handleMobileDrawerClose}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              
              {/* Wallet Balance */}
              {walletBalance != null && (
                <ListItem disablePadding>
                  <ListItemButton 
                    component={RouterLink} 
                    to="/contracts/me" 
                    onClick={handleMobileDrawerClose}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Tokens: ${walletBalance}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
            
            <Divider />
            
            {/* Authentication - Only show for authenticated users */}
            {isAuthenticated && (
              <List>
                <ListItem disablePadding>
                  <ListItemButton 
                    component={RouterLink} 
                    to="/dashboard" 
                    onClick={handleMobileDrawerClose}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <AccountCircle />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Profile"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <Logout />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Logout"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            )}
          </SwipeableDrawer>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;