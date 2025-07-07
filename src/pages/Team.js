import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

// Styled components
const TeamMemberCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const RoleBadge = styled(Chip)(({ theme, rolecolor }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: rolecolor || theme.palette.primary.main,
  color: '#ffffff',
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
}));

const MemberDetailsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
  },
}));

const MemberAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Team = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vtcData, setVtcData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const VTC_ID = '70030';

  useEffect(() => {
    const fetchVtcData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/vtc/${VTC_ID}`);
        console.log('Processed VTC data:', response.data);
        setVtcData(response.data);
      } catch (error) {
        console.error('Error fetching VTC data:', error);
        setError(error.response?.data?.error || 'Failed to fetch team data');
      } finally {
        setLoading(false);
      }
    };

    fetchVtcData();
  }, [VTC_ID]);

  const getRoleColor = (roleName) => {
    const roleColors = {
      'Founder': '#ff0000',
      'Chief Executive Officer': '#ff0000',
      'HR Manager': '#2196f3',
      'Rider': '#4caf50',
      // Add more role colors as needed
    };
    return roleColors[roleName] || '#757575';
  };

  const handleMemberClick = async (member) => {
    setSelectedMember(member);
    setLoadingDetails(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/vtc/${VTC_ID}/member/${member.id}`);
      setMemberDetails(response.data);
    } catch (error) {
      console.error('Error fetching member details:', error);
      setError('Failed to load member details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedMember(null);
    setMemberDetails(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading team data...
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

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Our Team
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Meet the dedicated members of TAMILNADU LOGISTICS
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Total Members: {vtcData.totalMembers} • Total Roles: {vtcData.totalRoles}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Last updated: {new Date(vtcData.lastUpdated).toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {Object.entries(vtcData.departments).map(([department, members]) => (
        <Box key={department} sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
            {department}
            <Chip
              label={`${members.length} members`}
              size="small"
              sx={{
                ml: 2,
                backgroundColor: getRoleColor(department),
                color: '#ffffff',
                '& .MuiChip-label': {
                  color: '#ffffff',
                }
              }}
            />
          </Typography>
          <Grid container spacing={3}>
            {members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <TeamMemberCard 
                  elevation={3}
                  onClick={() => handleMemberClick(member)}
                  sx={{ cursor: 'pointer' }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {member.username}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {member.roles.map((role) => (
                        <RoleBadge
                          key={role.id}
                          label={role.name}
                          rolecolor={role.color || getRoleColor(role.name)}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="TruckersMP Profile">
                        <IconButton
                          href={`https://truckersmp.com/user/${member.userId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LocalShippingIcon />
                        </IconButton>
                      </Tooltip>
                      {member.discord && (
                        <Tooltip title="Discord Profile">
                          <IconButton
                            href={`https://discord.com/users/${member.discord}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src="/discord-icon.png"
                              alt="Discord"
                              style={{ width: 24, height: 24 }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </TeamMemberCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Member Details Dialog */}
      <MemberDetailsDialog
        open={Boolean(selectedMember)}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {loadingDetails ? (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </DialogContent>
        ) : memberDetails && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <MemberAvatar
                src={`https://truckersmp.com/avatar/${selectedMember.steamId64}`}
                alt={selectedMember.username}
              />
              <Typography variant="h5" component="div" gutterBottom>
                {selectedMember.username}
              </Typography>
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
            <DialogContent dividers>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="User ID"
                    secondary={selectedMember.userId}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Join Date"
                    secondary={formatDate(selectedMember.joinDate)}
                  />
                </ListItem>
                {memberDetails.lastSeen && (
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Seen"
                      secondary={formatDate(memberDetails.lastSeen)}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <LocalShippingIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Steam ID"
                    secondary={selectedMember.steamId64}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                href={`https://truckersmp.com/user/${selectedMember.userId}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LocalShippingIcon />}
              >
                View TruckersMP Profile
              </Button>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </MemberDetailsDialog>
    </Container>
  );
};

export default Team; 