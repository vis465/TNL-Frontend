import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip as MuiTooltip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import axiosInstance from '../utils/axios';
import { 
  Download as DownloadIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  BookOnline as BookIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    eventAttendance: [],
    bookingPatterns: [],
    vtcParticipation: [],
    slotUtilization: []
  });
  const [activeTab, setActiveTab] = useState(0);

  const COLORS = ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0', '#00BCD4'];
  const STATUS_COLORS = {
    approved: '#4CAF50',
    pending: '#FFC107',
    rejected: '#F44336',
    available: '#9E9E9E'
  };

  // Calculate derived statistics
  const calculateDerivedStats = (data) => {
    // Total bookings
    const totalBookings = data.bookingPatterns.reduce((sum, item) => sum + item.value, 0);
    
    // Approval rate
    const approvedBookings = data.bookingPatterns.find(p => p.name === 'Approved')?.value || 0;
    const approvalRate = totalBookings > 0 ? (approvedBookings / totalBookings * 100).toFixed(1) : 0;
    
    // Total VTC participants
    const totalVTCs = data.vtcParticipation.length;
    
    // Total active events
    
    // Average attendance per event
    const totalAttendance = data.eventAttendance.reduce((sum, event) => sum + event.attendance, 0);
const totalEvents = data.eventAttendance.length;
const avgAttendance = totalEvents > 0 ? Math.round(totalAttendance / totalEvents) : 0;

    // Calculate bookings by utilization type for pie chart
    const utilizationData = [];
    if (data.slotUtilization.length > 0) {
      // Calculate averages across all events
      let totalApproved = 0;
      let totalPending = 0;
      let totalRejected = 0;
      let totalAvailable = 0;
      
      data.slotUtilization.forEach(item => {
        totalApproved += item.approved || 0;
        totalPending += item.pending || 0;
        totalRejected += item.rejected || 0;
        totalAvailable += item.available || 0;
      });
      
      const eventCount = data.slotUtilization.length;
      
      if (eventCount > 0) {
        utilizationData.push(
          { name: 'Approved', value: Math.round(totalApproved / eventCount) },
          { name: 'Pending', value: Math.round(totalPending / eventCount) },
          { name: 'Rejected', value: Math.round(totalRejected / eventCount) },
          { name: 'Available', value: Math.round(totalAvailable / eventCount) }
        );
      }
    }
    
    return {
      totalBookings,
      approvalRate,
      totalVTCs,
      totalEvents,
      avgAttendance,
      utilizationData
    };
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/analytics/dashboard');
      console.log('Analytics data received:', response.data);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get('/analytics/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'approved-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again later.');
    }
  };

  const handleExportEventSlots = async () => {
    try {
      const response = await axiosInstance.get('/analytics/export-event-slots', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event-slot-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting event slot data:', error);
      setError('Failed to export event slot data. Please try again later.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const derivedStats = calculateDerivedStats(stats);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header and Export Buttons */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', md: 'center' }} 
        mb={4}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2} mt={{ xs: 2, md: 0 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Export Approved Bookings
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportEventSlots}
          >
            Export Event Slots
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<EventIcon />} label="Events" />
          <Tab icon={<BookIcon />} label="Bookings" />
          <Tab icon={<BusinessIcon />} label="VTCs" />
          <Tab icon={<BookIcon />} label="Recent Bookings" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {/* OVERVIEW TAB */}
      {activeTab === 0 && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 140,
                  background: 'linear-gradient(to right, #2196F3, #21CBF3)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Total Bookings
                </Typography>
                <Typography variant="h3" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {derivedStats.totalBookings}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 'auto' }}>
                  Across all events
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 140,
                  background: 'linear-gradient(to right, #4CAF50, #8BC34A)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Approval Rate
                </Typography>
                <Typography variant="h3" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {derivedStats.approvalRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 'auto' }}>
                  Bookings approved
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 140,
                  background: 'linear-gradient(to right, #FFC107, #FF9800)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Active VTCs
                </Typography>
                <Typography variant="h3" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {derivedStats.totalVTCs}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 'auto' }}>
                  Participating in events
                </Typography>
              </Paper>
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 140,
                  background: 'linear-gradient(to right, #9C27B0, #673AB7)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Average Attendance
                </Typography>
                <Typography variant="h3" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {derivedStats.avgAttendance}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 'auto' }}>
                  Per event
                </Typography>
              </Paper>
            </Grid> */}
          </Grid>

          {/* Main Overview Charts */}
          <Grid container spacing={3}>
            {/* Booking Distribution Pie Chart */}
          

            {/* VTC Participation */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Top VTC Participation
                </Typography>
                <Box sx={{ height: 350 }}>
                  {stats.vtcParticipation.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={stats.vtcParticipation.slice(0, 5)} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Bookings" fill="#3f51b5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography variant="body1" color="text.secondary">
                        No VTC participation data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Event Attendance */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Event Attendance Overview
                </Typography>
                <Box sx={{ height: 400 }}>
                  {stats.eventAttendance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={stats.eventAttendance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attendance" name="Confirmed Attendees" fill="#2196F3" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography variant="body1" color="text.secondary">
                        No event attendance data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* EVENTS TAB */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Event Attendance Bar Chart - Detailed */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Attendance (Detailed)
              </Typography>
              <Box sx={{ height: 500 }}>
                {stats.eventAttendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={stats.eventAttendance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="attendance" 
                        name="Confirmed Attendees" 
                        fill="#2196F3" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No event attendance data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Event Slot Utilization */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Average Slot Utilization
              </Typography>
              <Box sx={{ height: 500 }}>
                {derivedStats.utilizationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={derivedStats.utilizationData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {derivedStats.utilizationData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name.toLowerCase() === 'approved' ? STATUS_COLORS.approved :
                              entry.name.toLowerCase() === 'pending' ? STATUS_COLORS.pending :
                              entry.name.toLowerCase() === 'rejected' ? STATUS_COLORS.rejected :
                              entry.name.toLowerCase() === 'available' ? STATUS_COLORS.available :
                              COLORS[index % COLORS.length]
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No slot utilization data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Event Slot Distribution */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event-wise Slot Distribution in %
              </Typography>
              <Box sx={{ height: 450 }}>
                {stats.slotUtilization.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.slotUtilization}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="approved" name="Approved" stackId="a" fill={STATUS_COLORS.approved} />
                      <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.pending} />
                      <Bar dataKey="rejected" name="Rejected" stackId="a" fill={STATUS_COLORS.rejected} />
                      <Bar dataKey="available" name="Available" stackId="a" fill={STATUS_COLORS.available} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No slot distribution data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Booking Status Distribution - Detailed */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Booking Status Distribution
              </Typography>
              <Box sx={{ height: 400 }}>
                {stats.bookingPatterns.some(pattern => pattern.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.bookingPatterns}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {stats.bookingPatterns.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name.toLowerCase() === 'approved' ? STATUS_COLORS.approved :
                              entry.name.toLowerCase() === 'pending' ? STATUS_COLORS.pending :
                              entry.name.toLowerCase() === 'rejected' ? STATUS_COLORS.rejected :
                              COLORS[index % COLORS.length]
                            } 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} bookings`, '']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No booking pattern data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Booking Status Cards */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3} height="100%">
              {stats.bookingPatterns.map((pattern, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%',
                      borderLeft: 5,
                      borderColor: 
                        pattern.name.toLowerCase() === 'approved' ? STATUS_COLORS.approved :
                        pattern.name.toLowerCase() === 'pending' ? STATUS_COLORS.pending :
                        pattern.name.toLowerCase() === 'rejected' ? STATUS_COLORS.rejected :
                        COLORS[index % COLORS.length]
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {pattern.name}
                      </Typography>
                      <Typography variant="h3" component="div" fontWeight="bold">
                        {pattern.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {derivedStats.totalBookings > 0 
                          ? `${(pattern.value / derivedStats.totalBookings * 100).toFixed(1)}% of total`
                          : '0% of total'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Slot Utilization By Event - Radar Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Slot Utilization By Event (%)
              </Typography>
              <Box sx={{ height: 450 }}>
                {stats.slotUtilization.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={stats.slotUtilization}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Approved"
                        dataKey="approved"
                        stroke={STATUS_COLORS.approved}
                        fill={STATUS_COLORS.approved}
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Pending"
                        dataKey="pending"
                        stroke={STATUS_COLORS.pending}
                        fill={STATUS_COLORS.pending}
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Rejected"
                        dataKey="rejected"
                        stroke={STATUS_COLORS.rejected}
                        fill={STATUS_COLORS.rejected}
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Available"
                        dataKey="available"
                        stroke={STATUS_COLORS.available}
                        fill={STATUS_COLORS.available}
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No slot utilization data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* VTCs TAB */}
      {activeTab === 3 && (
        <Grid container spacing={1}>
          {/* VTC Participation Bar Chart */}
          <Grid item xs={12} md={10}>
            <Paper >
              <Typography variant="h6" gutterBottom>
                Top 10 VTCs by Participation
              </Typography>
              <Box sx={{ height: 500 }}>
                {stats.vtcParticipation.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={stats.vtcParticipation}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={140}
                        interval={0}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Bookings" 
                        fill="#9C27B0" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No VTC participation data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          
        </Grid>
      )}

      {/* RECENT BOOKINGS TAB */}
      {activeTab === 4 && (
        <RecentBookings />
      )}
    </Container>
  );
};

const RecentBookings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosInstance.get('/analytics/recent-bookings');
        setBookings(response.data.bookings || []);
        setLoading(false);
      } catch (error) {
        setError('Failed to load recent bookings.');
        setLoading(false);
      }
    };
    fetchRecentBookings();
    // console.log("RecentBookings",RecentBookings)
  }, []);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!bookings.length) {
    return <Typography>No recent bookings found.</Typography>;
  }
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Bookings
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Event</th>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>VTC</th>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Slot</th>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Status</th>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Date</th>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Discord Username</th>
              <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{b.eventTitle}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{b.vtcName}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{b.slotNumber}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{b.status}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{new Date(b.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{b.discordUsername}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{b.approvedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};
export default AnalyticsDashboard;