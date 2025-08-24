import React, { useState, useEffect } from "react";
import Markdown from 'react-markdown'
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Link,
  Paper,
  List,
  Avatar,
  AvatarGroup,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  CardActions,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  LinearProgress,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Route as RouteIcon,
  RequestPage as RequestIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  LocalShipping as TruckIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Whatshot as FireIcon,
  EmojiEvents as TrophyIcon,
  FlashOn as FlashIcon,
  Sync as SyncIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { format, addHours } from "date-fns";
import axiosInstance from "../utils/axios";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { keyframes } from "@emotion/react";
dayjs.extend(utc);

const SpecialEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [routeSlots, setRouteSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const [requestForm, setRequestForm] = useState({
    vtcName: "",
    vtcRole: "",
    vtcLink: "",
    playercount: "",
    discordUsername: "",
    truck: "",
    trailer: "",
    notes: "",
  });

  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState({});
  const [routeRequests, setRouteRequests] = useState({});

  const theme = useTheme();

  // Function to get allocated VTCs for a specific slot
  const getSlotAllocations = (slot, routeName) => {
    console.log("getSlotAllocations called with:", { slot: slot._id, routeName, routeRequests });
    if (!routeRequests[routeName]) {
      console.log(`No requests found for route: ${routeName}`);
      return [];
    }
    
    const allocations = routeRequests[routeName].filter(request => 
      request.allocatedSlotId === slot._id && request.status === 'approved'
    );
    console.log(`Found ${allocations.length} allocations for slot ${slot._id}`);
    return allocations;
  };

  // Function to get pending requests for a specific slot
  const getSlotPendingRequests = (slot, routeName) => {
    console.log("getSlotPendingRequests called with:", { slot: slot._id, routeName, routeRequests });
    if (!routeRequests[routeName]) {
      console.log(`No requests found for route: ${routeName}`);
      return [];
    }
    
    const pending = routeRequests[routeName].filter(request => 
      request.allocatedSlotId === slot._id && request.status === 'pending'
    );
    console.log(`Found ${pending.length} pending requests for slot ${slot._id}`);
    return pending;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(`/special-events/${id}`);
        setEvent(response.data.event);
        console.log(response.data.event);
        setRouteSlots(response.data.routeSlots);
        
        // Set route requests for allocation display
        if (response.data.routeRequests) {
          console.log("Setting route requests:", response.data.routeRequests);
          setRouteRequests(response.data.routeRequests);
        } else {
          console.log("No route requests found in response");
        }

        if (response.data.event.routes.length > 0) {
          setSelectedRoute(0);
        }
      } catch (error) {
        console.error("Error fetching special event:", error);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRequestRoute = () => {
    setRequestForm({
      vtcName: "",
      vtcRole: "",
      playercount: 1,
      discordUsername: "",
      vtcLink: "",
      notes: "",
    });
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    
    try {
      setRequestLoading(true);
      setError("");

      const requestData = {
        vtcName: requestForm.vtcName,
        vtcRole: requestForm.vtcRole,
        playercount: parseInt(requestForm.playercount),
        discordUsername: requestForm.discordUsername,
        vtcLink: requestForm.vtcLink,
        notes: requestForm.notes,
      };

      // Submit general request (admin will allocate to route and slot)
      const response = await axiosInstance.post(
        `/special-events/${event.truckersmpId}/request`,
        requestData
      );

      console.log("Request submitted successfully:", response.data);
      console.log("Request details:", {
        eventId: event.truckersmpId,
        routeName: event.routes[selectedRoute].name,
        requestData: requestData,
        response: response.data,
      });
      setRequestSuccess(true);

      // Close dialog and reset form
      setRequestDialogOpen(false);
      setRequestForm({
        vtcName: "",
        vtcRole: "",
        playercount: 1,
        discordUsername: "",
        vtcLink: "",
        notes: "",
      });

      // Refresh event data to show updated request count
      console.log("Refreshing event data after request submission...");
      const eventResponse = await axiosInstance.get(`/special-events/${id}`);
      console.log("Refreshed event data:", eventResponse.data);
      console.log("Route slots:", eventResponse.data.routeSlots);
      console.log("Route requests:", eventResponse.data.routeRequests);
      setEvent(eventResponse.data.event);
      setRouteSlots(eventResponse.data.routeSlots);
      if (eventResponse.data.routeRequests) {
        setRouteRequests(eventResponse.data.routeRequests);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setError(error.response?.data?.message || "Failed to submit request");
    } finally {
      setRequestLoading(false);
    }
  };

  const getSlotStatusColor = (slot) => {
    if (slot.status === "assigned") return "success";
    if (slot.status === "requested") return "warning";
    if (slot.status === "closed") return "error";
    return "default";
  };

  const getSlotStatusText = (slot) => {
    if (slot.status === "assigned") return "Assigned";
    if (slot.status === "requested") return "Requested";
    if (slot.status === "closed") return "Closed";
    return "Available";
  };

  const getRequestStatusIcon = (request) => {
    switch (request.status) {
      case "approved":
        return <CheckIcon color="success" />;
      case "rejected":
        return <CancelIcon color="error" />;
      case "pending":
        return <PendingIcon sx={{ color: "#FF9800" }} />;
      default:
        return <InfoIcon />;
    }
  };

  const getRequestStatusColor = (request) => {
    switch (request.status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const toggleSlotExpansion = (slotId) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 6,
          }}
        >
          <CircularProgress
            size={60}
            sx={{
              color: "#FFD700",
              mb: 3,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              color: "#F57C00",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
            }}
          >
            🌟 Loading Special Event...
          </Typography>
          <LinearProgress
            sx={{
              width: "100%",
              maxWidth: 400,
              mt: 2,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#FFD700",
              },
            }}
          />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
   return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? '#0f0f0f' : '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          background: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRadius: '8px',
          padding: '48px 32px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 1px 3px rgba(255, 255, 255, 0.05)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid #2a2a2a' 
            : '1px solid #e5e7eb',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          
          {/* Status Icon */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: theme.palette.mode === 'dark' ? '#2563eb' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'white'
            }} />
          </div>
          
          {/* Main Message */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#111827',
            marginBottom: '8px',
            lineHeight: '1.3'
          }}>
            Event Details Coming Soon
          </h1>
          
          {/* Subtitle */}
          <p style={{
            fontSize: '16px',
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            We're working on something special for this event. Check back soon for all the exciting details.
          </p>
          
          {/* Loading Bar */}
     
          
          {/* Back Button */}
          <button
            onClick={() => window.history.go(-2)}
            style={{
              backgroundColor: 'transparent',
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              fontWeight: '500',
              fontSize: '14px',
              border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#d1d5db'}`,
              borderRadius: '6px',
              padding: '10px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = theme.palette.mode === 'dark' ? '#4b5563' : '#9ca3af';
              e.target.style.color = theme.palette.mode === 'dark' ? '#d1d5db' : '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = theme.palette.mode === 'dark' ? '#374151' : '#d1d5db';
              e.target.style.color = theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280';
            }}
          >
            <span>←</span>
            Go Back
          </button>
        </div>
        
        {/* CSS Animations */}
        <style jsx>{`
        @keyframes drive {
          0% {
            transform: translateX(-10%);
          }
          100% {
            transform: translateX(110%);
          }
        }
      `}</style>

      </div>
    );
  }


  const currentRoute = event.routes[selectedRoute];
  const currentRouteSlots = routeSlots[currentRoute?.name] || [];
  const currentRouteRequests = currentRouteSlots.flatMap(
    (slot) => slot.requests
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{ pt: 4, pb: 8, position: "relative", zIndex: 1 }}
      >
        {/* Floating Specialty Badges */}
        <Box
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        ></Box>

        {/* Enhanced Event Header */}
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 6,
            mb: 4,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)",
            border: "2px solid",
            borderImage: "linear-gradient(45deg, #FFD700, #FF9800, #FFD700) 1",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background:
                "linear-gradient(90deg, #FFD700 0%, #FF6B35 25%, #F7931E 50%, #FFD700 75%, #FF9800 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "-200% 0" },
                "100%": { backgroundPosition: "200% 0" },
              },
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 2, p: 5 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                {/* Event Type Badge */}

                {/* Enhanced Title */}
                <Typography
                  variant="h2"
                  gutterBottom
                  sx={{
                    fontFamily: "'Montserrat', 'Roboto', sans-serif",
                    fontWeight: 900,
                    background:
                      "linear-gradient(45deg, #FFD700 0%, #FF9800 50%, #FFD700 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
                    mb: 3,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {event.title}
                </Typography>

                {/* Enhanced Description */}
                <Typography
                  variant="h6"
                  color="rgba(255,255,255,0.9)"
                  paragraph
                  sx={{
                    lineHeight: 1.8,
                    fontSize: "1.3rem",
                    fontWeight: 300,
                    mb: 4,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {event.description}
                </Typography>

                {/* Premium Info Cards Grid */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)",
                        border: "2px solid rgba(255, 215, 0, 0.3)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(255, 215, 0, 0.2)",
                        },
                      }}
                    >
                      <EventIcon sx={{ color: "#FFD700", fontSize: 36 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.7)"
                          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                        >
                          📅 EVENT DATE
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "#FFD700", fontWeight: 800 }}
                        >
                          August 25, 2025
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)",
                        border: "2px solid rgba(255, 193, 7, 0.3)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(255, 193, 7, 0.2)",
                        },
                      }}
                    >
                      <ScheduleIcon sx={{ color: "#FFC107", fontSize: 36 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.7)"
                          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                        >
                          ⏰ DURATION
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "#FFC107", fontWeight: 800 }}
                        >
                          2:00 PM - 6:00 PM
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(245, 124, 0, 0.1) 100%)",
                        border: "2px solid rgba(255, 152, 0, 0.3)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(255, 152, 0, 0.2)",
                        },
                      }}
                    >
                      <LocationIcon sx={{ color: "#FF9800", fontSize: 36 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.7)"
                          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                        >
                          🎯 MEETING POINT
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "#FF9800", fontWeight: 800 }}
                        >
                          {event.meetingPoint}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        p: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, rgba(245, 124, 0, 0.15) 0%, rgba(255, 107, 53, 0.1) 100%)",
                        border: "2px solid rgba(245, 124, 0, 0.3)",
                        backdropFilter: "blur(10px)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 40px rgba(245, 124, 0, 0.2)",
                        },
                      }}
                    >
                      <TruckIcon sx={{ color: "#F57C00", fontSize: 36 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          color="rgba(255,255,255,0.7)"
                          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                        >
                          🛣️ ROUTE
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "#F57C00", fontWeight: 800 }}
                        >
                          {event.departurePoint} → {event.arrivalPoint}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {event.banner && (
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "3px solid",
                      borderImage: "linear-gradient(45deg, #FFD700, #FF9800) 1",
                      boxShadow: "0 20px 60px rgba(255, 215, 0, 0.3)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        background:
                          "linear-gradient(45deg, #FFD700, #FF9800, #FFD700)",
                        borderRadius: 4,
                        zIndex: -1,
                        animation: "borderRotate 3s linear infinite",
                        "@keyframes borderRotate": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={event.banner}
                      alt={event.title}
                      sx={{
                        height: 320,
                        objectFit: "cover",
                        filter: "brightness(0.9) contrast(1.1)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        p: 2,
                      }}
                    ></Box>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Enhanced Rules Section */}
          </Box>
        </Paper>

        {/* Enhanced Route Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.8) 100%)",
            border: "2px solid rgba(255, 215, 0, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Tabs
            value={selectedRoute}
            onChange={(e, newValue) => setSelectedRoute(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                fontSize: "1.1rem",
                textTransform: "none",
                minHeight: 80,
                color: "rgba(255,255,255,0.7)",
                "&.Mui-selected": {
                  color: "#FFD700",
                  background:
                    "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%)",
                },
                "&:hover": {
                  color: "#FFC107",
                  background: "rgba(255, 215, 0, 0.05)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFD700",
                height: 6,
                borderRadius: 3,
              },
            }}
          >
            {event.routes.map((route, index) => (
              <Tab
                key={route.name}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <RouteIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {route.name}
                      </Typography>
                    </Box>
                    <Badge
                      badgeContent={
                        routeSlots[route.name]?.reduce(
                          (total, slot) =>
                            total + (slot.maxVtc - (slot.allocatedVtcs || 0)),
                          0
                        ) || 0
                      }
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#FFD700",
                          color: "#000",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {routeSlots[route.name]?.reduce(
                          (total, slot) =>
                            total + (slot.maxVtc - (slot.allocatedVtcs || 0)),
                          0
                        ) || 0}{" "}
                        spots available
                      </Typography>
                    </Badge>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* Enhanced Route Description */}
        {currentRoute && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 152, 0, 0.05) 100%)",
              border: "2px solid rgba(255, 215, 0, 0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: "#FFD700",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              🛣️ {currentRoute.name}
            </Typography>
            {currentRoute.description && (
              <Typography
                variant="h6"
                color="rgba(255,255,255,0.9)"
                sx={{ fontSize: "1.2rem", lineHeight: 1.6 }}
              >
                {currentRoute.description}
              </Typography>
            )}
          </Paper>
        )}

        {/* Enhanced Slots Grid */}
        <Box sx={{ mb: 4 }}>
          {/* Route Summary */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background:
                "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              borderRadius: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{ color: "#FFD700", fontWeight: 800 }}
                  >
                    {currentRouteSlots.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ fontWeight: 700 }}
                  >
                    TOTAL SLOTS
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{ color: "#4CAF50", fontWeight: 800 }}
                  >
                    {currentRouteSlots.reduce(
                      (total, slot) =>
                        total + (slot.maxVtc - (slot.allocatedVtcs || 0)),
                      0
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ fontWeight: 700 }}
                  >
                    AVAILABLE SPOTS
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{ color: "#FF9800", fontWeight: 800 }}
                  >
                    {currentRouteSlots.reduce(
                      (total, slot) => total + (slot.allocatedVtcs || 0),
                      0
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ fontWeight: 700 }}
                  >
                    USED SPOTS
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{ color: "#2196F3", fontWeight: 800 }}
                  >
                    {currentRouteRequests ? currentRouteRequests.length : 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ fontWeight: 700 }}
                  >
                    TOTAL REQUESTS
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Route Request Button */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleRequestRoute}
                sx={{
                  background:
                    "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                  color: "white",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "1.2rem",
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)",
                  },
                }}
              >
                🎯 Submit Event Request
              </Button>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.7)"
                sx={{ mt: 1, fontStyle: "italic" }}
              >
                Submit a request for this event. Admins will allocate you to an
                appropriate route and slot.
              </Typography>

              {/* Route Request Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 2,
                  background:
                    "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
                  border: "1px solid rgba(33, 150, 243, 0.3)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.9)"
                  sx={{ textAlign: "center", fontWeight: 500 }}
                >
                  ℹ️ <strong>How it works:</strong> Submit event request → Admin
                  reviews → Admin allocates you to route & slot → You're
                  confirmed!
                </Typography>
              </Paper>
            </Box>
          </Paper>

          {/* All Slots Display */}
          <Typography
            variant="h4"
            sx={{
              color: "#FFD700",
              fontWeight: 800,
              mb: 3,
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            🎯 Route Slots Overview
          </Typography>

          <Grid container spacing={3}>
            {currentRouteSlots.map((slot, index) => (
              <Grid item xs={12} sm={6} md={4} key={slot._id || index}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 4,
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(26,26,46,0.85) 100%)",
                    border: (() => {
                      if (slot.status === "assigned")
                        return "3px solid #4CAF50"; // Assigned
                      if (slot.status === "available")
                        return "3px solid #2196F3"; // Available
                      return "3px solid #FF9800"; // Default
                    })(),
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  {/* Status Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      label={
                        slot.status === "available" ? "AVAILABLE" : "ASSIGNED"
                      }
                      color={
                        slot.status === "available" ? "success" : "warning"
                      }
                      size="small"
                      sx={{
                        fontWeight: 800,
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      }}
                    />
                  </Box>

                  {/* Slot Image */}
                  {slot.imageUrl && (
                    <Box
                      sx={{
                        position: "relative",
                        height: "200px",
                        overflow: "hidden",
                      }}
                    >
                      
                      <img
                        src={slot.imageUrl}
                        alt={`Slot ${slot.slotNumber}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      
                      {/* Image Overlay */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            "linear-gradient(transparent, rgba(0,0,0,0.8))",
                          p: 2,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            color: "#FFD700",
                            fontWeight: 800,
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          🎯 {slot.slotName || `Slot ${slot.slotNumber}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1, p: 3 }}>
                    {/* Slot Details */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#FFD700",
                          fontWeight: 800,
                          mb: 1,
                        }}
                      >
                        {slot.slotName || `Slot ${slot.slotNumber}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="rgba(255,255,255,0.8)"
                        sx={{ mb: 1 }}
                      >
                        📍 Position: {slot.slotNumber}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="rgba(255,255,255,0.8)"
                        sx={{ mb: 1 }}
                      >
                        � Max VTCs: {slot.maxVtc}
                      </Typography>
                      {slot.description && (
                        <Typography
                          variant="body2"
                          color="rgba(255,255,255,0.7)"
                          sx={{ mb: 2 }}
                        >
                          📝 {slot.description}
                        </Typography>
                      )}
                    </Box>

                    {/* Booked Slot Details */}
                    {(() => {
                      const allocatedVtcs = getSlotAllocations(slot, currentRoute?.name);
                      const pendingRequests = getSlotPendingRequests(slot, currentRoute?.name);
                      
                      if (allocatedVtcs.length > 0 || pendingRequests.length > 0) {
                        return (
                          <Box sx={{ mb: 2 }}>
                            {/* Allocated VTCs */}
                            {allocatedVtcs.length > 0 && (
                              <>
                                <Typography
                                  variant="subtitle2"
                                  color="#4CAF50"
                                  sx={{ fontWeight: 700, mb: 1 }}
                                >
                                  ✅ ALLOCATED VTCs
                                </Typography>
                                <List dense>
                                  {allocatedVtcs.map((req, idx) => (
                                    <ListItem
                                      key={idx}
                                      sx={{
                                        background: "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)",
                                        borderRadius: 2,
                                        mb: 1,
                                        border: "1px solid rgba(76, 175, 80, 0.3)",
                                      }}
                                    >
                                      <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: "#4CAF50" }} />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Typography variant="subtitle2" sx={{ color: "#4CAF50", fontWeight: 700 }}>
                                            {req.vtcName}
                                          </Typography>
                                        }
                                        secondary={
                                          <>
                                          <span style={{ color: "#FFD700" }}>
                                              Slot Number:
                                            </span>{" "}
                                            {req.admincomment || "N/A"}
                                            <br />
                                           
                                            
                                            {req.vtcLink && (
                                              <>
                                                <br />
                                                <span style={{ color: "#FF9800" }}>
                                                  VTC Link:
                                                </span>{" "}
                                                <Link href={req.vtcLink} target="_blank" sx={{ color: "#FFD700" }}>
                                                  View VTC
                                                </Link>
                                              </>
                                            )}
                                            
                                          </>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </>
                            )}

                            {/* Pending Requests */}
                           
                          </Box>
                        );
                      }
                      return null;
                    })()}

                    {/* Special Requirements */}
                    {slot.specialRequirements &&
                      slot.specialRequirements.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="rgba(255,255,255,0.8)"
                            sx={{ fontWeight: 700, mb: 1 }}
                          >
                            ⚠️ SPECIAL REQUIREMENTS
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {slot.specialRequirements.map((req, idx) => (
                              <Chip
                                key={idx}
                                label={req}
                                size="small"
                                variant="outlined"
                                sx={{
                                  color: "#FF9800",
                                  borderColor: "#FF9800",
                                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                    {/* Slot Status Info */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        background:
                          slot.status === "available"
                            ? "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)"
                            : slot.status === "assigned"
                            ? "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)"
                            : "linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.05) 100%)",
                        border: `1px solid ${
                          slot.status === "available"
                            ? "rgba(76, 175, 80, 0.3)"
                            : slot.status === "assigned"
                            ? "rgba(255, 152, 0, 0.3)"
                            : "rgba(244, 67, 54, 0.3)"
                        }`,
                      }}
                    >
                      {slot.status === "available" ? (
                        <>
                          <CheckCircleIcon
                            sx={{ color: "#4CAF50", fontSize: 24 }}
                          />
                          <Typography
                            variant="body2"
                            color="rgba(255,255,255,0.9)"
                            sx={{ fontWeight: 700 }}
                          >
                            This slot is available for booking!
                          </Typography>
                        </>
                      ) : slot.status === "assigned" ? (
                        <>
                          <WarningIcon
                            sx={{ color: "#FF9800", fontSize: 24 }}
                          />
                          <Typography
                            variant="body2"
                            color="rgba(255,255,255,0.9)"
                            sx={{ fontWeight: 700 }}
                          >
                            This slot is partially filled ({slot.allocatedVtcs || 0}/{slot.maxVtc} spots taken)
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CancelIcon
                            sx={{ color: "#F44336", fontSize: 24 }}
                          />
                          <Typography
                            variant="body2"
                            color="rgba(255,255,255,0.9)"
                            sx={{ fontWeight: 700 }}
                          >
                            This slot is full ({slot.maxVtc}/{slot.maxVtc} spots taken)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>

                  {/* Slot Status Display */}
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Box sx={{ width: "100%", textAlign: "center" }}>
                      <Chip
                        label={
                          slot.status === "available"
                            ? "Available"
                            : slot.status === "assigned"
                            ? "Partially Filled"
                            : "Full"
                        }
                        color={
                          slot.status === "available"
                            ? "success"
                            : slot.status === "assigned"
                            ? "warning"
                            : "error"
                        }
                        sx={{ fontWeight: 700, fontSize: "1rem" }}
                      />
                      <Typography
                        variant="body2"
                        color="rgba(255,255,255,0.7)"
                        sx={{ mt: 1 }}
                      >
                        {slot.maxVtc - (slot.allocatedVtcs || 0)}/{slot.maxVtc}{" "}
                        spots available
                      </Typography>
                      <a href={slot.imageUrl}>
                      <button >View image</button></a>
                      {/* Allocation Summary */}
                      {(() => {
                        const allocatedVtcs = getSlotAllocations(slot, currentRoute?.name);
                        const pendingRequests = getSlotPendingRequests(slot, currentRoute?.name);
                        
                        if (allocatedVtcs.length > 0 || pendingRequests.length > 0) {
                          return (
                            <Box sx={{ mt: 2, p: 2, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                              <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ fontWeight: 600 }}>
                                📊 ALLOCATION SUMMARY
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "space-around", mt: 1 }}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: 800 }}>
                                    {allocatedVtcs.length}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                    Confirmed
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="h6" sx={{ color: "#FF9800", fontWeight: 800 }}>
                                    {pendingRequests.length}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                    Pending
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="h6" sx={{ color: "#2196F3", fontWeight: 800 }}>
                                    {slot.maxVtc - (slot.allocatedVtcs || 0)}
                                  </Typography>
                                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                    Available
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced No Slots Message */}
        {currentRouteSlots.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 6,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.8) 100%)",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              backdropFilter: "blur(15px)",
            }}
          >
            <RouteIcon
              sx={{
                fontSize: 120,
                color: "#FFD700",
                mb: 4,
                filter: "drop-shadow(0 8px 16px rgba(255, 215, 0, 0.3))",
              }}
            />
            <Typography
              variant="h3"
              color="#FFD700"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 3,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              🚫 NO SLOTS AVAILABLE
            </Typography>
            <Typography
              variant="h6"
              color="rgba(255,255,255,0.8)"
              sx={{ maxWidth: 600, mx: "auto", lineHeight: 1.6 }}
            >
              No slots are currently available for the{" "}
              <strong style={{ color: "#FFD700" }}>{currentRoute?.name}</strong>{" "}
              route.
              <br />
              
            </Typography>

            

            {/* Debug Button */}
          
          </Paper>
        )}

        {/* Enhanced Request Dialog */}
        <Dialog
          open={requestDialogOpen}
          onClose={() => setRequestDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #FFD700 0%, #FF9800 100%)",
              color: "#000",
              fontWeight: 800,
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: 2,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            🎯 SUBMIT EVENT REQUEST
          </DialogTitle>

          <DialogContent sx={{ pt: 4, pb: 2 }}>
            {requestSuccess ? (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(102, 187, 106, 0.1) 100%)",
                  border: "2px solid rgba(76, 175, 80, 0.3)",
                  color: "#4CAF50",
                  "& .MuiAlert-icon": {
                    fontSize: "2rem",
                  },
                }}
                icon={<CheckIcon fontSize="inherit" />}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  🎉 REQUEST SUBMITTED SUCCESSFULLY!
                </Typography>
                <Typography variant="body1">
                  Your event request has been submitted successfully! An
                  administrator will review your request and allocate you to an
                  appropriate route and slot. You'll be notified via Discord
                  once a decision is made.
                </Typography>
              </Alert>
            ) : (
              <Stack spacing={4} sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="🏢 VTC Name"
                      value={requestForm.vtcName}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          vtcName: e.target.value,
                        }))
                      }
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.8)",
                          "&.Mui-focused": { color: "#FFD700" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="👤 Your Role in VTC"
                      value={requestForm.vtcRole}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          vtcRole: e.target.value,
                        }))
                      }
                      fullWidth
                      placeholder="e.g., Owner, Manager, Member"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.8)",
                          "&.Mui-focused": { color: "#FFD700" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="🌐 VTC Link"
                      value={requestForm.vtcLink}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          vtcLink: e.target.value,
                        }))
                      }
                      fullWidth
                      placeholder="TruckersMP VTC page or website"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.8)",
                          "&.Mui-focused": { color: "#FFD700" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="👥 Number of Players"
                      value={requestForm.playercount}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          playercount: e.target.value,
                        }))
                      }
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 1 }}
                      helperText="Number of players in your VTC"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.8)",
                          "&.Mui-focused": { color: "#FFD700" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                        "& .MuiFormHelperText-root": {
                          color: "#FFD700",
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="💬 Discord Username"
                      value={requestForm.discordUsername}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          discordUsername: e.target.value,
                        }))
                      }
                      fullWidth
                      required
                      placeholder="Your Discord username for notifications"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.8)",
                          "&.Mui-focused": { color: "#FFD700" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="📝 Additional Notes"
                      value={requestForm.notes}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Any special requirements or additional information"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.8)",
                          "&.Mui-focused": { color: "#FFD700" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 4, pt: 2 }}>
            {!requestSuccess && (
              <>
                <Button
                  onClick={() => setRequestDialogOpen(false)}
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  ❌ CANCEL
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  variant="contained"
                  disabled={
                    requestLoading ||
                    !requestForm.vtcName ||
                    !requestForm.playercount ||
                    !requestForm.discordUsername
                  }
                  sx={{
                    background:
                      "linear-gradient(45deg, #FFD700 0%, #FF9800 100%)",
                    color: "#000",
                    fontWeight: 800,
                    px: 6,
                    py: 2,
                    fontSize: "1rem",
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(255, 215, 0, 0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #FF9800 0%, #F57C00 100%)",
                      boxShadow: "0 12px 32px rgba(255, 215, 0, 0.6)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  {requestLoading ? (
                    <CircularProgress size={24} sx={{ color: "#000" }} />
                  ) : (
                    "🚀 SUBMIT REQUEST"
                  )}
                </Button>
              </>
            )}

            {requestSuccess && (
              <Button
                onClick={() => setRequestDialogOpen(false)}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(45deg, #4CAF50 0%, #66BB6A 100%)",
                  color: "white",
                  fontWeight: 800,
                  px: 6,
                  py: 2,
                  fontSize: "1rem",
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(76, 175, 80, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #66BB6A 0%, #4CAF50 100%)",
                    boxShadow: "0 12px 32px rgba(76, 175, 80, 0.6)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                🎉 CLOSE
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SpecialEvent;
