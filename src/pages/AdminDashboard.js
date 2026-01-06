import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
  Typography,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  MenuIcon,
} from '@mui/material';
import {
  EmojiEvents,
  Directions,
  People,
  Analytics,
  SettingsIcon,
  Assignment,
  Timeline,
  Assessment,
  Menu as MenuMui,
} from '@mui/icons-material';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const managementCards = [
    {
      title: 'Event Management',
      description: 'Manage events, slots, bookings, and special events. Create and organize trucking events for the community.',
      icon: <EmojiEvents sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary',
      href: '/admin/events',
      features: ['Event Management', 'Booking Requests', 'Special Events', 'Analytics'],
      allowedRoles: ['admin', 'eventteam']
    },
    {
      title: 'Challenge Management',
      description: 'Create and manage driving challenges. Track driver progress, leaderboards, and challenge completion.',
      icon: <Directions sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      href: '/admin/challenges',
      features: ['Create Challenges', 'Track Progress', 'View Leaderboards', 'Manage Rewards'],
      allowedRoles: ['admin', 'eventteam', 'hrteam', 'financeteam']
    },
    {
      title: 'Contracts',
      description: 'Create story-like contract templates with tasks and constraints.',
      icon: <Assignment sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      href: '/admin/contracts',
      features: ['Templates', 'Tasks', 'Constraints', 'Deadlines'],
      allowedRoles: ['admin', 'hrteam','financeteam']
    },
    {
      title: 'Attendance Management',
      description: 'Manage member attendance, track participation, and generate attendance reports for events.',
      icon: <People sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success',
      href: '/admin/attendance',
      features: ['Member Attendance', 'Event Participation', 'Attendance Reports', 'Member Management'],
      allowedRoles: ['admin', 'hrteam']
    },
    {
      title: 'Job Management',
      description: 'Browse, filter and manage all imported jobs from TruckersHub.',
      icon: <Assignment sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning',
      href: '/admin/jobs',
      features: ['Browse Jobs', 'Filter by Status', 'Clean up old data'],
      allowedRoles: ['admin', 'hrteam']
    },
    {
      title: 'System Analytics',
      description: 'View comprehensive analytics and reports for events, challenges, attendance, and user engagement.',
      icon: <Analytics sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info',
      href: '/admin/analytics',
      features: ['Event Analytics', 'Challenge Statistics', 'Attendance Reports', 'User Engagement'],
      allowedRoles: ['admin']
    },
    {
      title: 'Bank',
      description: 'View central bank balance, transactions, and pay bonuses to riders from the bank.',
      icon: <Assessment sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success',
      href: '/admin/bank',
      features: ['Bank Balance', 'Transactions', 'Payout Bonuses'],
      allowedRoles: ['admin','financeteam']
    },
    {
      title: 'Achievement Management',
      description: 'Issue and manage achievements for riders. Create custom achievements with logos and descriptions.',
      icon: <EmojiEvents sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning',
      href: '/admin/achievements',
      features: ['Issue Achievements', 'Manage Awards', 'Track Recognition', 'Custom Badges'],
      allowedRoles: ['admin', 'hrteam']
    },
    {
      title: 'User Approvals',
      description: 'Review and approve pending user registrations. Approve or reject new user accounts.',
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary',
      href: '/admin/user-approvals',
      features: ['Pending Approvals', 'Approve Users', 'Reject Users', 'Email Notifications'],
      allowedRoles: ['admin', 'hrteam']
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar 
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={handleMobileDrawerClose}
        user={user}
      />

      <Box sx={{ flex: 1 }}>
        {/* Mobile Header */}
        {isMobile && (
          <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuMui />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Admin Dashboard
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Container maxWidth="xl" sx={{
          px: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 8, sm: 9 },
          pb: 3
        }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Choose what you want to manage
          </Typography>
        </Box>
        {user && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Welcome back,
            </Typography>
            <Typography variant="h6" color="primary">
              {user.username}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Management Cards with RBAC gating */}
      <Grid container spacing={3}>
        {managementCards
          .filter(card => !user || (card.allowedRoles || []).includes(user.role))
          .map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    {card.icon}
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        ml: 2,
                        fontWeight: 'bold',
                        color: `${card.color}.main`
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 2 }}
                  >
                    {card.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Features:
                    </Typography>
                    {card.features.map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: `${card.color}.main`,
                            mr: 1
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    color={card.color}
                    fullWidth
                    size="large"
                    href={card.href}
                    disabled={user ? !(card.allowedRoles || []).includes(user.role) : true}
                    sx={{
                      fontWeight: 'bold',
                      py: 1.5
                    }}
                  >
                    Manage {card.title.split(' ')[0]}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Quick Stats or Additional Info */}

        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 