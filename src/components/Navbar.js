import React, { useState, useEffect } from 'react';
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
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled, keyframes } from '@mui/material/styles';

// Animation keyframes
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
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
    text-shadow: 0 0 5px rgba(0, 123, 255, 0.5), 0 0 10px rgba(0, 123, 255, 0.3);
  }
  50% {
    text-shadow: 0 0 10px rgba(0, 123, 255, 0.8), 0 0 20px rgba(0, 123, 255, 0.5);
  }
  100% {
    text-shadow: 0 0 5px rgba(0, 123, 255, 0.5), 0 0 10px rgba(0, 123, 255, 0.3);
  }
`;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(18, 18, 18, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 700,
  letterSpacing: '0.05em',
  animation: `${glow} 3s infinite`,
  background: 'linear-gradient(45deg, #00b4d8, #0077b6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 10px rgba(0, 180, 216, 0.5)',
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '6px 16px',
  margin: '0 5px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(45deg, #00b4d8, #0077b6)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0, 180, 216, 0.4)',
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
        background: scrolled 
          ? 'rgba(18, 18, 18, 0.9)' 
          : 'rgba(18, 18, 18, 0.7)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AnimatedIcon sx={{ mr: 2 }}>
            <DirectionsCar sx={{ fontSize: 28, color: '#00b4d8' }} />
          </AnimatedIcon>
          
          <LogoText
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            VTC Convoy Booking
          </LogoText>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                {user.role === 'admin' && (
                  <Tooltip title="Admin Dashboard" arrow TransitionComponent={Fade}>
                    <NavButton
                      color="inherit"
                      component={RouterLink}
                      to="/admin"
                      startIcon={<Dashboard />}
                    >
                      Admin
                    </NavButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Notifications" arrow TransitionComponent={Fade}>
                  <IconButton
                    size="large"
                    color="inherit"
                    sx={{ mx: 1 }}
                  >
                    <Badge badgeContent={3} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
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
                      background: 'rgba(18, 18, 18, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                      '& .MuiMenuItem-root': {
                        borderRadius: '8px',
                        mx: 1,
                        my: 0.5,
                        '&:hover': {
                          background: 'rgba(0, 180, 216, 0.1)',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem onClick={handleClose} sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountCircle sx={{ mr: 2, color: '#00b4d8' }} />
                    <Typography variant="body1">{user.username}</Typography>
                  </MenuItem>
                  
                  <MenuItem onClick={() => { navigate('/register'); handleClose(); }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonAdd sx={{ mr: 2, color: '#00b4d8' }} />
                    <Typography variant="body1">Register new admin</Typography>
                  </MenuItem>
                  
                  <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Logout sx={{ mr: 2, color: '#00b4d8' }} />
                    <Typography variant="body1">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <NavButton
                  color="inherit"
                  component={RouterLink}
                  to="/attending-events"
                  startIcon={<Event />}
                >
                  Attending Events
                </NavButton>
                
                <NavButton
                  color="inherit"
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