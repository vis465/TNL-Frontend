import React, { useEffect, useState } from 'react';
import { User, Calendar, Shield, Award, Ban, ExternalLink, Truck, Star, Crown, Users } from 'lucide-react';
import axios from 'axios';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Avatar, Stack, Divider, LinearProgress
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

export default function PlayerProfile({ playerId = "75" }) {
  const [player, setPlayer] = useState(null);
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const steamId=useSearchParams()

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Prefer live TruckersHub data if steamId is provided
        if (steamId) {
          const { data } = await axios.get(`https://api.truckershub.in/v1/drivers/${steamId}`,{
            headers: {
              'Authorization': `${process.env.TRUCKERSHUB_API_KEY}`
            }
          });
          // Expected data shape reference: https://api.truckershub.in/v1/drivers/steamID
          const avatar = data?.steam?.avatarfull || data?.steam?.avatar || data?.avatar;
          const stats = data?.statistics || {};
          const normalized = {
            id: data?.steamID || steamId,
            name: data?.username || data?.steam?.personaname || 'Driver',
            avatar,
            steamID64: data?.steamID || steamId,
            joinDate: data?.steam?.timecreated ? new Date(data.steam.timecreated * 1000).toISOString() : null,
            groupName: data?.vtc?.name || 'TNL Driver',
            isSupporter: false,
            isDeveloper: false,
            isStaff: false,
            isGameAdmin: false,
            patreon: null,
            displayBadges: [],
            vtc: data?.vtc ? { id: String(data.vtc.id || ''), name: data.vtc.name, tag: data.vtc.tag, memberID: data.vtc.memberID } : null,
            achievements: [],
            stats: {
              totalDistance: (stats?.distance?.total || 0).toLocaleString() + ' km',
              totalDeliveries: stats?.jobs || 0,
              totalPlaytime: null,
              thp: stats?.THP || null,
              rating: stats?.rating || null,
              income: stats?.income || null,
              revenue: stats?.revenue || null,
              xp: stats?.XP || null,
              weight: stats?.weight || null,
              fuelBurned: stats?.fuelBurned || null,
              speed: stats?.speed || null,
              level: data?.level || null,
            }
          };
          setPlayer(normalized);
          setBans([]);
        } else {
          // fallback to mock
          const mockPlayer = {
            id: playerId,
            name: "TamilNadu_Trucker",
            avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/56/567c42fa6b8a5fc80df2e80e7843dd6b7e3a3b5a_full.jpg",
            steamID64: "76561198123456789",
            joinDate: "2021-03-15T10:30:00.000Z",
            groupName: "TNL Driver",
            isSupporter: true,
            isDeveloper: false,
            isStaff: false,
            isGameAdmin: false,
            patreon: { tier: 2 },
            displayBadges: ["verified", "supporter"],
            vtc: {
              id: "70030",
              name: "Tamil Nadu Logistics",
              tag: "TNL",
              memberID: 15
            },
            achievements: [],
            stats: {
              totalDistance: "125,847 km",
              totalDeliveries: 1247,
              totalPlaytime: "847 hours"
            }
          };
          setPlayer(mockPlayer);
          setBans([]);
        }
      } catch (err) {
        console.error('Failed to load player:', err);
        setError('Failed to load player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'verified': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'supporter': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'staff': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Award className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <LinearProgress sx={{ width: 200 }} />
          <Typography color="text.secondary">Loading player profile...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !player) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h6">Player Not Found</Typography>
          <Typography variant="body2" color="text.secondary">{error || 'The requested player could not be found.'}</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Avatar src={player.avatar} sx={{ width: 80, height: 80 }} />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" fontWeight={700}>{player.name}</Typography>
                  <Chip size="small" label={`#${player.id}`} />
                </Stack>
                {player.vtc && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    [{player.vtc.tag}] {player.vtc.name} • Member #{player.vtc.memberID}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                {player.displayBadges?.map((badge, idx) => (
                  <Chip key={idx} size="small" label={badge} />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Content */}

        {/* Tab Content */}
        <Grid container spacing={3}>
          {activeTab === 'profile' && (
            <>
              {/* Left: Player Information */}
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Player Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Join Date</Typography>
                        <Typography variant="body1">{formatDate(player.joinDate)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Group</Typography>
                        <Typography variant="body1">{player.groupName || 'None'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Steam Profile</Typography>
                        <Typography variant="body1">
                          <a href={`https://steamcommunity.com/profiles/${player.steamID64}`} target="_blank" rel="noreferrer">
                            View Profile
                          </a>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    {player.stats && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Total Distance</Typography>
                          <Typography variant="h6">{player.stats.totalDistance}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">Deliveries</Typography>
                          <Typography variant="h6">{player.stats.totalDeliveries}</Typography>
                        </Grid>
                        {player.stats.rating && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Rating (avg)</Typography>
                            <Typography variant="h6">{Number(player.stats.rating.avg || 0).toFixed(2)}</Typography>
                          </Grid>
                        )}
                        {player.stats.revenue && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Revenue</Typography>
                            <Typography variant="h6">${(player.stats.revenue.total || 0).toLocaleString()}</Typography>
                          </Grid>
                        )}
                        {player.stats.income && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Income</Typography>
                            <Typography variant="h6">${(player.stats.income.total || 0).toLocaleString()}</Typography>
                          </Grid>
                        )}
                        {player.stats.speed && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Avg Speed</Typography>
                            <Typography variant="h6">{Number(player.stats.speed.avg || 0).toFixed(2)} km/h</Typography>
                          </Grid>
                        )}
                        {player.stats.level && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">Level</Typography>
                            <Typography variant="h6">{player.stats.level}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              {/* Right: Quick Stats */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Bans</Typography>
                      <Typography variant="h5" sx={{ color: bans.length > 0 ? 'error.main' : 'success.main' }}>{bans.length}</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">Achievements</Typography>
                      <Typography variant="h5">{player.achievements?.length || 0}</Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </>
          )}

          {activeTab === 'achievements' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Achievements ({player.achievements?.length || 0})
                </h3>
                {player.achievements && player.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {player.achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                        <img
                          src={ach.icon}
                          alt={ach.name}
                          className="w-12 h-12 rounded-lg"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></svg>';
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{ach.name}</p>
                          <p className="text-sm text-gray-500">Achievement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No achievements found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bans' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Ban className="w-5 h-5 mr-2 text-red-600" />
                  Ban History ({bans.length})
                </h3>
                {bans.length > 0 ? (
                  <div className="space-y-4">
                    {bans.map((ban, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                        ban.active ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">{ban.reason}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ban.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {ban.active ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Admin:</strong> {ban.adminName}</p>
                          <p><strong>Date:</strong> {formatDate(ban.timeAdded)}</p>
                          <p><strong>Expires:</strong> {formatDate(ban.timeExpires)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bans found - Clean record!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Raw Player Data</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(player, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Grid>
      </Box>
    </Box>
  );
}