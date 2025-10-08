import React, { createContext, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobs from './pages/AdminJobs';
import RiderJobs from './pages/RiderJobs';

import JobDetails from './pages/jobdetails';
import AdminUsers from './pages/AdminUsers';
import EventManagement from './pages/EventManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import MyBookings from './pages/MyBookings';
import Servers from './pages/Servers';
import PrivateRoute from './components/PrivateRoute';
import Others from './pages/Others';
import AttendingEvents from "./components/AttendingEvents"
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import NotFoundPage from './components/404';
import Footer from './components/Footer';
// import { setItemWithExpiry } from './config/localStorageWithExpiry';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
// Import Montserrat font
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/noto-sans-tamil/400.css';
import '@fontsource/noto-sans-tamil/500.css';
import '@fontsource/noto-sans-tamil/600.css';
import '@fontsource/noto-sans-tamil/700.css';
// New page imports
import Landing from './pages/Landing';
import ContactUs from './pages/ContactUs';
import JoinUsPage from './pages/Application';
import Partners from './pages/Partners';
import Team from './pages/Team';
import TermsOfService from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Events from './pages/Events';
import RedirectBasedOnHost from './components/RedirectBasedOnHost';
import PlayerProfile from './pages/playerprofile';
import LicenseGenerator from './pages/LicenseGenerator';
import SpecialEvent from './pages/SpecialEvent';
import HRDashboard from './pages/HRDashboard';
import PublicAttendance from './pages/PublicAttendance';
import AdminChallenges from './pages/AdminChallenges';
import RiderChallenges from './pages/RiderChallenges';
import ChallengeDetails from './pages/ChallengeDetails';
import PublicChallenges from './pages/PublicChallenges';
import Leaderboard from './pages/Leaderboard';
import UserDashboardV2 from './pages/UserDashboardV2';
import RiderRegistration from './pages/RiderRegistration';
import AdminRiders from './pages/AdminRiders';
import RiderAttendance from './pages/RiderAttendance';
import AdminAchievements from './pages/AdminAchievements';
import SteamCallback from './pages/SteamCallback';
import SteamRegistration from './pages/SteamRegistration';
import ContractsMarketplace from './pages/ContractsMarketplace';
import MyContracts from './pages/MyContracts';
import AdminBank from './pages/AdminBank';
import AdminContracts from './pages/AdminContracts';
import PageMaintenance from './pages/pagemaintanance';

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [maintain,setmaintain]=useState(false)
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#90caf9' : '#1976d2',
            light: isDarkMode ? '#e3f2fd' : '#63a4ff',
            dark: isDarkMode ? '#42a5f5' : '#004ba0',
            contrastText: '#ffffff',
          },
          secondary: {
            main: isDarkMode ? '#f48fb1' : '#d81b60',
            light: isDarkMode ? '#fce4ec' : '#ff5c8d',
            dark: isDarkMode ? '#c2185b' : '#880e4f',
            contrastText: '#ffffff',
          },
          background: {
            default: isDarkMode ? '#121212' : '#fafafa',
            paper: isDarkMode ? '#1f1f1f' : '#ffffff',
          },
          text: {
            primary: isDarkMode ? '#ffffff' : '#212121',
            secondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          },
          action: {
            active: isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.54)',
            hover: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            selected: isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
            disabled: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
            disabledBackground: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          },
        },
        typography: {
          fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            color: isDarkMode ? '#ffffff' : '#212121',
          },
          h2: {
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : '#212121',
          },
          h3: {
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : '#212121',
          },
          h4: {
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : '#212121',
          },
          h5: {
            fontWeight: 500,
            color: isDarkMode ? '#ffffff' : '#212121',
          },
          h6: {
            fontWeight: 500,
            color: isDarkMode ? '#ffffff' : '#212121',
          },
          body1: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
          },
          body2: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
              contained: {
                color: '#ffffff',
              },
              outlined: {
                borderColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(0, 0, 0, 0.23)',
                color: isDarkMode ? '#ffffff' : 'inherit',
              },
              text: {
                color: isDarkMode ? '#ffffff' : 'inherit',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                color: isDarkMode ? '#ffffff' : 'inherit',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                color: isDarkMode ? '#ffffff' : 'inherit',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                color: isDarkMode ? '#ffffff' : 'inherit',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                color: isDarkMode ? '#ffffff' : 'inherit',
                borderBottom: isDarkMode 
                  ? '1px solid rgba(255, 255, 255, 0.12)' 
                  : '1px solid rgba(0, 0, 0, 0.12)',
              },
              head: {
                fontWeight: 600,
                color: isDarkMode ? '#ffffff' : 'inherit',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  if (maintain) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="*" element={<PageMaintenance />} />
          </Routes>
        </Router>
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <MuiThemeProvider theme={theme}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '100vh'
            }}>

              <RedirectBasedOnHost />
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/player" element={<PlayerProfile playerId={5304347} />} />
                  <Route path="/maintain" element={<PageMaintenance />} />
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register/steam" element={<SteamRegistration />} />
                  <Route path="/auth/steam/callback" element={<SteamCallback />} />
                  <Route path="/servers" element={<Servers />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/special-events/:id" element={<SpecialEvent />} />
                  <Route path="/attending-events" element={<AttendingEvents />} />
                  <Route path="/External/:id" element={<Others />} />
                  {/* New public routes */}
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/apply" element={<JoinUsPage />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/events" element={<Home />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/riders/licence" element={<LicenseGenerator />} />
                  <Route path="/attendance" element={<PublicAttendance />} />
                  <Route path="/riders/:driverId/challenges" element={<RiderChallenges />} />
                  <Route path="/challenges" element={<PublicChallenges />} />
                  <Route path="/rider/register" element={<RiderRegistration />} />
                  {/* Authenticated personal routes */}
                  <Route element={<PrivateRoute allowedRoles={["rider","admin","eventteam","hrteam","financeteam"]} />}>
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/dashboard" element={<UserDashboardV2 />} />
                    <Route path="/profile" element={<UserDashboardV2 />} />
                    <Route path="/jobs" element={<RiderJobs />} />
                    <Route path="/attendance" element={<RiderAttendance />} />
                  <Route path="/contracts" element={<ContractsMarketplace />} />
                  <Route path="/contracts/me" element={<MyContracts />} />
                    {/* <Route path="/jobs/:id" element={<JobDetailsMUI />} /> */}
                    <Route path="/jobs/:id" element={<JobDetails />} />
                  </Route>
                  
                  {/* Role-based admin area: shared dashboard, gated subroutes */}
                  <Route element={<PrivateRoute allowedRoles={["admin","eventteam","hrteam"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    {/* Admin only */}
                    <Route path="/admin/users" element={<PrivateRoute allowedRoles={["admin"]}><AdminUsers /></PrivateRoute>} />
                    {/* Admin + Event team */}
                    <Route path="/admin/jobs" element={<PrivateRoute allowedRoles={["admin","eventteam"]}><AdminJobs /></PrivateRoute>} />
                    <Route path="/admin/events" element={<PrivateRoute allowedRoles={["admin","eventteam"]}><EventManagement /></PrivateRoute>} />
                    <Route path="/admin/analytics" element={<PrivateRoute allowedRoles={["admin","eventteam"]}><AnalyticsDashboard /></PrivateRoute>} />
                    <Route path="/admin/challenges" element={<PrivateRoute allowedRoles={["admin","eventteam","hrteam"]}><AdminChallenges /></PrivateRoute>} />
                    <Route path="/admin/challenges/:id" element={<PrivateRoute allowedRoles={["admin","eventteam","hrteam"]}><ChallengeDetails /></PrivateRoute>} />
                    {/* Admin + HR team */}
                    <Route path="/admin/attendance" element={<PrivateRoute allowedRoles={["admin","hrteam"]}><HRDashboard /></PrivateRoute>} />
                    <Route path="/admin/riders" element={<PrivateRoute allowedRoles={["admin","eventteam","hrteam"]}><AdminRiders /></PrivateRoute>} />
                    <Route path="/admin/achievements" element={<PrivateRoute allowedRoles={["admin","hrteam"]}><AdminAchievements /></PrivateRoute>} />
                    <Route path="/admin/bank" element={<PrivateRoute allowedRoles={["admin"]}><AdminBank /></PrivateRoute>} />
                    <Route path="/admin/contracts" element={<PrivateRoute allowedRoles={["admin","eventteam",'financeteam']}><AdminContracts /></PrivateRoute>} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </MuiThemeProvider>
        </Router>
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    </ThemeContext.Provider>
  );

}

export default App; 