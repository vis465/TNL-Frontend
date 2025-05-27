import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  TablePagination,
  Tooltip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardMedia,
  CardActionArea
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  PersonOff as InactiveIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  Gavel as BanIcon,
  Info as InfoIcon,
  MilitaryTech,
  EmojiEvents
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';

function MembersInfoDashboard() {
  const theme = useTheme();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [memberBans, setMemberBans] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    fetchMembersInfo();
  }, []);

  const fetchMembersInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching members info from backend...');
      const response = await axiosInstance.get('/membersinfo/baninfo');
      const data = response.data.data;
      
      console.log('Received data from backend:', {
        hasRoles: !!data.roles,
        rolesCount: data.roles?.length || 0,
        hasMembers: !!data.members,
        membersCount: data.members?.length || 0,
        firstMember: data.members?.[0]
      });
      
      const transformedMembers = data.members.map(member => ({
        id: member.user_id,
        username: member.username,
        
        status: member.status === 1 ? 'active' : 'inactive',
        joinDate: member.joinDate,
        lastActive: member.lastSeen,
        avatar: member.avatar || null,
        role: member.roleName || 'Member',
        roleId: member.role
      }));
      console.log("transformedMembers",transformedMembers);
      setMembers(transformedMembers);
    } catch (err) {
      console.error('Error in fetchMembersInfo:', err);
      setError(err.message || 'Failed to fetch members information. Please try again later.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member?.id?.toString().includes(searchTerm)
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'banned': return 'error';
      case 'suspended': return 'warning';
      case 'member': return 'info';
      case 'admin': return 'secondary';
      case 'owner': return 'primary';
      case 'manager': return 'warning';
      case 'recruiter': return 'info';
      default: return 'default';
    }
  };

  const handleMemberClick = async (member) => {
    setSelectedMember(member);
    setDetailsLoading(true);
    setDetailsError(null);
    console.log("invokign player for",member);
    try {
      const [playerResponse, bansResponse] = await Promise.all([
        axiosInstance.get(`/membersinfo/player/${member.id}`),
        axiosInstance.get(`/membersinfo/bans/${member.id}`)
      ]);
      
      setMemberDetails(playerResponse.data);
      setMemberBans(bansResponse.data);
      console.log("memberDetails",memberDetails);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setDetailsError('Failed to fetch member details. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedMember(null);
    setMemberDetails(null);
    setMemberBans(null);
    setDetailsError(null);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          VTC Members Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all VTC member information
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Members
                  </Typography>
                  <Typography variant="h5" component="div">
                    {members.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

       
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <AdminIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Staff Members
                  </Typography>
                  <Typography variant="h5" component="div">
                    {members.filter(m => m.role.toLowerCase() !='rider' && m.role.toLowerCase() !='passanger').length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <InactiveIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Regular Members
                  </Typography>
                  <Typography variant="h5" component="div">
                    {members.filter(m => m?.role?.toLowerCase() === 'rider' || m.role.toLowerCase() === 'passanger').length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Refresh */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search members by username, display name, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchMembersInfo} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Members Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Join Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((member) => (
                  <TableRow 
                    key={member.id} 
                    hover 
                    onClick={() => handleMemberClick(member)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{member.id}</TableCell>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        color={getStatusColor(member.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarIcon fontSize="small" color="action" />
                        {formatDate(member.joinDate)}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Member Details Dialog */}
      <Dialog 
        open={!!selectedMember} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedMember && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={selectedMember.avatar}>
                  <PersonIcon />
                  {/* <img src={selectedMember.avatar} alt="avatar" /> */}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.displayName}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    @{selectedMember.username}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : detailsError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {detailsError}
                </Alert>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {/* Player Information */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Player Information
                          </Typography>
                          <img src={memberDetails.avatar} alt="avatar" />
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <InfoIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Player ID" 
                                secondary={memberDetails?.id || 'N/A'} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <CalendarIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Join Date" 
                                secondary={formatDate(memberDetails?.joinDate)} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <AccessTimeIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Last Seen" 
                                secondary={formatDate(memberDetails?.lastSeen)} 
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Ban Information */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Ban History
                          </Typography>
                          {memberBans?.length > 0 ? (
                            <List>
                              {memberBans.map((ban, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <BanIcon color="error" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`Ban #${index + 1}`}
                                    secondary={
                                      <>
                                        <Typography variant="body2">
                                          Reason: {ban.reason}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatDate(ban.expires)} - {ban.active ? 'Active' : 'Expired'}
                                        </Typography>
                                      </>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography color="text.secondary" align="center">
                              No ban history found
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Achievements and Awards Section */}
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Achievements */}
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MilitaryTech color="primary" />
                            Achievements
                          </Typography>
                          {memberDetails?.achievements?.length > 0 ? (
                            <Grid container spacing={2}>
                              {memberDetails.achievements.map((achievement) => (
                                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                                  <Card variant="outlined">
                                    <CardActionArea>
                                      <CardMedia
                                        component="img"
                                        height="140"
                                        image={achievement.image_url}
                                        alt={achievement.title}
                                        sx={{ objectFit: 'contain', p: 1 }}
                                      />
                                      <CardContent>
                                        <Typography variant="subtitle1" component="div" noWrap>
                                          {achievement.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          {achievement.description}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Achieved: {formatDate(achievement.achieved_at)}
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography color="text.secondary" align="center">
                              No achievements found
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Awards */}
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmojiEvents color="secondary" />
                            Awards
                          </Typography>
                          {memberDetails?.awards?.length > 0 ? (
                            <Grid container spacing={2}>
                              {memberDetails.awards.map((award) => (
                                <Grid item xs={12} sm={6} md={4} key={award.id}>
                                  <Card variant="outlined">
                                    <CardActionArea>
                                      <CardMedia
                                        component="img"
                                        height="140"
                                        image={award.image_url}
                                        alt={award.name}
                                        sx={{ objectFit: 'contain', p: 1 }}
                                      />
                                      <CardContent>
                                        <Typography variant="subtitle1" component="div" noWrap>
                                          {award.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Awarded: {formatDate(award.awarded_at)}
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography color="text.secondary" align="center">
                              No awards found
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          VTC Members Dashboard - Last updated: {format(new Date(), 'PPpp')}
        </Typography>
      </Box>
    </Container>
  );
}

export default MembersInfoDashboard;