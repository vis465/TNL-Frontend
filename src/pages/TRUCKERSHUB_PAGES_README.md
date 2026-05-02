# TruckersHub Frontend Pages

Complete real-time driver telemetry dashboard for TNL platform. Built with React, Tailwind CSS, and Lucide icons.

## 📁 File Structure

```
frontend/src/
├── pages/
│   ├── TruckersHubDashboard.jsx         # Main dashboard with live drivers
│   ├── DriverTelemetryPage.jsx          # Detailed view for single driver
│   ├── SpeedViolationsMonitor.jsx       # Real-time speed violations
│   ├── LiveJobTracking.jsx              # Job progress monitoring
│   └── TruckersHubStatus.jsx            # System health & status
└── components/
    └── TruckersHubLayout.jsx             # Navigation layout & routing
```

## 🚀 Quick Setup

### 1. Install Lucide Icons (if not already installed)
```bash
npm install lucide-react
```

### 2. Add Routes to Your App
In your main `App.jsx` or router setup:

```jsx
import { TruckersHubLayout } from './components/TruckersHubLayout';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Your other routes */}
      <Route path="/telemetry/*" element={<TruckersHubLayout />} />
    </Routes>
  );
}
```

### 3. Add Navigation Link
Add link to your main navigation:

```jsx
<Link to="/telemetry" className="nav-link">
  🚚 TruckersHub Dashboard
</Link>
```

## 📄 Pages Overview

### 1. **TruckersHub Dashboard** (`/telemetry`)
Main real-time dashboard showing all active drivers.

**Features:**
- Live driver list with status indicators
- Real-time speed, fuel, and damage tracking
- Connection status
- Auto-updating telemetry cards
- WebSocket integration for instant updates

**Props:** None (fetches from API)

### 2. **Driver Telemetry Page** (`/telemetry/driver/:riderId`)
Detailed view of a single driver's telemetry data.

**Features:**
- Vehicle status (speed, fuel, damage)
- Current location (XYZ coordinates)
- Active job details (cargo, income, route)
- Truck information
- Real-time updates every 3 seconds

**Props:** 
- `riderId` (URL param) - Driver's rider ID

### 3. **Speed Violations Monitor** (`/telemetry/violations`)
Real-time speed violation tracking with severity levels.

**Features:**
- Live violation feed
- Severity indicators (critical, warning, minor)
- Filtering by severity
- Sorting options (recent, severity, speed excess)
- Real-time WebSocket updates
- Historical stats

**Props:** None (WebSocket-driven)

### 4. **Live Job Tracking** (`/telemetry/jobs`)
Monitor active delivery jobs with real-time progress.

**Features:**
- Active jobs list
- Route information (source → destination)
- Cargo details
- Progress tracking
- Job income and statistics
- Multiple view modes (list, detail)

**Props:** None (fetches from API)

### 5. **System Status** (`/telemetry/status`)
Monitor TruckersHub integration health and connection status.

**Features:**
- WebSocket connection status
- Uptime tracking
- Reconnection attempts
- Active sessions count
- Health checks
- Configuration display
- Auto-refresh controls

**Props:** None (fetches from API)

## 🎨 Design System

### Colors Used
- **Primary:** Blue (`#3b82f6`) - Actions, info
- **Success:** Green (`#22c55e`) - Connected, healthy
- **Warning:** Yellow/Orange (`#eab308`, `#f97316`) - Caution
- **Error:** Red (`#ef4444`) - Critical issues
- **Neutral:** Slate (`#0f172a` - `#e2e8f0`) - Backgrounds, text

### Components Used
- **Lucide Icons** - All icons
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Native WebSocket API** - Real-time updates

## 🔗 API Integration

All pages connect to these backend API endpoints:

### Status Endpoint
```
GET /api/telemetry/status
```
Returns: WebSocket status, active sessions, heartbeat interval

### Drivers List
```
GET /api/telemetry/drivers
```
Returns: Array of active drivers with basic info

### Driver Details
```
GET /api/telemetry/drivers/:riderId
```
Returns: Detailed telemetry for specific driver

### WebSocket Events
```
wss://{host}
```
Events:
- `STATUS` - System status update
- `TELEMETRY_UPDATE` - Driver telemetry data
- `SPEED_VIOLATION` - Speed violation alert

## 📊 Real-time Features

### WebSocket Connection
Pages automatically connect to backend WebSocket for real-time updates:

```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
const ws = new WebSocket(wsUrl);
```

### Event Types
- **TELEMETRY_UPDATE** - Real-time driver data (position, speed, fuel, etc.)
- **SPEED_VIOLATION** - Speed violation detection
- **STATUS** - System health updates
- **PLAYER_ONLINE** - Driver comes online
- **PLAYER_OFFLINE** - Driver goes offline

## 🎯 Usage Examples

### Navigate to Dashboard
```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/telemetry')}>
      Open Dashboard
    </button>
  );
}
```

### Navigate to Driver Details
```jsx
const handleDriverClick = (riderId) => {
  navigate(`/telemetry/driver/${riderId}`);
};
```

### Fetch Driver Data Manually
```jsx
const fetchDriver = async (riderId) => {
  const response = await fetch(`/api/telemetry/drivers/${riderId}`);
  const data = await response.json();
  return data;
};
```

## 🔧 Customization

### Change Refresh Intervals
In any page component:

```jsx
// Dashboard refreshes every 5 seconds
const [refreshInterval, setRefreshInterval] = useState(5000);

// Update to different interval
setRefreshInterval(3000); // 3 seconds
```

### Add Custom Filters
In `SpeedViolationsMonitor.jsx`:

```jsx
// Add to filter array
const filterOptions = ['all', 'critical', 'warning', 'my-custom-filter'];
```

### Modify Color Scheme
Update Tailwind color classes in each component:

```jsx
// Change blue to purple
className="bg-purple-500/20 border-purple-500/30 text-purple-400"
```

## 🚨 Common Issues

### WebSocket Connection Fails
- Check if backend is running on correct port
- Verify WebSocket endpoint in backend
- Check for CORS/proxy issues
- Ensure WSS certificate valid for HTTPS

### No Data Displayed
- Check API endpoints are returning data
- Verify riders have Steam IDs in database
- Check browser console for errors
- Ensure backend services initialized

### Styles Not Applied
- Verify Tailwind CSS configured correctly
- Check postcss.config.js and tailwind.config.js
- Rebuild CSS if needed: `npm run build`

## 📱 Responsive Design
All pages are fully responsive:
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: Multi-column grid
- Navigation adapts to screen size

## ♿ Accessibility
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast maintained
- Focus indicators visible

## 🎓 Learning Resources

### React Concepts Used
- Functional components with hooks
- `useState` for state management
- `useEffect` for side effects
- `useParams` and `useNavigate` from React Router
- WebSocket API

### Tailwind CSS Patterns
- Grid layouts
- Flexbox
- Color utilities
- Responsive prefixes (md:, lg:, etc.)
- Gradient backgrounds
- Border and shadow utilities

## 🤝 Integration Checklist

- [ ] Lucide icons installed
- [ ] React Router configured
- [ ] Backend API endpoints working
- [ ] WebSocket connection established
- [ ] Routes added to main router
- [ ] Navigation links added
- [ ] Database has rider Steam IDs
- [ ] Backend services initialized
- [ ] Testing in development environment
- [ ] Deploy to production

## 📝 File Dependencies

```
TruckersHubDashboard.jsx
├── lucide-react (icons)
├── react (hooks)
└── fetch API

DriverTelemetryPage.jsx
├── react-router-dom (useParams, useNavigate)
├── lucide-react (icons)
└── fetch API

SpeedViolationsMonitor.jsx
├── WebSocket API
├── lucide-react (icons)
└── React hooks

LiveJobTracking.jsx
├── lucide-react (icons)
├── React hooks
└── fetch API

TruckersHubStatus.jsx
├── lucide-react (icons)
├── React hooks
└── fetch API

TruckersHubLayout.jsx
├── react-router-dom
├── lucide-react (icons)
└── All page components
```

## 🔐 Security Notes

- All data fetched from secure endpoints
- WebSocket over WSS (encrypted)
- No sensitive data stored in browser
- Rider IDs used for authorization
- Error messages don't expose system details

## 📞 Support

For issues or questions:
1. Check backend logs
2. Verify API endpoints
3. Check browser developer tools
4. Review backend integration README
5. Contact team lead

---

**Last Updated:** May 2, 2026
**Version:** 1.0.0
**Status:** Production Ready
