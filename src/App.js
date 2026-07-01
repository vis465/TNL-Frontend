import React, { createContext, useState, useMemo } from "react";
import TruckersHubLayout from "./components/TruckersHubLayout";
import TruckersHubDashboard from "./pages/TruckersHubDashboard";
import SpeedViolationsMonitor from "./pages/SpeedViolationsMonitor";
import LiveJobTrackingPage from "./pages/LiveJobTracking";
import TruckersHubStatus from "./pages/TruckersHubStatus";
import DriverTelemetryPage from "./pages/DriverTelemetryPage";
import { STAFF_ROLES } from "./config/adminNavigation";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import theme from "./theme";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import RiderJobs from "./pages/RiderJobs";

import JobDetails from "./pages/jobdetails";
import AdminUsers from "./pages/AdminUsers";
import EventManagement from "./pages/EventManagement";
import MyBookings from "./pages/MyBookings";
import Servers from "./pages/Servers";
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout";
import Others from "./pages/Others";
import AttendingEvents from "./components/AttendingEvents";
import AnalyticsV2Page from "./pages/analytics/AnalyticsV2Page";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import NotFoundPage from "./components/404";
import Footer from "./components/Footer";
// import { setItemWithExpiry } from './config/localStorageWithExpiry';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ExternalDataProvider } from "./contexts/ExternalDataContext";
// Import Montserrat font
import "@fontsource/montserrat/300.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/noto-sans-tamil/400.css";
import "@fontsource/noto-sans-tamil/500.css";
import "@fontsource/noto-sans-tamil/600.css";
import "@fontsource/noto-sans-tamil/700.css";
// New page imports
import Landing from "./pages/Landing";
import ContactUs from "./pages/ContactUs";
import JoinUsPage from "./pages/Application";
import Partners from "./pages/Partners";
import Team from "./pages/Team";
import TermsOfService from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Events from "./pages/Events";
import RedirectBasedOnHost from "./components/RedirectBasedOnHost";
import PlayerProfile from "./pages/playerprofile";
import LicenseGenerator from "./pages/LicenseGenerator";
import SpecialEvent from "./pages/SpecialEvent";
import HRDashboard from "./pages/HRDashboard";
import PublicAttendance from "./pages/PublicAttendance";
import AdminChallenges from "./pages/AdminChallenges";
import RiderChallenges from "./pages/RiderChallenges";
import ChallengeDetails from "./pages/ChallengeDetails";
import PublicChallenges from "./pages/PublicChallenges";
import Leaderboard from "./pages/Leaderboard";
import UserDashboardV2 from "./pages/UserDashboardV2";
import RiderRegistration from "./pages/RiderRegistration";
import AdminRiders from "./pages/AdminRiders";
import RiderAttendance from "./pages/RiderAttendance";
import AdminAchievements from "./pages/AdminAchievements";
import SteamCallback from "./pages/SteamCallback";
import SteamRegistration from "./pages/SteamRegistration";
import ContractsMarketplace from "./pages/ContractsMarketplace";
import MyContracts from "./pages/MyContracts";
import AdminBank from "./pages/AdminBank";
import AdminContracts from "./pages/AdminContracts";
import AdminRtoLayout from "./pages/admin/AdminRtoLayout";
import AdminRtoOffences from "./pages/admin/AdminRtoOffences";
import AdminRtoChallans from "./pages/admin/AdminRtoChallans";
import AdminRtoSettings from "./pages/admin/AdminRtoSettings";
import RtoIssueChallan from "./pages/rto/RtoIssueChallan";
import MyRtoChallans from "./pages/rto/MyRtoChallans";
import PageMaintenance from "./pages/pagemaintanance";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Wallet from "./pages/Wallet";
import PersonalGoals from "./pages/PersonalGoals";
import AdminUserApprovals from "./pages/AdminUserApprovals";
import JobValidation from "./pages/JobValidation";
import AdminCreateUser from "./pages/AdminCreateUser";
import ChangePassword from "./pages/ChangePassword";
import OnlineRiders from "./pages/OnlineRiders";
import MapPlayground from "./pages/MapPlayground";
import Loans from "./pages/Loans";
import AdminLoans from "./pages/AdminLoans";
import AdminEmis from "./pages/AdminEmis";
import EventCalendarPage from "./pages/EventCalendarPage";
import AdminExternalAttendance from "./pages/AdminExternalAttendance";
import AdminConvoyReminders from "./pages/admin/AdminConvoyReminders";
import FleetManagement from "./pages/FleetManagement";
import TruckMarketplace from "./pages/TruckMarketplace";
import AdminTrucks from "./pages/AdminTrucks";
import AdminDivisions from "./pages/AdminDivisions";
import AdminDivisionDetail from "./pages/AdminDivisionDetail";
import AdminCargoRates from "./pages/AdminCargoRates";
import AdminFuelMarket from "./pages/AdminFuelMarket";
import AdminDriverProgression from "./pages/AdminDriverProgression";
import MyDivision from "./pages/MyDivision";
import FuelMarketplace from "./pages/FuelMarketplace";
import DivisionInvites from "./pages/DivisionInvites";
import DivisionLeaderboard from "./pages/DivisionLeaderboard";
import DivisionPublic from "./pages/DivisionPublic";
import DivisionsIndex from "./pages/DivisionsIndex";
import AdminCoupons from "./pages/AdminCoupons";
import AdminVtcMonthlyStats from "./pages/AdminVtcMonthlyStats";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminOperations from "./pages/admin/AdminOperations";
import FleetOdometerBackfill from "./pages/admin/FleetOdometerBackfill";
import JobWorkflowDebugger from "./pages/admin/JobWorkflowDebugger";
import AdminSystemOverview from "./pages/admin/AdminSystemOverview";
import JobQueueInspector from "./pages/admin/JobQueueInspector";
import TokenPayoutCalculator from "./pages/admin/TokenPayoutCalculator";
import RiderWalletInspector from "./pages/admin/RiderWalletInspector";
import CacheInspector from "./pages/admin/CacheInspector";
import SpecialEventsListPage from "./pages/admin/SpecialEventsListPage";
import SpecialEventWorkspace from "./pages/admin/SpecialEventWorkspace";
import PowerupManagement from "./pages/PowerupManagement";

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [maintain, setmaintain] = useState(false);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
       palette: {
  mode: isDarkMode ? "dark" : "light",

  primary: {
    main: "#BFA14A",
    light: "#D8BE72",
    dark: "#8C742F",
    contrastText: "#0F0D07",
  },

  secondary: {
    main: isDarkMode ? "#D6C089" : "#2B2418",
    light: isDarkMode ? "#E5D4A8" : "#4A3F2A",
    dark: isDarkMode ? "#9D8240" : "#17120A",
    contrastText: isDarkMode ? "#0B0904" : "#FFFFFF",
  },

  background: {
    default: isDarkMode ? "#0A0907" : "#F6F3ED",
    paper: isDarkMode ? "#15120E" : "#FEFCF8",
  },

  text: {
    primary: isDarkMode
      ? "rgba(245,238,220,0.92)"
      : "rgba(28,22,12,0.92)",

    secondary: isDarkMode
      ? "rgba(214,201,168,0.64)"
      : "rgba(58,48,26,0.62)",
  },

  divider: isDarkMode
    ? "rgba(191,161,74,0.14)"
    : "rgba(120,98,40,0.12)",

  action: {
    active: isDarkMode
      ? "#CDB46A"
      : "rgba(43,36,24,0.62)",

    hover: isDarkMode
      ? "rgba(191,161,74,0.08)"
      : "rgba(191,161,74,0.06)",

    selected: isDarkMode
      ? "rgba(191,161,74,0.14)"
      : "rgba(191,161,74,0.10)",

    disabled: isDarkMode
      ? "rgba(214,201,168,0.30)"
      : "rgba(58,48,26,0.28)",

    disabledBackground: isDarkMode
      ? "rgba(191,161,74,0.08)"
      : "rgba(191,161,74,0.08)",
  },
},
      typography: {
  fontFamily: '"Montserrat", "Helvetica", sans-serif',

  h1: {
    fontSize: "4rem",
    lineHeight: 1.08,
    fontWeight: 700,
    letterSpacing: "-0.035em",
    color: isDarkMode ? "#F5EEDC" : "#0F0D07",
  },

  h2: {
    fontSize: "3rem",
    lineHeight: 1.12,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: isDarkMode ? "#F5EEDC" : "#0F0D07",
  },

  h3: {
    fontSize: "2.25rem",
    lineHeight: 1.18,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: isDarkMode ? "#F5EEDC" : "#0F0D07",
  },

  h4: {
    fontSize: "1.75rem",
    lineHeight: 1.24,
    fontWeight: 600,
    letterSpacing: "-0.015em",
    color: isDarkMode ? "#F5EEDC" : "#0F0D07",
  },

  h5: {
    fontSize: "1.35rem",
    lineHeight: 1.3,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: isDarkMode ? "#F5EEDC" : "#0F0D07",
  },

  h6: {
    fontSize: "1.05rem",
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: "-0.005em",
    color: isDarkMode ? "#F5EEDC" : "#0F0D07",
  },

  body1: {
    fontFamily: '"Montserrat", "Helvetica", sans-serif',
    fontSize: "1.05rem",
    lineHeight: 1.8,
    fontWeight: 400,
    color: isDarkMode
      ? "rgba(245,238,220,0.88)"
      : "rgba(28,22,12,0.86)",
  },

  body2: {
    fontFamily: '"Montserrat", "Helvetica", sans-serif',
    fontSize: "0.95rem",
    lineHeight: 1.7,
    fontWeight: 400,
    color: isDarkMode
      ? "rgba(214,201,168,0.66)"
      : "rgba(58,48,26,0.62)",
  },

  button: {
    fontFamily: '"Montserrat", "Helvetica", sans-serif',
    fontSize: "0.95rem",
    fontWeight: 600,
    letterSpacing: "0.045em",
    textTransform: "none",
  },

  overline: {
    fontFamily: '"Montserrat", "Helvetica", sans-serif',
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#BFA14A",
  },
},
        shape: {
          borderRadius: 6,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                letterSpacing: "0.04em",
                padding: "10px 28px",
              },
              containedPrimary: ({ theme }) => ({
                color: `${theme.palette.primary.contrastText} !important`,
                backgroundColor: theme.palette.primary.main,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: "0 2px 12px rgba(201,168,0,0.25)",
                  color: `${theme.palette.primary.contrastText} !important`,
                },
              }),
              outlined: {
                borderColor: isDarkMode
                  ? "rgba(201, 168, 0, 0.35)"
                  : "rgba(180, 148, 0, 0.40)",
                color: isDarkMode ? "#C9A800" : "#7A6400",
                "&:hover": {
                  borderColor: "#C9A800",
                  backgroundColor: isDarkMode
                    ? "rgba(201,168,0,0.07)"
                    : "rgba(180,148,0,0.06)",
                },
              },
              text: {
                color: isDarkMode ? "#C9A800" : "#7A6400",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
                fontFamily: '"DM Sans", sans-serif',
                letterSpacing: "0.02em",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? "#1E1A14" : "#FAFAF6",
                color: isDarkMode ? "#EDE8DC" : "#1A1508",
                border: isDarkMode
                  ? "1px solid rgba(201,168,0,0.10)"
                  : "1px solid rgba(180,148,0,0.13)",
                boxShadow: isDarkMode
                  ? "0 1px 24px rgba(0,0,0,0.35)"
                  : "0 1px 16px rgba(180,148,0,0.07)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? "#1E1A14" : "#FAFAF6",
                color: isDarkMode ? "#EDE8DC" : "#1A1508",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: isDarkMode ? "#1E1A14" : "#FAFAF6",
                color: isDarkMode ? "#EDE8DC" : "#1A1508",
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: isDarkMode
                  ? "rgba(201,168,0,0.10)"
                  : "rgba(180,148,0,0.13)",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                color: isDarkMode ? "#EDE8DC" : "#1A1508",
                borderBottom: isDarkMode
                  ? "1px solid rgba(201,168,0,0.10)"
                  : "1px solid rgba(180,148,0,0.12)",
              },
              head: {
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.72rem",
                color: "#C9A800",
              },
            },
          },
        },
      }),
    [isDarkMode],
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
        <ExternalDataProvider>
          <Router>
            <MuiThemeProvider theme={theme}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                <RedirectBasedOnHost />
                <Navbar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <Routes>
                    {/* Public routes */}
                    <Route
                      path="/player"
                      element={<PlayerProfile plxayerId={5304347} />}
                    />
                    <Route path="/maintain" element={<PageMaintenance />} />
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<SteamRegistration />} />
                    <Route path="steam" element={<SteamRegistration />} />

                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="/auth/steam/callback"
                      element={<SteamCallback />}
                    />
                    <Route path="/servers" element={<Servers />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route
                      path="/special-events/:id"
                      element={<SpecialEvent />}
                    />
                    <Route
                      path="/attending-events"
                      element={<AttendingEvents />}
                    />
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
                    <Route
                      path="/division-leaderboard"
                      element={<DivisionLeaderboard />}
                    />
                    <Route path="/divisions" element={<DivisionsIndex />} />
                    <Route
                      path="/divisions/:slug"
                      element={<DivisionPublic />}
                    />
                    <Route path="/map-test" element={<MapPlayground />} />
                    <Route
                      path="/riders/licence"
                      element={<LicenseGenerator />}
                    />
                    <Route path="/attendance" element={<PublicAttendance />} />
                    <Route
                      path="/riders/:driverId/challenges"
                      element={<RiderChallenges />}
                    />
                    <Route path="/challenges" element={<PublicChallenges />} />
                    <Route
                      path="/rider/register"
                      element={<RiderRegistration />}
                    />
                    {/* Authenticated personal routes (sidebar shell — same as /admin for staff) */}
                    <Route
                      element={
                        <PrivateRoute
                          allowedRoles={[
                            "rider",
                            "rto",
                            "admin",
                            "eventteam",
                            "hrteam",
                            "financeteam",
                            "communityManager",
                          ]}
                        />
                      }
                    >
                      <Route element={<AdminLayout />}>
                        <Route
                          path="/dashboard"
                          element={<UserDashboardV2 />}
                        />
                        <Route
                          path="/change-password"
                          element={<ChangePassword />}
                        />
                        <Route path="/profile" element={<UserDashboardV2 />} />
                        <Route path="/jobs" element={<RiderJobs />} />
                        {/* <Route
                          path="/validate-job"
                          element={<JobValidation />}
                        /> */}
                        <Route
                          path="/online-riders"
                          element={<OnlineRiders />}
                        />
                        <Route
                          path="/telemetry/*"
                          element={<TruckersHubLayout />}
                        >
                          <Route index element={<TruckersHubDashboard />} />
                          <Route
                            path="violations"
                            element={<SpeedViolationsMonitor />}
                          />
                          <Route
                            path="jobs"
                            element={<LiveJobTrackingPage />}
                          />
                          <Route
                            path="status"
                            element={<TruckersHubStatus />}
                          />
                          <Route
                            path="driver/:riderId"
                            element={<DriverTelemetryPage />}
                          />
                        </Route>
                        <Route
                          path="/attendance/me"
                          element={<RiderAttendance />}
                        />
                        <Route
                          path="/contracts"
                          element={<ContractsMarketplace />}
                        />
                        <Route path="/contracts/me" element={<MyContracts />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/fleet" element={<FleetManagement />} />
                        <Route
                          path="/trucks/marketplace"
                          element={<TruckMarketplace />}
                        />
                        <Route path="/loans" element={<Loans />} />
                        <Route path="/goals" element={<PersonalGoals />} />
                        <Route path="/jobs/:id" element={<JobDetails />} />
                        <Route
                          path="/calendar"
                          element={<EventCalendarPage />}
                        />
                        <Route path="/division" element={<MyDivision />} />
                        <Route
                          path="/division/fuel"
                          element={<FuelMarketplace />}
                        />
                        <Route
                          path="/division/invites"
                          element={<DivisionInvites />}
                        />
                        <Route path="/rto/my-challans" element={<MyRtoChallans />} />
                        <Route
                          path="/rto/issue"
                          element={
                            <PrivateRoute allowedRoles={["rto", "admin"]}>
                              <RtoIssueChallan />
                            </PrivateRoute>
                          }
                        />
                      </Route>
                    </Route>

                    {/* Admin area: layout with sidebar + nested gated routes */}
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute
                          allowedRoles={[
                            "admin",
                            "eventteam",
                            "hrteam",
                            "financeteam",
                            "communityManager",
                          ]}
                        >
                          <AdminLayout
                            sidebarBrandTitle="Staff console"
                            mobileBarTitle="Staff console"
                          />
                        </PrivateRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route
                        path="jobs"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <AdminJobs />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="events"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <EventManagement />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="special-events"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <SpecialEventsListPage />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="special-events/:eventId"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <SpecialEventWorkspace />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="external-attendance"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <AdminExternalAttendance />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="convoy-reminders"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <AdminConvoyReminders />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <AnalyticsV2Page />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="trucks"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                            <AdminTrucks />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="users"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <AdminUsers />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="create-user"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <AdminCreateUser />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="challenges"
                        element={
                          <PrivateRoute
                            allowedRoles={[
                              "admin",
                              "eventteam",
                              "hrteam",
                              "financeteam",
                            ]}
                          >
                            <AdminChallenges />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="challenges/:id"
                        element={
                          <PrivateRoute
                            allowedRoles={[
                              "admin",
                              "eventteam",
                              "hrteam",
                              "financeteam",
                            ]}
                          >
                            <ChallengeDetails />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="attendance"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <HRDashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="powerups"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <PowerupManagement />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="riders"
                        element={
                          <PrivateRoute
                            allowedRoles={["admin", "eventteam", "hrteam"]}
                          >
                            <AdminRiders />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="achievements"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <AdminAchievements />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="bank"
                        element={
                          <PrivateRoute allowedRoles={["admin", "financeteam"]}>
                            <AdminBank />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="contracts"
                        element={
                          <PrivateRoute
                            allowedRoles={["admin", "eventteam", "financeteam"]}
                          >
                            <AdminContracts />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="loans"
                        element={
                          <PrivateRoute allowedRoles={["admin", "financeteam"]}>
                            <AdminLoans />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="emis"
                        element={
                          <PrivateRoute allowedRoles={["admin", "financeteam"]}>
                            <AdminEmis />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="divisions"
                        element={
                          <PrivateRoute
                            allowedRoles={["admin", "communityManager"]}
                          >
                            <AdminDivisions />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="divisions/:id"
                        element={
                          <PrivateRoute
                            allowedRoles={["admin", "communityManager"]}
                          >
                            <AdminDivisionDetail />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="cargo-rates"
                        element={
                          <PrivateRoute allowedRoles={["admin"]}>
                            <AdminCargoRates />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="fuel-market"
                        element={
                          <PrivateRoute allowedRoles={["admin"]}>
                            <AdminFuelMarket />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="driver-progression"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <AdminDriverProgression />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="rto"
                        element={
                          <PrivateRoute allowedRoles={["admin", "eventteam", "financeteam"]}>
                            <AdminRtoLayout />
                          </PrivateRoute>
                        }
                      >
                        <Route index element={<Navigate to="challans" replace />} />
                        <Route
                          path="offences"
                          element={
                            <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                              <AdminRtoOffences />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="challans"
                          element={
                            <PrivateRoute allowedRoles={["admin", "eventteam", "financeteam"]}>
                              <AdminRtoChallans />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="settings"
                          element={
                            <PrivateRoute allowedRoles={["admin", "eventteam"]}>
                              <AdminRtoSettings />
                            </PrivateRoute>
                          }
                        />
                      </Route>
                      <Route
                        path="coupons"
                        element={
                          <PrivateRoute allowedRoles={["admin"]}>
                            <AdminCoupons />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="vtc-monthly-stats"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <AdminVtcMonthlyStats />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="audit-logs"
                        element={
                          <PrivateRoute
                            allowedRoles={[
                              "admin",
                              "eventteam",
                              "hrteam",
                              "financeteam",
                              "communityManager",
                            ]}
                          >
                            <AdminAuditLogs />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager"]}>
                            <AdminOperations />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/fleet-odometer"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager"]}>
                            <FleetOdometerBackfill />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/system"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager"]}>
                            <AdminSystemOverview />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/job-workflow"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager"]}>
                            <JobWorkflowDebugger />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/job-queue"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager"]}>
                            <JobQueueInspector />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/token-calculator"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager", "financeteam"]}>
                            <TokenPayoutCalculator />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/rider-inspector"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager", "financeteam"]}>
                            <RiderWalletInspector />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="operations/cache"
                        element={
                          <PrivateRoute allowedRoles={["admin", "communityManager"]}>
                            <CacheInspector />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="user-approvals"
                        element={
                          <PrivateRoute allowedRoles={["admin", "hrteam"]}>
                            <AdminUserApprovals />
                          </PrivateRoute>
                        }
                      />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </MuiThemeProvider>
          </Router>
        </ExternalDataProvider>
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
