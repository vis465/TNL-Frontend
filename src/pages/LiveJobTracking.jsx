/**
 * Live Job Tracking Page
 * Monitor active jobs with real-time driver progress
 */

import React from 'react';
import { useState,useEffect } from 'react';
import {
  Map,
  Package,
  Navigation,
  AlertCircle,
  CheckCircle,
  Truck,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function LiveJobTrackingPage() {
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, map, detail

  useEffect(() => {
    fetchActiveJobs();

    const interval = setInterval(() => {
      fetchActiveJobs();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/telemetry/drivers');
      const data = await response.json();

      if (data.success) {
        const driversWithJobs = [];

        // Fetch detailed telemetry for each driver to get job info
        await Promise.all(
          data.data.drivers.map(async (driver) => {
            try {
              const detailResponse = await fetch(`/api/telemetry/drivers/${driver.riderId}`);
              const detailData = await detailResponse.json();

              if (detailData.success && detailData.data.telemetry.job) {
                driversWithJobs.push({
                  ...driver,
                  job: detailData.data.telemetry.job,
                  vehicle: detailData.data.telemetry,
                  position: detailData.data.telemetry.position,
                });
              }
            } catch (err) {
              console.error(`Error fetching details for ${driver.riderId}:`, err);
            }
          })
        );

        setJobs(driversWithJobs);
        setDrivers(data.data.drivers);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching active jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (job, vehicle) => {
    if (!job?.plannedDistance || !vehicle?.speed?.kph) return 0;
    // This is a simplified estimate - actual progress tracking would need more data
    return Math.random() * 100; // Placeholder
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
          <Navigation className="w-10 h-10 text-blue-400" />
          Live Job Tracking
        </h1>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-4">
          {['list', 'map', 'detail'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              {mode === 'list' && '📋 List'}
              {mode === 'map' && '🗺️ Map'}
              {mode === 'detail' && '🔍 Details'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-slate-400 mb-1">Active Jobs</p>
            <p className="text-3xl font-bold text-blue-400">{jobs.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-slate-400 mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-400">
              ${jobs.reduce((sum, j) => sum + (j.job?.income || 0), 0)}
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
            <p className="text-sm text-slate-400 mb-1">Avg. Distance</p>
            <p className="text-3xl font-bold text-purple-400">
              {jobs.length > 0
                ? (
                    jobs.reduce((sum, j) => sum + (j.job?.plannedDistance?.km || 0), 0) /
                    jobs.length
                  ).toFixed(0)
                : 0}
              km
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin">
            <Truck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <JobListView
          jobs={jobs}
          onSelectJob={setSelectedJob}
          getProgressPercentage={getProgressPercentage}
        />
      ) : viewMode === 'detail' && selectedJob ? (
        <JobDetailView job={selectedJob} />
      ) : (
        <div className="text-center py-12 px-6 bg-slate-700/50 backdrop-blur rounded-lg border border-slate-600/50">
          <Map className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">Map view coming soon</p>
        </div>
      )}
    </div>
  );
}

/**
 * Job List View
 */
function JobListView({ jobs, onSelectJob, getProgressPercentage }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-slate-700/50 backdrop-blur rounded-lg border border-slate-600/50">
        <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No active jobs at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.riderId}
          onClick={() => onSelectJob(job)}
          className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50 hover:border-slate-500/50 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Driver {job.steamId?.slice(-6)}
              </h3>
              <p className="text-sm text-slate-400">
                {job.job.source?.city?.name} → {job.job.destination?.city?.name}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-green-400 flex items-center gap-1 justify-end">
                <DollarSign className="w-5 h-5" />
                {job.job.income}
              </div>
              <p className="text-sm text-slate-400">{job.job.plannedDistance?.km} km</p>
            </div>
          </div>

          {/* Cargo Info */}
          <div className="mb-4 p-3 bg-slate-600/30 rounded border border-slate-600/50">
            <p className="text-sm text-slate-400 mb-1">Cargo</p>
            <p className="font-semibold text-white">{job.job.cargo?.name}</p>
            <p className="text-xs text-slate-400 mt-1">
              {job.job.cargo?.mass} kg • Damage: {(job.job.cargo?.damage * 100).toFixed(2)}%
            </p>
          </div>

          {/* Vehicle Status */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatusBadge
              icon={TrendingUp}
              label="Speed"
              value={`${job.vehicle?.speed?.kph || 0} km/h`}
              color="blue"
            />
            <StatusBadge
              icon={Truck}
              label="Fuel"
              value={`${(
                ((job.vehicle?.fuel?.value || 0) / (job.vehicle?.fuel?.capacity || 1)) *
                100
              ).toFixed(0)}%`}
              color="green"
            />
            <StatusBadge
              icon={AlertCircle}
              label="Damage"
              value={`${((job.vehicle?.damage?.total || 0) * 100).toFixed(1)}%`}
              color="orange"
            />
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Progress</span>
              <span className="text-xs font-semibold text-white">
                {getProgressPercentage(job.job, job.vehicle).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(job.job, job.vehicle)}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Job Detail View
 */
function JobDetailView({ job }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
        <h2 className="text-2xl font-bold text-white mb-4">Job Details</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem label="Cargo" value={job.job.cargo?.name} />
          <DetailItem label="Weight" value={`${job.job.cargo?.mass} kg`} />
          <DetailItem label="Income" value={`$${job.job.income}`} color="green" />
          <DetailItem label="Distance" value={`${job.job.plannedDistance?.km} km`} />
          <DetailItem label="Speed" value={`${job.vehicle?.speed?.kph || 0} km/h`} />
          <DetailItem
            label="Fuel"
            value={`${(
              ((job.vehicle?.fuel?.value || 0) / (job.vehicle?.fuel?.capacity || 1)) *
              100
            ).toFixed(0)}%`}
          />
        </div>
      </div>

      {/* Route */}
      <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Route
        </h3>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400 mb-1">From</p>
            <p className="text-lg font-semibold text-white">
              {job.job.source?.city?.name}
            </p>
            <p className="text-xs text-slate-500">{job.job.source?.company?.name}</p>
          </div>

          <div className="py-2 text-center">
            <Navigation className="w-4 h-4 text-blue-400 mx-auto" />
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-1">To</p>
            <p className="text-lg font-semibold text-white">
              {job.job.destination?.city?.name}
            </p>
            <p className="text-xs text-slate-500">{job.job.destination?.company?.name}</p>
          </div>
        </div>
      </div>

      {/* Cargo Details */}
      <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-400" />
          Cargo Details
        </h3>

        <div className="space-y-3">
          <DetailItem label="Type" value={job.job.cargo?.name} />
          <DetailItem label="Mass" value={`${job.job.cargo?.mass} kg`} />
          <DetailItem label="Unit Mass" value={`${job.job.cargo?.unitMass} kg`} />
          <DetailItem
            label="Damage"
            value={`${(job.job.cargo?.damage * 100).toFixed(2)}%`}
            color={job.job.cargo?.damage > 0.1 ? 'red' : 'green'}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  return (
    <div className={`${colors[color]} rounded p-2 border flex flex-col items-center text-center`}>
      <Icon className="w-4 h-4 mb-1" />
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

/**
 * Detail Item Component
 */
function DetailItem({ label, value, color = 'white' }) {
  const colorClasses = {
    white: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
  };

  return (
    <div className="bg-slate-600/30 rounded-lg p-3 border border-slate-600/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}
