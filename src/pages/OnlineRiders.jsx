import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import { getItemWithExpiry } from '../localStorageWithExpiry';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import WifiTethering from '@mui/icons-material/WifiTethering';
import AdminSidebar from '../components/AdminSidebar';

const REFRESH_INTERVAL_MS = 10000;

function serverTypeLabel(serverType) {
  const t = Number(serverType);
  if (t === 1) return 'ETS2';
  if (t === 2) return 'ATS';
  if (t === 3) return 'ETS2 (Sim 2)';
  return `Type ${t}`;
}

export default function OnlineRiders() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = getItemWithExpiry('user') || {};

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchOnlineRiders = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axiosInstance.get('/online-riders');
      // API may return either `players` (our backend) or `Players` (raw tracker)
      const rawPlayers = Array.isArray(data?.players)
        ? data.players
        : Array.isArray(data?.Players)
          ? data.Players
          : [];
      setPlayers(rawPlayers);

      setFetchedAt(data.fetchedAt || new Date().toISOString());
    } catch (e) {
      console.warn('Failed to fetch online riders', e);
      setError(e?.response?.data?.message || 'Failed to load online riders');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnlineRiders();
    const interval = setInterval(fetchOnlineRiders, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOnlineRiders]);
  console.log(players);
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar
        mobileDrawerOpen={mobileDrawerOpen}
        handleMobileDrawerClose={() => setMobileDrawerOpen(false)}
        user={user}
      />

      <Box sx={{ flex: 1 }}>
        {isMobile && (
          <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Online Riders
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Online Riders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            VTC members currently in-game (ETS2/ATS)
            
            . Refreshes every 10 seconds.
          </Typography>

          {fetchedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Last updated: {new Date(fetchedAt).toLocaleString()}
            </Typography>
          )}

          {loading && players.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ py: 3 }}>
              {error}
            </Typography>
          ) : players.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <WifiTethering sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                No riders online right now. Check back later.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Server</strong></TableCell>
                    <TableCell><strong>Game</strong></TableCell>
                    <TableCell align="right"><strong>Position (X, Y)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players.map((p, index) => (
                    <TableRow key={`${p.MpId}-${p.Time}`} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{p.Name || '—'}</TableCell>
                      <TableCell>Server {p.ServerId ?? '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={serverTypeLabel(p.ServerType)} variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        {p.X != null && p.Y != null
                          ? `${Number(p.X).toLocaleString()}, ${Number(p.Y).toLocaleString()}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}
