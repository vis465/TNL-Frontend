Driver Performance Frontend
===========================

This folder adds a lightweight Driver Performance dashboard used in the admin division overview.

Files added
- `src/contexts/DriverPerformanceContext.js` — provides `DriverPerformanceProvider` and polling/websocket placeholder.
- `src/components/DriverPerformance/*` — UI components: `Dashboard`, `Leaderboards`, `PerksCertifications`, `TrendChart`.

Backend expectations (optional)
- GET `/api/leaderboard` — main precomputed leaderboard payload (see backend `/routes/leaderboard.js`).
- GET `/api/driver-progression/ranks/leaderboard` — rank leaderboard.
- GET `/api/driver-progression/certifications/available` — available certifications.
- GET `/api/driver-progression/skill-levels/details` — skill level configs.
- GET `/api/driver-progression/ranks/milestones` — rank milestones.
	(The frontend polls these endpoints every 20 seconds; no websocket is required.)

How to use
- The dashboard is automatically mounted in `src/pages/AdminDivisionDetail.jsx` inside the Overview tab.
- The context polls every 20s and queries the backend endpoints above; the UI tolerates missing backend responses.

Notes
- This frontend implements scoring, XP progress, level labels, perks, certifications, leaderboards and a tiny trend sparkline.
- For production, provide a secure websocket endpoint and backend snapshot endpoint returning real data.
