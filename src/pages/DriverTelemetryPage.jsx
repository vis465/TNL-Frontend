/**
 * Driver Telemetry Details Page
 * Detailed view of a single driver's real-time data
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Gauge,
  Droplet,
  AlertCircle,
  MapPin,
  Package,
  DollarSign,
  Zap,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function DriverTelemetryPage() {
  const { riderId } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDriverDetails();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDriverDetails();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [riderId, autoRefresh]);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/telemetry/drivers/${riderId}`);
      const data = await response.json();

      if (data.success) {
        setDriver(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch driver data');
      }
    } catch (err) {
      console.error('Error fetching driver details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <div className="animate-spin">
          <Activity className="w-12 h-12 text-blue-400" />
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <button
          onClick={() => navigate('/telemetry')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-8 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-red-200 mb-1">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const telemetry = driver.telemetry || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/telemetry')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10 text-blue-400" />
              Driver Details
            </h1>
            <p className="text-slate-400">
              Steam ID: <span className="font-mono text-slate-300">{driver.steamId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={fetchDriverDetails}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-6">
        {/* Vehicle Status */}
        <Section title="Vehicle Status" icon={Gauge}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Speed */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Speed
              </h3>
              <div className="mb-4">
                <div className="text-4xl font-bold text-blue-400">
                  {telemetry.speed?.kph || 0}
                  <span className="text-lg text-slate-400 ml-2">km/h</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {telemetry.speed?.mph || 0} mph
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Speed</span>
                  <span>{telemetry.speed?.value?.toFixed(2) || 0} m/s</span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${Math.min((telemetry.speed?.kph || 0) / 120 * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Fuel */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Fuel
              </h3>
              <div className="mb-4">
                <div className="text-4xl font-bold text-green-400">
                  {((telemetry.fuel?.value || 0) / (telemetry.fuel?.capacity || 1) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {telemetry.fuel?.value?.toFixed(1) || 0} L / {telemetry.fuel?.capacity || 0} L
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Range</span>
                  <span>{telemetry.fuel?.range?.toFixed(0) || 0} km</span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(telemetry.fuel?.value || 0) / (telemetry.fuel?.capacity || 1) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Damage */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Damage
              </h3>
              <div className="mb-4">
                <div className="text-4xl font-bold text-orange-400">
                  {(telemetry.damage?.total * 100 || 0).toFixed(2)}%
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Chassis:</span>
                  <span>{(telemetry.damage?.chassis * 100 || 0).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span>{(telemetry.damage?.engine * 100 || 0).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wheels:</span>
                  <span>{(telemetry.damage?.wheels * 100 || 0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Location & Job */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location */}
          <Section title="Current Location" icon={MapPin}>
            {telemetry.position ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">X</p>
                    <p className="text-lg font-mono text-blue-300">
                      {telemetry.position.X?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Y</p>
                    <p className="text-lg font-mono text-blue-300">
                      {telemetry.position.Y?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Z</p>
                    <p className="text-lg font-mono text-blue-300">
                      {telemetry.position.Z?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {telemetry.location && (
                  <div className="bg-slate-600/30 rounded p-3 border border-slate-600/50">
                    <p className="text-sm text-slate-400">City</p>
                    <p className="text-lg font-semibold text-white">
                      {telemetry.location.city?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Distance: {telemetry.location.distance?.toFixed(1)} km
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">No position data available</p>
            )}
          </Section>

          {/* Job Info */}
          <Section title="Current Job" icon={Package}>
            {telemetry.job ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-600/30 rounded border border-slate-600/50">
                  <span className="text-slate-400">Income</span>
                  <span className="text-xl font-bold text-green-400 flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    {telemetry.job.income}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Cargo</p>
                  <div className="p-3 bg-slate-600/30 rounded border border-slate-600/50">
                    <p className="font-semibold text-white mb-1">{telemetry.job.cargo?.name}</p>
                    <p className="text-sm text-slate-400">
                      {telemetry.job.cargo?.mass} kg ({telemetry.job.cargo?.unitMass} kg/unit)
                    </p>
                    <p className="text-xs text-yellow-400 mt-1">
                      Damage: {(telemetry.job.cargo?.damage * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">From</p>
                    <p className="text-sm font-semibold text-white">
                      {telemetry.job.source?.city?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">To</p>
                    <p className="text-sm font-semibold text-white">
                      {telemetry.job.destination?.city?.name}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Distance</p>
                  <p className="text-lg font-bold text-blue-400">
                    {telemetry.job.plannedDistance?.km} km
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No active job</p>
            )}
          </Section>
        </div>

        {/* Truck Details */}
        <Section title="Vehicle Details" icon={Zap}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard
              label="Make"
              value={telemetry.truck?.make?.name || 'Unknown'}
            />
            <InfoCard
              label="Model"
              value={telemetry.truck?.model?.name || 'Unknown'}
            />
            <InfoCard
              label="License Plate"
              value={telemetry.truck?.licensePlate?.value || 'N/A'}
            />
            <InfoCard
              label="Odometer"
              value={`${telemetry.truck?.odometer?.toFixed(0)} km`}
            />
          </div>
        </Section>

        {/* Timestamp */}
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            Last Updated
          </div>
          <div className="text-white font-mono">
            {new Date(driver.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Section Component
 */
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-slate-700/50 backdrop-blur rounded-lg border border-slate-600/50 overflow-hidden">
      <div className="flex items-center gap-3 p-6 bg-slate-600/30 border-b border-slate-600/50">
        <Icon className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/**
 * Info Card Component
 */
function InfoCard({ label, value }) {
  return (
    <div className="bg-slate-600/30 rounded-lg p-4 border border-slate-600/50">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <p className="text-sm font-semibold text-white truncate">{value}</p>
    </div>
  );
}
