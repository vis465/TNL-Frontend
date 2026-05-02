/**
 * TruckersHub Real-time Driver Dashboard
 * Displays active drivers with live telemetry data
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Wifi,
  WifiOff,
  Users,
  Activity,
  TrendingUp,
  MapPin,
  Zap,
} from 'lucide-react';

export default function TruckersHubDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to real-time updates');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'STATUS':
              setStatus(message.data);
              break;

            case 'TELEMETRY_UPDATE':
              updateDriverTelemetry(message.data);
              break;

            case 'SPEED_VIOLATION':
              handleSpeedViolation(message.data);
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Real-time connection error');
      };

      ws.onclose = () => {
        console.log('Real-time connection closed');
      };

      setSocket(ws);

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
    }
  }, []);

  // Fetch initial data and set up polling
  useEffect(() => {
    fetchStatus();
    fetchDrivers();

    const interval = setInterval(() => {
      fetchStatus();
      fetchDrivers();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/telemetry/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/telemetry/drivers');
      const data = await response.json();

      if (data.success) {
        // Fetch detailed telemetry for each driver
        const driversWithDetails = await Promise.all(
          data.data.drivers.map(async (driver) => {
            try {
              const detailResponse = await fetch(`/api/telemetry/drivers/${driver.riderId}`);
              const detailData = await detailResponse.json();
              if (detailData.success) {
                return { ...driver, details: detailData.data.telemetry };
              }
            } catch (err) {
              console.error(`Error fetching details for ${driver.riderId}:`, err);
            }
            return driver;
          })
        );

        setDrivers(driversWithDetails);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDriverTelemetry = (data) => {
    // Real-time telemetry update from WebSocket
    console.log('Telemetry update:', data);
  };

  const handleSpeedViolation = (data) => {
    // Handle speed violation notification
    console.warn('Speed violation:', data);
  };

  const getSpeedStatus = (speed, limit) => {
    if (!speed || !limit) return 'unknown';
    if (speed > limit + 10) return 'violation';
    if (speed > limit) return 'warning';
    return 'normal';
  };

  const getFuelPercentage = (current, capacity) => {
    if (!current || !capacity) return 0;
    return (current / capacity) * 100;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-400" />
            TruckersHub Live Dashboard
          </h1>
          <div className="flex items-center gap-2">
            {status?.websocket?.connected ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Active Drivers</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {status?.activeSessions || 0}
            </div>
          </div>

          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Heartbeat</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {status?.websocket?.heartbeatInterval || 0}s
            </div>
          </div>

          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Connection</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm text-slate-300">
              {status?.websocket?.connectedAt
                ? `${formatTime(status.websocket.connectedAt)}`
                : 'Not connected'}
            </div>
          </div>

          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Last Update</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm text-slate-300">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Drivers Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Active Drivers</h2>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-8 border border-slate-600/50 text-center">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No active drivers at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {drivers.map((driver) => (
              <DriverCard key={driver.riderId} driver={driver} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Driver Card Component
 */
function DriverCard({ driver }) {
  const details = driver.details || {};
  const speed = details.speed?.kph || 0;
  const speedLimit = details.speed?.kph || 90;
  const speedStatus = speed > speedLimit + 10 ? 'violation' : speed > speedLimit ? 'warning' : 'normal';
  const fuelPercent = (details.fuel?.value || 0) / (details.fuel?.capacity || 1);

  return (
    <div className="bg-slate-700/50 backdrop-blur rounded-lg p-5 border border-slate-600/50 hover:border-slate-500/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{driver.steamId || 'Unknown'}</h3>
          <p className="text-xs text-slate-400">{driver.game?.toUpperCase()}</p>
        </div>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30">
          Active
        </span>
      </div>

      {/* Speed */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Speed</span>
          <span
            className={`text-lg font-bold ${
              speedStatus === 'violation'
                ? 'text-red-400'
                : speedStatus === 'warning'
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}
          >
            {speed} km/h
          </span>
        </div>
        <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              speedStatus === 'violation'
                ? 'bg-red-500'
                : speedStatus === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((speed / 120) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Fuel */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Fuel</span>
          <span className="text-lg font-bold text-blue-400">{(fuelPercent * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${fuelPercent * 100}%` }}
          />
        </div>
      </div>

      {/* Damage */}
      {details.damage?.total !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Damage</span>
            <span className="text-lg font-bold text-orange-400">
              {(details.damage.total * 100).toFixed(2)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${(details.damage.total * 100).toFixed(2)}%` }}
            />
          </div>
        </div>
      )}

      {/* Location */}
      {details.position && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span>
            {details.position.X?.toFixed(0)}, {details.position.Z?.toFixed(0)}
          </span>
        </div>
      )}

      {/* Last Update */}
      <div className="pt-3 border-t border-slate-600/50 text-xs text-slate-500">
        Updated: {new Date(driver.lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
}
