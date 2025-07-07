import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useAnimation, AnimatePresence } from 'framer-motion';

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
} from '@mui/icons-material';

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

const ParallaxSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(12, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.9,
    zIndex: 0,
    transform: 'scale(1.1)',
    transition: 'transform 0.5s ease',
  },
  '&:hover::before': {
    transform: 'scale(1)',
  },
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
          {/* Enhanced truck SVG */}
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
const EventCard = ({ title, date, location, image, featured }) => {
  const theme = useTheme();
  
  return (
    <StyledCard>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={image || '/api/placeholder/500/300'}
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
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
            },
          }}
        />
        {featured && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'primary.main',
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
      <CardContent className="card-content" sx={{ transition: 'transform 0.3s ease' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <CalendarIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2">{date}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <MapPinIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2">{location}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

// Enhanced Partner Card component
const PartnerCard = ({ name, logo, description }) => {
  const theme = useTheme();
  
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
            bgcolor: 'grey.100',
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
            style={{ width: '60%', height: '60%', objectFit: 'contain' }}
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

// Add this new component before the main Landing component
const PartnerCardWithBeam = ({ partner, index, totalPartners, containerRef }) => {
  const cardRef = useRef(null);
  const nextCardRef = useRef(null);
  const isLast = index === totalPartners - 1;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box ref={cardRef}>
        <PartnerCard {...partner} />
      </Box>
      {!isLast && (
        <Box ref={nextCardRef}>
          
        </Box>
      )}
    </Box>
  );
};

// Main component
const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // References for scroll navigation
  const aboutRef = useRef(null);
  const rulesRef = useRef(null);
  const requirementsRef = useRef(null);
  const eventsRef = useRef(null);
  const partnersRef = useRef(null);
  
  // Sample data for events
  const ourEvents = [
    {
      id: 1,
      title: "Annual Logistics Summit",
      date: "July 15, 2025",
      location: "Chennai, Tamil Nadu",
      image: "/api/placeholder/500/300",
      featured: true
    },
    {
      id: 2,
      title: "Driver Safety Workshop",
      date: "August 5, 2025",
      location: "Coimbatore, Tamil Nadu",
      image: "/api/placeholder/500/300",
      featured: false
    },
    {
      id: 3,
      title: "Fleet Management Seminar",
      date: "September 12, 2025",
      location: "Madurai, Tamil Nadu",
      image: "/api/placeholder/500/300",
      featured: false
    }
  ];
  
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
      name: "TruckersMP",
      logo: "/api/placeholder/120/120",
      description: "The leading multiplayer mod for Euro Truck Simulator 2."
    },
    {
      id: 2,
      name: "SpeedLine Transportation",
      logo: "/api/placeholder/120/120",
      description: "Fast and reliable shipping partner across South India."
    },
    {
      id: 3,
      name: "ETS2 Tamil Community",
      logo: "/api/placeholder/120/120",
      description: "The largest Tamil Euro Truck Simulator community hub."
    },
    {
      id: 4,
      name: "SCS Software",
      logo: "/api/placeholder/120/120",
      description: "Developers of Euro Truck Simulator 2 and American Truck Simulator."
    }
  ];
  
  // Rules and requirements from original code
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
    }
  ];
  
  const requirements = [
    {
      title: "Game Requirements",
      items: [
        "Compatible Euro Truck Simulator 2 version",
        "Valid TruckersMP account",
        "Minimum playtime requirements",
        "Sufficient driving experience"
      ],
      icon: HeartIcon
    },
    {
      title: "Technical Requirements",
      items: [
        "Discord for communication",
        "Voice communication capability",
        "VTC-approved mods",
        "Custom VTC paint scheme"
      ],
      icon: AwardIcon
    },
    {
      title: "Personal Requirements",
      items: [
        "Minimum age requirement (16-18)",
        "Positive attitude",
        "Team spirit",
        "Good communication skills"
      ],
      icon: UsersIcon
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
  
  // Stats
  const stats = [
    { value: 120, title: "Active Drivers", icon: UsersIcon },
    { value: 500, title: "Completed Jobs", icon: TruckIcon },
    { value: 30, title: "Events Held", icon: CalendarIcon },
    { value: 15, title: "Partner Companies", icon: AwardIcon }
  ];
  
  // Enhanced features data
  const features = [
    {
      icon: <SpeedIcon className="feature-icon" sx={{ fontSize: 40, color: 'primary.main', transition: 'all 0.3s ease' }} />,
      title: "Fast & Reliable",
      description: "Quick delivery times with real-time tracking and updates."
    },
    {
      icon: <SecurityIcon className="feature-icon" sx={{ fontSize: 40, color: 'primary.main', transition: 'all 0.3s ease' }} />,
      title: "Secure Transport",
      description: "Your cargo is protected with our advanced security measures."
    },
    {
      icon: <SupportIcon className="feature-icon" sx={{ fontSize: 40, color: 'primary.main', transition: 'all 0.3s ease' }} />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs."
    },
    {
      icon: <TruckIcon className="feature-icon" sx={{ fontSize: 40, color: 'primary.main', transition: 'all 0.3s ease' }} />,
      title: "Modern Fleet",
      description: "State-of-the-art vehicles for efficient transportation."
    }
  ];

  const containerRef = useRef(null);

  return (
    <Box sx={{ minHeight: '100vh', overflowX: 'hidden', bgcolor: 'background.default' }}>
      {/* Enhanced Navigation */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          bgcolor: isScrolled ? alpha(theme.palette.background.paper, 0.8) : 'transparent',
          boxShadow: isScrolled ? theme.shadows[4] : 'none',
          py: isScrolled ? 1 : 2,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'relative',
          }}>
            <Typography
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              variant="h5"
              sx={{ 
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TAMILNADU LOGISTICS
            </Typography>
            
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              gap: 2,
              '& .MuiButton-root': {
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 2,
                  bgcolor: 'primary.main',
                  transition: 'width 0.3s ease',
                },
                '&:hover::after': {
                  width: '80%',
                },
              },
            }}>
              {['About', 'Rules', 'Requirements', 'Events', 'Partners'].map((item) => (
                <Button
                  key={item}
                  onClick={() => scrollToSection(eval(`${item.toLowerCase()}Ref`))}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': { 
                      color: 'primary.main',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
            
            <StyledButton 
              variant="contained" 
              color="primary"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Join Us
            </StyledButton>
          </Box>
        </Container>
      </Box>

      {/* Enhanced Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/api/placeholder/1920/1080")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            transform: 'scale(1.1)',
            transition: 'transform 10s ease',
          },
          '&:hover::before': {
            transform: 'scale(1)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.secondary.dark, 0.9)})`,
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
            <Typography
              component={motion.h1}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              variant="h1"
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              TAMILNADU LOGISTICS
            </Typography>
            
            <Typography
              component={motion.p}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              variant="h4"
              sx={{ 
                color: 'white',
                opacity: 0.9,
                mb: 6,
                fontSize: { xs: '1.25rem', md: '1.75rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Professional Vehicle Transportation Services
            </Typography>
            
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              sx={{ 
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() => scrollToSection(aboutRef)}
                sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { 
                    bgcolor: 'grey.100',
                    transform: 'translateY(-4px)',
                  },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Learn More
              </StyledButton>
              <StyledButton
                variant="outlined"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                Join Us
              </StyledButton>
            </Box>
          </Box>
        </Container>
        
        {/* Enhanced Truck Animation */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <TruckAnimation />
          </motion.div>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
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

      {/* Partners Section with Animated Beams */}
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
          <SectionTitle variant="h3" component="h2" align="center">
            Our Partners
          </SectionTitle>
          <Box
            ref={containerRef}
            sx={{
              position: 'relative',
              mt: 8,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 4,
              '& > *': {
                position: 'relative',
                zIndex: 1,
              },
            }}
          >
            {partners.map((partner, index) => (
              <PartnerCardWithBeam
                key={partner.id}
                partner={partner}
                index={index}
                totalPartners={partners.length}
                containerRef={containerRef}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Enhanced Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: 'grey.900',
          color: 'white',
          py: 8,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                TAMILNADU LOGISTICS
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
                Professional Vehicle Transportation Services. Proudly serving the virtual trucking community since 2023.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {['Discord', 'TruckersMP', 'Facebook', 'Instagram'].map((social) => (
                  <IconButton
                    key={social}
                    sx={{
                      color: 'grey.400',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Add social icons here */}
                  </IconButton>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {['About Us', 'Rules', 'Requirements', 'Events'].map((item) => (
                  <Button
                    key={item}
                    onClick={() => scrollToSection(eval(`${item.toLowerCase().replace(' ', '')}Ref`))}
                    sx={{ 
                      color: 'grey.400',
                      justifyContent: 'flex-start',
                      '&:hover': { 
                        color: 'primary.main',
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                Contact
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'grey.400' }}>
                  <Typography variant="body2">
                    Email: contact@tamilnadulogistics.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'grey.400' }}>
                  <Typography variant="body2">
                    Discord: TNL#1234
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                Newsletter
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
                Subscribe to our newsletter for updates and news.
              </Typography>
              <Box component="form" sx={{ display: 'flex', gap: 1 }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none',
                  }}
                />
                <StyledButton
                  variant="contained"
                  color="primary"
                  sx={{ px: 3 }}
                >
                  Subscribe
                </StyledButton>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'grey.800' }} />
          
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              &copy; {new Date().getFullYear()} Tamilnadu Logistics. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                Privacy Policy
              </Button>
              <Button sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                Terms of Service
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;