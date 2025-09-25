import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Stack, TextField, MenuItem, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Chip, LinearProgress, Avatar, Fade, Slide, IconButton, useTheme,
  alpha, Divider
} from '@mui/material';
import { 
  EmojiEvents, TrendingUp, LocalShipping, AttachMoney, 
  Speed, LocationOn, MyLocation, Refresh, CalendarMonth
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

export default function Leaderboard() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const theme = useTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, attRes] = await Promise.all([
        axiosInstance.get('/jobs/leaderboard', { params: { from: from || undefined, to: to || undefined } }),
        axiosInstance.get('/hr-events/public/leaderboard')
      ]);
      setData(jobsRes.data);
      setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const StatsCard = ({ icon, title, value, accent = 'primary', delay = 0 }) => (
    <Fade in={!loading} timeout={600 + delay}>
      <Card 
        variant="outlined" 
        sx={{ 
          flex: 1,
          backgroundColor: 'background.paper',
          borderColor: alpha(theme.palette.divider, 0.12),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: alpha(theme.palette[accent].main, 0.3),
            transform: 'translateY(-1px)',
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ mb: 2, color: `${accent}.main` }}>
            {React.cloneElement(icon, { sx: { fontSize: 32 } })}
          </Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: '0.5px', display: 'block', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );

  const TopRiderCard = ({ title, rider, icon, rank, delay = 0 }) => {
    const rankColors = {
      1: { main: '#FFD700', light: '#FFF4CC' },
      2: { main: '#C0C0C0', light: '#F5F5F5' },
      default: { main: theme.palette.primary.main, light: alpha(theme.palette.primary.main, 0.1) }
    };
    const colors = rankColors[rank] || rankColors.default;

    return (
      <Fade in={!loading} timeout={800 + delay}>
        <Card 
          variant="outlined" 
          sx={{ 
            height: '100%',
            backgroundColor: 'background.paper',
            borderColor: alpha(colors.main, 0.2),
            borderLeftWidth: 3,
            borderLeftColor: colors.main,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: alpha(colors.main, 0.4),
              transform: 'translateY(-2px)',
            }
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              {React.cloneElement(icon, { sx: { fontSize: 18, color: 'text.secondary' } })}
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {title}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48,
                  backgroundColor: colors.main,
                  color: rank <= 2 ? 'black' : 'white',
                  fontWeight: 600,
                }}
              >
                {(rider?.username || '?')[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {rider?.username || '—'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  ${rider?.totalRevenue?.toLocaleString?.() || rider?.totalRevenue || 0}
                </Typography>
              </Box>
              {rank <= 3 && (
                <Typography sx={{ fontSize: '1.5rem', opacity: 0.7 }}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const ProgressSection = ({ title, icon, items, color = 'primary', delay = 0 }) => {
    const max = Math.max(1, ...items.map(item => item.count));
    
    return (
      <Fade in={!loading} timeout={1000 + delay}>
        <Card variant="outlined" sx={{ backgroundColor: 'background.paper', borderColor: alpha(theme.palette.divider, 0.12) }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              {React.cloneElement(icon, { sx: { fontSize: 20, color: `${color}.main` } })}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2, opacity: 0.6 }} />
            <Stack spacing={2.5}>
              {items.map((item, idx) => (
                <Box key={idx}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      noWrap 
                      maxWidth={200}
                      sx={{ fontWeight: 500 }}
                    >
                      {item.name || 'Unknown'}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={item.count} 
                      variant="outlined"
                      sx={{ 
                        minWidth: 45,
                        fontWeight: 500,
                        borderColor: alpha(theme.palette[color].main, 0.3),
                        color: `${color}.main`,
                      }}
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, Math.round((item.count / max) * 100))}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette[color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        backgroundColor: theme.palette[color].main,
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Top {items.length} locations
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      py: 4
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        {/* Header */}
        <Fade in timeout={400}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            sx={{ mb: 4 }} 
            spacing={3}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 300, 
                  color: 'text.primary',
                  mb: 0.5,
                  letterSpacing: '-0.02em'
                }}
              >
                Leaderboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Driver performance and statistics
              </Typography>
            </Box>
            
            <Card 
              variant="outlined" 
              sx={{ 
                backgroundColor: 'background.paper',
                borderColor: alpha(theme.palette.divider, 0.12)
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CalendarMonth sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <TextField 
                    type="date" 
                    label="From" 
                    size="small" 
                    InputLabelProps={{ shrink: true }} 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)}
                    sx={{ minWidth: 130 }}
                  />
                  <TextField 
                    type="date" 
                    label="To" 
                    size="small" 
                    InputLabelProps={{ shrink: true }} 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)}
                    sx={{ minWidth: 130 }}
                  />
                  <TextField 
                    select 
                    label="Period" 
                    size="small" 
                    value={''} 
                    onChange={(e) => {
                      const v = e.target.value; 
                      const now = new Date(); 
                      const d = new Date(now);
                      if (v === '3m') d.setMonth(d.getMonth() - 3);
                      if (v === '6m') d.setMonth(d.getMonth() - 6);
                      if (v === '12m') d.setMonth(d.getMonth() - 12);
                      setFrom(d.toISOString().slice(0,10)); 
                      setTo(now.toISOString().slice(0,10));
                    }} 
                    sx={{ width: 100 }}
                  >
                    <MenuItem value="3m">3M</MenuItem>
                    <MenuItem value="6m">6M</MenuItem>
                    <MenuItem value="12m">12M</MenuItem>
                  </TextField>
                  <IconButton 
                    onClick={fetchData}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Fade>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Stack alignItems="center" spacing={2}>
              <LinearProgress sx={{ width: 200 }} />
              <Typography variant="body2" color="text.secondary">
                Loading dashboard...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Overview Stats */}
            <Grid item xs={12}>
              <Card 
                variant="outlined" 
                sx={{ 
                  backgroundColor: 'background.paper',
                  borderColor: alpha(theme.palette.divider, 0.12)
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                    Overview
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <StatsCard 
                      icon={<LocalShipping />}
                      title="Total Jobs"
                      value={data?.totals?.totalJobs?.toLocaleString?.() || data?.totals?.totalJobs || 0}
                      accent="info"
                      delay={100}
                    />
                    <StatsCard 
                      icon={<Speed />}
                      title="Total Distance"
                      value={data?.totals?.totalDistance?.toLocaleString?.() || data?.totals?.totalDistance || 0}
                      accent="warning"
                      delay={200}
                    />
                    <StatsCard 
                      icon={<AttachMoney />}
                      title="Total Revenue"
                      value={`$${data?.totals?.totalRevenue?.toLocaleString?.() || data?.totals?.totalRevenue || 0}`}
                      accent="success"
                      delay={300}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Performers */}
            <Grid item xs={12} md={6}>
              <TopRiderCard 
                title="Top Revenue Driver"
                rider={data?.driversByRevenue?.[0]}
                icon={<AttachMoney />}
                rank={1}
                delay={100}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TopRiderCard 
                title="Top Balance Driver"
                rider={data?.driversByBalance?.[0]}
                icon={<TrendingUp />}
                rank={2}
                delay={200}
              />
            </Grid>

            {/* Drivers Ranking Table */}
            <Grid item xs={12} md={8}>
              <div className='mb-4'>
            <Fade in={!loading} timeout={1000}>
                <Card variant="outlined" sx={{ backgroundColor: 'background.paper', borderColor: alpha(theme.palette.divider, 0.12) }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <EmojiEvents sx={{ fontSize: 20, color: 'warning.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Top Event Attendees
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2, opacity: 0.6 }} />
                    <Stack spacing={1.25}>
                      {attendance.slice(0, 10).map((m, idx) => (
                        <Stack key={m._id || idx} direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ width: 22, textAlign: 'right', color: 'text.secondary' }}>{idx + 1}</Typography>
                            <Avatar sx={{ width: 28, height: 28 }}>{(m.username || '?')[0]}</Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{m.username || 'Unknown'}</Typography>
                          </Stack>
                          <Chip size="small" label={(m.totalEventsAttended || 0)} color="warning" variant="outlined" />
                        </Stack>
                      ))}
                      {attendance.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No attendance data.</Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
              </div>
              <Fade in={!loading} timeout={1000}>
                
                <Card 
                  variant="outlined"
                  sx={{
                    backgroundColor: 'background.paper',
                    borderColor: alpha(theme.palette.divider, 0.12)
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, pb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Driver Rankings
                      </Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ backgroundColor: 'background.paper', fontWeight: 600, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                              Driver
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: 'background.paper', fontWeight: 600, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                              Jobs
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: 'background.paper', fontWeight: 600, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                              Distance
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: 'background.paper', fontWeight: 600, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                              Revenue
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: 'background.paper', fontWeight: 600, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                              Avg/Job
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data?.drivers?.map((d, idx) => (
                            <TableRow 
                              key={idx}
                              sx={{ 
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                },
                                borderLeft: idx < 3 ? `3px solid ${
                                  idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'
                                }` : 'none'
                              }}
                            >
                              <TableCell sx={{ fontWeight: 500, pl: idx < 3 ? 2 : 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {idx < 3 && (
                                    <Typography sx={{ fontSize: '1rem' }}>
                                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                    </Typography>
                                  )}
                                  <Typography variant="body2">{d.username}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>{d.totalJobs}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                {d.totalDistance?.toLocaleString?.() || d.totalDistance}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                                ${d.totalRevenue?.toLocaleString?.() || d.totalRevenue}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500 }}>
                                ${Math.round(d.avgRevenuePerJob || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Location Analytics */}
          <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <ProgressSection
                  title="Popular Sources"
                  icon={<MyLocation />}
                  items={data?.topSources || []}
                  color="info"
                  delay={200}
                />
                <ProgressSection
                  title="Popular Destinations"
                  icon={<LocationOn />}
                  items={data?.topDestinations || []}
                  color="success"
                  delay={400}
                />
              {/* Top Event Attendees */}
              
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}