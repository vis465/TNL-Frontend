import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
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
// import { setItemWithExpiry } from './config/localStorageWithExpiry';

// Import Montserrat font
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/servers" element={<Servers />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/attending-events" element={<AttendingEvents />} />
          <Route path="/External/:id" element={<Others />} />
          {/* Protected routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            
          </Route>

          <Route element={<PrivateRoute allowedRoles={["user", "admin"]} />}>
            
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 