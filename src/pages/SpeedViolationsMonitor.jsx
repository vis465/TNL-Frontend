/**
 * Speed Violations Monitoring Page
 * Real-time tracking of speed violations with severity indicators
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  AlertCircle,
  Activity,
  Zap,
  BarChart3,
  Filter,
} from 'lucide-react';

export default function SpeedViolationsMonitor() {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    today: 0,
  });
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all'); // all, critical, warning
  const [sortBy, setSortBy] = useState('recent'); // recent, severity, speed

  // Initialize WebSocket for real-time violations
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'SPEED_VIOLATION') {
            addViolation(message.data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
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

  const addViolation = (data) => {
    const violation = {
      id: `${data.riderId}-${Date.now()}`,
      riderId: data.riderId,
      violation: data.violation,
      timestamp: new Date(),
      severity: getSeverity(data.violation),
    };

    setViolations((prev) => [violation, ...prev.slice(0, 99)]);

    // Update stats
    setStats((prev) => ({
      total: prev.total + 1,
      critical: violation.severity === 'critical' ? prev.critical + 1 : prev.critical,
      warning: violation.severity === 'warning' ? prev.warning + 1 : prev.warning,
      today: prev.today + 1,
    }));
  };

  const getSeverity = (violation) => {
    const excess = violation.excess || 0;
    if (excess > 25) return 'critical';
    if (excess > 15) return 'warning';
    return 'minor';
  };

  const getFilteredViolations = () => {
    let filtered = violations;

    if (filter !== 'all') {
      filtered = violations.filter((v) => {
        if (filter === 'critical') return v.severity === 'critical';
        if (filter === 'warning') return v.severity === 'critical' || v.severity === 'warning';
        return true;
      });
    }

    // Sort
    if (sortBy === 'recent') {
      filtered = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'severity') {
      const severityOrder = { critical: 3, warning: 2, minor: 1 };
      filtered = [...filtered].sort(
        (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
      );
    } else if (sortBy === 'speed') {
      filtered = [...filtered].sort(
        (a, b) => (b.violation.excess || 0) - (a.violation.excess || 0)
      );
    }

    return filtered;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const filteredViolations = getFilteredViolations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          Speed Violations Monitor
        </h1>
        <p className="text-slate-400">Real-time tracking of driver speed violations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Violations"
          value={stats.total}
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Critical"
          value={stats.critical}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Warning"
          value={stats.warning}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Today"
          value={stats.today}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-slate-700/50 backdrop-blur rounded-lg border border-slate-600/50 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filter:</span>
        </div>

        <div className="flex gap-2">
          {['all', 'critical', 'warning'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-600/30 text-slate-400 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 bg-slate-600/30 text-slate-300 border border-slate-600/50 rounded text-sm font-medium hover:border-slate-500/50 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="severity">By Severity</option>
            <option value="speed">By Speed Excess</option>
          </select>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-3">
        {filteredViolations.length === 0 ? (
          <div className="text-center py-12 px-6 bg-slate-700/50 backdrop-blur rounded-lg border border-slate-600/50">
            <Activity className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-lg">No violations detected</p>
            <p className="text-slate-500 text-sm mt-1">
              {filter !== 'all'
                ? 'Try adjusting your filters'
                : 'All drivers are following speed limits'}
            </p>
          </div>
        ) : (
          filteredViolations.map((violation) => (
            <ViolationCard
              key={violation.id}
              violation={violation}
              getSeverityColor={getSeverityColor}
              getSeverityIcon={getSeverityIcon}
            />
          ))
        )}
      </div>

      {/* Auto-scroll note */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
        <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <p className="text-blue-200 text-sm">
          New violations appear at the top of the list in real-time
        </p>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500/30',
    red: 'bg-red-500/20 border-red-500/30',
    yellow: 'bg-yellow-500/20 border-yellow-500/30',
    orange: 'bg-orange-500/20 border-orange-500/30',
  };

  const textColor = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
  };

  return (
    <div
      className={`${colorClasses[color]} backdrop-blur rounded-lg p-6 border flex items-start justify-between`}
    >
      <div>
        <p className={`text-sm font-medium mb-2 ${textColor[color]}`}>{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <Icon className={`w-6 h-6 ${textColor[color]} opacity-50`} />
    </div>
  );
}

/**
 * Violation Card Component
 */
function ViolationCard({ violation, getSeverityColor, getSeverityIcon }) {
  const timeAgo = getTimeAgo(violation.timestamp);

  return (
    <div
      className={`${getSeverityColor(
        violation.severity
      )} backdrop-blur rounded-lg p-4 border transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-1">{getSeverityIcon(violation.severity)}</div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white capitalize">
                {violation.severity} Severity Violation
              </h3>
              <span className="text-xs opacity-75 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs opacity-75 mb-1">Current Speed</p>
                <p className="text-lg font-bold">{violation.violation.currentSpeed} km/h</p>
              </div>

              <div>
                <p className="text-xs opacity-75 mb-1">Speed Limit</p>
                <p className="text-lg font-bold">{violation.violation.speedLimit} km/h</p>
              </div>

              <div>
                <p className="text-xs opacity-75 mb-1">Excess</p>
                <p className="text-lg font-bold">+{violation.violation.excess} km/h</p>
              </div>
            </div>

            <p className="text-xs opacity-75 mt-3 font-mono">
              Rider ID: {violation.riderId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to format time
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleTimeString();
}
