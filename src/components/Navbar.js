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
} from '@mui/material';
import { 
  AccountCircle, 
  Dashboard, 
  DirectionsCar, 
  Logout, 
  PersonAdd,
  Speed,
  Notifications,
  FireTruckOutlined,
  Brightness4,
  Brightness7,
  EventIcon,
  Event,
  AdminPanelSettings,
  MenuIcon,
  Menu as MenuMui,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled, keyframes } from '@mui/material/styles';
import { ThemeContext } from '../App';
import logo from '../img/tnllogo.jpg';

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
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    handleMobileClose();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'eventteam';

  // Navigation items based on user role
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', path: '/admin', icon: <Dashboard /> },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined /> },
        { label: 'Contact', path: '/contact', icon: <Event /> },
      ];
    } else {
      return [
        { label: 'Our Team', path: '/team', icon: <PersonAdd /> },
        { label: 'Events', path: '/events', icon: <Event /> },
        { label: 'Apply', path: '/apply', icon: <Dashboard /> },
        { label: 'Server Status', path: '/servers', icon: <FireTruckOutlined /> },
        { label: 'Contact', path: '/contact', icon: <Event /> },
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
            
            {/* Theme Toggle */}
          
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
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="mobile-menu"
              aria-haspopup="true"
              onClick={handleMobileMenu}
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
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          {/* Mobile Menu */}
          <Menu
            id="mobile-menu"
            anchorEl={mobileMenuAnchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileClose}
            TransitionComponent={Fade}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          >
            {/* Navigation Items */}
            {navItems.map((item) => (
              <MenuItem 
                key={item.path}
                component={RouterLink} 
                to={item.path} 
                onClick={handleMobileClose}
              >
                {item.icon}
                <Typography sx={{ ml: 1 }}>{item.label}</Typography>
              </MenuItem>
            ))}
            
            {/* Theme Toggle */}
          
            
            {/* Authentication */}
            {isAuthenticated ? (
              <>
                <MenuItem onClick={handleMobileClose}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </>
            ) : (
              <MenuItem component={RouterLink} to="/login" onClick={handleMobileClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Login
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;