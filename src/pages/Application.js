import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container,
  Grid,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Custom styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: '#1D1D1D',
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
    animation: 'pulse 4s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.5 },
    '50%': { opacity: 0.8 },
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

const StepIcon = styled(Box)(({ bgcolor }) => ({
  width: 64,
  height: 64,
  borderRadius: '16px',
  background: bgcolor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
  },
}));

const steps = [
  {
    title: 'Step 1',
    subtitle: 'Connect with Us',
    description: 'Join our Discord server and create a ticket to get started.',
    icon: '💬',
    color: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
  },
  {
    title: 'Step 2', 
    subtitle: 'Submit Application',
    description: 'Apply on TruckersMp with all the required details.',
    icon: '📝',
    color: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
  },
  {
    title: 'Step 3',
    subtitle: 'Get Contacted',
    description: 'Wait until our HR team contacts you via the ticket.',
    icon: '✅',
    color: 'linear-gradient(45deg, #ec4899, #ef4444)',
  },
];

const JoinUsPage = () => {
  const theme = useTheme();
  const [hoveredStep, setHoveredStep] = useState(null);

  return (
    <HeroSection>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                fontSize: '2rem',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              }}
            >
              🚛
            </Box>
            
            <GradientText
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '4.5rem' },
                fontWeight: 'bold',
                mb: 3,
                lineHeight: 1.1,
              }}
            >
              Join Our Community
            </GradientText>
            
            <Box
              sx={{
                width: 120,
                height: 4,
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                borderRadius: 2,
                mx: 'auto',
                mb: 4,
              }}
            />
            
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 300,
              }}
            >
              Ready to hit the road with the best trucking community? Follow these simple steps to become part of our family.
            </Typography>
          </motion.div>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {[
            { number: '100+', label: 'Active Members' },
            { number: '24/7', label: 'Support Available' },
            { number: '98%', label: 'Approval Rate' }
          ].map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <GlassCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <GradientText
                      variant="h3"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      {stat.number}
                    </GradientText>
                    <Typography
                      variant="body1"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Steps Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 'bold',
              color: 'white',
              mb: 2,
            }}
          >
            How to Join
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 300,
            }}
          >
            Three simple steps to become part of our trucking community
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.3 }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <GlassCard sx={{ height: '100%', position: 'relative' }}>
                  <CardContent sx={{ p: 4, height: '100%' }}>
                    {/* Step number and icon */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                      <StepIcon bgcolor={step.color}>
                        <Typography variant="h4">
                          {step.icon}
                        </Typography>
                      </StepIcon>
                      <Typography
                        variant="h1"
                        sx={{
                          fontSize: '4rem',
                          fontWeight: 'bold',
                          color: 'rgba(255, 255, 255, 0.1)',
                          lineHeight: 1,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 'bold',
                          color: hoveredStep === index ? 'transparent' : 'white',
                          background: hoveredStep === index ? step.color : 'none',
                          WebkitBackgroundClip: hoveredStep === index ? 'text' : 'none',
                          WebkitTextFillColor: hoveredStep === index ? 'transparent' : 'white',
                          transition: 'all 0.3s ease',
                          mb: 1,
                        }}
                      >
                        {step.title}
                      </Typography>
                      
                      <Typography
                        variant="subtitle1"
                        sx={{
                          background: step.color,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 'bold',
                          mb: 2,
                        }}
                      >
                        {step.subtitle}
                      </Typography>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          color: hoveredStep === index ? 'white' : 'rgba(255, 255, 255, 0.8)',
                          transition: 'color 0.3s ease',
                          lineHeight: 1.6,
                        }}
                      >
                        {step.description}
                      </Typography>

                      <Box
                        display="flex"
                        alignItems="center"
                        mt={3}
                        sx={{
                          color: hoveredStep === index ? 'white' : 'rgba(255, 255, 255, 0.6)',
                          transition: 'color 0.3s ease',
                        }}
                      >
                    
                      </Box>
                    </Box>

                    {/* Hover overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: step.color,
                        opacity: hoveredStep === index ? 0.05 : 0,
                        borderRadius: '24px',
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    />
                  </CardContent>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <GlassCard sx={{ maxWidth: 800, mx: 'auto' }}>
            <CardContent sx={{ textAlign: 'center', p: 6 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #10b981, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontSize: '1.5rem',
                }}
              >
                👥
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  mb: 2,
                }}
              >
                Ready to Start Your Journey?
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Join thousands of professional drivers who have made our community their home. 
                Your trucking adventure starts here!
              </Typography>
             
              <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                 <a href='https://discord.gg/xX9DUsWzQb'>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    borderRadius: '16px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Join Discord Server
                </Button>
                  </a>
                  <a href="https://truckersmp.com/vtc/70030">
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: '16px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Visit TruckersMp
                </Button>
                </a>
              </Box>
            </CardContent>
          </GlassCard>
        </motion.div>
      </Container>
    </HeroSection>
  );
};

export default JoinUsPage;