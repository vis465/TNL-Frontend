/**
 * TruckersHub Routes Configuration
 * Add these routes to your main application router
 */

import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import TruckersHubDashboard from '../pages/TruckersHubDashboard';
import DriverTelemetryPage from '../pages/DriverTelemetryPage';
import SpeedViolationsMonitor from '../pages/SpeedViolationsMonitor';
import LiveJobTrackingPage from '../pages/LiveJobTracking';
import TruckersHubStatus from '../pages/TruckersHubStatus';
import { Navigation, Home, AlertTriangle, Map, Settings } from 'lucide-react';

/**
 * Main TruckersHub Layout Component
 * Provides navigation and layout for all telemetry pages
 */
export function TruckersHubLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-800/50 backdrop-blur border-r border-slate-700/50 overflow-y-auto">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Navigation className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-white">TruckersHub</h1>
          </div>
          <p className="text-sm text-slate-400">Real-time Driver Telemetry</p>
        </div>

        <nav className="p-4 space-y-2">
          <NavLinkItem
            to="/telemetry"
            icon={Home}
            label="Dashboard"
            isActive={isActive('/telemetry') && location.pathname === '/telemetry'}
          />
          <NavLinkItem
            to="/telemetry/violations"
            icon={AlertTriangle}
            label="Speed Violations"
            isActive={isActive('/telemetry/violations')}
          />
          <NavLinkItem
            to="/telemetry/jobs"
            icon={Map}
            label="Live Jobs"
            isActive={isActive('/telemetry/jobs')}
          />
          <NavLinkItem
            to="/telemetry/status"
            icon={Settings}
            label="System Status"
            isActive={isActive('/telemetry/status')}
          />
        </nav>

        <div className="p-4 border-t border-slate-700/50 absolute bottom-0 w-full">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 text-xs">
            <p className="text-slate-400 mb-2">Current Time</p>
            <p className="text-white font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <Routes>
          <Route path="/" element={<TruckersHubDashboard />} />
          <Route path="/violations" element={<SpeedViolationsMonitor />} />
          <Route path="/jobs" element={<LiveJobTrackingPage />} />
          <Route path="/status" element={<TruckersHubStatus />} />
          <Route path="/driver/:riderId" element={<DriverTelemetryPage />} />
        </Routes>
      </div>
    </div>
  );
}

/**
 * Navigation Link Item Component
 */
function NavLinkItem({ to, icon: Icon, label, isActive }) {
  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

/**
 * ROUTER SETUP INSTRUCTIONS
 *
 * 1. In your main App.jsx or Router configuration file, add:
 *
 *    import { TruckersHubLayout } from './components/TruckersHubLayout';
 *
 *    // Inside your main Routes component:
 *    <Route path="/telemetry/*" element={<TruckersHubLayout />} />
 *
 * 2. From your main navigation, add a link:
 *
 *    <Link to="/telemetry">TruckersHub Dashboard</Link>
 *
 * 3. Route structure will be:
 *    - /telemetry                    → Main dashboard with active drivers
 *    - /telemetry/violations         → Speed violations monitor
 *    - /telemetry/jobs               → Live job tracking
 *    - /telemetry/status             → System status and health
 *    - /telemetry/driver/:riderId    → Individual driver details
 *
 * EXAMPLE: Complete Router Setup
 */

export const ExampleRouterSetup = () => {
  return (
    <Routes>
      {/* Other routes... */}

      {/* TruckersHub Telemetry Routes */}
      <Route path="/telemetry/*" element={<TruckersHubLayout />} />

      {/* Other routes... */}
    </Routes>
  );
};

/**
 * QUICK START: Add this to your main App.jsx
 *
 * ```jsx
 * import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
 * import { TruckersHubLayout } from './components/TruckersHubLayout';
 *
 * function App() {
 *   return (
 *     <Router>
 *       <nav className="bg-slate-800 p-4 flex gap-4">
 *         <Link to="/" className="text-white hover:text-blue-400">Home</Link>
 *         <Link to="/telemetry" className="text-white hover:text-blue-400">TruckersHub</Link>
 *       </nav>
 *
 *       <Routes>
 *         <Route path="/" element={<HomePage />} />
 *         <Route path="/telemetry/*" element={<TruckersHubLayout />} />
 *       </Routes>
 *     </Router>
 *   );
 * }
 *
 * export default App;
 * ```
 */

export default TruckersHubLayout;
