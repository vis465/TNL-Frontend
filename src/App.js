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

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);


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
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/servers" element={<Servers />} />
                  <Route path="/events/:id" element={<EventDetails />} />
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
                  <Route path="/license" element={<LicenseGenerator />} />
                  {/* Protected routes */}
                  <Route element={<PrivateRoute allowedRoles={["admin","eventteam"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    
                    <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
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