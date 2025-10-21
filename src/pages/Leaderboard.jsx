import React, { useEffect, useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Stack, TextField, MenuItem, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Chip, LinearProgress, Avatar, Fade, IconButton, useTheme,
  alpha, Divider, Backdrop, CircularProgress, Skeleton
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { 
  EmojiEvents, TrendingUp, LocalShipping, CurrencyRupeeOutlined, 
  Speed, LocationOn, MyLocation, Refresh, CalendarMonth,
  Star, WorkspacePremium, Timeline, Place, LocalFireDepartment,
  Build, Scale, DirectionsCar
} from '@mui/icons-material';



const mockAttendance = [
  { _id: '1', username: 'Alex Rodriguez', totalEventsAttended: 24 },
  { _id: '2', username: 'Sarah Chen', totalEventsAttended: 22 },
  { _id: '3', username: 'Michael Johnson', totalEventsAttended: 19 },
  { _id: '4', username: 'Emma Wilson', totalEventsAttended: 17 },
  { _id: '5', username: 'David Park', totalEventsAttended: 15 }
];

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
        axiosInstance.get('/leaderboard', { params: { from: from || undefined, to: to || undefined } }),
        axiosInstance.get('/attendance-events/public/leaderboard')
      ]);
      setData(jobsRes.data);
      setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(true);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const   GlowingStatsCard = ({ icon, title, value, accent = 'primary', delay = 0, subtitle }) => (
    <Fade in={!loading} timeout={800 + delay}>
      <Card 
        sx={{ 
          position: 'relative',
          
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette[accent].main, 0.2)}`,
          borderRadius: 4,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(theme.palette[accent].main, 0.3)}`,
            border: `1px solid ${alpha(theme.palette[accent].main, 0.4)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
           
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative' }}>
          {/* Animated background glow */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette[accent].main, 0.1)} 0%, transparent 70%)`,
              animation: 'pulse 3s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 },
                '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.8 },
              }
            }}
          />
          
          <Box sx={{ 
            mb: 2, 
            color: `${accent}.main`,
            position: 'relative',
            zIndex: 2
          }}>
            {React.cloneElement(icon, { 
              sx: { 
                fontSize: 48,
                filter: `drop-shadow(0 4px 8px ${alpha(theme.palette[accent].main, 0.3)})`,
              } 
            })}
          </Box>
          
          <Typography 
            variant="overline" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 700, 
              letterSpacing: '1px', 
              display: 'block', 
              mb: 1,
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 2
            }}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: 'text.primary',
              background: `linear-gradient(45deg, ${theme.palette[accent].main}, ${theme.palette[accent].light})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: subtitle ? 1 : 0,
              position: 'relative',
              zIndex: 2
            }}
          >
            {value}
          </Typography>
          
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Fade>
  );

  const PremiumDriverCard = ({ title, rider, icon, rank, delay = 0 }) => {
    const rankColors = {
      1: { main: '#FFD700', light: '#FFF9C4', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)' },
      2: { main: '#E0E0E0', light: '#F5F5F5', gradient: 'linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)' },
      default: { main: theme.palette.primary.main, light: alpha(theme.palette.primary.main, 0.1), gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)` }
    };
    const colors = rankColors[rank] || rankColors.default;

    return (
      <Fade in={!loading} timeout={1000 + delay}>
        <Card 
          sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(colors.main, 0.05)} 0%, ${alpha(colors.main, 0.02)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(colors.main, 0.3)}`,
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-12px) scale(1.03)',
              boxShadow: `0 25px 50px ${alpha(colors.main, 0.4)}`,
              border: `2px solid ${alpha(colors.main, 0.6)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: colors.gradient,
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              {React.cloneElement(icon, { 
                sx: { 
                  fontSize: 24, 
                  color: colors.main,
                  filter: `drop-shadow(0 2px 4px ${alpha(colors.main, 0.3)})`
                } 
              })}
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 700, 
                  letterSpacing: '0.5px', 
                  textTransform: 'uppercase',
                  color: colors.main
                }}
              >
                {title}
              </Typography>
              {rank <= 3 && (
                <WorkspacePremium sx={{ fontSize: 20, color: colors.main }} />
              )}
            </Stack>
            
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60,
                    background: colors.gradient,
                    color: rank <= 2 ? 'black' : 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    boxShadow: `0 8px 16px ${alpha(colors.main, 0.3)}`,
                  }}
                >
                  {(rider?.username || '?')[0]}
                </Avatar>
                
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${colors.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {rider?.username || '—'}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: colors.main,
                    textShadow: `0 2px 4px ${alpha(colors.main, 0.2)}`
                  }}
                >
                  {rider?.totalRevenue ? `₹${rider.totalRevenue.toLocaleString()}` : 
                   rider?.totalDistance ? `${rider.totalDistance.toLocaleString()} km` :
                   rider?.totalTHP ? `${rider.totalTHP.toLocaleString()} THP` :
                   rider?.totalMass ? `${rider.totalMass.toLocaleString()} kg` :
                   rider?.totalDamage ? `${rider.totalDamage.toLocaleString()} damage` :
                   rider?.totalFuel ? `${rider.totalFuel.toLocaleString()} L` :
                   rider?.totalJobs ? `${rider.totalJobs} jobs` :
                   '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {rider?.totalJobs || 0} jobs completed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const ModernProgressSection = ({ title, icon, items, color = 'primary', delay = 0 }) => {
    const max = Math.max(1, ...items.map(item => item.count));
    
    return (
      <Fade in={!loading} timeout={1200 + delay}>
        <Card 
          sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.03)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
            borderRadius: 4,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.2)}`,
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.cloneElement(icon, { 
                  sx: { 
                    fontSize: 24, 
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  } 
                })}
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette[color].main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
            </Stack>
            
            <Stack spacing={3}>
              {items.map((item, idx) => (
                <Box key={idx}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography 
                      variant="body1" 
                      noWrap 
                      maxWidth={180}
                      sx={{ fontWeight: 600 }}
                    >
                      {item.name || 'Unknown'}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={item.count} 
                      sx={{ 
                        minWidth: 50,
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
                        color: 'white',
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, Math.round((item.count / max) * 100))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette[color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
                        animation: 'slideIn 1s ease-out',
                        '@keyframes slideIn': {
                          '0%': { width: '0%' },
                          '100%': { width: '100%' },
                        }
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh'    }}>
      {/* Loading Backdrop */}
      <Backdrop open={loading} sx={{ zIndex: 1000, color: '#fff' }}>
        <Stack alignItems="center" spacing={3}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Dashboard not available right now, please come back later
          </Typography>
        </Stack>
      </Backdrop>

      <Box sx={{ maxWidth: 1600, mx: 'auto', px: 4, py: 6, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={600}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            sx={{ mb: 6 }} 
            spacing={4}
          >
            <Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                Leaderboard
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Driver performance and statistics dashboard
              </Typography>
            </Box>
            
            <Card 
              sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CalendarMonth sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }} />
                  <TextField 
                    type="date" 
                    label="From" 
                    size="small" 
                    InputLabelProps={{ shrink: true }} 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)}
                    sx={{ 
                      minWidth: 140,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputBase-input': { color: 'white' },
                    }}
                  />
                  <TextField 
                    type="date" 
                    label="To" 
                    size="small" 
                    InputLabelProps={{ shrink: true }} 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)}
                    sx={{ 
                      minWidth: 140,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiInputBase-input': { color: 'white' },
                    }}
                  />
                  <IconButton 
                    onClick={fetchData}
                    sx={{ 
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Fade>

        {!loading && (
          <Grid container spacing={4}>
            {/* Overview Stats */}
            <Grid item xs={12}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <GlowingStatsCard 
                    icon={<LocalShipping />}
                    title="Total Jobs"
                    value={data?.totals?.totalJobs?.toLocaleString?.() || '0'}
                    accent="info"
                    delay={100}
                    subtitle="Completed this period"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <GlowingStatsCard 
                    icon={<Speed />}
                    title="Distance Covered"
                    value={`${data?.totals?.totalDistance?.toLocaleString?.() || '0'} KMs`}
                    accent="warning"
                    delay={200}
                    subtitle="Kilometers driven"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <GlowingStatsCard 
                    icon={<CurrencyRupeeOutlined />}
                    title="Total Revenue"
                    value={`₹${data?.totals?.totalRevenue?.toLocaleString?.() || '0'}`}
                    accent="success"
                    delay={300}
                    subtitle="Generated revenue"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Top Performers */}
            <Grid item xs={12} md={6}>
              <PremiumDriverCard 
                title="🚀 Top Revenue Driver"
                rider={data?.driversByRevenue?.[0]}
                icon={<CurrencyRupeeOutlined />}
                rank={1}
                delay={100}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PremiumDriverCard 
                title="⚡ Top Distance Driver"
                rider={data?.topDistanceDrivers?.[0]}
                icon={<Speed />}
                rank={2}
                delay={200}
              />
            </Grid>

            {/* Additional Top Performers */}
            <Grid item xs={12} md={4}>
              <PremiumDriverCard 
                title="📊 Most Jobs"
                rider={data?.topJobsDrivers?.[0]}
                icon={<LocalShipping />}
                rank={3}
                delay={300}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PremiumDriverCard 
                title="🏆 Most THP"
                rider={data?.topTHPDrivers?.[0]}
                icon={<Star />}
                rank={4}
                delay={400}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PremiumDriverCard 
                title="📦 Most Mass"
                rider={data?.topMassDrivers?.[0]}
                icon={<Scale />}
                rank={5}
                delay={500}
              />
            </Grid>

            <Grid item xs={12}>
              <Fade in={!loading} timeout={1200}>
                <Card 
                  sx={{
                   
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    p: 4, 
                   
                    color: 'white'
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Timeline sx={{ fontSize: 32 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        🏁 Driver Rankings
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                          }}>
                            Driver
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                          }}>
                            Jobs
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                          }}>
                            Distance
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                          }}>
                            Revenue
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                          }}>
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
                                backgroundColor: alpha('#667eea', 0.08),
                                transform: 'scale(1.01)',
                              },
                              transition: 'all 0.2s ease-in-out',
                              borderLeft: idx < 3 ? `4px solid ${
                                idx === 0 ? '#FFD700' : idx === 1 ? '#E0E0E0' : '#CD7F32'
                              }` : 'none',
                              backgroundColor: idx < 3 ? alpha(
                                idx === 0 ? '#FFD700' : idx === 1 ? '#E0E0E0' : '#CD7F32', 0.05
                              ) : 'transparent'
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, pl: idx < 3 ? 2 : 2 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  backgroundColor: idx < 3 ? (
                                    idx === 0 ? '#FFD700' : idx === 1 ? '#E0E0E0' : '#CD7F32'
                                  ) : '#667eea',
                                  color: idx === 1 ? 'black' : 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.9rem'
                                }}>
                                  {idx + 1}
                                </Box>
                                <Avatar sx={{ 
                                  width: 36, 
                                  height: 36,
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  fontWeight: 600
                                }}>
                                  {(d.username || '?')[0]}
                                </Avatar>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {d.username}
                                </Typography>
                                {idx < 3 && (
                                  <Typography sx={{ fontSize: '1.2rem' }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                  </Typography>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {d.totalJobs}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {d.totalDistance?.toLocaleString?.() || d.totalDistance} mi
                            </TableCell>
                            <TableCell align="right" sx={{ 
                              fontWeight: 700, 
                              color: '#4CAF50',
                              fontSize: '1.1rem'
                            }}>
                              ${d.totalRevenue?.toLocaleString?.() || d.totalRevenue}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              ${Math.round(d.avgRevenuePerJob || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Fade>
            </Grid>

            {/* Right Column - Event Attendees (removed as it's now full width above) */}
             <Grid item xs={12}>
              <Fade in={!loading} timeout={1000}>
                <Card sx={{ 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 4 }}>
                        <EmojiEvents sx={{ fontSize: 32 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Top Event Attendees
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {attendance.slice(0, 5).map((m, idx) => (
                          <Stack key={m._id || idx} direction="row" alignItems="center" justifyContent="space-between"
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              backgroundColor: idx < 3 ? alpha('#FF6B6B', 0.05) : 'transparent',
                              border: idx < 3 ? '1px solid rgba(255, 107, 107, 0.2)' : 'none',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: alpha('#4ECDC4', 0.1),
                                transform: 'translateX(8px)'
                              }
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography 
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  borderRadius: '50%',
                                  backgroundColor: idx < 3 ? '#FF6B6B' : '#4ECDC4',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700
                                }}
                              >
                                {idx + 1}
                              </Typography>
                              <Avatar sx={{ 
                                width: 40, 
                                height: 40,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 600
                              }}>
                                {(m.username || '?')[0]}
                              </Avatar>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {m.username || 'Unknown'}
                              </Typography>
                              {idx < 3 && <Star sx={{ color: '#FFD700', fontSize: 20 }} />}
                            </Stack>
                            <Chip 
                              size="medium" 
                              label={`${m.totalEventsAttended || 0} events`}
                              sx={{
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Location Analytics - Full Width */}
           

          </Grid>
        )}
      </Box>
    </Box>
  );
}