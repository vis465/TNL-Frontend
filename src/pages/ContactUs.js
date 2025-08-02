import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import GroupsIcon from '@mui/icons-material/Groups';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ChatIcon from '@mui/icons-material/Chat';

const HeroSection = styled(Box)(({ theme }) => ({

  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '100%',
    height: '60px',
   
    clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
  }
}));

const ContactInfoCard = styled(Paper)(({ theme, gradient }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: gradient,
    opacity: 0.05,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[20],
    '&::before': {
      opacity: 0.1,
    }
  }
}));

const GradientButton = styled(Button)(({ theme, gradient }) => ({
  background: gradient,
  color: 'white',
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  boxShadow: theme.shadows[8],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[16],
    transform: 'scale(1.02)',
  }
}));

const IconWrapper = styled(Box)(({ theme, gradient }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.spacing(2),
  background: gradient,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  marginBottom: theme.spacing(3),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

const FormContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: theme.shadows[24],
}));

const FormSide = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8),
  }
}));

const InfoSide = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  color: 'white',
  padding: theme.spacing(6),
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8),
  }
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(1.5),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
  }
}));

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSnackbar({
      open: true,
      message: 'Thank you for your message. We will get back to you soon!',
      severity: 'success',
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const contactInfo = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 32 }} />,
      title: 'Our Location',
      content: 'TruckersMP Virtual Hub',
      description: 'Find us in the heart of virtual trucking',
      cta: 'Get me there',
      action: () => window.open('https://truckersmp.com/vtc/70030', '_blank'),
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 32 }} />,
      title: 'Discord Community',
      content: 'Join 5,000+ Members',
      description: 'Connect with fellow truckers instantly',
      cta: 'Join Server',
      action: () => window.open('https://discord.gg/xX9DUsWzQb', '_blank'),
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      icon: <EmailIcon sx={{ fontSize: 32 }} />,
      title: 'Email Support',
    
      description: 'Professional support within 24 hours',
      cta: 'Send Email',
      action: () => window.location.href = 'mailto:tamilnadulogistics@gmail.com',
      gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    }
  ];

  const quickActions = [
    {
      icon: <GroupsIcon />,
      title: 'Community Hub',
      description: 'Join discussions and events',
      action: () => window.open('https://discord.gg/your-server', '_blank')
    },
    {
      icon: <HeadsetMicIcon />,
      title: 'Live Support',
      description: 'Get instant help',
      action: () => window.open('https://discord.gg/your-server', '_blank')
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 12 }}>
          <Box textAlign="center">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '4.5rem', lg: '6rem' },
                fontWeight: 'bold',
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #bfdbfe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Get In Touch
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem', lg: '2rem' },
                color: '#bfdbfe',
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Ready to hit the virtual roads? Connect with Tamil Nadu Logistics and join our thriving trucking community
            </Typography>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Contact Cards */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <ContactInfoCard 
                elevation={8} 
                gradient={info.gradient}
                onClick={info.action}
              >
                <IconWrapper gradient={info.gradient}>
                  {info.icon}
                </IconWrapper>
                
                <Typography variant="h5" fontWeight="bold" color="text.primary" mb={1}>
                  {info.title}
                </Typography>
                
                <Typography variant="h6" fontWeight="600" color="text.secondary" mb={1}>
                  {info.content}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {info.description}
                </Typography>
                
                <GradientButton
                  gradient={info.gradient}
                  fullWidth
                  endIcon={<SendIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    info.action();
                  }}
                >
                  {info.cta}
                </GradientButton>
              </ContactInfoCard>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box mb={8}>
          <Typography variant="h3" textAlign="center" fontWeight="bold" color="text.primary" mb={4}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} justifyContent="center" maxWidth="600px" mx="auto">
            {quickActions.map((action, index) => (
              <Grid item xs={12} md={6} key={index}>
                <QuickActionCard onClick={action.action}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <IconWrapper 
                        gradient="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                        sx={{ width: 48, height: 48, mb: 0 }}
                      >
                        {action.icon}
                      </IconWrapper>
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </QuickActionCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Form */}
        <FormContainer>
          <Grid container>
            {/* Form Side */}
            <Grid item xs={12} lg={6}>
              <FormSide>
                <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
                  Send us a message
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                  Have a question or need support? We're here to help you succeed on the virtual roads.
                </Typography>

              
              </FormSide>
            </Grid>

            {/* Info Side */}
            <Grid item xs={12} lg={6}>
              <InfoSide>
                <Typography variant="h4" fontWeight="bold" mb={3}>
                  Why Choose Tamil Nadu Logistics?
                </Typography>
                
                <Box mb={4}>
                  {[
                    {
                      icon: <GroupsIcon />,
                      title: 'Active Community',
                      desc: 'Join thousands of passionate virtual truckers from around the world'
                    },
                    {
                      icon: <HeadsetMicIcon />,
                      title: '24/7 Support',
                      desc: 'Our dedicated team is always ready to help you succeed'
                    },
                    {
                      icon: <ChatIcon />,
                      title: 'Instant Communication',
                      desc: 'Connect with us on Discord for real-time assistance'
                    }
                  ].map((item, index) => (
                    <Box key={index} display="flex" alignItems="flex-start" gap={2} mb={3}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 16 } })}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="600" mb={0.5}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#bfdbfe' }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="600" mb={1}>
                    Need immediate help?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#bfdbfe', mb: 2 }}>
                    Join our Discord server for instant support and community interaction
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: 'white',
                      color: '#1e40af',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                      }
                    }}
                    startIcon={<ChatIcon />}
                    onClick={() => window.open('https://discord.gg/your-server', '_blank')}
                  >
                    Join Discord
                  </Button>
                </Paper>
              </InfoSide>
            </Grid>
          </Grid>
        </FormContainer>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactUs;