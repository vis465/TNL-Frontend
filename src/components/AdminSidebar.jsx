import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  SwipeableDrawer,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  DashboardOutlined,
  AssignmentTurnedInOutlined  ,
  LeaderboardOutlined,
  Assignment,
  AccountBalanceWallet,
  LocalShippingOutlined,
  Event,
  AdminPanelSettings,
  People,
  EmojiEventsOutlined,
  AttachMoneyOutlined,
  Timeline,
  Close
} from '@mui/icons-material';

const AdminSidebar = ({ 
  mobileDrawerOpen, 
  handleMobileDrawerClose, 
  user 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isAdmin = user?.role === 'admin';
  const isEventTeam = user?.role === 'eventteam' || isAdmin;
  const isHR = user?.role === 'hrteam' || isAdmin;
  const isFinanceTeam = user?.role === 'financeteam' || isAdmin;

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Dashboard</Typography>
      </Box>
      <List sx={{ flex: 1 }}>
        {/* Core Navigation */}
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/dashboard" onClick={handleMobileDrawerClose}>
            <ListItemIcon><DashboardOutlined /></ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/challenges" onClick={handleMobileDrawerClose}>
            <ListItemIcon><AssignmentTurnedInOutlined /></ListItemIcon>
            <ListItemText primary="Challenges" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/leaderboard" onClick={handleMobileDrawerClose}>
            <ListItemIcon><LeaderboardOutlined /></ListItemIcon>
            <ListItemText primary="Leaderboards" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/contracts" onClick={handleMobileDrawerClose}>
            <ListItemIcon><Assignment /></ListItemIcon>
            <ListItemText primary="Contracts" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/wallet" onClick={handleMobileDrawerClose}>
            <ListItemIcon><AccountBalanceWallet /></ListItemIcon>
            <ListItemText primary="Wallet" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/jobs" onClick={handleMobileDrawerClose}>
            <ListItemIcon><LocalShippingOutlined /></ListItemIcon>
            <ListItemText primary="Jobs" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/attendance" onClick={handleMobileDrawerClose}>
            <ListItemIcon><Event /></ListItemIcon>
            <ListItemText primary="Attendance" />
          </ListItemButton>
        </ListItem>

        {/* Role-specific Navigation */}
        {(isAdmin || isEventTeam || isHR || isFinanceTeam) && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ADMIN PANEL
              </Typography>
            </Box>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/admin" onClick={handleMobileDrawerClose}>
                <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                <ListItemText primary="Admin Dashboard" />
              </ListItemButton>
            </ListItem>

            {(isAdmin || isEventTeam) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/jobs" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><LocalShippingOutlined /></ListItemIcon>
                    <ListItemText primary="Job Management" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/events" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><Event /></ListItemIcon>
                    <ListItemText primary="Event Management" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/analytics" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><Timeline /></ListItemIcon>
                    <ListItemText primary="Analytics" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {(isAdmin || isHR) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/users" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><People /></ListItemIcon>
                    <ListItemText primary="User Management" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/user-approvals" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><People /></ListItemIcon>
                    <ListItemText primary="User Approvals" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/attendance" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><Event /></ListItemIcon>
                    <ListItemText primary="Attendance Management" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/achievements" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><EmojiEventsOutlined /></ListItemIcon>
                    <ListItemText primary="Achievements" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {(isAdmin || isEventTeam || isHR || isFinanceTeam) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/challenges" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><AssignmentTurnedInOutlined /></ListItemIcon>
                    <ListItemText primary="Challenge Management" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {isAdmin  || isFinanceTeam && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/bank" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><AttachMoneyOutlined /></ListItemIcon>
                    <ListItemText primary="Bank Management" />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {(isAdmin || isEventTeam || isFinanceTeam) && (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/admin/contracts" onClick={handleMobileDrawerClose}>
                    <ListItemIcon><Assignment /></ListItemIcon>
                    <ListItemText primary="Contract Management" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer 
        variant="permanent" 
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' }
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Dashboard Menu
          </Typography>
          <IconButton onClick={handleMobileDrawerClose}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        <SidebarContent />
      </SwipeableDrawer>
    </>
  );
};

export default AdminSidebar;
