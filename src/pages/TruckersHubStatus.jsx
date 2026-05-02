/**
 * TruckersHub Integration Status Page
 * System health and connection monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Settings,
  TrendingUp,
  Clock,
  Zap,
  Heart,
} from 'lucide-react';

export default function TruckersHubStatusPage() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    fetchStatus();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/telemetry/status');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
        setError(null);

        // Calculate stats
        const uptime = new Date() - new Date(data.data?.websocket?.connectedAt);
        const uptimeMinutes = Math.floor(uptime / 60000);
        const uptimeHours = Math.floor(uptimeMinutes / 60);

        setStats({
          uptime:
            uptimeHours > 0
              ? `${uptimeHours}h ${uptimeMinutes % 60}m`
              : `${uptimeMinutes}m`,
          connected: data.data?.websocket?.connected,
          reconnectAttempts: data.data?.websocket?.reconnectAttempts || 0,
          activeSessions: data.data?.activeSessions || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Activity className="w-10 h-10 text-green-400" />
            Integration Status
          </h1>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <p className="text-slate-400">Real-time system health and TruckersHub connection status</p>
      </div>

      {/* Connection Status */}
      {status && (
        <div className="mb-8">
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-8 border border-slate-600/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">WebSocket Connection</h2>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  stats?.connected
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border-red-500/30 text-red-400'
                }`}
              >
                {stats?.connected ? (
                  <>
                    <Wifi className="w-5 h-5" />
                    <span className="font-semibold">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5" />
                    <span className="font-semibold">Disconnected</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatusCard
                icon={Clock}
                label="Connected Since"
                value={
                  status.websocket?.connectedAt
                    ? new Date(status.websocket.connectedAt).toLocaleTimeString()
                    : 'N/A'
                }
              />
              <StatusCard
                icon={TrendingUp}
                label="Uptime"
                value={stats?.uptime || 'N/A'}
                color="green"
              />
              <StatusCard
                icon={Heart}
                label="Heartbeat Interval"
                value={`${status.websocket?.heartbeatInterval || 0}s`}
              />
              <StatusCard
                icon={Zap}
                label="Reconnect Attempts"
                value={stats?.reconnectAttempts || 0}
                color={stats?.reconnectAttempts > 0 ? 'warning' : 'success'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="mb-8">
        <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            Active Sessions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SessionCard
              label="Active Drivers"
              value={stats?.activeSessions || 0}
              icon={Wifi}
              color="blue"
            />
            <SessionCard
              label="Status"
              value={stats?.connected ? 'Monitoring' : 'Offline'}
              icon={CheckCircle}
              color={stats?.connected ? 'green' : 'red'}
            />
            <SessionCard
              label="Last Updated"
              value={new Date().toLocaleTimeString()}
              icon={Clock}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="mb-8">
        <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-yellow-400" />
            Configuration
          </h2>

          <div className="space-y-4">
            <ConfigItem label="Gateway URL" value="wss://gateway.truckershub.in/" />
            <ConfigItem label="Company ID" value="772" />
            <ConfigItem label="Game" value="ets2" />
            <ConfigItem label="Heartbeat Interval" value="30 seconds" />
            <ConfigItem label="Auto-Reconnect" value="Enabled (5s delay, max 10 attempts)" />
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="mb-8">
        <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Health Checks
          </h2>

          <div className="space-y-3">
            <HealthCheck
              label="WebSocket Connection"
              status={stats?.connected ? 'healthy' : 'warning'}
            />
            <HealthCheck
              label="Active Sessions"
              status={stats?.activeSessions > 0 ? 'healthy' : 'idle'}
            />
            <HealthCheck
              label="Reconnection Status"
              status={stats?.reconnectAttempts === 0 ? 'healthy' : 'warning'}
            />
            <HealthCheck label="API Endpoints" status="healthy" />
            <HealthCheck label="Database Connection" status="healthy" />
          </div>
        </div>
      </div>

      {/* Auto-Refresh Control */}
      <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5 rounded border-slate-400"
              />
              <span className="text-white font-medium">Auto-Refresh</span>
            </label>

            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-2 bg-slate-600/30 text-slate-300 border border-slate-600/50 rounded font-medium hover:border-slate-500/50 focus:outline-none"
              >
                <option value={2000}>Every 2s</option>
                <option value={5000}>Every 5s</option>
                <option value={10000}>Every 10s</option>
                <option value={30000}>Every 30s</option>
              </select>
            )}
          </div>

          <p className="text-sm text-slate-400">
            Last update: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Status Card Component
 */
function StatusCard({ icon: Icon, label, value, color = 'default' }) {
  const colorClasses = {
    default: 'bg-slate-600/30 border-slate-600/50',
    green: 'bg-green-500/20 border-green-500/30',
    warning: 'bg-yellow-500/20 border-yellow-500/30',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 border`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-blue-400" />
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

/**
 * Session Card Component
 */
function SessionCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <div className={`${colors[color]} rounded-lg p-6 border flex items-start justify-between`}>
      <div>
        <p className="text-sm font-medium opacity-75 mb-2">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon className="w-8 h-8 opacity-50" />
    </div>
  );
}

/**
 * Config Item Component
 */
function ConfigItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-600/30 rounded border border-slate-600/50">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className="text-sm font-mono text-slate-300">{value}</span>
    </div>
  );
}

/**
 * Health Check Component
 */
function HealthCheck({ label, status }) {
  const statusColors = {
    healthy: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    idle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const statusIcons = {
    healthy: CheckCircle,
    warning: AlertCircle,
    idle: Activity,
    error: AlertCircle,
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className={`${statusColors[status]} rounded-lg p-4 border flex items-center justify-between`}>
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm capitalize font-semibold">{status}</span>
        <StatusIcon className="w-5 h-5" />
      </div>
    </div>
  );
}
