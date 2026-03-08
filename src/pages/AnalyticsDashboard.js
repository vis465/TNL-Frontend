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
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  ResponsiveContainer
} from 'recharts';
import axiosInstance from '../utils/axios';
import {
  Download as DownloadIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  BookOnline as BookIcon,
  Business as BusinessIcon,
  EmojiEvents as ChallengeIcon,
  Assignment as ContractIcon,
  People as AttendanceIcon,
  List as RecentIcon
} from '@mui/icons-material';

const COLORS = ['#2196F3', '#4CAF50', '#FFC107', '#F44336', '#9C27B0', '#00BCD4'];
const STATUS_COLORS = {
  approved: '#4CAF50',
  pending: '#FFC107',
  rejected: '#F44336',
  available: '#9E9E9E'
};

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    eventAttendance: [],
    bookingPatterns: [],
    vtcParticipation: [],
    slotUtilization: [],
    challengeProgress: [],
    contractProgress: { active: 0, completed: 0, failed: 0, total: 0, completionRate: 0 },
    contractByTemplate: [],
    attendanceStats: {
      eventAttendance: [],
      hrAttendanceEvents: [],
      topAttendees: []
    }
  });
  const [activeTab, setActiveTab] = useState(0);

  const calculateDerivedStats = (data) => {
    const totalBookings = (data.bookingPatterns || []).reduce((sum, item) => sum + item.value, 0);
    const approvedBookings = (data.bookingPatterns || []).find(p => p.name === 'Approved')?.value || 0;
    const approvalRate = totalBookings > 0 ? (approvedBookings / totalBookings * 100).toFixed(1) : 0;
    const totalVTCs = (data.vtcParticipation || []).length;
    const totalAttendance = (data.eventAttendance || []).reduce((sum, e) => sum + (e.attendance || 0), 0);
    const totalEvents = (data.eventAttendance || []).length;
    const avgAttendance = totalEvents > 0 ? Math.round(totalAttendance / totalEvents) : 0;
    const utilizationData = [];
    const slotUtil = data.slotUtilization || [];
    if (slotUtil.length > 0) {
      let ta = 0, tp = 0, tr = 0, tav = 0;
      slotUtil.forEach(item => {
        ta += item.approved || 0;
        tp += item.pending || 0;
        tr += item.rejected || 0;
        tav += item.available || 0;
      });
      const n = slotUtil.length;
      utilizationData.push(
        { name: 'Approved', value: Math.round(ta / n) },
        { name: 'Pending', value: Math.round(tp / n) },
        { name: 'Rejected', value: Math.round(tr / n) },
        { name: 'Available', value: Math.round(tav / n) }
      );
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
      setStats({
        eventAttendance: response.data.eventAttendance || [],
        bookingPatterns: response.data.bookingPatterns || [],
        vtcParticipation: response.data.vtcParticipation || [],
        slotUtilization: response.data.slotUtilization || [],
        challengeProgress: response.data.challengeProgress || [],
        contractProgress: response.data.contractProgress || { active: 0, completed: 0, failed: 0, total: 0, completionRate: 0 },
        contractByTemplate: response.data.contractByTemplate || [],
        attendanceStats: response.data.attendanceStats || { eventAttendance: [], hrAttendanceEvents: [], topAttendees: [] }
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get('/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'approved-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export data.');
    }
  };

  const handleExportEventSlots = async () => {
    try {
      const response = await axiosInstance.get('/analytics/export-event-slots', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event-slot-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export event slot data.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const derivedStats = calculateDerivedStats(stats);
  const slotUtilization = stats.slotUtilization || [];
  const challengeProgress = stats.challengeProgress || [];
  const contractProgress = stats.contractProgress || {};
  const contractByTemplate = stats.contractByTemplate || [];
  const attendanceStats = stats.attendanceStats || {};
  const hrAttendanceEvents = attendanceStats.hrAttendanceEvents || [];
  const topAttendees = attendanceStats.topAttendees || [];
  const eventAttendanceList = attendanceStats.eventAttendance && attendanceStats.eventAttendance.length
    ? attendanceStats.eventAttendance
    : (stats.eventAttendance || []).map(e => ({ eventName: e.name, confirmed: e.attendance }));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export Approved Bookings
          </Button>
          <Button variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={handleExportEventSlots}>
            Export Event Slots
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<EventIcon />} label="Event slots" />
          <Tab icon={<BookIcon />} label="Bookings" />
          <Tab icon={<ChallengeIcon />} label="Challenge progress" />
          <Tab icon={<ContractIcon />} label="Contract progress" />
          <Tab icon={<AttendanceIcon />} label="Attendances" />
          <Tab icon={<RecentIcon />} label="Recent Bookings" />
        </Tabs>
      </Box>

      {/* Overview */}
      {activeTab === 0 && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, height: 140, background: 'linear-gradient(to right, #2196F3, #21CBF3)' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Total Bookings</Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>{derivedStats.totalBookings}</Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>Across all events</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, height: 140, background: 'linear-gradient(to right, #4CAF50, #8BC34A)' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Approval Rate</Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>{derivedStats.approvalRate}%</Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>Bookings approved</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, height: 140, background: 'linear-gradient(to right, #FFC107, #FF9800)' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Active VTCs</Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>{derivedStats.totalVTCs}</Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>Participating in events</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, height: 140, background: 'linear-gradient(to right, #9C27B0, #673AB7)' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Avg. Event Attendance</Typography>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>{derivedStats.avgAttendance}</Typography>
                <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>Per event (TruckersMP)</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Top VTC Participation</Typography>
                <Box sx={{ height: 320 }}>
                  {stats.vtcParticipation?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.vtcParticipation.slice(0, 8)} layout="vertical" margin={{ left: 80, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={75} />
                        <Tooltip />
                        <Bar dataKey="value" name="Bookings" fill="#3f51b5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography color="text.secondary">No VTC participation data</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Booking Status</Typography>
                <Box sx={{ height: 320 }}>
                  {stats.bookingPatterns?.some(p => p.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.bookingPatterns}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {stats.bookingPatterns.map((entry, i) => (
                            <Cell key={i} fill={
                              entry.name === 'Approved' ? STATUS_COLORS.approved :
                              entry.name === 'Pending' ? STATUS_COLORS.pending : STATUS_COLORS.rejected
                            } />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography color="text.secondary">No booking data</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Event slots – new analytics: table + fill rate */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Event slot fill & capacity</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Per-event slot counts and fill rate (booked vs available).
              </Typography>
              {slotUtilization.length > 0 ? (
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Event</strong></TableCell>
                        <TableCell align="right"><strong>Total slots</strong></TableCell>
                        <TableCell align="right"><strong>Filled</strong></TableCell>
                        <TableCell align="right"><strong>Approved</strong></TableCell>
                        <TableCell align="right"><strong>Pending</strong></TableCell>
                        <TableCell align="right"><strong>Rejected</strong></TableCell>
                        <TableCell align="right"><strong>Available</strong></TableCell>
                        <TableCell align="right"><strong>Fill rate</strong></TableCell>
                        <TableCell align="right" sx={{ minWidth: 140 }}><strong>Fill %</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slotUtilization.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">{row.totalSlots ?? '–'}</TableCell>
                          <TableCell align="right">
                            {(row.approvedSlots ?? 0) + (row.pendingSlots ?? 0) + (row.rejectedSlots ?? 0)}
                          </TableCell>
                          <TableCell align="right">{row.approvedSlots ?? '–'}</TableCell>
                          <TableCell align="right">{row.pendingSlots ?? '–'}</TableCell>
                          <TableCell align="right">{row.rejectedSlots ?? '–'}</TableCell>
                          <TableCell align="right">{row.availableSlots ?? '–'}</TableCell>
                          <TableCell align="right">{row.fillRate != null ? `${row.fillRate}%` : '–'}</TableCell>
                          <TableCell align="right" sx={{ minWidth: 140 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, row.fillRate || 0)}
                              sx={{ height: 8, borderRadius: 1, bgcolor: 'grey.200' }}
                              color={row.fillRate >= 80 ? 'success' : row.fillRate >= 50 ? 'primary' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4 }}>No event slot data available.</Typography>
              )}
            </Paper>
          </Grid>
          {slotUtilization.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Fill rate by event</Typography>
                <Box sx={{ height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...slotUtilization].sort((a, b) => (b.fillRate || 0) - (a.fillRate || 0)).slice(0, 10)}
                      layout="vertical"
                      margin={{ left: 100, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={v => [`${v}%`, 'Fill rate']} />
                      <Bar dataKey="fillRate" name="Fill rate %" fill="#2196F3" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}
          {slotUtilization.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Average slot status (all events)</Typography>
                <Box sx={{ height: 360 }}>
                  {derivedStats.utilizationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={derivedStats.utilizationData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {derivedStats.utilizationData.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography color="text.secondary">No utilization data</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Bookings */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Booking status distribution</Typography>
              <Box sx={{ height: 380 }}>
                {stats.bookingPatterns?.some(p => p.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.bookingPatterns}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {stats.bookingPatterns.map((entry, i) => (
                          <Cell key={i} fill={
                            entry.name === 'Approved' ? STATUS_COLORS.approved :
                            entry.name === 'Pending' ? STATUS_COLORS.pending : STATUS_COLORS.rejected
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography color="text.secondary">No booking data</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {(stats.bookingPatterns || []).map((pattern, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Card elevation={2} sx={{ borderLeft: 4, borderColor: pattern.name === 'Approved' ? STATUS_COLORS.approved : pattern.name === 'Pending' ? STATUS_COLORS.pending : STATUS_COLORS.rejected }}>
                    <CardContent>
                      <Typography variant="subtitle2">{pattern.name}</Typography>
                      <Typography variant="h4" fontWeight="bold">{pattern.value}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {derivedStats.totalBookings > 0 ? `${(pattern.value / derivedStats.totalBookings * 100).toFixed(1)}% of total` : '0%'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Challenge progress */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Challenge participation & completions</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Per-challenge participants, completions, and completion rate.
            </Typography>
          </Grid>
          {challengeProgress.length > 0 ? (
            <>
              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Challenge</strong></TableCell>
                        <TableCell align="right"><strong>Required jobs</strong></TableCell>
                        <TableCell align="right"><strong>Difficulty</strong></TableCell>
                        <TableCell align="right"><strong>Participants</strong></TableCell>
                        <TableCell align="right"><strong>Completions</strong></TableCell>
                        <TableCell align="right"><strong>In progress</strong></TableCell>
                        <TableCell align="right"><strong>Completion rate</strong></TableCell>
                        <TableCell sx={{ minWidth: 120 }}><strong>Progress</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {challengeProgress.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">{row.requiredJobs ?? '–'}</TableCell>
                          <TableCell align="right">{row.difficulty ?? '–'}</TableCell>
                          <TableCell align="right">{row.participants ?? 0}</TableCell>
                          <TableCell align="right">{row.completions ?? 0}</TableCell>
                          <TableCell align="right">{row.inProgress ?? 0}</TableCell>
                          <TableCell align="right">{row.completionRate != null ? `${row.completionRate}%` : '–'}</TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, row.completionRate || 0)}
                              sx={{ height: 8, borderRadius: 1 }}
                              color="primary"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Completions by challenge</Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={challengeProgress.slice(0, 8)} margin={{ top: 10, right: 20, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-35} textAnchor="end" height={80} interval={0} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completions" name="Completions" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="inProgress" name="In progress" fill="#FFC107" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4 }}>
                <Typography color="text.secondary">No challenge progress data available.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Contract progress */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Contract overview</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2">Active</Typography>
                <Typography variant="h4">{contractProgress.active ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2">Completed</Typography>
                <Typography variant="h4">{contractProgress.completed ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2">Failed</Typography>
                <Typography variant="h4">{contractProgress.failed ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'grey.800', color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2">Completion rate</Typography>
                <Typography variant="h4">{contractProgress.completionRate ?? 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>By contract template</Typography>
            {contractByTemplate.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Template</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>Completed</strong></TableCell>
                      <TableCell align="right"><strong>Active</strong></TableCell>
                      <TableCell align="right"><strong>Failed</strong></TableCell>
                      <TableCell align="right"><strong>Completion rate</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contractByTemplate.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        <TableCell align="right">{row.completed}</TableCell>
                        <TableCell align="right">{row.active}</TableCell>
                        <TableCell align="right">{row.failed}</TableCell>
                        <TableCell align="right">{row.completionRate != null ? `${row.completionRate}%` : '–'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>No contract template data.</Typography>
            )}
          </Grid>
        </Grid>
      )}

      {/* Attendances */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Event & HR attendance</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Event attendance (TruckersMP)</Typography>
              {eventAttendanceList.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Event</strong></TableCell>
                        <TableCell align="right"><strong>Confirmed</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventAttendanceList.slice(0, 15).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.eventName || row.name}</TableCell>
                          <TableCell align="right">{row.confirmed ?? row.attendance ?? '–'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No event attendance data.</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>HR attendance events</Typography>
              {hrAttendanceEvents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Event</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="right"><strong>Approved</strong></TableCell>
                        <TableCell align="right"><strong>Pending</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hrAttendanceEvents.slice(0, 10).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.eventDate ? new Date(row.eventDate).toLocaleDateString() : '–'}</TableCell>
                          <TableCell align="right">{row.approved ?? 0}</TableCell>
                          <TableCell align="right">{row.pending ?? 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No HR attendance events.</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Top attendees (member events)</Typography>
              {topAttendees.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Member</strong></TableCell>
                        <TableCell align="right"><strong>Events attended</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topAttendees.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell align="right">{row.totalEventsAttended ?? 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No top attendees data.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Recent Bookings – unchanged */}
      {activeTab === 6 && <RecentBookings />}
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
      } catch (err) {
        setError('Failed to load recent bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentBookings();
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
      <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
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
