import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  People as PeopleIcon,
  Queue as QueueIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

const ServerCard = ({ server }) => {
  const theme = useTheme();
  const playerPercentage = (server.players / server.maxplayers) * 100;

  const getStatusColor = () => {
    if (playerPercentage >= 90) return 'error';
    if (playerPercentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: server.game === 'ETS2' ? 'primary.main' : 'secondary.light',
          color: 'white',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            color:'primary.dark',
            gap: 1,
          }}
        >
          {server.name}
          <Chip
            label={server.game}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'red',
              fontFamily: 'Montserrat, sans-serif',
            }}
          />
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Stack spacing={2}>
          {/* Server Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<CheckCircleIcon />}
              label="Online"
              color="success"
              size="small"
              sx={{ fontFamily: 'Montserrat, sans-serif' }}
            />
            {server.event && (
              <Chip
                icon={<InfoIcon />}
                label="Event Server"
                color="info"
                size="small"
                sx={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            )}
          </Box>

          {/* Player Count */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ fontFamily: 'Montserrat, sans-serif', mb: 1 }}
            >
              Players
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${playerPercentage}%`,
                      bgcolor: `${getStatusColor()}.main`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                {server.players}/{server.maxplayers}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Server Details */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon color="action" fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {server.speedlimiter ? 'Speed Limited' : 'No Speed Limit'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="action" fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {server.collisions ? 'Collisions On' : 'Collisions Off'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="action" fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {server.carsforplayers ? 'Player Cars' : 'No Player Cars'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QueueIcon color="action" fontSize="small" />
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Queue: {server.queue}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Server Features */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {server.promods && (
              <Chip
                icon={<InfoIcon />}
                label="ProMods"
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            )}
            {server.afkenabled && (
              <Chip
                icon={<InfoIcon />}
                label="AFK Enabled"
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'Montserrat, sans-serif' }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>

      {/* Server Actions */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {server.ip}:{server.port}
          </Typography>
          <Tooltip title="Copy IP:Port">
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(`${server.ip}:${server.port}`);
              }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/servers');
        setServers(response.data.servers);
      } catch (error) {
        console.error('Error fetching servers:', error);
        setError('Failed to fetch server information');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchServers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          mb: 4,
        }}
      >
        TruckersMP Servers
      </Typography>

      <Grid container spacing={3}>
        {servers.map((server) => (
          <Grid item xs={12} sm={6} md={4} key={server.id}>
            <ServerCard server={server} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Servers; 