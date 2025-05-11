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
  alpha,
  Container,
  Badge,
  Avatar,
  Tooltip,
  Fade,
} from '@mui/material';
import { 
  AccountCircle, 
  Dashboard, 
  DirectionsCar, 
  Event, 
  Logout, 
  PersonAdd,
  Speed,
  Notifications,
  FireTruckOutlined,
  Brightness4,
  Brightness7
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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

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
          <AnimatedIcon sx={{ mr: 2 }}>
            <img src={logo} alt="logo" style={{ width: '28px', height: '28px' }} />
          </AnimatedIcon>
          
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
            TNL Convoy Booking
          </LogoText>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {(user.role === 'admin' || user.role === 'eventteam') && (
                  <Tooltip title="Admin Dashboard" arrow TransitionComponent={Fade}>
                    <NavButton
                      color="primary"
                      component={RouterLink}
                      to="/admin"
                      startIcon={<Dashboard />}
                    >
                      Dashboard
                    </NavButton>
                  </Tooltip>
                )}
                
               
                
                <Tooltip title="Account" arrow TransitionComponent={Fade}>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                    sx={{ 
                      ml: 1,
                      '&:hover': {
                        animation: `${pulse} 1.5s infinite`,
                      }
                    }}
                  >
                    <Avatar 
                      alt={user.username} 
                      src="/static/images/avatar/1.jpg"
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: '2px solid #00b4d8',
                      }}
                    />
                  </IconButton>
                </Tooltip>
                
                <Menu
                  id="menu-appbar"
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
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(30, 30, 30, 0.9)' 
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 30px rgba(0, 0, 0, 0.3)'
                        : '0 4px 30px rgba(0, 0, 0, 0.1)',
                      '& .MuiMenuItem-root': {
                        borderRadius: '8px',
                        mx: 1,
                        my: 0.5,
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                      },
                    },
                  }}
                >
                  <MenuItem onClick={handleClose} sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountCircle sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>{user.username}</Typography>
                  </MenuItem>
                  
                  {user.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/register'); handleClose(); }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonAdd sx={{ mr: 2, color: theme.palette.primary.main }} />
                      <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Register new admin</Typography>
                  </MenuItem>
                  )}
                  
                  <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Logout sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000' }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <NavButton
                  component={RouterLink}
                  to="/attending-events"
                  startIcon={<Event />}
                >
                  Attending Events
                </NavButton>
                
                <NavButton
                  component={RouterLink}
                  to="/servers"
                  startIcon={<Speed />}
                >
                  Server Status
                </NavButton>
              </>
            )}
          </Box>
          
          
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar; 