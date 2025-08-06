import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  alpha,
  styled,
  useMediaQuery,
  Stack,
  Fade,
  Zoom,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// Enhanced styled components inspired by Landing.js
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f1419 0%, #1e293b 50%, #334155 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '100%',
    height: '60px',
    background: theme.palette.background.default,
    clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'visible',
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: theme.shadows[15],
    '& .card-content': {
      transform: 'translateY(-8px)',
    },
    '& .card-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: theme.palette.primary.main,
    },
    '& .member-avatar': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[12],
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.spacing(2),
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const RoleBadge = styled(Chip)(({ theme, rolecolor }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: rolecolor || theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.75rem',
  '& .MuiChip-label': {
    color: '#ffffff',
  },
  '& .MuiChip-icon': {
    color: '#ffffff',
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const MemberDetailsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    maxWidth: 800,
    width: '100%',
    overflow: 'hidden',
  },
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: 140,
  height: 140,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  border: `4px solid ${theme.palette.primary.main}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[12],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(8),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '2px',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const VTC_ID = '70030'; // Tamil Nadu Logistics VTC ID

const Team = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vtcData, setVtcData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchVtcData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/vtc/${VTC_ID}`);
        
        setVtcData(response.data);

      } catch (error) {
        console.error('Error fetching VTC data:', error);
        console.error('Error response:', error.response?.data);
        setError(error.response?.data?.error || 'Failed to fetch team data');
      } finally {
        setLoading(false);
      }
    };

    fetchVtcData();
  }, []);

  const getRoleColor = (roleName) => {
    const roleColors = {
      'Founder': '#ff0000',
      'Chief Executive Officer': '#ff0000',
      'HR Manager': '#2196f3',
      'Rider': '#4caf50',
      'Manager': '#ff9800',
      'Admin': '#9c27b0',
      'Moderator': '#f44336',
      'Member': '#757575',
      'Owner': '#ff0000',
      'Co-Owner': '#ff6b35',
      'Manager': '#ff9800',
      'Supervisor': '#ffc107',
      'Driver': '#4caf50',
      'Trainee': '#607d8b',
      // Add more role colors as needed
    };
    return roleColors[roleName] || '#757575';
  };

  const handleMemberClick = async (member) => {
    setSelectedMember(member);
    setLoadingDetails(true);
    try {
      
      
      const response = await axios.get(`${API_BASE_URL}/vtc/player/${member.userId}`);
      
      setPlayerDetails(response.data);
    } catch (error) {
      console.error('Error fetching player details:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load player details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedMember(null);
    setPlayerDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" color="text.secondary">
          Loading our amazing team...
        </Typography>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!vtcData) {
    return null;
  }

  // --- FIXED LOGIC: Use the 'order' field from roles array for proper ordering ---
  // 1. Flatten all members into a single array
  const allMembers = Object.values(vtcData.departments).flat();

  // 2. Create a map of role names to their order values
  const roleOrderMap = new Map();
  allMembers.forEach(member => {
    if (member.roles && member.roles.length > 0) {
      // Use the first role's order value (primary role)
      const primaryRole = member.roles[0];
      if (!roleOrderMap.has(primaryRole.name)) {
        roleOrderMap.set(primaryRole.name, primaryRole.order);
      }
    }
  });

  // 3. Group members by their primary role
  const roleToMembers = {};
  allMembers.forEach(member => {
    const primaryRole = member.roles && member.roles.length > 0 ? member.roles[0].name : 'Other';
    if (!roleToMembers[primaryRole]) {
      roleToMembers[primaryRole] = [];
    }
    roleToMembers[primaryRole].push(member);
  });

  // 4. Sort roles by their order value (Founder=0, CEO=1, etc.)
  const sortedRoles = Array.from(roleOrderMap.entries())
    .sort(([, orderA], [, orderB]) => orderA - orderB)
    .map(([roleName]) => roleName);

  // 5. Create sortedDepartments array based on proper role order
  const sortedDepartments = sortedRoles.map(role => [role, roleToMembers[role]]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 12 }}>
          <Box textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #bfdbfe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Meet Our Team
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem', lg: '2rem' },
                  color: '#bfdbfe',
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  mb: 4,
                }}
              >
                The dedicated professionals behind TAMILNADU LOGISTICS
              </Typography>
            </motion.div>

            {/* Stats */}
            <Grid container spacing={4} sx={{ mt: 6 }}>
              {[
                { icon: <GroupsIcon />, value: vtcData.totalMembers, label: 'Team Members' },
                { icon: <EmojiEventsIcon />, value: vtcData.totalRoles, label: 'Roles' },
                { icon: <StarIcon />, value: '24/7', label: 'Support' },
                { icon: <LocalShippingIcon />, value: '100%', label: 'Professional' },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <StatsCard elevation={3}>
                      <Box sx={{ color: 'yellow', mb: 2 }}>
                        {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bfdbfe' }}>
                        {stat.label}
                      </Typography>
                    </StatsCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </HeroSection>

      {/* Team Members Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle variant="h2" component="h2" align="center" sx={{ mb: 8 }}>
            Our Leadership & Team
          </SectionTitle>
        </motion.div>

        {sortedDepartments.map(([department, members], deptIndex) => (
          <Box key={department} sx={{ mb: 8 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: deptIndex * 0.1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
                <Typography 
                  variant="h3" 
                  component="h3" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mr: 2,
                    mb: { xs: 2, md: 0 }
                  }}
                >
                  {department}
                </Typography>
                <Chip
                  label={`${members.length} member${members.length !== 1 ? 's' : ''}`}
                  size="medium"
                  sx={{
                    backgroundColor: getRoleColor(department),
                    color: '#ffffff',
                    fontWeight: 600,
                    '& .MuiChip-label': {
                      color: '#ffffff',
                    }
                  }}
                />
              </Box>
            </motion.div>

            <Grid container spacing={3}>
              {members.map((member, memberIndex) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (deptIndex * 0.1) + (memberIndex * 0.05) }}
                  >
                    <StyledCard elevation={6}>
                      <CardContent 
                        className="card-content"
                        sx={{
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          transition: 'transform 0.3s ease',
                        }}
                        onClick={() => handleMemberClick(member)}
                      >
                        
                        
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {member.username}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          ID: {member.userId}
                        </Typography>

                        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                          {member.roles.map((role) => (
                            <RoleBadge
                              key={role.id}
                              label={role.name}
                              rolecolor={role.color || getRoleColor(role.name)}
                              size="small"
                            />
                          ))}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                          <Tooltip title="TruckersMP Profile">
                            <IconButton
                              href={`https://truckersmp.com/user/${member.userId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  transform: 'scale(1.1)',
                                }
                              }}
                            >
                              <LocalShippingIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Steam Profile">
                            <IconButton
                              href={`https://steamcommunity.com/profiles/${member.steamId64}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              sx={{ 
                                color: 'secondary.main',
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  transform: 'scale(1.1)',
                                }
                              }}
                            >
                              <PersonIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Container>

      {/* Player Details Dialog */}
      <MemberDetailsDialog
        open={Boolean(selectedMember)}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        {loadingDetails ? (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading player details...
              </Typography>
            </Box>
          </DialogContent>
        ) : playerDetails && selectedMember && (
          <>
            <DialogTitle sx={{ 
              textAlign: 'center', 
              pb: 1,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              position: 'relative'
            }}>
              <IconButton
                onClick={handleCloseDetails}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'text.secondary',
                }}
              >
                <CloseIcon />
              </IconButton>
              {/* Large player name header */}
              <Typography
                variant="h2"
                component="div"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem', lg: '4rem' },
                  textAlign: 'center',
                  mt: 4,
                  mb: 2,
                  letterSpacing: 1,
                  lineHeight: 1.1,
                  color: 'primary.main',
                  textShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                {selectedMember.username}
              </Typography>
              {/* <MemberAvatar
                src={`https://truckersmp.com/avatar/${selectedMember.steamId64}`}
                alt={selectedMember.username}
              /> */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                {selectedMember.roles.map((role) => (
                  <RoleBadge
                    key={role.id}
                    label={role.name}
                    rolecolor={role.color || getRoleColor(role.name)}
                    size="small"
                  />
                ))}
              </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="User ID"
                        secondary={selectedMember.userId}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarTodayIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Join Date"
                        secondary={formatDate(selectedMember.joinDate)}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocalShippingIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Steam ID"
                        secondary={selectedMember.steamId64}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {/* Player Statistics */}
              

                {/* Additional Details */}
                {playerDetails.last_seen && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Activity
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Last Seen"
                          secondary={formatDate(playerDetails.last_seen)}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button
                href={`https://truckersmp.com/user/${selectedMember.userId}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LocalShippingIcon />}
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
                  }
                }}
              >
                View TruckersMP Profile
              </Button>
              <Button
                href={`https://steamcommunity.com/profiles/${selectedMember.steamId64}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<PersonIcon />}
                variant="outlined"
                sx={{ 
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                View Steam Profile
              </Button>
              <Button 
                onClick={handleCloseDetails}
                variant="text"
                color="inherit"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </MemberDetailsDialog>
    </Box>
  );
};

export default Team; 