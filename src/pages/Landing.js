import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import placeholderimg from "../img/placeholder.jpg"
import axiosInstance from '../utils/axios';
import bgimg from "../img/image.png"
import logo from "../img/tnllogo.jpg"
import {
  Box,
  Container,
  Typography,
  Button,

  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  useTheme,
  alpha,
  styled,
  useMediaQuery,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  CalendarMonth as CalendarIcon,
  LocalShipping as TruckIcon,
  EmojiEvents as AwardIcon,
  LocationOn as MapPinIcon,
  People as UsersIcon,
  AccessTime as ClockIcon,
  Favorite as HeartIcon,
  OpenInNew as ExternalLinkIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  ExpandMore as ExpandMoreIcon,
  Rule as RuleIcon,
  Assignment as AssignmentIcon,
  SentimentSatisfied as SentimentSatisfiedIcon,
  Games as GamesIcon,
  Mic as MicIcon,
  Palette as PaletteIcon,
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  LocalShipping,
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import FullScreenVideoPlayer from '../components/FullScreenVideoPlayer';
import { leaderboardService } from '../services/leaderboardService';

// Add CSS animations for space effects
const spaceAnimations = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px #00d4ff, 0 0 40px #ff00ff; }
    50% { box-shadow: 0 0 40px #00d4ff, 0 0 80px #ff00ff, 0 0 120px #ffff00; }
  }
  
  @keyframes trailGlow {
    0% { stroke-dashoffset: 1000; }
    100% { stroke-dashoffset: 0; }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spaceAnimations;
  document.head.appendChild(style);
}

// Enhanced styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: theme.shadows[15],
    '& .card-content': {
      transform: 'translateY(-8px)',
    },
    '& .card-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: theme.palette.primary.main,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.shape.borderRadius,
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
}));



const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(8),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '2px',
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
    '&::before': {
      opacity: 1,
    },
    '& .feature-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: theme.palette.primary.main,
    },
  },
}));

const WelcomeSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
    transform: 'rotate(-45deg) scale(2)',
    animation: 'float 6s ease-in-out infinite',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'rotate(-45deg) scale(2) translateX(-10px)' },
    '50%': { transform: 'rotate(-45deg) scale(2) translateX(10px)' },
  },
}));

// Enhanced Truck Animation component
const TruckAnimation = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const truckX = useTransform(scrollYProgress, [0, 1], ['-50%', '150%']);
  const truckRotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);

  return (
    <Box ref={containerRef} sx={{ height: 200, position: 'relative', overflow: 'hidden', my: 8 }}>
      <motion.div
        style={{
          x: truckX,
          y: '50%',
          rotate: truckRotate,
          opacity,
          scale,
        }}
        className="absolute"
      >
        <Box sx={{
          position: 'relative',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
        }}>
          <svg width="200" height="100" viewBox="0 0 200 100">
            <defs>
              <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#1976d2', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2196f3', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M20 60 L180 60 L180 40 L140 40 L140 20 L60 20 L60 40 L20 40 Z"
              fill="url(#truckGradient)"
              stroke="#1565c0"
              strokeWidth="2"
            />
            <circle cx="40" cy="70" r="8" fill="#424242" />
            <circle cx="160" cy="70" r="8" fill="#424242" />
            <rect x="60" y="25" width="70" height="15" fill="#fff" rx="2" />
          </svg>
        </Box>
      </motion.div>
      <Box sx={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #1976d2, #2196f3)',
        opacity: 0.5,
        borderRadius: '2px',
      }} />
    </Box>
  );
};

// Enhanced Event Card component
const EventCard = ({ event, notours }) => {
  const theme = useTheme();

  // Normalize fields
  const title = event.title || event.name || "Untitled Event";
  const startDate = event.startDate || event.meetup_at || event.start_at || "";
  const departure = event.departurePoint || event.departure?.city || "TBD";
  const arrival = event.arrivalPoint || event.arrive?.city || "TBD";
  const banner = event.banner || placeholderimg;
  const featured = event.featured === true || event.featured === "true"; // adjust as needed
  const attendances = event.attendances || {};
  const externalLink = event.externalLink || event.external_link || null;
  const truckersmpId = event.truckersmpId

  const route = `${departure} → ${arrival}`;

  return (
    <StyledCard>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={banner}
          alt={title}
          sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
            },
          }}
        />
        {featured && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'yellow',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <StarIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Featured
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent
        className="card-content"
        sx={{
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <MapPinIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2">{route}</Typography>
          </Box>

          {attendances?.confirmed !== undefined && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Confirmed: {attendances.confirmed}, Unsure: {attendances.unsure}, VTCs: {attendances.vtcs}
            </Typography>
          )}
        </Stack>

        {!notours && (
          <StyledButton
            variant="outlined"
            size="large"
            href={`events/${truckersmpId}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              alignSelf: 'start',
              borderColor: 'yellow',
              color: 'yellow',
              px: 4,
              py: 1.5,
              fontSize: '1.05rem',
              textTransform: 'none',

            }}
          >
            See Details
          </StyledButton>
        )}
      </CardContent>
    </StyledCard>

  );
};

// Enhanced Partner Card component
const PartnerCard = ({ name, logo, description }) => {
  const theme = useTheme();



  const [loading, setLoading] = useState(true);

  return (
    <StyledCard>
      <CardContent sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            mb: 3,
            borderRadius: '50%',
            // bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          <img
            src={logo || '/api/placeholder/120/120'}
            alt={`${name} logo`}
            style={{ width: '80%', height: '80%', objectFit: 'fill' }}
          />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

// Rules Card Component
const RulesCard = ({ title, items, icon: IconComponent }) => {
  const theme = useTheme();

  return (
    <FeatureCard elevation={3}>
      <IconComponent
        className="feature-icon"
        sx={{
          fontSize: 50,
          color: 'yellow',
          mb: 2,
          transition: 'all 0.3s ease'
        }}
      />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        {title}
      </Typography>
      <List dense sx={{ width: '100%' }}>
        {items.map((item, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={item}
              primaryTypographyProps={{
                variant: 'body2',
                sx: { fontSize: '0.85rem' }
              }}
            />
          </ListItem>
        ))}
      </List>
    </FeatureCard>
  );
};


// Main component
const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const [events, setEvents] = useState([]);
  const [datatorender, setdatatorender] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  // References for scroll navigation
  const aboutRef = useRef(null);
  const rulesRef = useRef(null);
  const requirementsRef = useRef(null);
  const eventsRef = useRef(null);
  const partnersRef = useRef(null);
  useEffect(() => {
    fetchEvents();
    fetchextEvents();
    fetchLeaderboardStats();
  }, []);
  const fetchextEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/events/attending");

      const currentWaypoint = Math.min(10, Math.floor(leaderboardStats.totals.totalDistance / 1000000));
      const progressPercent = (currentWaypoint / 10) * 100;
      const getTruckPosition = (progress) => {
        const x = 5 + (progress * 0.9);
        const y = 50 + Math.sin(progress / 10 * Math.PI * 2) * 20;
        return { x, y };
      };

      // Set only the first 5 events
      setdatatorender(response.data.slice(0, 5));
      // Assuming API response is an array
      setError(null);
    } catch (err) {
      console.error("Error details:", err);
      setError("Failed to fetch attending events. Please try again later.");
    } finally {
      setLoading(false);

    }
  };


  const fetchEvents = async () => {
    try {

      const response = await axiosInstance.get('/events');
      const eventsData = response.data.response || response.data;
      console.log(eventsData)


      if (!Array.isArray(eventsData)) {
        console.error('Events data is not an array:', eventsData);
        setError('Invalid data format received from server');
        return;
      }

      const filteredEvents = eventsData.filter(event => event.status !== 'Completed');

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Error fetching events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await leaderboardService.getGlobalStats();
      setLeaderboardStats(stats);
      console.log(stats)
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'success';
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  console.log(datatorender)
  const categorizeEvents = () => {
    const now = new Date();


    const categorized = {
      upcoming: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);
          // console.log('Checking upcoming event:', event.title, startDate);
          return startDate > now; // Future start date
        } catch (error) {
          // console.error('Error processing upcoming event:', event.title, error);
          return false;
        }
      }),
      live: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);


        } catch (error) {
          console.error('Error processing live event:', event.title, error);
          return false;
        }
      }),
      past: events.filter(event => {
        try {
          const startDate = new Date(event.startDate);
          // console.log('Checking past event:', event.title, startDate);
          return startDate < now; // Past start date
        } catch (error) {
          console.error('Error processing past event:', event.title, error);
          return false;
        }
      })
    };

    console.log('Categorized events:', categorized);
    return categorized;
  };
  const { upcoming, live, past } = categorizeEvents();

  // Sample data for events


  const externalEvents = [
    {
      id: 1,
      title: "International Logistics Fair",
      date: "June 20, 2025",
      location: "Mumbai, Maharashtra",
      image: "/api/placeholder/500/300",
      featured: false
    },
    {
      id: 2,
      title: "Transport Tech Expo",
      date: "October 8, 2025",
      location: "Bangalore, Karnataka",
      image: "/api/placeholder/500/300",
      featured: true
    },
    {
      id: 3,
      title: "Trucking Industry Conference",
      date: "November 25, 2025",
      location: "Delhi, Delhi",
      image: "/api/placeholder/500/300",
      featured: false
    }
  ];

  // Sample data for partners
  const partners = [
    {
      id: 1,
      name: "Indian Truckers",
      logo: "https://static.truckersmp.com/images/vtc/logo/19885.1712066123.png",

    },
    {
      id: 2,
      name: "Indian Carriers",
      logo: "https://static.truckersmp.com/images/vtc/logo/64218.1724950052.png",

    },
    {
      id: 3,
      name: "Indian Group",
      logo: "https://static.truckersmp.com/images/vtc/logo/76045.1749322103.png",

    },
    {
      id: 4,
      name: "Lumo haul",
      logo: "https://static.truckersmp.com/images/vtc/logo/79072.1747716542.png",

    },
    {
      id: 4,
      name: "Super Events",
      logo: "https://static.truckersmp.com/images/vtc/logo/72897.1741616015.png",

    },
    {
      id: 4,
      name: "Aura",
      logo: "https://static.truckersmp.com/images/vtc/logo/75200.1729511385.png",

    },
    {
      id: 5,
      name: "Nextgen CC and media group",
      logo: "https://i.postimg.cc/5ttXzFGn/Nenx-Gen-LOGO.png",
    }

  ];

  // Rules and requirements from the documents
  const rules = [
    {
      title: "General Conduct",
      items: [
        "Respect All Players: Treat all members with respect",
        "No Discrimination or Harassment",
        "Use appropriate language in all communications",
        "Follow the Chain of Command"
      ],
      icon: UsersIcon
    },
    {
      title: "Driving Rules",
      items: [
        "Follow TruckersMP Rules",
        "Drive in a realistic and responsible manner",
        "Obey all traffic laws",
        "Maintain proper convoy conduct"
      ],
      icon: TruckIcon
    },
    {
      title: "Activity Requirements",
      items: [
        "Meet minimum activity requirements",
        "Participate in VTC events",
        "Notify managers of absences",
        "Maintain regular communication"
      ],
      icon: ClockIcon
    },
    {
      title: "Communication",
      items: [
        "Join VTC Discord server",
        "Check announcements regularly",
        "Use voice channels appropriately",
        "Follow convoy leader instructions"
      ],
      icon: MicIcon
    },
    {
      title: "Vehicle Customization",
      items: [
        "Use official VTC paint scheme",
        "Only approved mods allowed",
        "No inappropriate customizations",
        "Maintain professional appearance"
      ],
      icon: PaletteIcon
    },
    {
      title: "Reporting & Consequences",
      items: [
        "Report misconduct with evidence",
        "Resolve disputes amicably",
        "Warnings for minor infractions",
        "Suspension or ban for serious violations"
      ],
      icon: RuleIcon
    }
  ];

  const requirements = [
    {
      title: "Game Requirements",
      items: [
        "Compatible Euro Truck Simulator 2 version",
        "Valid TruckersMP account in good standing",
        "Minimum playtime requirements",
        "Sufficient driving experience"
      ],
      icon: GamesIcon
    },
    {
      title: "Technical Requirements",
      items: [
        "Discord for communication",
        "Voice communication capability",
        "VTC-approved mods only",
        "Custom VTC paint scheme"
      ],
      icon: AssignmentIcon
    },
    {
      title: "Personal Requirements",
      items: [
        "Minimum age requirement (16-18)",
        "Positive attitude and team spirit",
        "Good communication skills",
        "Willingness to work as a team"
      ],
      icon: PersonAddIcon
    },
    {
      title: "Activity & Attendance",
      items: [
        "Regular convoy event attendance",
        "Minimum driven miles per month",
        "Adherence to driving style rules",
        "Application process completion"
      ],
      icon: ScheduleIcon
    }
  ];

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Stats - will be populated with real data from leaderboard
  const getStats = () => {
    if (!leaderboardStats) {
      return [
        { value: 100, title: "Active Drivers", icon: UsersIcon },
        { value: 12000, title: "Completed Jobs", icon: TruckIcon },
        { value: 100, title: "Events Held", icon: CalendarIcon },
        { value: 15, title: "Partner Companies", icon: AwardIcon }
      ];
    }

    return [
      {
        value: leaderboardService.formatNumber(leaderboardStats.totals.totalJobs),
        title: "Jobs Completed",
        icon: TruckIcon,
        subtitle: "Across all drivers"
      },
      {
        value: leaderboardService.formatDistance(leaderboardStats.totals.totalDistance),
        title: "Distance Covered",
        icon: MapPinIcon,
        subtitle: "Miles of deliveries"
      },
      {
        value: leaderboardService.formatRevenue(leaderboardStats.totals.totalRevenue),
        title: "Revenue Generated",
        icon: AwardIcon,
        subtitle: "Economic impact"
      },
      {
        value: leaderboardService.formatNumber(leaderboardStats.totals.totalPoints),
        title: "Points Earned",
        icon: StarIcon,
        subtitle: "Community achievements"
      }
    ];
  };

  // Enhanced features data
  const features = [
    {
      icon: <SpeedIcon className="feature-icon" sx={{ fontSize: 40, color: 'yellow', transition: 'all 0.3s ease' }} />,
      title: "Fast & Reliable",
      description: "Quick delivery times with real-time tracking and updates."
    },
    {
      icon: <SecurityIcon className="feature-icon" sx={{ fontSize: 40, color: 'yellow', transition: 'all 0.3s ease' }} />,
      title: "Secure Transport",
      description: "Your cargo is protected with our advanced security measures."
    },
    {
      icon: <SupportIcon className="feature-icon" sx={{ fontSize: 40, color: 'yellow', transition: 'all 0.3s ease' }} />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs."
    },
    {
      icon: <TruckIcon className="feature-icon" sx={{ fontSize: 40, color: 'yellow', transition: 'all 0.3s ease' }} />,
      title: "Modern Fleet",
      description: "State-of-the-art vehicles for efficient transportation."
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', overflowX: 'hidden', bgcolor: 'background.default' }}>
      {/* Enhanced Navigation */}


      {/* Enhanced Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          bg: bgimg
        }}
      >
        {/* Animated background elements */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              component={motion.div}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              sx={{
                position: 'absolute',
                width: { xs: 4, md: 6 },
                height: { xs: 4, md: 6 },
                bgcolor: 'yellow',
                borderRadius: '50%',
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 2) * 40}%`,
                boxShadow: '0 0 20px rgba(25, 118, 210, 0.5)',
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  component={motion.div}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  variant="overline"
                  sx={{
                    color: 'yellow',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: 2,
                    mb: 2,
                    display: 'block',
                  }}
                >
                  PROFESSIONAL VIRTUAL TRUCKING
                </Typography>

                <Typography
                  component={motion.h1}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  variant="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '4.5rem' },
                    lineHeight: 1.1,
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  TAMILNADU
                  <Box component="span" sx={{ display: 'block', color: 'yellow' }}>
                    LOGISTICS
                  </Box>
                </Typography>

                <Typography
                  component={motion.p}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  variant="h6"
                  sx={{
                    color: 'grey.300',
                    mb: 6,
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    lineHeight: 1.6,
                    maxWidth: 600,
                  }}
                >
                  Experience the future of virtual transportation with India's premier logistics company.
                  Join our community of professional drivers and embark on an extraordinary journey.
                </Typography>

                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  sx={{
                    display: 'flex',
                    gap: 3,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    flexWrap: 'wrap',
                    mb: 4,
                  }}
                >
                  <StyledButton
                    variant="contained"
                    size="large"
                    onClick={() => scrollToSection(aboutRef)}
                    sx={{
                      bgcolor: 'yellow',
                      color: 'black',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 30px rgba(25, 118, 210, 0.4)',
                      },
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Explore More
                  </StyledButton>
                  <a href='/apply'>
                    <StyledButton
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'yellow',
                        color: 'yellow',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          borderColor: 'yellow',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      Want to Join Us?
                    </StyledButton>
                  </a>
                </Box>

                {/* Key Features */}
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  {[
                    { icon: <CheckCircleIcon />, text: '24/7 Support' },
                    { icon: <StarIcon />, text: 'Premium Experience' },
                    { icon: <SecurityIcon />, text: 'Trusted Platform' },
                  ].map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: 'yellow', fontSize: 20 }}>{feature.icon}</Box>
                      <Typography variant="body2" sx={{ color: 'grey.400', fontWeight: 500 }}>
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                sx={{
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {/* 3D Truck Illustration */}
                <Box
                  sx={{
                    width: { xs: 250, md: 350 },
                    height: { xs: 200, md: 280 },
                    mx: 'auto',
                    position: 'relative',
                    // background: 'radial-gradient(ellipse, rgba(25, 118, 210, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',

                  }}
                >
                  <img src={logo} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll indicator */}
        <Box
          component={motion.div}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            color: 'yellow',
            cursor: 'pointer',
          }}
          onClick={() => scrollToSection(aboutRef)}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'grey.400' }}>
              Scroll to explore
            </Typography>
            <ArrowForwardIcon sx={{ transform: 'rotate(90deg)', fontSize: 28 }} />
          </Box>
        </Box>
      </Box>

      {/* Welcome Section */}
      <Box ref={aboutRef} sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <WelcomeSection>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <SentimentSatisfiedIcon sx={{ fontSize: 60, color: 'yellow', mb: 2 }} />
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Welcome to TAMILNADU LOGISTICS
                  </Typography>
                </Box>

                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" sx={{ mb: 3, color: 'yellow', fontWeight: 'bold' }}>
                      English
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                      🖤 We are proud that this logistic run by the people of Tamilnadu will bring you all kinds of happiness.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                      🖤 Here people behave in such a way that unity, peace and contentment always happen to everyone.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      🖤 Give us your support today and forever. We humbly request you to accept it.
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" sx={{ mb: 3, color: 'secondary.main', fontWeight: 'bold' }}>
                      தமிழ்
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                      🖤 தமிழ்நாடு மக்கள் மூலம் நடத்தப்படும் இந்த லாஜிஸ்டிக் உங்களுக்கு எல்லா வகையான மகிழ்ச்சியை உண்டாக்கி கொடுக்கும் என்பதில் நாங்கள் பெருமிதம் கொள்கிறோம்.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                      🖤 இங்கு ஒற்றுமையும், அமைதியும் மற்றும் மன நிறைவும் எப்பொழுதும் அனைவருக்கும் ஏற்படும் வகையில் இங்கு மக்கள் நடந்து கொள்வார்.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      🖤 இன்று போல் என்றும் எங்களுக்கு, உங்களுடைய ஒத்துழைப்பை கொடுத்து. பேரன்பை பெற்றுக் கொள்ளுமாறு தாழ்மையுடன் கேட்டுக்கொள்கிறோம்.
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </WelcomeSection>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, color: 'white' }}>
        <Container maxWidth="lg">
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                Loading performance data...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {getStats().map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <stat.icon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                        {stat.title}
                      </Typography>
                      {stat.subtitle && (
                        <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
                          {stat.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Trail of Stardust Section */}


      {/* Explorer's Map Section */}
      {leaderboardStats && leaderboardStats.totals.totalDistance > 0 && (
        <>
          {leaderboardStats && leaderboardStats.totals.totalDistance > 0 && (
             <Box sx={{
               minHeight: '100vh',
               width: '100vw',
               py: 8,
               bgcolor: 'background.default',
               position: 'relative',
               overflow: 'hidden'
             }}>

              <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Typography variant="h2" sx={{
                        fontWeight: 900,
                        mb: 3,
                        background: "#ffff00",
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2.8rem', md: '4.5rem' },
                        
                        letterSpacing: '0.02em'
                      }}>
                        Global Distance Tracker
                      </Typography>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: '#ffff00',
                          mb: 2,
                          fontWeight: 600,
                          textShadow: '0 0 20px rgba(255,255,0, 0.3)',
                          fontSize: { xs: '1.2rem', md: '1.5rem' },
                        }}
                      >
                        Our riders travelled {(leaderboardStats.totals.totalDistance).toFixed(0)} km and
                        circling the globe {(leaderboardStats.totals.totalDistance / 40075).toFixed(0)} times!
                      </Typography>

                      <Typography variant="body1" sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxWidth: '600px',
                        mx: 'auto',
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                      }}>
                        Track our global journey as we connect cities and countries through virtual logistics
                      </Typography>
                    </motion.div>
                  </Box>

                  {/* Progress Bar Section */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Box sx={{
                      position: 'relative',
                      width: "100%",
                      py: 4,
                    }}>
                      {/* Progress Bar Container */}
                      <Box sx={{
                        position: 'relative',
                        width: '100%',
                        height: '12px',
                        background: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        overflow: 'hidden',
                      }}>
                        {/* Progress Fill */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              100,
                              (leaderboardStats.totals.totalDistance / (40075 * 500)) * 100
                            )}%`,
                          }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background:
                              'linear-gradient(90deg, #4caf50 0%, #2196f3 50%, #ff9800 100%)',
                            borderRadius: '6px',
                            boxShadow: '0 0 15px rgba(76, 175, 80, 0.6)',
                            position: 'relative',
                          }}
                        />



                      </Box>

                      {/* Small Truck on Progress Bar */}
                      <motion.div
                        animate={{
                          y: [-4, 4, -4],
                          rotate: [0, 1, 0, -1, 0]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          position: 'absolute',
                          left: `${(leaderboardStats.totals.totalDistance / 40075) * 100}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10,
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          {/* Small truck container */}
                          <Box sx={{
                            width: { xs: 50, md: 60 },
                            height: { xs: 35, md: 40 },
                            background: 'linear-gradient(135deg, #ff6600 0%, #ff3300 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 25px rgba(255, 102, 0, 0.7), 0 6px 12px rgba(0, 0, 0, 0.3)',
                            border: '2px solid #ffff00',
                            position: 'relative',
                          }}>
                            {/* Small truck icon */}
                            <LocalShipping sx={{
                              fontSize: { xs: 24, md: 28 },
                              color: '#fff',
                              opacity: 0.95,
                              filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.5))'
                            }} />

                            {/* Small exhaust effect */}
                            <Box sx={{
                              position: 'absolute',
                              left: '-18px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '25px',
                              height: '25px',
                              zIndex: -1,
                            }}>
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0.8, x: 0, scale: 1 }}
                                  animate={{ opacity: 0, x: -25, scale: 0.3 }}
                                  transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: "easeOut"
                                  }}
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    width: '10px',
                                    height: '10px',
                                    background: `radial-gradient(circle, ${i % 2 === 0 ? '#4caf50' : '#ff9800'} 0%, transparent 70%)`,
                                    borderRadius: '50%',
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>

                      {/* Distance scale below progress bar */}
                      <Box sx={{
                        mt: 4,
                        position: 'relative',
                        height: '60px', // Add fixed height to contain the absolute positioned elements
                        display: 'flex',
                        justifyContent: 'space-between',
                        px: 2,
                      }}>
                        {[100, 200, 300, 400, 500].map((milestone) => {
                          const milestonePercent = (milestone / 500) * 100; // scale to progress bar
                          return (
                            <motion.div
                              key={milestone}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                             
                              viewport={{ once: true }}
                            >
                              <Box sx={{
                                textAlign: 'center',
                                position: 'absolute',
                                left: `${milestonePercent}%`,
                                top: '0px', // Position at the top of the container
                                transform: 'translateX(-50%)',
                                marginBottom: 6
                              }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      leaderboardStats.totals.totalDistance >= milestone * 40075
                                        ? '#4caf50'
                                        : '#666',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                                    textShadow:
                                      leaderboardStats.totals.totalDistance >= milestone * 40075
                                        ? '0 0 15px #4caf50'
                                        : 'none',
                                    display: 'block',
                                    mb: 0.5,
                                  }}
                                >
                                  {milestone}x
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    color: '#888',
                                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                                    fontWeight: 500,
                                  }}
                                >
                                  Earth
                                </Typography>
                              </Box>
                            </motion.div>
                          );
                        })}


                      </Box>

                      {/* Current stats below progress bar */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <Box sx={{
                          mt: 6, // Increased margin to provide more space from milestone markers
                          textAlign: 'center',
                          background: 'rgba(76, 175, 80, 0.05)',
                          border: '1px solid rgba(76, 175, 80, 0.2)',
                          borderRadius: 2,
                          padding: 3,
                          backdropFilter: 'blur(10px)',
                        }}>
                          <Typography variant="body2" sx={{
                            color: '#4caf50',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            mb: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}>
                            Global Journey Status
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#aaa',
                              fontSize: '1rem',
                              fontWeight: 500,
                            }}
                          >
                            Next milestone:{' '}
                            {(Math.floor(leaderboardStats.totals.totalDistance / 40075) + 10)}x
                            {' '}around Earth
                          </Typography>


                        </Box>
                      </motion.div>
                    </Box>
                  </motion.div>
                </motion.div>
              </Container>

            </Box>
          )}
        </>
      )}

      {/* Top Performers Section */}
      {leaderboardStats && leaderboardStats.drivers && leaderboardStats.drivers.length > 0 && (
        <Box sx={{ py: 12, bgcolor: 'background.default' }}>
          <Container maxWidth="lg">
            <SectionTitle variant="h3" component="h2" align="center" sx={{ mb: 8 }}>
              Top Performers
            </SectionTitle>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TruckIcon sx={{ fontSize: 40, color: 'yellow', mr: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Top by Distance
                      </Typography>
                    </Box>
                    <List>
                      {leaderboardStats.drivers.slice(0, 5).map((driver, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'yellow' }}>
                              #{index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={driver.username}
                            secondary={`${leaderboardService.formatDistance(driver.totalDistance)} • ${driver.totalJobs} jobs`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </FeatureCard>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AwardIcon sx={{ fontSize: 40, color: 'yellow', mr: 2 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Top by Revenue
                      </Typography>
                    </Box>
                    <List>
                      {leaderboardStats.driversByRevenue.slice(0, 5).map((driver, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'yellow' }}>
                              #{index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={driver.username}
                            secondary={`${leaderboardService.formatRevenue(driver.totalRevenue)} • ${driver.totalJobs} jobs`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </FeatureCard>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      {/* Features Section */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h3" component="h2" align="center">
            Why Choose Us
          </SectionTitle>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard elevation={2}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <FullScreenVideoPlayer />
      {/* Rules Section */}
      <Box ref={rulesRef} sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h3" component="h2" align="center">
            Rules & Regulations
          </SectionTitle>
          <Grid container spacing={4}>
            {rules.map((rule, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <RulesCard
                    title={rule.title}
                    items={rule.items}
                    icon={rule.icon}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Requirements Section */}
      <Box ref={requirementsRef} sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h3" component="h2" align="center">
            Requirements
          </SectionTitle>
          <Grid container spacing={4}>
            {requirements.map((requirement, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <RulesCard
                    title={requirement.title}
                    items={requirement.items}
                    icon={requirement.icon}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Events Section */}
      <Box ref={eventsRef} sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h3" component="h2" align="center">
            Events
          </SectionTitle>

          {/* Our Events */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'yellow' }}>
              Our Events
            </Typography>
            <Grid container spacing={4}>
              {upcoming.map((event, index) => (
                <Grid item xs={12} md={4} key={event.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

         
        </Container>
      </Box>

      {/* Partners Section */}
      <Box
        ref={partnersRef}
        sx={{
          py: 12,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <SectionTitle variant="h3" component="h2" align="center" color={'yellow'}>
            Our Partners
          </SectionTitle>
          <Grid container spacing={4}>
            {partners.map((partner, index) => (
              <Grid item xs={12} sm={6} md={3} key={partner.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PartnerCard {...partner} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Call to Action Section */}
      <Box sx={{
        py: 16,
        bgcolor: '#0f1419',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, ${theme.palette.primary.main} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${theme.palette.secondary.main} 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, ${theme.palette.primary.light} 0%, transparent 50%)
          `,
          animation: 'float 8s ease-in-out infinite',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'yellow',
                      fontSize: '1rem',
                      fontWeight: 600,
                      letterSpacing: 2,
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    JOIN THE ELITE
                  </Typography>

                  <Typography
                    variant="h2"
                    sx={{
                      mb: 3,
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    Ready to Join Our
                    <Box component="span" sx={{ color: 'yellow', display: 'block' }}>
                      Elite Team?
                    </Box>
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mb: 6,
                      color: 'grey.300',
                      lineHeight: 1.6,
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Become part of the TAMILNADU LOGISTICS family and experience
                    professional virtual trucking like never before. Join thousands
                    of drivers who trust us for their virtual career.
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    sx={{ mb: 4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <StyledButton
                        variant="contained"
                        size="large"
                        sx={{
                          bgcolor: 'yellow',
                          color: 'black',
                          px: 4,
                          py: 2,
                          fontSize: '1.1rem',
                          minWidth: 180,
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)',
                          },
                        }}
                        endIcon={<PersonAddIcon />}
                      >
                        Apply Now
                      </StyledButton>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <StyledButton
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: 'yellow',
                          color: 'yellow',
                          px: 4,
                          py: 2,
                          fontSize: '1.1rem',
                          minWidth: 180,
                          '&:hover': {
                            borderColor: 'yellow',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            boxShadow: '0 8px 30px rgba(25, 118, 210, 0.2)',
                          },
                        }}
                        endIcon={<ExternalLinkIcon />}
                      >
                        Join Discord
                      </StyledButton>
                    </motion.div>
                  </Stack>

                  {/* Additional info */}
                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {[
                      { number: '100+', label: 'Active Members' },
                      { number: '24/7', label: 'Support Available' },
                      { number: '5★', label: 'Community Rating' },
                    ].map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'left' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'yellow' }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'grey.400' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  {/* Feature cards */}
                  <Stack spacing={3}>
                    {[
                      {
                        icon: <CheckCircleIcon sx={{ color: 'success.main' }} />,
                        title: 'Instant Approval',
                        desc: 'Get approved within 24 hours'
                      },
                      {
                        icon: <StarIcon sx={{ color: 'warning.main' }} />,
                        title: 'Premium Benefits',
                        desc: 'Exclusive events and rewards'
                      },
                      {
                        icon: <SupportIcon sx={{ color: 'info.main' }} />,
                        title: 'Expert Support',
                        desc: 'Professional guidance always'
                      },
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Paper
                          sx={{
                            p: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {feature.icon}
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                                {feature.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                                {feature.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Enhanced Footer */}

    </Box>
  );
};

export default Landing;