import React, { useEffect, useState } from 'react';
import { User, Calendar, Shield, Award, Ban, ExternalLink, Truck, Star, Crown, Users } from 'lucide-react';

export default function PlayerProfile({ playerId = "75" }) {
  const [player, setPlayer] = useState(null);
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API calls since we can't make actual requests
        // In real implementation, these would be your actual API endpoints
        
        // Mock player data based on TruckersMP API structure
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
          achievements: [
            {
              name: "First Delivery",
              icon: "https://truckersmp.com/assets/img/achievements/first_delivery.png"
            },
            {
              name: "100 Deliveries",
              icon: "https://truckersmp.com/assets/img/achievements/100_deliveries.png"
            },
            {
              name: "Long Distance",
              icon: "https://truckersmp.com/assets/img/achievements/long_distance.png"
            }
          ],
          stats: {
            totalDistance: "125,847 km",
            totalDeliveries: 1247,
            totalPlaytime: "847 hours"
          }
        };

        const mockBans = [
          {
            id: 1,
            reason: "Reckless Driving",
            adminName: "TMP_Admin",
            timeAdded: "2023-06-15T14:30:00.000Z",
            timeExpires: "2023-06-22T14:30:00.000Z",
            active: false
          }
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setPlayer(mockPlayer);
        setBans(mockBans);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Player Not Found</h2>
          <p className="text-gray-600">{error || 'The requested player could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center space-x-6">
              <img
                src={player.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{player.name}</h1>
                  <span className="text-blue-200">#{player.id}</span>
                  <div className="flex space-x-1">
                    {player.displayBadges?.map((badge, idx) => (
                      <div key={idx} className="bg-white/20 rounded-full p-1">
                        {getBadgeIcon(badge)}
                      </div>
                    ))}
                  </div>
                </div>
                {player.vtc && (
                  <div className="flex items-center space-x-2 text-blue-100">
                    <Truck className="w-4 h-4" />
                    <span>[{player.vtc.tag}] {player.vtc.name}</span>
                    <span className="text-xs bg-blue-500/30 px-2 py-1 rounded">Member #{player.vtc.memberID}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'bans', label: 'Bans', icon: Ban },
              { id: 'raw', label: 'Raw Data', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'bans' && bans.length > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {bans.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'profile' && (
            <>
              {/* Player Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Player Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Join Date</p>
                          <p className="font-medium">{formatDate(player.joinDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Group</p>
                          <p className="font-medium">{player.groupName || 'None'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Steam Profile</p>
                          <a
                            href={`https://steamcommunity.com/profiles/${player.steamID64}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {player.stats && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Total Distance</p>
                            <p className="font-medium text-lg text-green-600">{player.stats.totalDistance}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Deliveries</p>
                            <p className="font-medium text-lg text-blue-600">{player.stats.totalDeliveries}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Playtime</p>
                            <p className="font-medium text-lg text-purple-600">{player.stats.totalPlaytime}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Status & Privileges</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Supporter', value: player.isSupporter, color: 'yellow' },
                      { label: 'Developer', value: player.isDeveloper, color: 'purple' },
                      { label: 'Staff', value: player.isStaff, color: 'blue' },
                      { label: 'Game Admin', value: player.isGameAdmin, color: 'red' }
                    ].map(status => (
                      <div key={status.label} className="text-center">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          status.value 
                            ? `bg-${status.color}-100 text-${status.color}-600` 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {status.value ? <Shield className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-medium text-gray-600">{status.label}</p>
                        <p className={`text-xs ${status.value ? 'text-green-600' : 'text-gray-400'}`}>
                          {status.value ? 'Yes' : 'No'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {player.patreon && (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-pink-500" />
                      Patreon Supporter
                    </h4>
                    <p className="text-pink-700">Tier {player.patreon.tier}</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bans</span>
                      <span className={`font-medium ${bans.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {bans.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Achievements</span>
                      <span className="font-medium text-blue-600">{player.achievements?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
}