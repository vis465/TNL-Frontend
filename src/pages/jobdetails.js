import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Rating,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Skeleton
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Help as HelpIcon,
  Flag as FlagIcon,
  DirectionsCar as DirectionsCarIcon,
  Build as BuildIcon,
  DirectionsBoat as DirectionsBoatIcon,
  LocalGasStation as LocalGasStationIcon,
  Train as TrainIcon,
  RemoveRoad as RoadIcon,
  Receipt as ReceiptIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from "@mui/icons-material";


// import LicensePlate from "../components/LicensePlate";


const JobDetails = ({ theme, toggleTheme, apiData, vtc }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef(null);
  const [permissions, setPermissions] = useState({ canDelete: false, canReemove: false });
  const [actionLoading, setActionLoading] = useState(false);
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  
  // Helper function to format duration from milliseconds
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return "N/A";
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to format time from timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const startTime = new Date(jobData?.realtime?.start || 0);
    const diffMs = date - startTime;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchJobDetails = async () => {
    try {
      const { data } = await axiosInstance.get(`/jobs/external/${encodeURIComponent(id)}`);
      const payload = data?.data || data;
      setJobData(payload || null);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setJobData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  // compute permissions when apiData and jobData are ready
  useEffect(() => {
    const userId = apiData?.data?.userData?.userID;   // <-- correct path
    const steamID = apiData?.data?.userData?.steamID; // <-- if needed later
  
    console.log(userId, "userId");
  
    const canDelete = Number(userId) === 1;
  
    const canRemove =
      Array.isArray(vtc?.team) &&
      Array.isArray(jobData?.driver?.vtc) &&
      vtc?.team.includes(jobData?.driver?.steamID) &&
      jobData?.driver?.vtc?.includes(vtc?.id);
  
    setPermissions({ canDelete, canRemove });
  }, [apiData, jobData, vtc]);
  
  
  useEffect(() => {
    if (jobData) {
      console.log("Updated jobData:", jobData);
    }
  }, [jobData]);

  console.log(permissions, "permissions")

  const getEventIcon = (type) => {
    switch (type) {
      case "started":
        return <FlagIcon />;
      case "ferry":
        return <DirectionsBoatIcon />;
      case "fine":
        return <ReceiptIcon />;
      case "refuel-paid":
        return <LocalGasStationIcon />;
      case "tollgate":
        return <RoadIcon />;
      case "train":
        return <TrainIcon />;
      case "collision":
        return <DirectionsCarIcon />;
      case "collission":
        return <DirectionsCarIcon />;
      case "repair":
        return <BuildIcon />;
      case "delivered":
        return <FlagIcon />;
      default:
        return <FlagIcon />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "started":
        return "primary";
      case "ferry":
      case "refuel-paid":
      case "tollgate":
      case "train":
        return "warning";
      case "fine":
        return "error";
      case "collision":
        return "error";
      case "collission":
        return "error";
      case "repair":
        return "success";
      case "delivered":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme === 'dark' ? 'grey.900' : 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }
  
  if (!jobData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme === 'dark' ? 'grey.900' : 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Job Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The job you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  const vtcdata = {
    name: "XYZ LOGISTICS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/TamilNadu_Logo.svg",
  };

  return (
    <Box sx={{ minHeight: '100vh'}}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => navigate(-1)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            {/* <Box component="img" src={logo} alt="TruckersHub Logo" sx={{ height: 32, flexGrow: 1 }} /> */}
            <IconButton onClick={toggleTheme}>
              {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ display: 'flex', minHeight: isMobile ? 'calc(100vh - 64px)' : '100vh' }}>
        {/* Sidebar - Desktop */}
        

        {/* Mobile Sidebar */}
    

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Desktop TopNav */}
          

          <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
                variant="outlined"
              >
                Back
              </Button>
              <Typography variant="h3" component="h1" gutterBottom>
                Job Details - #{jobData.jobID}
              </Typography>
              
            </Box>

            <Grid container spacing={3}>
              {/* Left Column - User Profile & Statistics */}
              <Grid item xs={12} lg={4}>
                {/* User Profile */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={jobData.driver.avatar}
                        alt="User Avatar"
                        sx={{ width: 64, height: 64, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h5" color="primary" gutterBottom>
                          {jobData.driver.username}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          {jobData.driver.games.map((game, index) => (
                            <Chip
                              key={index}
                              label={game.toUpperCase()}
                              color="primary"
                              size="small"
                            />
                          ))}
                          {jobData.isConvoyFeature && (
                            <Chip
                              label="Convoy Feature"
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Rating value={jobData.rating} readOnly precision={0.1} />
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      STATISTICS
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Rating:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography fontWeight="bold">{jobData.rating}</Typography>
                          <StarIcon color="warning" fontSize="small" />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Cargo:</Typography>
                        <Typography fontWeight="bold">{jobData.cargo.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Distance:</Typography>
                        <Typography fontWeight="bold">{jobData.distanceDriven} km</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Planned Distance:</Typography>
                        <Typography fontWeight="bold">{jobData.plannedDistance} km</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">TruckersHub Points:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography fontWeight="bold">{jobData.THP} THP</Typography>
                          <HelpIcon fontSize="small" color="action" />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Time Taken:</Typography>
                        <Typography fontWeight="bold">{formatDuration(jobData.realtime?.timeTaken)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Revenue:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography fontWeight="bold">${jobData.revenue}</Typography>
                          <HelpIcon fontSize="small" color="action" />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Fuel Burnt:</Typography>
                        <Typography fontWeight="bold">{jobData.fuel.burned} L</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Cargo Weight:</Typography>
                        <Typography fontWeight="bold">{(jobData.cargo.mass / 1000).toFixed(1)} t</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Top Speed:</Typography>
                        <Typography fontWeight="bold">{(jobData.topSpeed * 3.6).toFixed(0)} km/h</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Avg Speed:</Typography>
                        <Typography fontWeight="bold">{(jobData.avgSpeed * 3.6).toFixed(0)} km/h</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Job Type:</Typography>
                        <Typography fontWeight="bold">{jobData.market.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Client Version:</Typography>
                        <Typography fontWeight="bold">V{jobData.clientVersion}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Game Version:</Typography>
                        <Typography fontWeight="bold">{jobData.game.version}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Job Details */}
              <Grid item xs={12} lg={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Departure & Destination */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Departure</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Start:</Typography>
                              <Typography fontWeight="bold">{formatDate(jobData.realtime?.start)}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">City:</Typography>
                              <Typography fontWeight="bold">{jobData.source.city.name}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Company:</Typography>
                              <Typography fontWeight="bold">{jobData.source.company.name}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Odometer:</Typography>
                              <Typography fontWeight="bold">{jobData.truck.initialOdometer.toFixed(0)} km</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocationOnIcon color="error" sx={{ mr: 1 }} />
                            <Typography variant="h6">Destination</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box>
                              <Typography color="text.secondary" variant="body2">End:</Typography>
                              <Typography fontWeight="bold">{formatDate(jobData.realtime?.end)}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">City:</Typography>
                              <Typography fontWeight="bold">{jobData.destination.city.name}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Company:</Typography>
                              <Typography fontWeight="bold">{jobData.destination.company.name}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Odometer:</Typography>
                              <Typography fontWeight="bold">{jobData.truck.odometer.toFixed(0)} km</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Truck & Trailer */}
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocalShippingIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6">Truck & Trailer</Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Truck:</Typography>
                              <Typography fontWeight="bold">{jobData.truck.model.name}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Truck Damage:</Typography>
                              <Typography fontWeight="bold">{(jobData.truck.current_damage.total * 100).toFixed(0)}%</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Cargo Damage:</Typography>
                              <Typography fontWeight="bold">{(jobData.cargo.damage * 100).toFixed(0)}%</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Trailer Body Type:</Typography>
                              <Typography fontWeight="bold">{jobData.trailer.bodyType}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Trailer Chain Type:</Typography>
                              <Typography fontWeight="bold">{jobData.trailer.chainType}</Typography>
                            </Box>
                            <Box>
                              <Typography color="text.secondary" variant="body2">Trailer Damage:</Typography>
                              <Typography fontWeight="bold">{(jobData.trailer.damage.total * 100).toFixed(0)}%</Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* License Plates */}
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InfoIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="h6">More Info</Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                              Truck License Plate:
                            </Typography>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: 'background.paper'
                            }}>
                              <Box sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                bgcolor: 'grey.200',
                                color: 'text.primary',
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5
                              }}>
                                {(jobData.truck.licensePlate.country.id || 'EU').slice(0,2).toUpperCase()}
                              </Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                {jobData.truck.licensePlate.value || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                              Trailer License Plate:
                            </Typography>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: 'background.paper'
                            }}>
                              <Box sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                bgcolor: 'grey.200',
                                color: 'text.primary',
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5
                              }}>
                                {(jobData.trailer.licensePlate.country.id || 'EU').slice(0,2).toUpperCase()}
                              </Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                {jobData.trailer.licensePlate.value || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Job Timeline */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job TimeLine
                      </Typography>
                      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <List>
                          {jobData.events.map((event, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: `${getEventColor(event.type)}.main`,
                                    color: 'white'
                                  }}
                                >
                                  {getEventIcon(event.type)}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                    {event.type}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatTime(event.time)}
                                    </Typography>
                                    {event.type === "collision" && event.total && (
                                      <Typography variant="caption" color="error">
                                        Damage: {(event.total * 100).toFixed(1)}%
                                      </Typography>
                                    )}
                                    {event.type === "repair" && event.total && (
                                      <Typography variant="caption" color="success.main">
                                        Repaired: {(event.total * 100).toFixed(1)}%
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default JobDetails;