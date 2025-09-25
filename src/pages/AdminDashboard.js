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
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
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

  const managementCards = [
    {
      title: 'Event Management',
      description: 'Manage events, slots, bookings, and special events. Create and organize trucking events for the community.',
      icon: <EmojiEvents sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary',
      href: '/admin/events',
      features: ['Event Management', 'Booking Requests', 'Special Events', 'Analytics']
    },
    {
      title: 'Challenge Management',
      description: 'Create and manage driving challenges. Track driver progress, leaderboards, and challenge completion.',
      icon: <Directions sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      href: '/admin/challenges',
      features: ['Create Challenges', 'Track Progress', 'View Leaderboards', 'Manage Rewards']
    },
    {
      title: 'Attendance Management',
      description: 'Manage member attendance, track participation, and generate attendance reports for events.',
      icon: <People sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success',
      href: '/admin/attendance',
      features: ['Member Attendance', 'Event Participation', 'Attendance Reports', 'Member Management']
    },
    {
      title: 'Job Management',
      description: 'Browse, filter and manage all imported jobs from TruckersHub.',
      icon: <Assignment sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning',
      href: '/admin/jobs',
      features: ['Browse Jobs', 'Filter by Status', 'Clean up old data']
    },
    {
      title: 'System Analytics',
      description: 'View comprehensive analytics and reports for events, challenges, attendance, and user engagement.',
      icon: <Analytics sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info',
      href: '/admin/analytics',
      features: ['Event Analytics', 'Challenge Statistics', 'Attendance Reports', 'User Engagement']
    }
  ];

  return (
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

      {/* Management Cards */}
      <Grid container spacing={3}>
        {managementCards.map((card, index) => (
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
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Access
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Events</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all events
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 30, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">Challenges</Typography>
              <Typography variant="body2" color="text.secondary">
                Track driver progress
            </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <People sx={{ fontSize: 30, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Attendance</Typography>
              <Typography variant="body2" color="text.secondary">
                Member participation
          </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 30, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">Analytics</Typography>
              <Typography variant="body2" color="text.secondary">
                View reports
            </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 